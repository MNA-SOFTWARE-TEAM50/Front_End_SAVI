# SAVI - Sistema de Administración de Ventas e Inventario

Frontend desarrollado con React, TypeScript, Vite y Tailwind CSS para el punto de venta SAVI.

## 🚀 Tecnologías

- **React 18** - Librería de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Navegación
- **Axios/Fetch** - Peticiones HTTP

## 📋 Requisitos Previos

- Node.js 18 o superior
- npm 9 o superior
- Backend SAVI corriendo en http://localhost:8000

## 🔧 Instalación Rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
copy .env.example .env

# 3. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: http://localhost:5173

## 📝 Scripts Disponibles

```bash
npm run dev      # Modo desarrollo con hot-reload
npm run build    # Build para producción
npm run preview  # Preview del build de producción
npm run lint     # Ejecutar ESLint
```

## 🔗 Endpoints del Backend

El frontend se conecta al backend en: `http://localhost:8000/api/v1`

Endpoints disponibles:
- `/auth/login` - Autenticación
- `/products` - Gestión de productos
- `/sales` - Gestión de ventas
- `/customers` - Gestión de clientes

## 📚 Documentación Adicional

Para instrucciones detalladas de instalación, ver: [INSTALL.md](./INSTALL.md)
Para guía de desarrollo, ver: [SETUP.md](./SETUP.md)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

MNA-SOFTWARE-TEAM50

---

## Configuración Avanzada de ESLint

Si estás desarrollando una aplicación de producción, puedes actualizar la configuración para habilitar reglas de lint type-aware:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
