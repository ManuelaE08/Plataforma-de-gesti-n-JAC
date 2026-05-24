<div align="center">

# JAC Management Platform

**A modern web platform to manage Juntas de Acción Comunal (JAC), Asocomunales, and community affiliates.**

Built by [Equipo Orbit](https://github.com/Proyecto-Orbit) — React 19 · TypeScript · Vite · Tailwind · Keycloak

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Keycloak](https://img.shields.io/badge/Auth-Keycloak-4D4D4D?logo=keycloak&logoColor=white)](https://www.keycloak.org)
[![License](https://img.shields.io/badge/License-See%20LICENSE-blue)](LICENSE)

</div>

---

## Overview

The **JAC Management Platform** is the frontend layer of a microservices ecosystem designed to digitize the operations of Colombian *Juntas de Acción Comunal* — neighborhood civic organizations recognized by law. It centralizes the management of community boards, their affiliates, asocomunal federations, and the audit trail behind every change.

The frontend is a React 19 single-page application that talks to several backend microservices through an **API Gateway**, with authentication and authorization delegated to **Keycloak**.

---

## Features

- **Role-aware dashboards** — anonymous, operator, admin, and superadmin each get a tailored landing experience and navigation menu.
- **JAC directory** — searchable, filterable catalog of community boards with detail pages and georeferenced data.
- **Asocomunal management** — track regional federations, their member JACs, and their organizational status.
- **Affiliates** — registry of community members linked to each JAC, with full lifecycle management.
- **Maker-checker workflow** — operators *propose* changes via a request system; admins approve, reject, or send them back for revision. Full traceability included.
- **User administration** — superadmins create, update, and deactivate admins and operators through the Keycloak Admin REST API.
- **Analytics & alerts** — KPIs, charts (bar, donut), risk indicators, and organizational health metrics.
- **Interactive map** — Leaflet-based visualization for the Cauca department, showing JAC distribution at a glance.
- **Reports** — exportable data (XLSX) for stakeholders and audits.
- **Data migration** — guided importer for legacy spreadsheets into the new schema.
- **Dark mode** — built-in light/dark theme with Tailwind.
- **Audit-friendly** — every privileged action passes through a dedicated audit microservice.

---

## Screenshots / Demo

> _Replace the placeholders below with real screenshots or a short GIF demo._

| Public dashboard | Admin dashboard | JAC detail |
|---|---|---|
| ![Public dashboard placeholder](public/screenshots/public-dashboard.png) | ![Admin dashboard placeholder](public/screenshots/admin-dashboard.png) | ![JAC detail placeholder](public/screenshots/jac-detail.png) |

| Requests (maker-checker) | Cauca map | Dark mode |
|---|---|---|
| ![Requests placeholder](public/screenshots/requests.png) | ![Map placeholder](public/screenshots/map.png) | ![Dark mode placeholder](public/screenshots/dark-mode.png) |

---

## Architecture

The platform follows a **microservices architecture** where this React frontend is one of several clients that talk to backend services through a centralized **API Gateway**. Authentication is fully delegated to **Keycloak** via the OAuth 2.0 / OpenID Connect Authorization Code flow with PKCE.

```
                            ┌──────────────────────────┐
                            │        Keycloak          │
                            │  Realm: jac-project      │
                            │  Client: frontend-client │
                            └────────────┬─────────────┘
                                         │  OIDC (PKCE S256)
                                         ▼
┌────────────────────┐   Bearer JWT   ┌──────────────────────────┐
│  React Frontend    │ ─────────────► │      API Gateway         │
│  (this repo)       │                │   localhost:4000/api     │
│  Vite + TS + TW    │ ◄───────────── │                          │
└────────────────────┘                └─────┬─────┬──────┬──────┘
                                            │     │      │
                       ┌────────────────────┘     │      └────────────────────┐
                       ▼                          ▼                           ▼
              ┌─────────────────┐        ┌─────────────────┐         ┌─────────────────┐
              │   Auth Service  │        │   JAC Service   │         │  Audit Service  │
              │  (Keycloak      │        │  Asocomunales,  │         │  Trail of every │
              │   Admin proxy)  │        │  Affiliates...  │         │  privileged op  │
              └─────────────────┘        └─────────────────┘         └─────────────────┘
```

### Frontend responsibilities

- Acquire and refresh Keycloak tokens (`keycloak-js@26`, PKCE S256).
- Automatically inject `Authorization: Bearer <token>` into every request that targets the API Gateway via a `window.fetch` interceptor.
- Resolve the active user's role from the JWT `realm_access.roles` claim and pick the most privileged one (`superadmin > admin > operador`).
- Render role-specific menus, routes, and UI affordances.

### Role model

| Role         | Created in Keycloak | Can do                                                                 |
|--------------|---------------------|------------------------------------------------------------------------|
| `superadmin` | Manually            | Everything `admin` does + create / disable / delete admins.            |
| `admin`      | Via Auth Service    | Manage JAC / asocomunales; create / edit / delete operators; approve requests. |
| `operador`   | Via Auth Service    | Propose changes through the maker-checker flow.                        |
| `usuario`    | Not authenticated   | Read-only public access to dashboards and directories.                 |

---

## Tech stack

**Core**
- [React 19](https://react.dev) + [TypeScript 6](https://www.typescriptlang.org)
- [Vite 5](https://vitejs.dev) as bundler and dev server
- [React Router v7](https://reactrouter.com)
- [TailwindCSS 3](https://tailwindcss.com) for styling

**Auth & data**
- [keycloak-js 26](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter) — OIDC client with PKCE
- Custom `authClient` wrapper over `fetch` with automatic token refresh and retry on 401

**UI & utilities**
- [Lucide React](https://lucide.dev) — icons
- [Leaflet](https://leafletjs.com) + [react-leaflet](https://react-leaflet.js.org) — maps
- [SweetAlert2](https://sweetalert2.github.io) — modals
- [SheetJS (xlsx)](https://sheetjs.com) — report exports

**Tooling**
- [Vitest 4](https://vitest.dev) + [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro)
- [ESLint 9](https://eslint.org) flat config
- [Docker](https://www.docker.com) — multi-stage build, Nginx-served SPA

---

## Getting started

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- A running **Keycloak** instance (realm + public client configured)
- The backend microservices and **API Gateway** running locally (or the URLs to remote ones)

### Install

```bash
git clone https://github.com/Proyecto-Orbit/Plataforma-de-gesti-n-JAC.git
cd Plataforma-de-gesti-n-JAC
npm install
```

### Configure

Copy `.env.example` to `.env` and adjust to your environment:

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_AUTH=http://localhost:4000/api/auth

VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=jac-project
VITE_KEYCLOAK_CLIENT_ID=frontend-client
```

### Run

```bash
npm run dev        # start Vite dev server (http://localhost:5173 by default)
npm run build      # production build (output: dist/)
npm run preview    # preview the production build locally
npm run lint       # ESLint
npm run test       # Vitest, one-shot
npm run test:watch # Vitest, watch mode
```

### Docker

```bash
docker build \
  --build-arg VITE_API_BASE_URL=http://your-gateway/api \
  --build-arg VITE_KEYCLOAK_URL=https://your-keycloak \
  --build-arg VITE_KEYCLOAK_REALM=jac-project \
  --build-arg VITE_KEYCLOAK_CLIENT_ID=frontend-client \
  --build-arg VITE_AUTH=http://your-gateway/api/auth \
  -t jac-frontend .

docker run -p 8080:80 jac-frontend
```

---

## Project structure

```
src/
├── App.tsx                  # Root component
├── main.tsx                 # React + providers entry point
├── routes/AppRouter.tsx     # Route map, ProtectedRoute, role-based root
├── context/                 # AuthContext (Keycloak), TemaContext (theme)
├── lib/keycloak.ts          # Keycloak singleton + fetch interceptor
├── services/                # authClient + cross-cutting API clients
├── modules/                 # Feature modules (DDD-ish: each owns its slice)
│   ├── jac/                 # JAC directory + affiliates
│   ├── asocomunales/        # Asocomunal federations
│   ├── solicitudes/         # Maker-checker requests
│   └── migracion_datos/     # Legacy data importer
├── pages/                   # Top-level views (dashboards, reports, etc.)
├── components/              # Shared layout + UI building blocks
├── hooks/                   # Reusable data hooks (useJac, useDashboard…)
├── config/menu.ts           # Sidebar menu per role
├── utils/permissions.ts     # Centralized role checks
└── types/                   # Shared TypeScript types
```

---

## Team & credits

Built by **[Equipo Orbit](https://github.com/Proyecto-Orbit)** as part of the Programming course at **Universidad del Cauca**.

See the full list of contributors on the [Contributors page](https://github.com/Proyecto-Orbit/Plataforma-de-gesti-n-JAC/graphs/contributors).

Special thanks to the JAC community of the Cauca department, whose feedback shaped the requirements behind this platform.

---

## License

See [LICENSE](LICENSE) for details.
