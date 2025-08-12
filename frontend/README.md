# Frontend notes

- Auth now uses utilities in `src/lib/auth.ts` with `useSimpleAuth`, `authFetch`, and a lightweight `Protected` component for role-based access.
- New pages:
  - /login
  - /dashboard (auto-redirects by role)
  - /dashboard/customer (and bookings, payments, profile)
  - /dashboard/provider (and products, bookings, reports)
  - /dashboard/admin (and users, products, reports)
- Header now shows Login or Dashboard/Logout depending on session.
- API base URL can be set with NEXT_PUBLIC_API_URL; default is http://localhost:3001/api.

Dev tips
- Start backend: PORT=3001 (or set NEXT_PUBLIC_API_URL accordingly)
- Start frontend: npm run dev
