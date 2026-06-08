# Guia rapida del proyecto (para alguien de Angular)

## 1) Flujo de arranque
- El HTML base es [index.html](index.html). El punto de entrada React esta en [src/main.jsx](src/main.jsx).
- En [src/main.jsx](src/main.jsx) se crea el root y se monta la app con `BrowserRouter`.
- [src/App.jsx](src/App.jsx) solo renderiza el enrutador principal [src/routes/AppRouter.jsx](src/routes/AppRouter.jsx).

Equivalencias con Angular:
- `main.jsx` es parecido a `main.ts` + bootstrap en Angular.
- `App.jsx` seria el componente raiz (como `AppComponent`).
- `AppRouter.jsx` equivale a tu `RouterModule` con rutas.

## 2) Enrutamiento
Las rutas se definen en [src/routes/AppRouter.jsx](src/routes/AppRouter.jsx) usando `react-router-dom`.
- `/login` muestra [src/pages/Login.jsx](src/pages/Login.jsx) sin layout.
- El resto de rutas envuelven cada pagina con [src/components/Layout.jsx](src/components/Layout.jsx).
- Hay rutas de modulo en desarrollo que usan un componente interno `ComingSoon`.

## 3) Layout y navegacion
El layout general esta en [src/components/Layout.jsx](src/components/Layout.jsx):
- Sidebar con menu y datos del usuario.
- Topbar con breadcrumb, buscador y notificaciones.
- El menu se construye desde [src/config/menu.js](src/config/menu.js) segun rol.

Equivalencia Angular:
- `Layout` funciona como un componente shell (similar a un layout con `router-outlet`).

## 4) Paginas (views)
Cada pagina esta en [src/pages](src/pages):
- [src/pages/Dashboard.jsx](src/pages/Dashboard.jsx) muestra KPIs, grafica de barras, donut y un bloque de mapa (mock).
- [src/pages/Jac.jsx](src/pages/Jac.jsx) tiene filtros, tabla y estado local con `useState`.
- [src/pages/Asocomunales.jsx](src/pages/Asocomunales.jsx), [src/pages/Usuarios.jsx](src/pages/Usuarios.jsx) son placeholders.
- [src/pages/Login.jsx](src/pages/Login.jsx) contiene el formulario de acceso y navega a `/` al enviar.

## 5) Componentes UI reutilizables
En [src/components/ui](src/components/ui):
- [src/components/ui/KpiCard.jsx](src/components/ui/KpiCard.jsx): tarjeta KPI.
- [src/components/ui/PageHeader.jsx](src/components/ui/PageHeader.jsx): encabezado de pagina con titulo y acciones.
- [src/components/ui/SearchBar.jsx](src/components/ui/SearchBar.jsx): input de busqueda.
- [src/components/ui/SelectFilter.jsx](src/components/ui/SelectFilter.jsx): select con estilos.
- [src/components/ui/Badge.jsx](src/components/ui/Badge.jsx): etiqueta de estado.
- [src/components/ui/EmptyState.jsx](src/components/ui/EmptyState.jsx): fila para tabla vacia.

Equivalencia Angular:
- `props` en React son como `@Input()`.
- Callbacks por props son como `@Output()`.

## 6) Estado y datos
- Se usa `useState` de React en [src/pages/Jac.jsx](src/pages/Jac.jsx) y [src/pages/Login.jsx](src/pages/Login.jsx).
- Los datos son mock (arrays locales). No hay servicios ni llamadas HTTP aun.

Equivalencia Angular:
- En React no hay servicios por defecto; se suelen crear modulos propios (por ejemplo en `src/services`).

## 7) Estilos
- El proyecto usa Tailwind CSS (ver [src/index.css](src/index.css) y [tailwind.config.js](tailwind.config.js)).
- Las clases Tailwind aparecen directamente en `className`.
- [src/App.css](src/App.css) parece venir del template de Vite y no se importa en el flujo principal.

## 8) Dependencias clave
- React 19 y React Router 7 (ver [package.json](package.json)).
- Iconos con `lucide-react`.
- Bundler: Vite (scripts en [package.json](package.json)).

## 9) Sugerencias para orientarte rapido
1. Abre [src/routes/AppRouter.jsx](src/routes/AppRouter.jsx) para ver el mapa general de vistas.
2. Revisa [src/components/Layout.jsx](src/components/Layout.jsx) para entender la estructura global.
3. Entra a [src/pages/Dashboard.jsx](src/pages/Dashboard.jsx) y [src/pages/Jac.jsx](src/pages/Jac.jsx) para ver los patrones de UI.

Si quieres, puedo ampliar la guia con un diagrama simple de flujo o proponer una estructura de servicios similar a Angular.