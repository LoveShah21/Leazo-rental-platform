# Frontend notes

- Added AuthProvider with role-based protection (customer, provider, staff, manager, admin, super_admin).
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
