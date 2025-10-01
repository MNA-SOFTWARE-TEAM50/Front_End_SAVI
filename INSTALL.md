# Guía de Instalación - Frontend SAVI

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

### 1. Node.js y npm

Verifica que tengas Node.js 18 o superior:

```powershell
node --version
```

Debe mostrar v18.x.x o superior.

Verifica npm:

```powershell
npm --version
```

Debe mostrar 9.x.x o superior.

**Si no tienes Node.js instalado:**
1. Descarga desde: https://nodejs.org/
2. Instala la versión LTS (recomendada)
3. Reinicia tu terminal después de la instalación

### 2. Backend SAVI

El frontend requiere que el backend esté corriendo:
- URL del backend: http://localhost:8000
- Ver instrucciones en: `../Back_End_SAVI/INSTALL.md`

## 🔧 Instalación Paso a Paso

### Paso 1: Clonar/Navegar al Proyecto

```powershell
cd "C:\Users\LmCas\OneDrive\Documentos\Desarrollo\Maestria\SAVI\Front_End_SAVI"
```

### Paso 2: Instalar Dependencias

```powershell
npm install
```

Esto instalará todas las dependencias necesarias:
- ✅ React 18
- ✅ TypeScript
- ✅ Vite
- ✅ Tailwind CSS v3
- ✅ React Router
- ✅ ESLint
- ✅ PostCSS & Autoprefixer

**Tiempo estimado:** 1-2 minutos

**Si hay errores:**

```powershell
# Limpiar caché y reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Paso 3: Configurar Variables de Entorno

1. Copia el archivo de ejemplo:

```powershell
copy .env.example .env
```

2. Abre el archivo `.env` y verifica la configuración:

```env
# URL del backend API
VITE_API_URL=http://localhost:8000/api

# Nombre de la aplicación
VITE_APP_NAME=SAVI

# Ambiente
VITE_ENV=development
```

**Importante:** Si tu backend usa un puerto diferente, actualiza `VITE_API_URL`.

### Paso 4: Verificar Estructura del Proyecto

Tu carpeta debe verse así:

```
Front_End_SAVI/
├── node_modules/     ✅ Dependencias instaladas
├── public/           ✅ Archivos estáticos
├── src/              ✅ Código fuente
├── .env              ✅ Variables de entorno
├── package.json      ✅ Configuración del proyecto
└── vite.config.ts    ✅ Configuración de Vite
```

### Paso 5: Iniciar Servidor de Desarrollo

```powershell
npm run dev
```

Deberías ver algo como:

```
  VITE v7.1.7  ready in 237 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Paso 6: Abrir en el Navegador

Abre tu navegador y ve a: **http://localhost:5173**

Deberías ver la página principal de SAVI con:
- ✅ Header con logo
- ✅ Tres tarjetas (Ventas, Inventario, Reportes)
- ✅ Estadísticas (Ventas Hoy, Productos, Clientes, Transacciones)

## ✅ Verificación de Instalación

### 1. Verificar que el servidor está corriendo

La terminal debe mostrar:
```
➜  Local:   http://localhost:5173/
```

### 2. Verificar Hot Module Replacement (HMR)

1. Abre `src/App.tsx`
2. Cambia algún texto
3. Guarda el archivo
4. La página debe actualizarse automáticamente sin recargar

### 3. Verificar conexión con Backend

Abre las herramientas de desarrollador del navegador (F12) y verifica:
- No debe haber errores de CORS
- La consola debe estar limpia de errores

## 🎨 Personalización

### Cambiar Puerto del Servidor

Si el puerto 5173 está ocupado, puedes cambiarlo en `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Cambia a tu puerto preferido
    open: true, // Abre automáticamente el navegador
  },
})
```

### Cambiar URL del Backend

Edita el archivo `.env`:

```env
VITE_API_URL=http://tu-servidor:puerto/api
```

### Personalizar Tema Tailwind

Edita `tailwind.config.js`:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          // Cambia estos valores para tu color principal
          600: '#0284c7',
          700: '#0369a1',
        },
      },
    },
  },
  plugins: [],
}
```

## 🚀 Comandos Disponibles

### Desarrollo

```powershell
# Iniciar servidor de desarrollo
npm run dev

# Iniciar servidor y abrir navegador
npm run dev -- --open
```

### Build

```powershell
# Crear build de producción
npm run build

# Los archivos se generarán en la carpeta 'dist'
```

### Preview

```powershell
# Vista previa del build de producción
npm run preview
```

### Linting

```powershell
# Ejecutar ESLint
npm run lint

# Corregir errores automáticamente
npm run lint -- --fix
```

## 🐛 Solución de Problemas

### Error: "ENOENT: no such file or directory"

**Solución:**
```powershell
# Asegúrate de estar en el directorio correcto
cd "C:\Users\LmCas\OneDrive\Documentos\Desarrollo\Maestria\SAVI\Front_End_SAVI"

# Reinstala dependencias
npm install
```

### Error: "Port 5173 is already in use"

**Solución:**
```powershell
# Detén el proceso que está usando el puerto
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process

# O usa otro puerto
npm run dev -- --port 3000
```

### Error: "Cannot find module 'vite'"

**Solución:**
```powershell
# Reinstala las dependencias
Remove-Item -Recurse -Force node_modules
npm install
```

### Error: CORS al conectar con el backend

**Solución:**

1. Verifica que el backend esté corriendo en http://localhost:8000
2. Verifica la configuración CORS en el backend (`.env`):
   ```
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   ```
3. Reinicia el backend después de cambiar la configuración

### Error: "Unknown at rule @tailwind"

**Esto es normal.** VS Code no reconoce las directivas de Tailwind, pero funciona correctamente.

**Para eliminar el error:**
1. Instala la extensión "Tailwind CSS IntelliSense"
2. O ignora el error (no afecta la funcionalidad)

### Estilos de Tailwind no se aplican

**Solución:**
```powershell
# 1. Verifica que existe postcss.config.js
# 2. Verifica que existe tailwind.config.js
# 3. Limpia caché y reinicia
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

### Hot Reload no funciona

**Solución:**
```powershell
# Reinicia el servidor
# Presiona Ctrl+C para detener
npm run dev
```

## 📦 Estructura del Proyecto

```
Front_End_SAVI/
├── public/              # Archivos estáticos (no procesados)
│   └── vite.svg
├── src/                 # Código fuente
│   ├── assets/         # Imágenes, íconos
│   ├── components/     # Componentes reutilizables
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── index.ts
│   ├── hooks/          # Custom hooks
│   │   └── useAsync.ts
│   ├── pages/          # Páginas/vistas
│   │   ├── Dashboard.tsx
│   │   ├── Sales.tsx
│   │   └── Inventory.tsx
│   ├── services/       # Servicios API
│   │   └── api.ts
│   ├── types/          # Tipos TypeScript
│   │   └── index.ts
│   ├── utils/          # Utilidades
│   │   └── helpers.ts
│   ├── App.tsx         # Componente principal
│   ├── main.tsx        # Punto de entrada
│   └── index.css       # Estilos globales
├── .env                # Variables de entorno (NO SUBIR A GIT)
├── .env.example        # Ejemplo de variables
├── .gitignore          # Archivos ignorados por Git
├── index.html          # HTML principal
├── package.json        # Dependencias y scripts
├── tailwind.config.js  # Configuración Tailwind
├── tsconfig.json       # Configuración TypeScript
└── vite.config.ts      # Configuración Vite
```

## 🔗 Conectar con el Backend

### 1. Verificar que el backend está corriendo

```powershell
# En otra terminal, ve al directorio del backend
cd ..\Back_End_SAVI

# Activa el entorno virtual
.\venv\Scripts\Activate.ps1

# Inicia el servidor
uvicorn app.main:app --reload
```

### 2. Verificar la URL en el frontend

Archivo `.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Probar la conexión

Abre las herramientas de desarrollador (F12) y prueba:

```javascript
// En la consola del navegador
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(data => console.log(data))
```

Deberías ver:
```json
{
  "status": "healthy",
  "environment": "development"
}
```

## 📱 Configuración para Producción

### 1. Build de producción

```powershell
npm run build
```

### 2. Configurar variables de entorno

Crea `.env.production`:

```env
VITE_API_URL=https://tu-api-produccion.com/api
VITE_APP_NAME=SAVI
VITE_ENV=production
```

### 3. Preview local del build

```powershell
npm run preview
```

### 4. Desplegar

Los archivos en la carpeta `dist/` están listos para desplegar en:
- Vercel
- Netlify
- GitHub Pages
- Servidor web (Apache/Nginx)

## 🎓 Próximos Pasos

1. ✅ Frontend funcionando en http://localhost:5173
2. ✅ Backend funcionando en http://localhost:8000
3. 🔜 Implementar login y autenticación
4. 🔜 Conectar páginas con API del backend
5. 🔜 Agregar validación de formularios
6. 🔜 Implementar manejo de errores
7. 🔜 Agregar notificaciones (toasts)
8. 🔜 Implementar estado global (Context API o Zustand)

## 📚 Recursos Útiles

- **Documentación de Vite**: https://vitejs.dev
- **Documentación de React**: https://react.dev
- **Documentación de Tailwind**: https://tailwindcss.com/docs
- **Documentación de TypeScript**: https://www.typescriptlang.org/docs

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs en la consola del navegador (F12)
2. Revisa los logs en la terminal donde corre Vite
3. Verifica que el backend esté corriendo
4. Consulta la documentación de cada tecnología

## ✨ Características del Proyecto

- ✅ Hot Module Replacement (HMR)
- ✅ TypeScript para tipado estático
- ✅ Tailwind CSS para estilos
- ✅ Componentes reutilizables
- ✅ Estructura organizada
- ✅ ESLint configurado
- ✅ Optimización automática de producción
- ✅ Soporte para variables de entorno

---

¡Frontend SAVI listo para desarrollar! 🚀

Para continuar con el desarrollo, consulta [SETUP.md](./SETUP.md) para más detalles sobre la estructura del proyecto y cómo crear nuevos componentes y páginas.
