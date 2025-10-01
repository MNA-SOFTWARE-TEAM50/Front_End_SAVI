import React from 'react';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';

const Inventory: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-8">
        {/* Breadcrumb */}
        <Breadcrumb />
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <button className="btn-primary">
            Agregar Producto
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Buscar producto..."
              className="input-field"
            />
            <select className="input-field">
              <option value="">Todas las categorías</option>
              <option value="electronics">Electrónica</option>
              <option value="clothing">Ropa</option>
              <option value="food">Alimentos</option>
            </select>
            <select className="input-field">
              <option value="">Todos</option>
              <option value="low">Stock bajo</option>
              <option value="out">Agotados</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No hay productos en el inventario
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
