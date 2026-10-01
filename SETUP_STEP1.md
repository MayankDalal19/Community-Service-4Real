# SAHYOG - Step 1: Foundation (complete)

Step 1 = **1a** (Database + Backend) + **1b** (React Frontend), merged.
Stack: React -> Express -> **MongoDB Atlas** (Mongoose).

## Prerequisites
Node.js 18+ and a free MongoDB Atlas account (https://www.mongodb.com/cloud/atlas). No local database install needed.

## 1. Set up MongoDB Atlas (one time)
1. Create a free **M0** cluster.
2. **Database Access** -> Add Database User -> choose a username + password (keep them handy).
3. **Network Access** -> Add IP Address -> "Add Current IP Address" (or `0.0.0.0/0` for development only).
4. **Database** -> Connect -> Drivers -> copy the connection string.

## 2. Backend
Open `backend/.env` and set:

    MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR-CLUSTER.mongodb.net/?retryWrites=true&w=majority
    DB_NAME=sahyog_db

(If the password contains `@ : / ? # %`, URL-encode it, e.g. `@` -> `%40`.)

    cd backend
    npm install
    npm run dev

Expected:

    SAHYOG API running on http://localhost:5000
    MongoDB Atlas connected  (database: sahyog_db)
    Roles ready (3)

The three roles (Admin, Staff, Volunteer) are created automatically on start. `npm run seed` does the same manually. The `sahyog_db` database and its collections appear in Atlas on first write; there is no schema file to run.

## 3. Frontend
In a second terminal:

    cd frontend
    npm install
    npm run dev

Open http://localhost:5173

## 4. What you should see
| URL | Result |
|---|---|
| http://localhost:5173/login | Login page (validation works; demo mode) |
| http://localhost:5173/dashboard | Dashboard with the **System Connection Test** |
| http://localhost:5000/api/health | `API is running` JSON |
| http://localhost:5000/api/health/db | Atlas connected + 3 roles |

Both Dashboard cards (Express API, MongoDB Atlas) should turn green. Stop the backend and press **Re-test** to see the error state.

## Troubleshooting
- **"MongoDB NOT connected: ... bad auth"**: wrong username/password in `MONGODB_URI`.
- **Timeout / "Could not connect to any servers"**: your IP is not in Atlas Network Access, or the cluster is paused.
- **"MONGODB_URI is not set"**: `.env` still has the placeholder values.
- **Red "cannot reach the backend"**: backend not running, or port 5000 in use.
- **CORS error**: frontend must run on port 5173 (fixed in `vite.config.js`), matching `CLIENT_URL`.

## Step 1 completion checklist
[ ] Atlas cluster, database user and IP access set up
[ ] Express server runs
[ ] Backend connects to Atlas (see console message)
[ ] Roles collection has Admin, Staff, Volunteer
[ ] /api/health and /api/health/db work
[ ] React app runs
[ ] React calls the backend through Axios (Dashboard test is green)
[ ] Login UI and Dashboard skeleton exist
[ ] Project structure is clean and ready for Step 2
