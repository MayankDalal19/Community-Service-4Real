# SAHYOG - NGO Management System

Full-stack NGO management platform: **React 18 + Node/Express + MongoDB Atlas / Mongoose**.

**Status:** Step 1 (Foundation), Step 2 (Core NGO Modules), and Step 3 (Authentication, Role-Based Access Control, User Administration, and Reports) are fully implemented.

## System Architecture

```
SAHYOG/
├── frontend/                     # React 18 (Vite)
│   ├── src/
│   │   ├── components/          # DashboardLayout, Navbar, Sidebar, ProtectedRoute, ProfileModal, RecordForm...
│   │   ├── context/             # AuthContext (JWT management, current user session)
│   │   ├── config/              # modules.js (Single source of truth for NGO modules)
│   │   ├── pages/               # Dashboard, Login, Register, Reports, Users, ResourcePage, NotFound
│   │   ├── services/            # api.js (Axios + JWT interceptor), authService, userService, reportsService...
│   │   └── styles/              # Global CSS & design tokens
│   └── .env                     # Frontend environment variables (VITE_API_URL)
└── backend/                      # Express REST API
    ├── config/                  # MongoDB Atlas connection (db.js)
    ├── controllers/             # auth, user, reports, modules, stats, health
    ├── middleware/              # auth.js (JWT authentication & RBAC authorization), errorHandler.js
    ├── models/                  # User, Role, Volunteer, Donor, Donation, Beneficiary, Assistance, Event
    ├── routes/                  # auth, users, reports, stats, health, index.js
    ├── seeds/                   # roles.js (Admin, Staff, Volunteer) & default administrator seed
    ├── utils/                   # apiResponse, asyncHandler, crudController, crudRouter
    └── .env                     # Backend configuration (PORT, MONGODB_URI, JWT_SECRET...)
```

## Role-Based Access Control (RBAC)

1. **Admin**
   - Full access to all modules, financial data, and reports.
   - User administration (`/users`): create users, assign roles, toggle active/inactive status, remove accounts.
   - Delete permissions on sensitive financial records (Donors, Donations).
2. **Staff**
   - Operational access: create and update Volunteers, Donors, Donations, Beneficiaries, Assistance, and Events.
   - Access to Reports & CSV Data Export (`/reports`).
3. **Volunteer**
   - Access to Dashboard, Events, and Personal Profile Settings.

## Mock Dataset & Demo Credentials

SAHYOG includes a realistic, interconnected mock dataset (8 Volunteers with varying skills, 7 Donors, 10 Donations spanning past months, 8 Beneficiaries across 6 support sectors, 8 Assistance logs, and 5 NGO Events with assigned volunteers).

### Quick Demo Logins
| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `admin@sahyog.org` | `Admin@123` | Full access, User Administration, Reports, Deletion |
| **Staff** | `staff@sahyog.org` | `Staff@123` | Core NGO modules management, Reports & CSV export |
| **Volunteer** | `volunteer@sahyog.org` | `Volunteer@123` | Dashboard, Events viewing, Profile settings |

*(On the Login screen, click **Admin**, **Staff**, or **Volunteer** under "Quick Demo Logins" to fill credentials in 1 click).*

### Seeding Commands
```bash
cd backend

# Seed roles, admin, and mock data (if database is empty):
npm run seed

# Wipe operational data and re-seed clean mock records:
npm run seed:reset
```
*(You can also click **"Reset Mock Data"** directly inside the Dashboard's **System Connection Test** panel at any time).*

## Quick Start Guide

### 1. Backend Setup
```bash
cd backend
npm install
# Configure MONGODB_URI in backend/.env
npm run dev
# Or run with seeds: npm run seed
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.
