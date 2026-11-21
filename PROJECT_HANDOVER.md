# Kite FMCG — Project Handover

Next.js web platform for Kite FMCG / Mohsin Match Factory: product showcase, cash-on-delivery ordering (cart + bundle packages), order emails, real-time admin order management and visitor analytics.

- **Repository:** `https://github.com/00tatheer00/kite-match-project---full-stack.git` (public — never commit secrets)
- **Production:** Vercel (`https://www.kitepk.com`), deploys from `main`
- **Last audit:** 2026-11-21 — security & data-integrity overhaul (branch `fix/security-and-data-integrity`)

---

## 1. Tech stack

| Area | Technology |
|---|---|
| Framework | Next.js 16.4 (App Router, Turbopack), React 19.2 |
| Styling / motion | Tailwind CSS v4, Framer Motion |
| Database | Supabase PostgreSQL via `@supabase/supabase-js` (project ref `pslpiogqgohiznkasrmz`) |
| Images | Supabase Storage, public bucket `kite-images` (uploads re-encoded to WebP by `sharp`) |
| Email | Resend REST API, verified domain `send.kitepk.com` |
| Real-time | Pusher (`pusher` server, `pusher-js` admin UI) |

MongoDB, Mongoose, Cloudinary, Nodemailer, EmailJS and the old Render backend have been **removed** — do not re-introduce them.

---

## 2. Architecture rules

1. **Supabase is the single source of truth.** All reads/writes go through the service-role client in API routes / server components. There is no local-file or localStorage fallback for data. `data/db.json` is a *read-only seed* used only when Supabase env vars are missing (local dev).
2. **Server-side pricing only.** `src/lib/pricing.js` computes every order total from database prices (brand variants → product variants → SKUs; promotions use `totalPrice`). Client-sent prices/totals are ignored. Checkout shows the authoritative quote from `POST /api/orders/quote`.
3. **Admin auth = httpOnly cookie.** `POST /api/admin/login` sets a 12-hour HS256 JWT in an `httpOnly; SameSite=Strict; Secure` cookie. `src/lib/auth.js` verifies signature + expiry and rejects cross-origin mutations (CSRF). No tokens in localStorage.
4. **Await side effects in route handlers.** Vercel freezes the function after the response — always `await sendOrderEmail(...)`, `sendStatusUpdateEmail(...)` and `pusher.trigger(...)`.
5. **Admin edits refresh the public site** via `revalidatePath('/', 'layout')` (`revalidateCatalog()` in `src/lib/http.js`).

### Key files

```
src/lib/
  auth.js            JWT sign/verify, cookie options, same-origin (CSRF) check
  data.js            Catalog reads (products, promotions, settings) + product slug/alias resolution
  pricing.js         Authoritative order quote
  orders.js          Order insert (unique KT-xxx numbers with retry), lookup, public field filter
  admin-payloads.js  Allow-listed parsing of admin product/promotion forms (+ image upload)
  admin-catalog.js   Admin create/update/delete helpers (errors surfaced, 404 on missing)
  storage.js         Image upload to Supabase Storage (type/size checks, WebP re-encode)
  email.js           Resend emails (admin alert + customer receipt + status update)
  analytics.js       Analytics summary/reset
  validation.js      Customer input validation (PK mobile numbers, email, lengths)
  rate-limit.js      In-memory per-IP rate limiting (best effort on serverless)
  http.js            JSON error helpers, requireAdmin(), revalidateCatalog()
  json-ld.js         Safe JSON-LD serialization (escapes </script>)
src/services/api.js  Browser API client (no local data overlays)
supabase/migrations/ SQL to run in the Supabase SQL editor
```

---

## 3. Database schema (actual — camelCase columns)

- **products**: `id` (text PK), `title`, `category`, `productType`, `navGroup`, `iconType`, `description`, `image`, `images` (jsonb), `color`, `tagline`, `features`, `variants` (jsonb `[{name, price, detail, packing}]`), `variantImages`, `brands` (jsonb, each brand may have its own `variants`), `sizes`, `skus`, `facilities`, `services`, `shippingCost` (null = default), `displayOrder`, `carouselOrder`, `isActive`, `showOnLanding`, `showInProductsPage`, `showInNavbar`, `createdAt`, `updatedAt`
- **promotions**: `id`, `title`, `category`, `description`, `image`, `images`, `items` (jsonb `[{product, quantity, price}]`), `totalQuantity`, `totalPrice` (bundle price), `originalPrice`, `discount`, `shippingCost`, `displayOrder`, `isActive`, `createdAt`, `updatedAt`
- **orders**: `id` (uuid), `orderNumber` (unique, `KT-001`…), `type` (`product|promotion|cart`), `productId`, `promotionId`, `selectedSkuOrSize`, `quantity`, `items` (jsonb, priced lines with `title`, `price`, `lineTotal`), `customerName`, `phone` (03XXXXXXXXX), `email`, `address`, `city`, `note`, `paymentMethod`, `totalAmount`, `shippingCost`, `status` (`pending|confirmed|shipped|cancelled`), `createdAt`, `updatedAt`
- **settings** (single row `id = 1`): `defaultShippingCost`, `smallPackageShippingCost`, `freeShippingBundleIds` (jsonb), `bannerType`, `bannerImage`, `bannerMobileImage`, `bannerTitle`, `bannerLink`
- **analytics** (single row `key = 'global_summary'`): `totalVisitors`, `todayVisitors`, `totalPageviews`, `sources`, `devices`, `cities`, `countries`, `topPages`, `recentVisits`, `lastUpdated` — no IP addresses are stored.

Security: RLS must be **enabled** with no public write access — see `supabase/migrations/20261121_security_hardening.sql`.

---

## 4. Order flow

1. Checkout calls `POST /api/orders/quote` → shows server total.
2. `POST /api/orders` validates customer data, re-prices from the DB, inserts into Supabase (fails loudly with 503 if the DB is unavailable — never silently drops an order).
3. Awaits Resend: admin alert to **sales@kitepk.com + kitematchpk@gmail.com** (+ `ADMIN_ORDER_EMAIL`), receipt to the customer.
4. Awaits Pusher `admin-notifications/new-order` with a non-sensitive summary; admin UI re-fetches details.
5. Customer is redirected to `/order-success/<uuid>`; the public lookup `GET /api/orders/<uuid>` returns a reduced field set (no email/address, masked phone).

---

## 5. Environment variables

See `.env.example`. Required in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
ADMIN_EMAIL, ADMIN_PASSWORD_HASH (bcrypt), ADMIN_JWT_SECRET (≥32 chars)
RESEND_API_KEY, RESEND_FROM
NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER, PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER
```

Generate the password hash + JWT secret with `node scripts/hash-admin-password.mjs "NewStrongPassword"`.
Without `ADMIN_JWT_SECRET` / password env vars the admin login returns 503 (there are no built-in fallback passwords).

---

## 6. Commands

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — ESLint (0 errors expected; remaining warnings are `<img>` → `next/image` candidates)

---

## 7. Open follow-ups

- Migrate `<img>` tags to `next/image` (needs visual QA per component).
- Replace the in-memory rate limiter with Upstash Redis / Vercel Firewall for a global limit.
- Move Pusher to a private channel with an auth endpoint.
- Optional: Postgres sequence for order numbers (current retry-on-conflict approach is safe).
