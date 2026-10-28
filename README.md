# SAHYOG - NGO Management System

Full-stack NGO management platform: **React + Node/Express + MongoDB Atlas**.

**Status:** Foundation & Authentication (JWT + RBAC) complete.

## Structure
    SAHYOG/
    ├── frontend/   React (Vite) - pages, components, services, hooks, styles
    ├── backend/    Express API - config, models, routes, controllers, middleware, seeds, utils
    ├── docs/       (ER/data model, API docs)
    └── package.json Root helper scripts for running both apps

## Quick start
1. Install dependencies:
   ```bash
   npm run install:all
   ```
   Or separately:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. Start the backend:
   ```bash
   cd backend && npm run dev
   ```
3. Start the frontend:
   ```bash
   cd frontend && npm run dev
   ```
4. Open http://localhost:5173

## Authentication & Pre-configured Test Accounts
The system features JWT authentication, bcrypt password hashing, and Role-Based Access Control (RBAC):

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@sahyog.org` | `Admin@123` | Full system administration and access |
| **Staff** | `staff@sahyog.org` | `Staff@123` | Operational management |
| **Volunteer** | `volunteer@sahyog.org` | `Volunteer@123` | Profile and participation |

*(On the login page, you can also click the quick-fill pills to instantly load any test account).*

## Conventions
- Every API response: `{ success, message, data }`
- All frontend API calls go through `frontend/src/services/api.js` (attaches Bearer JWT token automatically)
- Protected routes guarded on backend (`protect`, `authorize`) and frontend (`<ProtectedRoute />`)
- Secrets live in `.env` files (git-ignored); commit only `.env.example`

