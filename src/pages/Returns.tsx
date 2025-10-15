import React from 'react';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';

type ReturnItem = {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

type ReturnRow = {
  id: number;
  sale_id: number;
  items_returned: ReturnItem[];
  items_exchanged?: ReturnItem[] | null;
  subtotal_refund: number;
  tax_refund: number;
  total_refund: number;
  action: 'refund' | 'credit_note' | 'exchange';
  refund_method?: string | null;
  reason?: string | null;
  status: string;
  created_at: string;
};

type ReturnList = { items: ReturnRow[]; total: number };

const Returns: React.FC = () => {
  const { token } = useAuth();
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [action, setAction] = React.useState('');
  const [method, setMethod] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [saleId, setSaleId] = React.useState('');
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const [data, setData] = React.useState<ReturnList>({ items: [], total: 0 });
  const [loading, setLoading] = React.useState(false);
  const [detail, setDetail] = React.useState<ReturnRow | null>(null);
  const [saleDetail, setSaleDetail] = React.useState<{
    id: number;
    created_at: string;
    payment_method: string;
    status: string;
    total: number;
    net_total?: number;
    items: Array<{ product_id: number; product_name: string; quantity: number; unit_price: number; subtotal: number }>;
  } | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('skip', String((page - 1) * pageSize));
      params.set('limit', String(pageSize));
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      if (action) params.set('action', action);
      if (method) params.set('refund_method', method);
      if (status) params.set('status', status);
      if (saleId) params.set('sale_id', saleId);
      const list = await apiClient.get<ReturnList>(`/v1/returns?${params.toString()}`, token || undefined);
      setData(list);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, action, method, status, saleId, page, pageSize, token]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / pageSize));

  const openSale = async (sid: number) => {
    try {
      const s = await apiClient.get<any>(`/v1/sales/${sid}`, token || undefined);
      setSaleDetail(s);
    } catch (e) {
      // opcional: feedback
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto p-8">
        <Breadcrumb />
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Registro de Devoluciones</h2>
          <p className="text-gray-600">Consulta, filtra y exporta las devoluciones realizadas</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="label">Desde</label>
            <input type="date" className="input-field" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">Hasta</label>
            <input type="date" className="input-field" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div>
            <label className="label">Acción</label>
            <select className="input-field" value={action} onChange={e => setAction(e.target.value)}>
              <option value="">Todas</option>
              <option value="refund">Reembolso</option>
              <option value="credit_note">Nota de crédito</option>
              <option value="exchange">Intercambio</option>
            </select>
          </div>
          <div>
            <label className="label">Método</label>
            <select className="input-field" value={method} onChange={e => setMethod(e.target.value)}>
              <option value="">Todos</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>
          <div>
            <label className="label">Estado</label>
            <select className="input-field" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="completed">Completado</option>
              <option value="pending">Pendiente</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="label">Venta</label>
            <input type="number" className="input-field" placeholder="ID" value={saleId} onChange={e => setSaleId(e.target.value)} />
          </div>
          <div className="md:col-span-6 text-right">
            <button className="btn-secondary mr-2" onClick={() => { setDateFrom(''); setDateTo(''); setAction(''); setMethod(''); setStatus(''); setSaleId(''); setPage(1); }}>Limpiar</button>
            <button className="btn-primary" onClick={() => { setPage(1); fetchData(); }}>Aplicar</button>
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
                if (dateFrom) params.set('date_from', dateFrom);
                if (dateTo) params.set('date_to', dateTo);
                if (action) params.set('action', action);
                if (method) params.set('refund_method', method);
                if (status) params.set('status', status);
                if (saleId) params.set('sale_id', saleId);
                const base = (import.meta.env as any).VITE_API_URL || 'http://localhost:8000/api';
                const tokenHeader = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await fetch(`${base}/v1/returns/export?${params.toString()}`, { headers: { ...tokenHeader } as any });
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte_devoluciones.csv`;
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Reembolso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-6 text-center text-gray-500">Cargando...</td></tr>
                ) : data.items.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-6 text-center text-gray-500">Sin datos</td></tr>
                ) : (
                  data.items.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setDetail(r)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(r.created_at).toLocaleString('es-MX')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={(e) => { e.stopPropagation(); openSale(r.sale_id); }}
                          title="Ver venta"
                        >
                          #{r.sale_id}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.action}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.refund_method ?? 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{r.total_refund.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.status}</td>
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <div className="px-8 py-5 border-b flex items-center justify-between">
                <h3 className="font-semibold text-xl md:text-2xl">Devolución #{detail.id}</h3>
                <button className="text-gray-600 text-xl" onClick={() => setDetail(null)}>✕</button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base md:text-lg">
                  <div><span className="text-gray-500">Fecha:</span> {new Date(detail.created_at).toLocaleString('es-MX')}</div>
                  <div><span className="text-gray-500">Venta:</span> #{detail.sale_id}</div>
                  <div><span className="text-gray-500">Acción:</span> {detail.action}</div>
                  <div><span className="text-gray-500">Método:</span> {detail.refund_method ?? 'N/A'}</div>
                  <div><span className="text-gray-500">Total reembolso:</span> {detail.total_refund.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</div>
                  <div><span className="text-gray-500">Estado:</span> {detail.status}</div>
                </div>
                <div>
                  <div className="text-base md:text-lg font-semibold mb-3">Artículos devueltos</div>
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-base">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="py-2 pr-3">Producto</th>
                          <th className="py-2 pr-3">Cantidad</th>
                          <th className="py-2 pr-3">Precio</th>
                          <th className="py-2 pr-3">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(detail.items_returned || []).map((it, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="py-2 pr-3">{it.product_name}</td>
                            <td className="py-2 pr-3">{it.quantity}</td>
                            <td className="py-2 pr-3">{it.unit_price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                            <td className="py-2 pr-3">{it.subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {detail.items_exchanged && detail.items_exchanged.length > 0 && (
                  <div>
                    <div className="text-base md:text-lg font-semibold mb-3">Artículos intercambiados</div>
                    <div className="max-h-80 overflow-y-auto">
                      <table className="w-full text-base">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="py-2 pr-3">Producto</th>
                            <th className="py-2 pr-3">Cantidad</th>
                            <th className="py-2 pr-3">Precio</th>
                            <th className="py-2 pr-3">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(detail.items_exchanged || []).map((it, idx) => (
                            <tr key={`ex-${idx}`} className="border-t">
                              <td className="py-2 pr-3">{it.product_name}</td>
                              <td className="py-2 pr-3">{it.quantity}</td>
                              <td className="py-2 pr-3">{it.unit_price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                              <td className="py-2 pr-3">{it.subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-8 py-5 border-t flex items-center justify-end gap-3">
                <button className="btn-secondary px-5 py-3 text-base" onClick={() => setDetail(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de venta vinculada */}
        {saleDetail && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-8 md:p-10 z-50" onClick={() => setSaleDetail(null)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <div className="px-8 py-5 border-b flex items-center justify-between">
                <h3 className="font-semibold text-xl md:text-2xl">Venta #{saleDetail.id}</h3>
                <button className="text-gray-600 text-xl" onClick={() => setSaleDetail(null)}>✕</button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base md:text-lg">
                  <div><span className="text-gray-500">Fecha:</span> {new Date(saleDetail.created_at).toLocaleString('es-MX')}</div>
                  <div><span className="text-gray-500">Pago:</span> {saleDetail.payment_method}</div>
                  <div><span className="text-gray-500">Estado:</span> {saleDetail.status}</div>
                  <div><span className="text-gray-500">Total:</span> {(saleDetail.net_total ?? saleDetail.total).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</div>
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
                        </tr>
                      </thead>
                      <tbody>
                        {(saleDetail.items || []).map((it, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="py-2 md:py-3 pr-3">{it.product_name}</td>
                            <td className="py-2 md:py-3 pr-3">{it.quantity}</td>
                            <td className="py-2 md:py-3 pr-3">{it.unit_price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                            <td className="py-2 md:py-3 pr-3">{it.subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="px-8 py-5 border-t flex items-center justify-end gap-3">
                <button className="btn-secondary px-5 py-3 text-base" onClick={() => setSaleDetail(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Returns;