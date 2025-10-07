import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

type User = {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
};

type UserListResponse = {
  items: User[];
  total: number;
};

const initialForm = {
  id: '',
  username: '',
  full_name: '',
  email: '',
  role: 'cashier',
  password: '',
  is_active: true,
};

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'manager', label: 'Gerente' },
  { value: 'cashier', label: 'Cajero' },
];

const Users: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<User | null>(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const baseUrl = useMemo(() => {
    const apiBase = (import.meta.env as any).VITE_API_URL || 'http://localhost:8000/api';
    return `${apiBase}/v1/config/users`;
  }, []);

  const headers = useMemo(() => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const url = new URL(baseUrl);
      if (query) url.searchParams.set('q', query);
      url.searchParams.set('limit', '100');
      const res = await fetch(url.toString(), { headers });
      if (!res.ok) {
        if (res.status === 401) throw new Error('No autenticado. Inicia sesión.');
        if (res.status === 403) throw new Error('Acceso restringido. Requiere rol administrador.');
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail || `Error ${res.status}`);
      }
      const data: UserListResponse = await res.json();
      setUsers(data.items);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message || 'No se pudo cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEdit = (u: User) => {
    setSelected(u);
    setForm({
      id: u.id,
      username: u.username,
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      password: '',
      is_active: u.is_active,
    });
  };

  const onNew = () => {
    setSelected(null);
    setForm(initialForm);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (selected) {
        // Update (omit empty password)
        const payload: any = {
          username: form.username,
          full_name: form.full_name,
          email: form.email,
          role: form.role,
          is_active: form.is_active,
        };
        if (form.password) payload.password = form.password;
        const res = await fetch(`${baseUrl}/${selected.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          if (res.status === 401) throw new Error('No autenticado. Inicia sesión.');
          if (res.status === 403) throw new Error('Acceso restringido. Requiere rol administrador.');
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.detail || 'No se pudo actualizar el usuario');
        }
        setSuccess('Usuario actualizado');
      } else {
        // Create (password required)
        const res = await fetch(baseUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            username: form.username,
            full_name: form.full_name,
            email: form.email,
            role: form.role,
            password: form.password,
          }),
        });
        if (!res.ok) {
          if (res.status === 401) throw new Error('No autenticado. Inicia sesión.');
          if (res.status === 403) throw new Error('Acceso restringido. Requiere rol administrador.');
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.detail || 'No se pudo crear el usuario');
        }
        setSuccess('Usuario creado');
      }
      await loadUsers();
      onNew();
    } catch (e: any) {
      setError(e.message || 'Operación fallida');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (u: User) => {
    if (!confirm(`¿Eliminar usuario ${u.username}?`)) return;
    setError('');
    try {
      const res = await fetch(`${baseUrl}/${u.id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok && res.status !== 204) {
        if (res.status === 401) throw new Error('No autenticado. Inicia sesión.');
        if (res.status === 403) throw new Error('Acceso restringido. Requiere rol administrador.');
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.detail || 'No se pudo eliminar');
      }
      setSuccess('Usuario eliminado');
      await loadUsers();
      if (selected?.id === u.id) onNew();
    } catch (e: any) {
      setError(e.message || 'No se pudo eliminar');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="max-w-7xl mx-auto p-8">
        <Breadcrumb />
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Usuarios</h2>
            <p className="text-gray-600">Gestión de cuentas del sistema</p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Buscar por nombre, usuario o email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-72"
            />
            <Button onClick={loadUsers}>Buscar</Button>
            <Button variant="secondary" onClick={onNew}>Nuevo</Button>
          </div>
        </div>

        {/* Contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tabla */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-4">
            {loading ? (
              <p className="text-gray-500">Cargando usuarios...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id} className={selected?.id === u.id ? 'bg-blue-50' : ''}>
                        <td className="px-4 py-2 text-sm text-gray-900">{u.username}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{u.full_name}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{u.email}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 capitalize">{u.role}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {u.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => onEdit(u)}>Editar</Button>
                            <Button variant="danger" onClick={() => remove(u)}>Eliminar</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-sm text-gray-500" colSpan={6}>No hay usuarios</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="text-xs text-gray-500 mt-3">Total: {total}</div>
              </div>
            )}
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-lg font-semibold mb-4">{selected ? 'Editar usuario' : 'Nuevo usuario'}</h3>
            {error && (
              <div className="mb-3 p-3 bg-red-50 border-l-4 border-red-500 rounded">{error}</div>
            )}
            {success && (
              <div className="mb-3 p-3 bg-green-50 border-l-4 border-green-500 rounded">{success}</div>
            )}
            <form onSubmit={save} className="space-y-3">
              <Input label="Usuario" name="username" value={form.username} onChange={onChange} required />
              <Input label="Nombre completo" name="full_name" value={form.full_name} onChange={onChange} required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <select name="role" value={form.role} onChange={onChange} className="w-full px-3 py-2 border rounded-lg">
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <Input label={selected ? 'Nueva contraseña (opcional)' : 'Contraseña'} name="password" type="password" value={form.password} onChange={onChange} {...(selected ? {} : { required: true })} />
              <div className="flex items-center gap-2">
                <input id="is_active" name="is_active" type="checkbox" checked={form.is_active} onChange={onChange} />
                <label htmlFor="is_active" className="text-sm text-gray-700">Activo</label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : (selected ? 'Actualizar' : 'Crear')}</Button>
                {selected && <Button type="button" variant="secondary" onClick={onNew}>Cancelar</Button>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
