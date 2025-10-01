import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Breadcrumb: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathMap: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/sales': 'Punto de Venta',
    '/inventory': 'Inventario',
    '/customers': 'Clientes',
    '/reports': 'Reportes',
    '/settings': 'Configuración'
  };

  const currentPath = pathMap[location.pathname] || 'Página';

  return (
    <div className="flex items-center gap-2 text-sm mb-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        Inicio
      </button>
      {location.pathname !== '/dashboard' && (
        <>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 font-medium">{currentPath}</span>
        </>
      )}
    </div>
  );
};

export default Breadcrumb;
