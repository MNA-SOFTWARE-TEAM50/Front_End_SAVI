import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  sku?: string;
  barcode?: string;
  image_url?: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type SaleItem = {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

const Sales: React.FC = () => {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [showCheckout, setShowCheckout] = useState(false);

  const API_BASE = (import.meta.env as any).VITE_API_URL || 'http://localhost:8000/api';
  const API_ROOT = API_BASE.replace(/\/?api\/?$/, '');

  const imageSrc = (p: Product) => {
    const url = p.image_url;
    if (!url) return '/product-placeholder.svg';
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('/')) return `${API_ROOT}${url}`;
    return `${API_ROOT}/${url.replace(/^\/+/, '')}`;
  };

  // Buscar productos
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.length < 2) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        const res = await apiClient.get<{ items: Product[]; total: number }>(
          `/v1/products/search?q=${encodeURIComponent(search)}&in_stock=true&limit=20`,
          token || undefined
        );
        setProducts(res.items);
      } catch (e) {
        console.error('Error searching products:', e);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, token]);

  const addToCart = (product: Product) => {
    const existing = cart.find(c => c.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        Swal.fire({ icon: 'warning', title: 'Stock máximo alcanzado', text: `Stock máximo alcanzado: ${product.stock}` });
        return;
      }
      setCart(cart.map(c => 
        c.product.id === product.id 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setSearch(''); // Limpiar búsqueda
    setProducts([]);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const item = cart.find(c => c.product.id === productId);
    if (!item) return;
    if (quantity > item.product.stock) {
      Swal.fire({ icon: 'warning', title: 'Stock máximo', text: `Stock máximo: ${item.product.stock}` });
      return;
    }
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(c => 
      c.product.id === productId ? { ...c, quantity } : c
    ));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(c => c.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setShowCheckout(false);
  };

  const subtotal = useMemo(() => 
    cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  const tax = useMemo(() => subtotal * 0.16, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const processSale = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const items: SaleItem[] = cart.map(c => ({
        product_id: c.product.id,
        product_name: c.product.name,
        quantity: c.quantity,
        unit_price: c.product.price,
        subtotal: c.product.price * c.quantity,
      }));

      await apiClient.post(
        '/v1/sales/',
        {
          items,
          subtotal,
          tax,
          discount: 0,
          total,
          payment_method: paymentMethod,
        },
        token || undefined
      );

      Swal.fire({ icon: 'success', title: 'Venta registrada', text: '¡Venta registrada exitosamente!' });
      clearCart();
    } catch (e: any) {
      const msg = e?.message || 'No se pudo procesar la venta';
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-8">
        <Breadcrumb />
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Punto de Venta</h1>
          {cart.length > 0 && (
            <button className="btn-secondary" onClick={clearCart}>
              Limpiar Carrito
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Search */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Buscar Productos</h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar por nombre, SKU o código de barras..."
                className="input-field"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            
            {loading && <div className="text-center py-4 text-gray-500">Buscando...</div>}
            
            {!loading && products.length === 0 && search.length >= 2 && (
              <div className="text-center py-12 text-gray-500">
                <p>No se encontraron productos</p>
              </div>
            )}
            
            {!loading && products.length === 0 && search.length < 2 && (
              <div className="text-center py-12 text-gray-500">
                <p>Escribe al menos 2 caracteres para buscar</p>
              </div>
            )}

            {products.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {products.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition text-left"
                  >
                    <img
                      src={imageSrc(p)}
                      alt={p.name}
                      className="h-12 w-12 object-cover rounded border bg-gray-50"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/product-placeholder.svg'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{p.name}</div>
                      <div className="text-sm text-gray-500">Stock: {p.stock}</div>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {p.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="bg-white rounded-lg shadow-sm p-6 lg:sticky lg:top-8 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Carrito ({cart.length})</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-500 mb-4">
                <p>El carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center gap-2 p-2 border rounded">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{item.product.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.product.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} × {item.quantity}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                        className="w-12 text-center border rounded text-sm"
                        min="1"
                        max={item.product.stock}
                      />
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">{subtotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">IVA (16%):</span>
                <span className="font-semibold">{tax.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
              </div>
              <div className="flex justify-between mb-4 text-lg">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-blue-600">{total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
              </div>

              {cart.length > 0 && !showCheckout && (
                <button 
                  className="btn-primary w-full mb-2"
                  onClick={() => setShowCheckout(true)}
                >
                  Continuar a Pago
                </button>
              )}

              {showCheckout && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                    <select 
                      className="input-field"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                    >
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta</option>
                      <option value="transfer">Transferencia</option>
                    </select>
                  </div>
                  <button 
                    className="btn-primary w-full"
                    onClick={processSale}
                    disabled={processing}
                  >
                    {processing ? 'Procesando...' : 'Procesar Venta'}
                  </button>
                  <button 
                    className="btn-secondary w-full"
                    onClick={() => setShowCheckout(false)}
                  >
                    Volver
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
