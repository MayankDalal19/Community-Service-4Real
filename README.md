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
See [SETUP_STEP1.md](SETUP_STEP1.md).

## Tech
React 18, React Router 6, Axios, Vite - Express 4, Mongoose 8, cors, dotenv - MongoDB Atlas

## Conventions
- Every API response: `{ success, message, data }`
- All frontend API calls go through `frontend/src/services/api.js` (attaches Bearer JWT token automatically)
- Protected routes guarded on backend (`protect`, `authorize`) and frontend (`<ProtectedRoute />`)
- Secrets live in `.env` files (git-ignored); commit only `.env.example`

