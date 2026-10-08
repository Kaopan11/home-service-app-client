# HomeServices Client

> Vue 3 SPA for booking home repair services. Customers book and pay, admins manage catalog and promotions, technicians accept and complete jobs.

[![Vue](docs/badges/vue.png)](https://vuejs.org/)
[![TypeScript](docs/badges/typescript.png)](https://www.typescriptlang.org/)
[![Vite](docs/badges/vite.png)](https://vite.dev/)
[![Vercel](docs/badges/vercel.png)](https://vercel.com/)

This repo is the frontend only. API, auth, and Postgres live in `home-service-app-server`.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Pages and Roles](#pages-and-roles)
- [Backend APIs Used](#backend-apis-used)
- [Deployment](#deployment)
- [Related Repos](#related-repos)
- [Author](#author)

---

## Features

- Browse services by category and pick priced options
- Book a visit (date, time, Thai address) and pay by card via Omise
- Apply admin promotion codes against the real checkout total
- Customer profile, change password, active orders, and history with reviews
- Admin CRUD for categories, services, and promotion codes, plus in-app notifications
- Technician queue: accept or decline jobs, pending work, history, and account/location
- Email/password login plus Facebook OAuth (Supabase via the Spring BFF)
- Role guards in Vue Router (`USER`, `ADMIN`, `TECHNICIAN`)

---

## Tech Stack

- **Frontend:** Vue 3 (`<script setup>`), TypeScript, Vite 8, Vue Router 5, Pinia 4
- **Backend (separate repo):** Spring Boot REST API, JWT
- **Database / Auth:** Supabase Postgres and Supabase Auth (server-side)
- **Payments:** Omise.js (`cdn.omise.co`) then `POST /api/charges`
- **Libraries & tools:** native `fetch` via `apiFetch`, Prompt font, Vercel SPA rewrites

---

## Project Structure

```text
home-service-app-client/
├── public/
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/index.ts          # routes + role guards
│   ├── pages/
│   │   ├── HomePage.vue
│   │   ├── ServiceList.vue
│   │   ├── ServiceDetailPage.vue
│   │   ├── ServiceBookingInfoPage.vue
│   │   ├── LoginPage.vue
│   │   ├── RegisterPage.vue
│   │   ├── admin/
│   │   └── technician/
│   ├── components/              # booking, layout, admin, technician
│   ├── stores/                  # auth, booking, profile, technicianJobs
│   ├── services/                # apiFetch + domain API clients
│   ├── composables/
│   ├── types/
│   └── utils/authStorage.ts
├── .env.example
├── vercel.json
├── package.json
└── README.md
```

`App.vue` only renders `<RouterView />`. Pages are lazy-loaded from the router. HTTP calls go through `src/services/api.ts`, which attaches `Authorization: Bearer <token>` and uses `VITE_API_BASE_URL`.

---

## Getting Started

**Needs:** Node.js 20+, npm, and the Spring server on port 8080 (or whatever you put in `.env`).

```bash
git clone <this-repo-url>
cd home-service-app-client
cp .env.example .env
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)

| Script | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Typecheck + production build | `npm run build` |
| Preview build | `npm run preview` |

Do not commit `.env`. Copy keys from `.env.example` only.

---

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Spring API origin, e.g. `http://localhost:8080` |
| `VITE_OMISE_PUBLIC_KEY` | Omise **public** test/live key (`pkey_…`). Never put a secret key here. |

Vite only exposes variables prefixed with `VITE_`.

---

## Pages and Roles

Router meta: `public`, `requiresAuth`, `requiresAdmin`, `requiresTechnician`. Session is restored from localStorage before each navigation.

### Customer (`USER`)

| Path | Auth |
| --- | --- |
| `/`, `/service`, `/service/:id` | Public |
| `/service/:id/info` | Logged in (booking + payment) |
| `/login`, `/register`, `/auth/callback` | Public |
| `/profile`, `/profile/password` | Logged in |
| `/orders`, `/history` | Logged in |

### Admin (`ADMIN`)

| Path | Auth |
| --- | --- |
| `/admin/login` | Public |
| `/admin/categories`, `/new`, `/:id`, `/:id/edit` | Admin |
| `/admin/services`, `/new`, `/:id`, `/:id/edit` | Admin |
| `/admin/promos`, `/new`, `/:id`, `/:id/edit` | Admin |

### Technician (`TECHNICIAN`)

| Path | Auth |
| --- | --- |
| `/technician/requests` | Technician |
| `/technician/jobs`, `/technician/jobs/:id` | Technician |
| `/technician/history`, `/technician/history/:id` | Technician |
| `/technician/account` | Technician |

`/technician` redirects to requests. Failed admin auth goes to `/admin/login`; other protected routes go to `/login`.

---

## Backend APIs Used

Base URL = `VITE_API_BASE_URL`. These are the paths this SPA calls, not a full server spec.

### Auth and account

| Method | Path |
| --- | --- |
| `POST` | `/api/auth/login` |
| `POST` | `/api/auth/register` |
| `GET` | `/api/auth/facebook?redirectTo=` |
| `POST` | `/api/auth/facebook` |
| `POST` | `/api/auth/logout` |
| `GET` / `PATCH` | `/api/users/me` |
| `PATCH` | `/api/users/me/password` |

### Catalog, booking, orders

| Method | Path |
| --- | --- |
| `GET` | `/api/services` |
| `GET` | `/api/services/:id` |
| `POST` | `/api/promotions/apply` |
| `POST` | `/api/charges` |
| `GET` | `/api/orders?scope=active\|history` |
| `POST` | `/api/orders/:jobId/review` |

### Admin

| Method | Path |
| --- | --- |
| `GET` / `POST` / `PATCH` | `/api/admin/categories` |
| `GET` / `PATCH` / `DELETE` | `/api/admin/categories/:id` |
| `GET` / `POST` / `PATCH` | `/api/admin/services` |
| `GET` / `PATCH` / `DELETE` | `/api/admin/services/:id` |
| `GET` / `POST` | `/api/admin/promotions` |
| `GET` / `PATCH` / `DELETE` | `/api/admin/promotions/:id` |
| `GET` | `/api/notifications` |
| `GET` | `/api/notifications/unread-count` |
| `PATCH` | `/api/notifications/:id/read` |

### Technician

| Method | Path |
| --- | --- |
| `GET` / `PATCH` | `/api/technician/account` |
| `PATCH` | `/api/technician/account/location` |
| `GET` | `/api/technician/requests` |
| `GET` | `/api/technician/requests/pending-count` |
| `POST` | `/api/technician/requests/:id/accept` |
| `POST` | `/api/technician/requests/:id/decline` |
| `GET` | `/api/technician/jobs/pending` |
| `GET` | `/api/technician/jobs/history` |
| `GET` | `/api/technician/jobs/:id` |
| `POST` | `/api/technician/jobs/:id/complete` |

---

## Deployment

`vercel.json` rewrites every path to `index.html` so Vue Router history mode works.

1. Import this repo in Vercel.
2. Set `VITE_API_BASE_URL` to the public Spring URL (e.g. Render).
3. Set `VITE_OMISE_PUBLIC_KEY` (public key only).
4. CORS on the server must allow the Vercel origin.

Vite inlines `VITE_*` at **build** time. Change env → rebuild/redeploy.

---

## Related Repos

- Frontend: this repository (`home-service-app-client`)
- Backend: `home-service-app-server` (Spring Boot, JPA, Supabase, Omise charges)

Deeper flow notes (optional): `docs/code-structure.md`

---

## Author

HomeServices team
