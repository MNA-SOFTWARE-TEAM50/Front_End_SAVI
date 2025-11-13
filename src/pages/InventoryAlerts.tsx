import React, { useState, useEffect } from 'react';
import { Card } from '../components';

interface Alert {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string | null;
  product_category: string;
  alert_type: string;
  severity: string;
  message: string;
  current_stock: number | null;
  threshold: number | null;
  days_without_movement: number | null;
  is_active: boolean;
  is_read: boolean;
  created_at: string;
  resolved_at: string | null;
}

interface AlertStats {
  total_alerts: number;
  active_alerts: number;
  unread_alerts: number;
  critical_alerts: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
}

const InventoryAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    severity: 'all',
    type: 'all',
    unread_only: false,
  });

  useEffect(() => {
    fetchAlerts();
    fetchStats();
  }, [filter]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/inventory-alerts/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        active_only: 'true',
        unread_only: filter.unread_only.toString(),
        ...(filter.severity !== 'all' && { severity: filter.severity }),
        ...(filter.type !== 'all' && { alert_type: filter.type }),
      });

      const response = await fetch(`/api/v1/inventory-alerts/?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = async () => {
    try {
      const response = await fetch('/api/v1/inventory-alerts/generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          low_stock_threshold: 10,
          critical_stock_threshold: 5,
          no_movement_days: 30,
        }),
      });
      const data = await response.json();
      alert(data.message);
      fetchAlerts();
      fetchStats();
    } catch (error) {
      console.error('Error generating alerts:', error);
    }
  };

  const markAsRead = async (alertId: number) => {
    try {
      await fetch(`/api/v1/inventory-alerts/${alertId}/mark-read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchAlerts();
      fetchStats();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const resolveAlert = async (alertId: number) => {
    try {
      await fetch(`/api/v1/inventory-alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchAlerts();
      fetchStats();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/v1/inventory-alerts/mark-all-read', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchAlerts();
      fetchStats();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityIcon = (severity: string) => {
    const icons: Record<string, string> = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
    };
    return icons[severity] || '⚪';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      low_stock: 'Stock Bajo',
      no_stock: 'Sin Stock',
      no_movement: 'Sin Movimiento',
      restock_suggestion: 'Sugerencia',
    };
    return labels[type] || type;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Alertas de Inventario</h1>
        <button
          onClick={generateAlerts}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generar Alertas
        </button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Total de Alertas</div>
            <div className="text-3xl font-bold">{stats.total_alerts}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Alertas Activas</div>
            <div className="text-3xl font-bold text-blue-600">{stats.active_alerts}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">No Leídas</div>
            <div className="text-3xl font-bold text-orange-600">{stats.unread_alerts}</div>
          </Card>
          <Card className="p-4">
            <div className="text-gray-600 text-sm">Críticas</div>
            <div className="text-3xl font-bold text-red-600">{stats.critical_alerts}</div>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-1">Severidad</label>
            <select
              value={filter.severity}
              onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="all">Todas</option>
              <option value="critical">Crítica</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="all">Todos</option>
              <option value="low_stock">Stock Bajo</option>
              <option value="no_stock">Sin Stock</option>
              <option value="no_movement">Sin Movimiento</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filter.unread_only}
                onChange={(e) => setFilter({ ...filter, unread_only: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Solo no leídas</span>
            </label>
          </div>

          <div className="ml-auto">
            <button
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Marcar todas como leídas
            </button>
          </div>
        </div>
      </Card>

      {/* Lista de Alertas */}
      {loading ? (
        <div className="text-center py-8">Cargando alertas...</div>
      ) : alerts.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No hay alertas con los filtros seleccionados
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-4 border-l-4 ${
                !alert.is_read ? 'bg-blue-50' : ''
              } ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                    <span className="font-semibold text-lg">{alert.product_name}</span>
                    <span className="text-sm text-gray-500">
                      {alert.product_sku && `(${alert.product_sku})`}
                    </span>
                    {!alert.is_read && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Nueva
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span className="font-medium">{getTypeLabel(alert.alert_type)}</span>
                    <span>•</span>
                    <span className="capitalize">{alert.severity}</span>
                    <span>•</span>
                    <span>{alert.product_category}</span>
                    {alert.current_stock !== null && (
                      <>
                        <span>•</span>
                        <span>Stock: {alert.current_stock}</span>
                      </>
                    )}
                  </div>

                  <p className="text-gray-700 mb-2">{alert.message}</p>

                  <div className="text-xs text-gray-500">
                    Creada: {new Date(alert.created_at).toLocaleString('es-ES')}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  {!alert.is_read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Marcar leída
                    </button>
                  )}
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    Resolver
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;
