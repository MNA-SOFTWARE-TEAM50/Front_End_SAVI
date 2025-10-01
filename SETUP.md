# Guía de Desarrollo - SAVI Frontend

> **¿Primera vez aquí?** Consulta primero [INSTALL.md](./INSTALL.md) para instrucciones de instalación.

## 📖 Navegación Rápida

- [Instalación](./INSTALL.md) - Guía paso a paso para instalar el proyecto
- [README](./README.md) - Información general del proyecto
- Esta guía - Desarrollo y uso de componentes

---

## ✅ Estado del Proyecto

El proyecto ha sido inicializado exitosamente con:

- ✅ React 18 con TypeScript
- ✅ Vite como build tool
- ✅ Tailwind CSS configurado
- ✅ React Router instalado
- ✅ Estructura de carpetas organizada
- ✅ Componentes base creados
- ✅ Páginas principales creadas
- ✅ Sistema de tipos TypeScript
- ✅ Utilidades y hooks personalizados

## 📂 Estructura Actual

```
Front_End_SAVI/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── Button.tsx    # Botón con variantes
│   │   ├── Card.tsx      # Tarjeta contenedora
│   │   ├── Input.tsx     # Input con validación
│   │   └── index.ts      # Exportador de componentes
│   │
│   ├── pages/            # Vistas principales
│   │   ├── Dashboard.tsx # Vista del dashboard
│   │   ├── Sales.tsx     # Punto de venta
│   │   ├── Inventory.tsx # Gestión de inventario
│   │   └── index.ts      # Exportador de páginas
│   │
│   ├── services/         # Servicios API
│   │   └── api.ts        # Cliente HTTP configurado
│   │
│   ├── types/            # Definiciones TypeScript
│   │   └── index.ts      # Tipos e interfaces
│   │
│   ├── utils/            # Funciones de utilidad
│   │   └── helpers.ts    # Helpers generales
│   │
│   ├── hooks/            # Custom hooks
│   │   └── useAsync.ts   # Hook para async/await
│   │
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Punto de entrada
│   └── index.css         # Estilos globales + Tailwind
│
├── .env                  # Variables de entorno
├── .env.example          # Ejemplo de variables
├── package.json          # Dependencias
├── tailwind.config.js    # Configuración Tailwind
├── tsconfig.json         # Configuración TypeScript
└── vite.config.ts        # Configuración Vite
```

## 🚀 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo en http://localhost:5173

# Producción
npm run build           # Compila para producción
npm run preview         # Preview del build de producción

# Calidad de código
npm run lint            # Ejecuta ESLint
```

## 🎨 Componentes Disponibles

### Button
```tsx
import { Button } from './components';

<Button variant="primary">Guardar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="danger">Eliminar</Button>
```

### Card
```tsx
import { Card } from './components';

<Card className="hover:shadow-lg">
  <h2>Título</h2>
  <p>Contenido</p>
</Card>
```

### Input
```tsx
import { Input } from './components';

<Input
  label="Nombre del producto"
  type="text"
  placeholder="Ingrese el nombre"
  value={name}
  onChange={(e) => setName(e.target.value)}
  error={errors.name}
/>
```

## 📄 Páginas Creadas

1. **Dashboard** (`/`) - Vista principal con estadísticas y métricas
2. **Sales** (`/sales`) - Punto de venta para realizar transacciones
3. **Inventory** (`/inventory`) - Gestión de productos e inventario

## 🔧 Servicios API

El cliente API está configurado en `src/services/api.ts`:

```typescript
import { apiClient } from './services/api';

// GET
const products = await apiClient.get<Product[]>('/products');

// POST
const newProduct = await apiClient.post<Product>('/products', productData);

// PUT
const updated = await apiClient.put<Product>('/products/1', updates);

// DELETE
await apiClient.delete('/products/1');
```

## 🎣 Hooks Personalizados

### useAsync
```typescript
import { useAsync } from './hooks/useAsync';

const { data, status, error, execute } = useAsync(
  async () => apiClient.get<Product[]>('/products'),
  true // ejecutar inmediatamente
);

// status puede ser: 'idle' | 'pending' | 'success' | 'error'
```

## 🛠️ Utilidades

```typescript
import { formatCurrency, formatDate, debounce } from './utils/helpers';

// Formatear moneda
formatCurrency(1500.50); // "$1,500.50"

// Formatear fecha
formatDate(new Date()); // "1 de octubre de 2025"

// Debounce
const debouncedSearch = debounce(searchFunction, 300);
```

## 🎨 Estilos con Tailwind

El proyecto usa clases de utilidad de Tailwind CSS. Algunas clases personalizadas:

```css
/* Botones */
.btn-primary
.btn-secondary

/* Tarjetas */
.card

/* Inputs */
.input-field
```

## 🌈 Paleta de Colores

Los colores primarios están configurados en `tailwind.config.js`:

- `primary-50` a `primary-900` - Azul (color principal)
- Colores estándar de Tailwind para el resto

## 🔐 Variables de Entorno

Crear un archivo `.env` basado en `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=SAVI
VITE_ENV=development
```

## 📝 Tipos TypeScript

Los tipos principales están en `src/types/index.ts`:

- `Product` - Productos del inventario
- `Sale` - Ventas realizadas
- `SaleItem` - Items de una venta
- `Customer` - Clientes
- `User` - Usuarios del sistema
- `PaymentMethod` - Métodos de pago
- `SaleStatus` - Estados de venta
- `UserRole` - Roles de usuario

## 🚀 Próximos Pasos

1. **Integrar React Router** - Configurar enrutamiento entre páginas
2. **Conectar con Backend** - Implementar llamadas API reales
3. **Estado Global** - Agregar Context API o Zustand para estado
4. **Autenticación** - Implementar login y manejo de sesiones
5. **Formularios** - Agregar validación con React Hook Form
6. **Notificaciones** - Implementar sistema de toast/alerts
7. **Modo Oscuro** - Agregar toggle para tema oscuro
8. **Reportes** - Crear gráficas con Chart.js o Recharts
9. **Testing** - Agregar tests con Vitest y Testing Library
10. **PWA** - Convertir en Progressive Web App

## 🐛 Notas

- Los errores de `@tailwind` y `@apply` en el CSS son normales, VSCode no reconoce estas directivas pero funcionan correctamente
- El proyecto está listo para comenzar el desarrollo
- Todos los componentes son funcionales y responsivos

## 📚 Recursos

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com)

---

**¡El proyecto está listo para comenzar el desarrollo!** 🎉
