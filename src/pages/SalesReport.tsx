import React from 'react';
import Swal from 'sweetalert2';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';

type Sale = {
  id: number;
  total: number;
  net_total?: number;
  payment_method: string;
  status: string;
  created_at: string;
  items: Array<{ product_id: number; product_name: string; quantity: number; unit_price: number; subtotal: number }>;
};

type SaleList = { items: Sale[]; total: number };

const SalesReport: React.FC = () => {
  const { token } = useAuth();
  const [dateFrom, setDateFrom] = React.useState<string>('');
  const [dateTo, setDateTo] = React.useState<string>('');
  const [paymentMethod, setPaymentMethod] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  const [saleId, setSaleId] = React.useState<string>('');
  const [page, setPage] = React.useState<number>(1);
  const pageSize = 20;
  const [data, setData] = React.useState<SaleList>({ items: [], total: 0 });
  const [loading, setLoading] = React.useState(false);
  const [stats, setStats] = React.useState<{ revenue_today: number; products_sold_today: number; customers_today: number; transactions_today: number } | null>(null);
  const [detail, setDetail] = React.useState<Sale | null>(null);
  const [returnMode, setReturnMode] = React.useState<boolean>(false);
  const [returnQty, setReturnQty] = React.useState<Record<number, number>>({});
  const [availableQty, setAvailableQty] = React.useState<Record<number, number>>({});
  const [returnAction, setReturnAction] = React.useState<'refund'|'credit_note'|'exchange'>('refund');
  const [returnReason, setReturnReason] = React.useState<string>('');
  const [returning, setReturning] = React.useState<boolean>(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('skip', String((page - 1) * pageSize));
      params.set('limit', String(pageSize));
      const saleIdTrim = (saleId || '').trim();
      if (saleIdTrim) {
        // Cuando se busca por ID de venta, hacemos la búsqueda directa por ID para evitar intersecciones con otros filtros
        params.set('sale_id', saleIdTrim);
      } else {
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        if (paymentMethod) params.set('payment_method', paymentMethod);
        if (status) params.set('status', status);
      }
      const list = await apiClient.get<SaleList>(`/v1/sales?${params.toString()}`, token || undefined);
      setData(list);

      const sParams = new URLSearchParams();
      if (dateFrom) sParams.set('date_from', dateFrom);
      if (dateTo) sParams.set('date_to', dateTo);
      const s = await apiClient.get<{ revenue_today: number; products_sold_today: number; customers_today: number; transactions_today: number }>(`/v1/sales/stats?${sParams.toString()}`, token || undefined);
      setStats(s);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, paymentMethod, status, page, pageSize, token, saleId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / pageSize));

  // Open return mode for a sale: compute available quantities considering prior returns
  const openReturnForSale = async (sale: Sale) => {
    setReturnMode(false);
    setReturnQty({});
    setAvailableQty({});
    setReturnAction('refund');
    setReturnReason('');
    try {
      const retList = await apiClient.get<{items: any[], total: number}>(`/v1/returns?sale_id=${sale.id}`, token || undefined);
      const prev: Record<number, number> = {};
      for (const r of retList.items || []) {
        const items = (r.items_returned || []) as Array<any>;
        for (const it of items) {
          const pid = Number(it.product_id);
          prev[pid] = (prev[pid] || 0) + Number(it.quantity || 0);
        }
      }
      const avail: Record<number, number> = {};
      for (const it of (sale.items || [])) {
        const already = prev[it.product_id] || 0;
        avail[it.product_id] = Math.max(0, (it.quantity || 0) - already);
      }
      setAvailableQty(avail);
      // init quantities to 0 not exceeding available
      const q: Record<number, number> = {};
      for (const it of (sale.items || [])) { q[it.product_id] = 0; }
      setReturnQty(q);
      setReturnMode(true);
    } catch (e) {
      await Swal.fire('Error', 'No se pudo preparar la devolución (consulta de devoluciones previas).', 'error');
    }
  };

  const processReturn = async () => {
    if (!detail) return;
    const items_returned = (detail.items || [])
      .filter(it => (returnQty[it.product_id] || 0) > 0)
      .map(it => ({
        product_id: it.product_id,
        product_name: it.product_name,
        quantity: Math.min(returnQty[it.product_id], availableQty[it.product_id] || 0),
        unit_price: it.unit_price,
        subtotal: it.unit_price * Math.min(returnQty[it.product_id], availableQty[it.product_id] || 0),
      }));
    if (items_returned.length === 0) {
      await Swal.fire('Sin artículos', 'Selecciona al menos un artículo válido para devolver', 'info');
      return;
    }
    // Validate window/state
    try {
      const valid = await apiClient.get<{ok:boolean; reason?: string}>(`/v1/returns/validate?sale_id=${detail.id}`, token || undefined);
      if (!valid.ok) {
        await Swal.fire('No elegible', valid.reason || 'La venta no es elegible para devolución', 'info');
        return;
      }
    } catch (e) {
      await Swal.fire('Error', 'No se pudo validar la devolución', 'error');
      return;
    }

    const confirm = await Swal.fire({
      title: 'Confirmar devolución',
      html: `<div class="text-left">`+
            `<p><b>Venta #${detail.id}</b></p>`+
            `<p>Método: ${detail.payment_method}</p>`+
            `<p>Acción: ${returnAction === 'refund' ? 'Reembolso' : returnAction === 'credit_note' ? 'Nota de crédito' : 'Intercambio'}</p>`+
            `</div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Procesar',
      cancelButtonText: 'Cancelar'
    });
    if (!confirm.isConfirmed) return;

    try {
      setReturning(true);
      const payload: any = {
        sale_id: detail.id,
        items_returned,
        items_exchanged: undefined,
        action: returnAction,
        refund_method: returnAction === 'refund' ? detail.payment_method : undefined,
        reason: returnReason || undefined,
      };
      const ret = await apiClient.post<any>('/v1/returns', payload, token || undefined);
      await Swal.fire('Devolución creada', `Return #${ret.id} por ${ret.total_refund.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, 'success');
      setReturnMode(false);
      setReturnQty({});
      setAvailableQty({});
      setReturnReason('');
      // refresh listing to reflect stock/metrics (optional)
      fetchData();
    } catch (err: any) {
      const msg = err?.message || 'No se pudo crear la devolución';
      await Swal.fire('Error', msg, 'error');
    } finally {
      setReturning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto p-8">
        <Breadcrumb />
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Reporte de Ventas</h2>
          <p className="text-gray-600">Filtra por fechas y parámetros para analizar las ventas</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="label">Desde</label>
            <input type="date" className="input-field" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">Hasta</label>
            <input type="date" className="input-field" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div>
            <label className="label">Método de Pago</label>
            <select className="input-field" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="">Todos</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>
          <div>
            <label className="label">Estado</label>
            <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="completed">Completado</option>
              <option value="pending">Pendiente</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="label">Venta (ID)</label>
            <input type="number" className="input-field" placeholder="Ej. 120" value={saleId} onChange={e => setSaleId(e.target.value)} />
          </div>
          <div className="md:col-span-5 text-right">
            <button className="btn-secondary mr-2" onClick={() => { setDateFrom(''); setDateTo(''); setPaymentMethod(''); setStatus(''); setSaleId(''); setPage(1); }}>Limpiar</button>
            <button className="btn-primary" onClick={() => { setPage(1); }}>Aplicar</button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-sm text-gray-600">Ingresos</div>
            <div className="text-3xl font-bold">{(stats?.revenue_today ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-sm text-gray-600">Productos vendidos</div>
            <div className="text-3xl font-bold">{stats?.products_sold_today ?? 0}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-sm text-gray-600">Clientes</div>
            <div className="text-3xl font-bold">{stats?.customers_today ?? 0}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-sm text-gray-600">Transacciones</div>
            <div className="text-3xl font-bold">{stats?.transactions_today ?? 0}</div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="text-sm text-gray-600">Resultados</div>
            <button
              className="btn-secondary"
              onClick={async () => {
                const params = new URLSearchParams();
                const saleIdTrim = (saleId || '').trim();
                if (saleIdTrim) {
                  params.set('sale_id', saleIdTrim);
                } else {
                  if (dateFrom) params.set('date_from', dateFrom);
                  if (dateTo) params.set('date_to', dateTo);
                  if (paymentMethod) params.set('payment_method', paymentMethod);
                  if (status) params.set('status', status);
                }
                const base = (import.meta.env as any).VITE_API_URL || 'http://localhost:8000/api';
                const tokenHeader = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await fetch(`${base}/v1/sales/export?${params.toString()}`, { headers: { ...tokenHeader } as any });
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte_ventas.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}
            >Exportar CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-6 text-center text-gray-500">Cargando...</td></tr>
                ) : data.items.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-6 text-center text-gray-500">Sin datos</td></tr>
                ) : (
                  data.items.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setDetail(s)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{s.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(s.created_at).toLocaleString('es-MX')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{(s.net_total ?? s.total).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.payment_method}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.items.reduce((acc, it) => acc + (it.quantity || 0), 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Paginación */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-600">Total: {data.total}</div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
              <span className="text-sm">Página {page} de {totalPages}</span>
              <button className="btn-secondary" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Siguiente</button>
            </div>
          </div>
        </div>
        {/* Modal de detalle */}
        {detail && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 md:p-10 z-50" onClick={() => setDetail(null)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <div className="px-8 py-5 border-b flex items-center justify-between">
                <h3 className="font-semibold text-xl md:text-2xl">Venta #{detail.id}</h3>
                <button className="text-gray-600 text-xl" onClick={() => setDetail(null)}>✕</button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base md:text-lg">
                  <div><span className="text-gray-500">Fecha:</span> {new Date(detail.created_at).toLocaleString('es-MX')}</div>
                  <div><span className="text-gray-500">Pago:</span> {detail.payment_method}</div>
                  <div><span className="text-gray-500">Estado:</span> {detail.status}</div>
                  <div><span className="text-gray-500">Total:</span> {(detail.net_total ?? detail.total).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</div>
                </div>
                <div>
                  <div className="text-base md:text-lg font-semibold mb-3">Items</div>
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-base">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="py-3 pr-3">Producto</th>
                          <th className="py-3 pr-3">Vendido</th>
                          <th className="py-3 pr-3">Precio</th>
                          <th className="py-3 pr-3">Subtotal</th>
                          {returnMode && <th className="py-3 pr-3">Devolver</th>}
                          {returnMode && <th className="py-3">Disponible</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {detail.items.map((it, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="py-2 md:py-3 pr-3">{it.product_name}</td>
                            <td className="py-2 md:py-3 pr-3">{it.quantity}</td>
                            <td className="py-2 md:py-3 pr-3">{it.unit_price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                            <td className="py-2 md:py-3 pr-3">{it.subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                            {returnMode && (
                              <>
                                <td className="py-2 md:py-3 pr-3">
                                  <input
                                    type="number"
                                    min={0}
                                    max={Math.max(0, (availableQty[it.product_id] || 0))}
                                    value={returnQty[it.product_id] ?? 0}
                                    onChange={e => setReturnQty(q => ({
                                      ...q,
                                      [it.product_id]: Math.max(0, Math.min(Number(e.target.value || 0), Math.max(0, (availableQty[it.product_id] || 0))))
                                    }))}
                                    className="w-28 md:w-32 border rounded px-3 py-2 text-base"
                                  />
                                </td>
                                <td className="py-2 md:py-3 text-gray-600">{Math.max(0, (availableQty[it.product_id] || 0))}</td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="px-8 py-5 border-t flex items-center justify-between gap-4">
                {returnMode ? (
                  <div className="flex-1 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="label text-sm md:text-base">Acción</label>
                        <select className="input-field h-12 text-base" value={returnAction} onChange={e => setReturnAction(e.target.value as any)}>
                          <option value="refund">Reembolso</option>
                          <option value="credit_note">Nota de crédito</option>
                          <option value="exchange">Intercambio</option>
                        </select>
                      </div>
                      <div>
                        <label className="label text-sm md:text-base">Método</label>
                        <input className="input-field bg-gray-50 h-12 text-base" value={returnAction === 'refund' ? (detail?.payment_method || '') : 'N/A'} disabled />
                      </div>
                      <div>
                        <label className="label text-sm md:text-base">Motivo (opcional)</label>
                        <input className="input-field h-12 text-base" value={returnReason} onChange={e => setReturnReason(e.target.value)} placeholder="Motivo" />
                      </div>
                    </div>
                  </div>
                ) : <div />}
                <div className="flex items-center gap-3">
                  {!returnMode && (
                    <button className="btn-secondary px-5 py-3 text-base" onClick={() => detail && openReturnForSale(detail)}>Devolver</button>
                  )}
                  {returnMode && (
                    <button className="btn-primary px-5 py-3 text-base" disabled={returning} onClick={processReturn}>{returning ? 'Procesando...' : 'Confirmar devolución'}</button>
                  )}
                  <button className="btn-secondary px-5 py-3 text-base" onClick={() => { setDetail(null); setReturnMode(false); }}>Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReport;
