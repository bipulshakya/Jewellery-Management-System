# Jewellery Management System

A modern ERP + POS web application for jewellery businesses, built with React and Vite.

## About

Jewellery retail operations are more complex than normal retail: pricing depends on metal type, purity, live rates, net/gross weight, stone value, making charges, wastage, and tax rules. This project is designed to digitize those workflows in one place with a fast and clear UI.

The system helps store owners and staff run day-to-day operations with less manual calculation and better visibility across sales, stock, customer history, custom orders, and repairs.

### What This Project Covers

- Dashboard insights for sales, stock, and activity
- Inventory management with SKU, purity, weight, and pricing calculations
- POS billing with discount handling and old-gold exchange support
- Customer profiles with purchase context and outstanding balances
- Orders and repairs tracking for workshop/service operations
- Reports and accounting views for business decisions
- Settings for store profile and metal rate updates

### UI/UX Focus

- Responsive layouts for desktop and tablet workflows
- Consistent button sizing and action alignment
- Clear visual hierarchy with glass-card panels and status badges
- Theme support (dark/light) through CSS variables and utility classes
- Faster readability for dense operational screens (tables, forms, totals)

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4
- Recharts
- Lucide React
- date-fns

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview production build:

```bash
npm run preview
```

## Backend API

This project now includes a Node.js + Express backend in [backend/package.json](backend/package.json).

1. Install backend dependencies:

```bash
npm --prefix backend install
```

2. Run backend in dev mode:

```bash
npm run dev:backend
```

The backend runs on `http://localhost:4000` by default.

3. Configure MySQL connection:

- Copy [backend/.env.example](backend/.env.example) to `backend/.env`
- Update MySQL credentials (`MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`)

The server auto-creates the database/tables and seeds initial data from [src/data/seedData.js](src/data/seedData.js).

4. Run migrations manually (optional):

```bash
npm --prefix backend run migrate
```

Check migration status:

```bash
npm --prefix backend run migrate:status
```

### API Endpoints

- `GET /health`
- `POST /auth/login`
- `GET /auth/me`
- `GET /api`
- `GET /api/:resource`
- `GET /api/:resource/:id`
- `POST /api/:resource`
- `PATCH /api/:resource/:id`
- `DELETE /api/:resource/:id`
- `GET /api/users` (admin)
- `GET /api/users/:id` (admin)
- `POST /api/users` (admin)
- `PATCH /api/users/:id` (admin)
- `PATCH /api/users/:id/password` (admin)
- `DELETE /api/users/:id` (admin)

Supported resources:

- `inventory`
- `customers`
- `suppliers`
- `sales`
- `repairs`
- `orders`

Settings endpoints:

- `GET /api/settings/metal-rates`
- `PATCH /api/settings/metal-rates`
- `GET /api/settings/store-info`
- `PATCH /api/settings/store-info`

### Data Persistence

Backend data is stored in MySQL with JSON-backed entity tables.

### Authentication and Roles

- Token auth is required for `/api/*`
- Demo users are auto-seeded:
	- `admin` / `admin123`
	- `staff` / `staff123`
- RBAC policy:
	- `admin`: full CRUD + settings updates
	- `staff`: read all, create/update `sales`, `repairs`, `orders`, `customers`
- Passwords are hashed with bcrypt (`bcrypt` package)
- Frontend now uses a dedicated login page at `/login` with route guards
