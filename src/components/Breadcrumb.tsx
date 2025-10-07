import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Breadcrumb: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathMap: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/sales': 'Punto de Venta',
    '/inventory': 'Inventario',
    '/customers': 'Clientes',
    '/reports': 'Reportes',
    '/config': 'Configuración',
    '/config/users': 'Usuarios',
  };

  const parts = location.pathname.split('/').filter(Boolean);
  const crumbs = parts.map((_, idx) => '/' + parts.slice(0, idx + 1).join('/'));

  return (
    <div className="flex items-center gap-2 text-sm mb-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        Inicio
      </button>
      {crumbs.filter(c => c !== '/dashboard').map((c, idx) => (
        <React.Fragment key={c}>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {idx < crumbs.length - 1 ? (
            <Link to={c} className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              {pathMap[c] || 'Página'}
            </Link>
          ) : (
            <span className="text-gray-700 font-medium">{pathMap[c] || 'Página'}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;
