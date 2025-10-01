import React from 'react';
import Header from '../components/Header';

const Sales: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Punto de Venta</h1>
          <button className="btn-primary">
            Nueva Venta
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos</h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar producto o escanear código..."
                className="input-field"
              />
            </div>
            <div className="text-center py-12 text-gray-500">
              <p>No hay productos disponibles</p>
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Carrito</h2>
            <div className="text-center py-12 text-gray-500 mb-4">
              <p>El carrito está vacío</p>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">IVA (16%):</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between mb-4 text-lg">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-primary-600">$0.00</span>
              </div>
              <button className="btn-primary w-full" disabled>
                Procesar Venta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
