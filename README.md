# SAHYOG - NGO Management System

Full-stack NGO management platform: **React + Node/Express + MongoDB Atlas**.

**Status:** Step 1 (Foundation) complete. Next: Step 2 (Core NGO modules).

## Structure
    SAHYOG/
    ├── frontend/   React (Vite) - pages, components, services, hooks, styles
    ├── backend/    Express API - config, models, routes, controllers, middleware, seeds, utils
    └── docs/       (ER/data model, API docs - coming later)

## Tech
React 18, React Router 6, Axios, Vite - Express 4, Mongoose 8, cors, dotenv - MongoDB Atlas

## Conventions
- Every API response: `{ success, message, data }`
- All frontend API calls go through `frontend/src/services/api.js`
- Mongoose models live in `backend/models/`; relations use ObjectId references
- Secrets live in `.env` files (git-ignored); commit only `.env.example`
