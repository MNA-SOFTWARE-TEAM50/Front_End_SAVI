import React from 'react';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import { useNavigate } from 'react-router-dom';

const Config: React.FC = () => {
  const navigate = useNavigate();

  const items = [
    {
      title: 'Usuarios',
      description: 'Gestiona cuentas, roles y accesos',
      colorFrom: 'from-gray-600',
      colorTo: 'to-gray-800',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A7 7 0 0112 15h0a7 7 0 016.879 2.804M15 11a3 3 0 10-6 0 3 3 0 006 0z" />
        </svg>
      ),
      onClick: () => navigate('/config/users'),
    },
    {
      title: 'Pruebas de Sistema',
      description: 'Verifica el funcionamiento del sistema y variables de entorno',
      colorFrom: 'from-green-600',
      colorTo: 'to-emerald-800',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => navigate('/config/system-tests'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="max-w-7xl mx-auto p-8">
        <Breadcrumb />

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h2>
          <p className="text-gray-600">Administra las configuraciones del sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <button
              key={item.title}
              onClick={item.onClick}
              className={`group bg-gradient-to-br ${item.colorFrom} ${item.colorTo} rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-left`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                  {item.icon}
                </div>
                <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-white mb-2">{item.title}</h4>
              <p className="text-gray-100">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Config;
