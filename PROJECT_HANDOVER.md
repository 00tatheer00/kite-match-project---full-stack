# MASTER PROMPT & ARCHITECTURE HANDOVER TO CLAUDE

Copy and paste the entire block below into Claude (Claude.ai / Claude Project / Claude Code):

---

```markdown
# MISSION BRIEFING: SENIOR FULL-STACK CODE AUDIT & CONTINUATION FOR KITE FMCG

Hello Claude, you are stepping in as the Lead Full-Stack Architect for the **Kite FMCG** web platform. 

Your objective is to:
1. Deeply inspect and understand the entire architecture, data flow, and codebase.
2. Conduct a rigorous, critical code audit to find hidden bugs, architectural flaws, security vulnerabilities, edge-case failures, or performance bottlenecks ("ghaltian nikalna").
3. Actively fix issues, clean up legacy technical debt, and drive the project forward according to the roadmap below.

---

## 1. BUSINESS & PLATFORM CONTEXT
- **Company:** Kite FMCG — Pakistan's premier safety match manufacturer & consumer goods brand.
- **Flagship Match Brands:** Kite Matches, Bird Matches, Olympia Matches, Party Matches, Tanga Matches.
- **Divisions:** FMCG Division, Board Division, Textile Division, Real Estate, Global Exports.
- **Core Functionality:** Dynamic product showcase, online direct-to-consumer order flow with cart & bundle promotions, automated transactional email alerts, real-time admin order management, and analytics tracking.
- **GitHub Repository:** `https://github.com/00tatheer00/kite-match-project---full-stack.git` (Branches: `main`, `master`).

---

## 2. TECH STACK & CURRENT VERSIONS
- **Framework:** Next.js 16.3.6 (App Router with Turbopack)
- **Runtime / UI:** React 19.2.8
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Animation Engine:** Framer Motion (`framer-motion`)
- **Primary Database:** **Supabase PostgreSQL** via `@supabase/supabase-js` (Project Ref: `pslpiogqgohiznkasrmz`)
- **Media CDN / Storage:** **Supabase Storage** (Public bucket: `kite-images`)
- **Transactional Emails:** **Resend API** (Verified DNS domain: `send.kitepk.com`, sender: `orders@send.kitepk.com`)
- **Real-Time Push:** Pusher (`pusher` server / `pusher-js` client)
- **Icons:** `react-icons`, `lucide-react`
- **Legacy Dependencies (Target for Cleanup):** `mongoose`, `cloudinary`, `nodemailer`

---

## 3. DATABASE & STORAGE ARCHITECTURE
### Supabase PostgreSQL Setup:
- **Connection Host:** IPv4 AWS Session Pooler at `aws-0-ap-northeast-1.pooler.supabase.com:5432` (Direct `db.<ref>.supabase.co` hostname is IPv6-only; always use the pooler).
- **Client Configuration (`src/lib/supabase.js`):**
  - `getSupabaseAdmin()` uses `SUPABASE_SERVICE_ROLE_KEY` to query server-side in API routes, bypassing RLS.
  - `getSupabaseClient()` uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client/public reads.
- **Active Schema & Tables:**
  1. `products`: id, title, description, category, brand, price, original_price, image, images, features, specs, sizes, in_stock, is_active, created_at, updated_at
  2. `promotions`: id, title, description, discount, original_price, final_price, image, badge, items, valid_until, is_active, created_at
  3. `orders`: id, order_number, customer, items, total_amount, status, payment_method, notes, created_at, updated_at
  4. `settings`: id, company_name, support_email, contact_phone, address, free_shipping_threshold, tax_rate, updated_at
  5. `analytics`: id, event_type, path, visitor_id, metadata, created_at

### Supabase Storage Bucket:
- Bucket name: `kite-images` (Public).
- All 30 product and match packaging images have been migrated here from Cloudinary.
- Database records point directly to Supabase CDN URLs (`https://pslpiogqgohiznkasrmz.supabase.co/storage/v1/object/public/kite-images/...`).

---

## 4. TRANSACTIONAL EMAIL SYSTEM (RESEND)
- **Implementation:** `src/lib/email.js`
- **Verified Sending Domain:** `send.kitepk.com`.
- **Default Sender:** `Kite FMCG Orders <orders@send.kitepk.com>`.
- **Dual Admin Order Alerts:** EVERY customer order triggers simultaneous notification emails to:
  1. `sales@kitepk.com` (Main sales desk)
  2. `kitematchpk@gmail.com` (Operations / management backup)
- **Customer Receipts:** Automatic professional HTML order receipt dispatched to customer email.
- **CRITICAL SERVERLESS RULE:** Next.js serverless functions freeze immediately upon sending a response. `sendOrderEmail()` MUST ALWAYS BE awaited (`await sendOrderEmail(...)`) inside `src/app/api/orders/route.js`. Do not run it fire-and-forget.

---

## 5. RECENT FIXES COMPLETED
1. **Safety Matches Scroll Barrier (FIXED):** 
   - Previously, match variant pages loaded blank until the user scrolled because of `animate={inView ? ... : {}}` with `initial={{ opacity: 0 }}`.
   - Removed `inView` gating in `ProductDetailPage.jsx`, `KiteMatchesPage.jsx`, `BirdMatchesPage.jsx`, `OlympiaMatchesPage.jsx`, `PartyMatchesPage.jsx`, and `TangaMatchesPage.jsx`. Content is now 100% visible immediately on page load.
2. **MongoDB / Cloudinary to Supabase Migration (COMPLETED):**
   - All 20 API routes in `src/app/api/` prioritize Supabase PostgreSQL.
   - Cloudinary completely replaced by Supabase Storage bucket `kite-images`.
3. **Resend Sender Validation (FIXED):**
   - Switched sender from unverified `@kitepk.com` to DNS-verified `@send.kitepk.com`.

---

## 6. REQUIRED ENVIRONMENT VARIABLES
```env
NEXT_PUBLIC_SUPABASE_URL=https://pslpiogqgohiznkasrmz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<supabase_service_role_key>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase_anon_key>
RESEND_API_KEY=<resend_api_key>
RESEND_FROM=Kite FMCG Orders <orders@send.kitepk.com>
ADMIN_EMAIL=admin@kitepk.com
ADMIN_JWT_SECRET=<jwt_secret_key>
ADMIN_ORDER_EMAIL=sales@kitepk.com,kitematchpk@gmail.com
NEXT_PUBLIC_PUSHER_KEY=d14edc647970149caa98
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
```

---

## 7. YOUR INITIAL AUDIT & ACTION INSTRUCTIONS ("Ghaltian Nikaalna & Aage Ka Kaam")

Please perform an in-depth code audit across the codebase and provide a comprehensive report covering:

1. **Security & Authentication Audit:**
   - Review `src/app/api/admin/login/route.js` and `src/lib/auth.js`.
   - Check JWT token lifespan, cookie security (`httpOnly`, `sameSite`, `secure: true`), CSRF protections, and whether any routes allow unauthenticated access to admin mutations.
2. **Order & Checkout Robustness:**
   - Review `src/app/api/orders/route.js` and `src/pages-source/CheckoutPage.jsx`.
   - Audit customer input validation (Pakistani phone number formatting, address validation, sanitization against XSS/injection).
   - Check total price calculation: ensure server-side price recalculation matches database prices (prevent client-side price tampering).
3. **Legacy Debt Pruning:**
   - Identify leftover traces of MongoDB (`mongoose`, `src/lib/db.js`, `src/models/`) and Cloudinary (`src/lib/cloudinary.js`) that can be safely deprecated or pruned without breaking fallbacks.
4. **SEO & Dynamic Metadata:**
   - Audit dynamic routes (`/products/[id]`, `/products/kite-matches`, etc.) for missing `generateMetadata` functions, OpenGraph preview cards, canonical tags, and structured JSON-LD data.
5. **UI & Performance:**
   - Audit mobile responsiveness on checkout, cart drawer, and product tables.
   - Check if `<Image>` from `next/image` is used instead of raw `<img>` tags for optimized loading.
6. **Error Handling & Resilience:**
   - Verify that all API routes return structured JSON errors with correct HTTP status codes and that client pages have React Error Boundaries to prevent full page crashes.

After completing the audit, summarize the top critical findings, rate the codebase quality (1-10), and present a prioritized step-by-step action plan to fix them.
```
