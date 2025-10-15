import React from 'react';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';

type Sale = {
  id: number;
  total: number;
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
  const [page, setPage] = React.useState<number>(1);
  const pageSize = 20;
  const [data, setData] = React.useState<SaleList>({ items: [], total: 0 });
  const [loading, setLoading] = React.useState(false);
  const [stats, setStats] = React.useState<{ revenue_today: number; products_sold_today: number; customers_today: number; transactions_today: number } | null>(null);
  const [detail, setDetail] = React.useState<Sale | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('skip', String((page - 1) * pageSize));
      params.set('limit', String(pageSize));
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      if (paymentMethod) params.set('payment_method', paymentMethod);
      if (status) params.set('status', status);
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
  }, [dateFrom, dateTo, paymentMethod, status, page, pageSize, token]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / pageSize));

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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div className="md:col-span-4 text-right">
            <button className="btn-secondary mr-2" onClick={() => { setDateFrom(''); setDateTo(''); setPaymentMethod(''); setStatus(''); setPage(1); }}>Limpiar</button>
            <button className="btn-primary" onClick={() => { setPage(1); fetchData(); }}>Aplicar</button>
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
                if (dateFrom) params.set('date_from', dateFrom);
                if (dateTo) params.set('date_to', dateTo);
                if (paymentMethod) params.set('payment_method', paymentMethod);
                if (status) params.set('status', status);
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-6 text-center text-gray-500">Cargando...</td></tr>
                ) : data.items.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-6 text-center text-gray-500">Sin datos</td></tr>
                ) : (
                  data.items.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setDetail(s)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(s.created_at).toLocaleString('es-MX')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{s.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50" onClick={() => setDetail(null)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Venta #{detail.id}</h3>
                <button className="text-gray-600" onClick={() => setDetail(null)}>✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Fecha:</span> {new Date(detail.created_at).toLocaleString('es-MX')}</div>
                  <div><span className="text-gray-500">Pago:</span> {detail.payment_method}</div>
                  <div><span className="text-gray-500">Estado:</span> {detail.status}</div>
                  <div><span className="text-gray-500">Total:</span> {detail.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">Items</div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="py-1">Producto</th>
                          <th className="py-1">Cantidad</th>
                          <th className="py-1">Precio</th>
                          <th className="py-1">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.items.map((it, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="py-1">{it.product_name}</td>
                            <td className="py-1">{it.quantity}</td>
                            <td className="py-1">{it.unit_price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                            <td className="py-1">{it.subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 border-t text-right">
                <button className="btn-primary" onClick={() => setDetail(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReport;
