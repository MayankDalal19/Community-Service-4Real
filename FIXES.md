# Fixes applied

## Root cause: Add/Edit did nothing for Admin & Staff
`frontend/src/components/ResourcePage.jsx` rendered `<RecordForm initial=... onSave=...>`,
but `RecordForm.jsx` expects the props `record` and `onSubmit`.
`onSubmit` was undefined, so pressing "Add ..." never called the API (and Edit forms were never pre-filled).
Affected: Volunteers, Donors, Donations, Beneficiaries, Assistance, Events.

Fix: pass `record={...}` and `onSubmit={handleSave}`, add a `key` so the form resets between records,
and allow the modal for anyone who can create OR edit.

## Other hardening
- backend/utils/jwt.js: used a different fallback JWT secret than middleware/auth.js. Now shares one secret.
- backend/models/Donation.js: receipt number had only 9000 possible values (random collisions -> "receiptNo already exists"). Now timestamp + random.
- frontend/src/services/api.js: timeout 10s -> 30s (Render free tier cold start caused "server took too long").

## Run
cd backend && cp .env.example .env  (fill MONGODB_URI, JWT_SECRET) && npm install && npm start
cd frontend && npm install && npm run dev
Default admin: admin@sahyog.org / Admin@123 (created on first start)
