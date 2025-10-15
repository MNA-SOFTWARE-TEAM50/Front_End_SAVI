import React from 'react';
import { MdPointOfSale, MdInventory2, MdBarChart, MdSettings, MdAttachMoney, MdList, MdPeople, MdReceiptLong, MdTrendingUp } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [kpis, setKpis] = React.useState<{ revenue_today: number; products_sold_today: number; customers_today: number; transactions_today: number } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [recent, setRecent] = React.useState<any[]>([]);
  const [topProducts, setTopProducts] = React.useState<any[]>([]);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await apiClient.get<{ revenue_today: number; products_sold_today: number; customers_today: number; transactions_today: number }>(
          '/v1/sales/stats/today',
          token || undefined
        );
        setKpis(data);
        const recentSales = await apiClient.get<{ items: any[]; total: number }>(
          '/v1/sales/recent?limit=5',
          token || undefined
        );
        setRecent(recentSales.items || []);
        const tops = await apiClient.get<{ items: any[] }>(
          '/v1/sales/top-products?limit=5',
          token || undefined
        );
        setTopProducts(tops.items || []);
      } catch (e) {
        setKpis({ revenue_today: 0, products_sold_today: 0, customers_today: 0, transactions_today: 0 });
        setRecent([]);
        setTopProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />

      {/* Contenido del Dashboard */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Título y Bienvenida */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Resumen general del sistema</p>
        </div>

        {/* KPIs del día */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Ventas Hoy (dinero) */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Ventas Hoy (MXN)</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <MdAttachMoney className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{(kpis?.revenue_today ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
            {!loading && (
              <p className="text-sm text-gray-500">Transacciones hoy: <span className="font-semibold text-gray-700">{kpis?.transactions_today ?? 0}</span></p>
            )}
            {loading && <p className="text-sm text-gray-500">Cargando...</p>}
          </div>

          {/* Productos vendidos hoy */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Productos Vendidos Hoy</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <MdList className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{kpis?.products_sold_today ?? 0}</p>
            {loading && <p className="text-sm text-gray-500">Cargando...</p>}
          </div>

          {/* Clientes de hoy */}
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Clientes Hoy</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <MdPeople className="w-7 h-7 text-white" />
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{kpis?.customers_today ?? 0}</p>
            {loading && <p className="text-sm text-gray-500">Cargando...</p>}
          </div>
        </div>

        {/* Módulos Principales */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Módulos del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Módulo de Ventas */}
            <button
              onClick={() => navigate('/sales')}
              className="group bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-left"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                  <MdPointOfSale className="w-8 h-8 text-white" />
                </div>
                <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-white mb-2">Punto de Venta</h4>
              <p className="text-blue-100">Gestiona las ventas y transacciones del día</p>
            </button>

            {/* Módulo de Inventario */}
            <button
              onClick={() => navigate('/inventory')}
              className="group bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-left"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                  <MdInventory2 className="w-8 h-8 text-white" />
                </div>
                <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-white mb-2">Inventario</h4>
              <p className="text-purple-100">Administra productos y stock disponible</p>
            </button>

            {/* Reporte de Ventas */}
            <button
              onClick={() => navigate('/reports/sales')}
              className="group bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-left"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                  <MdBarChart className="w-8 h-8 text-white" />
                </div>
                <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-white mb-2">Reporte de Ventas</h4>
              <p className="text-green-100">Filtra y analiza tus ventas</p>
            </button>

            {/* Módulo de Configuración */}
            <button
              onClick={() => navigate('/config')}
              className="group bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-left"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                  <MdSettings className="w-8 h-8 text-white" />
                </div>
                <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-white mb-2">Configuración</h4>
              <p className="text-gray-100">Ajustes del sistema y usuarios</p>
            </button>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Ventas Recientes</h3>
              <button onClick={() => navigate('/reports/sales')} className="text-sm text-blue-600 font-medium hover:underline">Ver todas</button>
            </div>
            {recent.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MdReceiptLong className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No hay ventas registradas</p>
                <p className="text-sm mt-1">Las ventas aparecerán aquí</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recent.map((s: any) => (
                  <li key={s.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-900 font-medium">Venta #{s.id}</div>
                      <div className="text-xs text-gray-500">{new Date(s.created_at).toLocaleString('es-MX')} • {s.payment_method}</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{s.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Productos Más Vendidos</h3>
              <button onClick={() => navigate('/reports/sales')} className="text-sm text-blue-600 font-medium hover:underline">Ver más</button>
            </div>
            {topProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MdTrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No hay datos disponibles</p>
                <p className="text-sm mt-1">Los productos más vendidos aparecerán aquí</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {topProducts.map((p: any, idx: number) => (
                  <li key={`${p.product_id ?? 'x'}-${idx}`} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-900 font-medium">{p.product_name}</div>
                      <div className="text-xs text-gray-500">{p.total_quantity} vendidos • {p.total_revenue.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
