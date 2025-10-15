import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/api';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  sku?: string;
  barcode?: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
};

type ProductList = { items: Product[]; total: number };

const Inventory: React.FC = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    let data = items;
    if (q) {
      const query = q.toLowerCase();
      data = data.filter(p => (
        p.name.toLowerCase().includes(query) ||
        (p.sku?.toLowerCase().includes(query) ?? false) ||
        (p.barcode?.toLowerCase().includes(query) ?? false) ||
        p.category.toLowerCase().includes(query)
      ));
    }
    if (category) {
      data = data.filter(p => p.category === category);
    }
    return data;
  }, [items, q, category]);

  // Base del backend (quitar "/api" para acceder a /media)
  const API_BASE = (import.meta.env as any).VITE_API_URL || 'http://localhost:8000/api';
  const API_ROOT = API_BASE.replace(/\/?api\/?$/, '');

  const imageSrc = (p: Product) => {
    const url = p.image_url;
    if (!url) return '/product-placeholder.svg';
    if (/^https?:\/\//i.test(url)) return url; // absoluta
    if (url.startsWith('/')) return `${API_ROOT}${url}`; // relativa al backend
    return `${API_ROOT}/${url.replace(/^\/+/, '')}`;
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
  const res = await apiClient.get<ProductList>(`/v1/products?limit=100`, token || undefined);
  setItems(res.items);
    } catch (e: any) {
      setError('No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = () => fetchProducts();
    window.addEventListener('savi:import:done', handler);
    return () => window.removeEventListener('savi:import:done', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAdd = () => {
    setEditing(null);
    setShowModal(true);
  };

  const onEdit = (p: Product) => {
    setEditing(p);
    setShowModal(true);
  };

  const onDelete = async (p: Product) => {
    const res = await Swal.fire({
      icon: 'warning',
      title: 'Eliminar producto',
      text: `¿Eliminar producto "${p.name}"?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!res.isConfirmed) return;
    try {
      await apiClient.delete(`/v1/products/${p.id}`, token || undefined);
      await fetchProducts();
    } catch (e: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el producto' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-8">
        <Breadcrumb />
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          <button className="btn-primary" onClick={onAdd}>
            Agregar Producto
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar por nombre, SKU, código de barras o categoría"
              className="input-field"
            />
            <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Todas las categorías</option>
              {[...new Set(items.map(i => i.category))].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div />
          </div>

          <div className="mt-4 mb-6 flex items-center gap-3">
            <input id="import-file" type="file" accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" className="hidden" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              // store selected file on window for the modal to access
              (window as any).__savi_import_file = f;
              // auto-run verify and show preview modal
              try {
                const fd = new FormData();
                fd.append('file', f);
                const res = await fetch(`${(import.meta.env as any).VITE_API_URL || 'http://localhost:8000/api'}/v1/imports/products/verify`, {
                  method: 'POST',
                  body: fd,
                  headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  } as any
                });
                if (!res.ok) {
                  const t = await res.text();
                  throw new Error(t || 'Error al verificar archivo');
                }
                const json = await res.json();
                (window as any).__savi_import_preview = json;
                // show modal with preview
                const ev = new CustomEvent('savi:import:preview');
                window.dispatchEvent(ev);
              } catch (err: any) {
                await Swal.fire({ icon: 'error', title: 'Error al verificar', text: err?.message || 'Error al verificar archivo' });
              }
            }} />
            <label htmlFor="import-file" className="btn-secondary cursor-pointer">Seleccionar archivo CSV/XLSX</label>
            <div className="text-sm text-gray-500">Máx. 20MB; columnas: SKU, name, cantidad, precio, categoria</div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">Cargando inventario...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No hay productos en el inventario</td>
                    </tr>
                  ) : (
                    filtered.map(p => (
                      <tr key={p.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={imageSrc(p)}
                            alt={p.name}
                            className="h-12 w-12 object-cover rounded border border-gray-200 bg-gray-50"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/product-placeholder.svg'; }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.sku || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.barcode || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.stock}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button className="btn-secondary" onClick={() => onEdit(p)}>Editar</button>
                            <button className="btn-danger" onClick={() => onDelete(p)}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProductModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchProducts(); }}
          editing={editing}
        />
      )}
      <ImportPreviewModal />
    </div>
  );
};

export default Inventory;

// Modal de producto (crear/editar)
const ProductModal: React.FC<{ onClose: () => void; onSaved: () => void; editing: Product | null }> = ({ onClose, onSaved, editing }) => {
  const { token } = useAuth();
  const [form, setForm] = useState<Partial<Product>>({
    name: editing?.name || '',
    category: editing?.category || '',
    price: editing?.price ?? 0,
    stock: editing?.stock ?? 0,
    sku: editing?.sku || '',
    barcode: editing?.barcode || '',
    description: editing?.description || '',
    image_url: editing?.image_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const update = (k: keyof Product, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let productId = editing?.id;
      if (editing) {
        await apiClient.put(`/v1/products/${editing.id}`, form, token || undefined);
      } else {
        const created = await apiClient.post<Product>(`/v1/products`, form, token || undefined);
        productId = created.id;
      }
      // Subir imagen si se seleccionó un archivo
      if (file && productId) {
        const fd = new FormData();
        fd.append('file', file);
        await fetch(`${(import.meta.env as any).VITE_API_URL || 'http://localhost:8000/api'}/v1/products/${productId}/image`, {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          } as any,
          body: fd,
        });
      }
      onSaved();
    } catch (e: any) {
      const msg = e?.message?.includes('400') ? 'SKU o código de barras ya existe' : 'No se pudo guardar el producto';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">{editing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <form onSubmit={onSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Nombre</label>
            <input className="input-field" value={form.name || ''} onChange={e => update('name', e.target.value)} required />
          </div>
          <div>
            <label className="label">Categoría</label>
            <input className="input-field" value={form.category || ''} onChange={e => update('category', e.target.value)} required />
          </div>
          <div>
            <label className="label">Precio</label>
            <input type="number" step="0.01" className="input-field" value={form.price ?? 0} onChange={e => update('price', parseFloat(e.target.value))} required />
          </div>
          <div>
            <label className="label">Stock</label>
            <input type="number" className="input-field" value={form.stock ?? 0} onChange={e => update('stock', parseInt(e.target.value || '0'))} required />
          </div>
          <div>
            <label className="label">SKU</label>
            <input className="input-field" value={form.sku || ''} onChange={e => update('sku', e.target.value)} placeholder="Opcional, único" />
          </div>
          <div>
            <label className="label">Código de barras</label>
            <input className="input-field" value={form.barcode || ''} onChange={e => update('barcode', e.target.value)} placeholder="Opcional, único" />
          </div>
          <div className="md:col-span-2">
            <label className="label">Descripción</label>
            <textarea className="input-field" value={form.description || ''} onChange={e => update('description', e.target.value)} rows={3} />
          </div>
          <div className="md:col-span-2">
            <label className="label">URL de imagen</label>
            <input className="input-field" value={form.image_url || ''} onChange={e => update('image_url', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Subir imagen (opcional)</label>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} className="input-field" />
            <p className="text-xs text-gray-500 mt-1">Máx. 5MB. Se guardará y servirá desde el backend.</p>
          </div>
          {error && (
            <div className="md:col-span-2 text-sm text-red-600">{error}</div>
          )}
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Import preview modal
const ImportPreviewModal: React.FC = () => {
  const [preview, setPreview] = React.useState<any>(null);

  useEffect(() => {
    const handler = () => {
      setPreview((window as any).__savi_import_preview || null);
    };
    window.addEventListener('savi:import:preview', handler);
    return () => window.removeEventListener('savi:import:preview', handler);
  }, []);

  if (!preview) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-6 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Preview de importación - {preview.filename}</h3>
          <div className="flex items-center gap-3">
            <button onClick={() => { (window as any).__savi_import_preview = undefined; setPreview(null); }} className="btn-secondary">Anular importación</button>
            <button onClick={async () => {
              const f = (window as any).__savi_import_file as File | undefined;
              if (!f) {
                await Swal.fire({ icon: 'warning', title: 'Archivo no encontrado', text: 'No se encontró el archivo seleccionado' });
                return;
              }
              try {
                const fd = new FormData();
                fd.append('file', f);
                const res = await fetch(`${(import.meta.env as any).VITE_API_URL || 'http://localhost:8000/api'}/v1/imports/products`, {
                  method: 'POST',
                  body: fd,
                  headers: {
                    ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
                  } as any
                });
                if (!res.ok) {
                  const t = await res.text();
                  throw new Error(t || 'Error al importar archivo');
                }
                const json = await res.json();
                await Swal.fire({
                  icon: 'success',
                  title: 'Importación completada',
                  html: `Insertados: <strong>${json.inserted}</strong><br/>Actualizados: <strong>${json.updated}</strong><br/>Fallidos: <strong>${json.failed}</strong>`
                });
                // close modal and clear temp
                (window as any).__savi_import_preview = undefined;
                (window as any).__savi_import_file = undefined;
                setPreview(null);
                // dispatch event to notify parent to refresh products
                window.dispatchEvent(new CustomEvent('savi:import:done'));
              } catch (err: any) {
                await Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Error al importar archivo' });
              }
            }} className="btn-primary">Subir inventario</button>
          </div>
        </div>
        <div className="p-4">
          <div className="mb-4 text-sm text-gray-600">Filas detectadas: {preview.total_rows ?? 0} · Preview mostrada: {preview.preview_count ?? 0} · Errores críticos: {preview.critical_errors ?? 0}</div>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">SKU</th>
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-left">Cantidad</th>
                <th className="p-2 text-left">Precio</th>
                <th className="p-2 text-left">Errores</th>
              </tr>
            </thead>
            <tbody>
              {(preview.preview || []).map((r: any) => (
                <tr key={r.row} className="odd:bg-white even:bg-gray-50">
                  <td className="p-2">{r.row}</td>
                  <td className="p-2">{r.data.sku ?? '-'}</td>
                  <td className="p-2">{r.data.name ?? '-'}</td>
                  <td className="p-2">{r.data.quantity ?? '-'}</td>
                  <td className="p-2">{r.data.price ?? '-'}</td>
                  <td className="p-2 text-red-600">{(r.errors || []).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

