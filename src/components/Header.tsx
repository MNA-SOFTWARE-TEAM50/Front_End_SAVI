import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoMediano from '../assets/Logos/SAVI_LogoMediano.png';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Función para capitalizar el rol
  const getRoleName = (role: string) => {
    const roles: { [key: string]: string } = {
      'admin': 'Administrador',
      'cashier': 'Cajero'
    };
    return roles[role] || role;
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Botón Atrás */}
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors group"
              title="Atrás"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Logo - clickeable para ir al Dashboard */}
            <button onClick={goToDashboard} className="group flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img
                src={LogoMediano}
                alt="SAVI"
                className="h-12 md:h-14 lg:h-16 w-auto select-none shrink-0"
                draggable={false}
              />
              <div className="text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">SAVI</h1>
                <p className="text-xs md:text-sm text-gray-500 leading-tight">Sistema de Administración de Ventas e Inventario</p>
              </div>
            </button>
          </div>
          <div className="flex items-center gap-4">
            {/* Información del usuario */}
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
              <p className="text-xs text-gray-500">
                {user?.role && getRoleName(user.role)} • {user?.username}
              </p>
            </div>
            {/* Botón de logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
