# Loka — Smart Community Service & Local Marketplace Platform

Teyzix Core Internship · Task FSWD-3

## Status: Phase 6 of 7 complete

This repo is being built in phases so every piece that ships is fully working and
reviewed, rather than a large amount of unaudited code at once.

- [x] **Phase 1** — Project scaffolding, backend auth (JWT + refresh, bcrypt, rate
      limiting), all six Mongoose models, global error handling, Next.js app with
      design system, animated landing page, working Login/Register wired to the API.
- [x] **Phase 2** — Listings (products + services): full CRUD, Cloudinary multi-image
      upload with drag-and-drop, keyword search, category/type/price filters,
      pagination, favorites/saved listings, owner-only edit/delete, admin status
      field wired for approval workflow.
- [x] **Phase 3** — Booking system (request → accept/reject → complete/cancel with
      role-based transition guards) and Reviews & Ratings (star ratings tied to
      completed bookings, incremental average rolled into both the listing and the
      seller's profile, one review per booking, report/flag).
- [x] **Phase 4** — Real-time chat over Socket.io (JWT-authenticated handshake,
      per-user rooms, typing indicators, read receipts) and notifications upgraded
      from polling to instant push, with polling kept only as a backstop for missed
      events.
- [x] **Phase 5** — Real dashboard analytics (earnings from actual completed
      bookings, live counts, recent activity feed — no dummy numbers) and a full
      admin panel: platform stats, user search/suspend/reactivate, listing
      approve/remove, and a reported-reviews queue with dismiss/delete.
- [x] **Phase 6** — Animation and polish pass: a reusable 3D tilt component
      (`TiltCard`, real perspective/rotation driven by cursor position via
      `gsap.quickTo`, not a fake shadow trick) applied to the hero preview cards,
      category cards, and every listing card across the app; scroll-triggered
      reveal animations via GSAP ScrollTrigger on the Categories and How It Works
      sections; a subtle parallax drift on the hero's ambient glow. Plus real
      accessibility fixes: the booking modal now has a genuine keyboard focus
      trap (Tab/Shift+Tab cycle inside it, focus returns to the trigger on close),
      and the admin users table scrolls horizontally on mobile instead of
      breaking the layout. Also fixed two real bugs found from user testing: a
      layout bug that let the hero preview cards spill into the section below,
      and a GSAP/React-Strict-Mode bug that could leave the login/register card
      stuck at low opacity.
      **Follow-up visual pass**, driven by direct feedback: the category grid
      was rebuilt on a real `/api/listings/meta/category-counts` aggregation
      endpoint instead of hardcoded numbers, with color-coded glow badges and
      a hover-reveal arrow; the Market Pulse ticker now pulls actual recent
      listings from the database instead of a fabricated repeating feed (and
      shows an honest empty state instead of fake activity when the platform
      has none yet); the entirely-unused mock-data file was deleted outright.
      The login/register pages got a genuine 3D scene (`AuthVisualPanel`) —
      three glass cards floating at different depths with independent idle
      motion plus cursor-driven parallax tilt on the group, over a slow-drifting
      aurora gradient background, all pure CSS 3D transforms + GSAP (no
      three.js/WebGL dependency added).
- [ ] Phase 7 — Deployment (Render + Vercel) + API docs

## Architecture

Decoupled two-service architecture — standard for apps needing a persistent
Socket.io connection alongside a REST API:

```
loka/
├── backend/     Node.js + Express + MongoDB API (port 5000)
└── frontend/    Next.js 14 (App Router) + TypeScript + Tailwind + GSAP (port 3000)
```

**Backend folder structure** (`backend/src`):
```
config/       DB + Cloudinary connection setup
models/       Mongoose schemas (User, Listing, Booking, Review, Message, Notification)
controllers/  Route handler logic (auth, listings, bookings, reviews, notifications,
              messages, dashboard, admin)
routes/       Express routers
middleware/   auth guard, validation, error handler, rate limiting, multer upload
validators/   express-validator rule sets
socket/       Socket.io setup — JWT handshake auth, per-user rooms, chat events
utils/        ApiError, asyncHandler, token generation, Cloudinary upload, pagination, notify
app.js        Express app (middleware + route wiring)
server.js     Entry point (DB connect + HTTP server + Socket.io attach)
```

**Frontend folder structure** (`frontend/src`):
```
app/
  (auth)/login, (auth)/register    Auth pages
  listings/                        Browse, detail, create, edit
  my-listings/, favorites/         User's own listings and saved listings
  bookings/, bookings/[id]/        Booking list (buyer/seller tabs) and detail + review
  messages/                        Conversation list + real-time chat window
  dashboard/                       Real analytics: earnings, activity, quick links
  admin/                           Admin-only section (role-guarded layout)
    (index)                        Platform stats overview
    users/                         Search, filter, suspend/reactivate accounts
    listings/                      Approve/remove listings by status
    reports/                       Flagged reviews queue — dismiss or delete
components/
  ui/            Reusable primitives (Button, Input, Select, Textarea, ImageUploader,
                 Modal, StatCard)
  landing/       Landing-page-specific sections
  listings/      ListingCard, ListingFilters, Pagination
  bookings/      BookingCard, BookingStatusBadge, BookingRequestModal
  reviews/       StarRating, ReviewForm, ReviewList
  notifications/ NotificationBell (real-time via socket + polling backstop)
  chat/          ConversationList, ChatWindow
context/         AuthContext (current user, login/register/logout, socket lifecycle)
lib/             API clients (incl. dashboard.ts, admin.ts), socket.ts, GSAP setup, Zod schemas
types/           Shared TypeScript types
```

## API endpoints (Phase 1 through 5)

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me                     (protected)
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/listings                    ?keyword&category&type&minPrice&maxPrice&city&sort&page&limit
POST   /api/listings                    (protected, multipart: images[] + fields)
GET    /api/listings/mine               (protected)
GET    /api/listings/favorites          (protected)
GET    /api/listings/meta/category-counts   — real per-category active-listing counts (public)
GET    /api/listings/:id
PUT    /api/listings/:id                (protected, owner/admin, multipart)
DELETE /api/listings/:id                (protected, owner/admin)
POST   /api/listings/:id/favorite       (protected, toggles favorite)

POST   /api/bookings                    (protected) — create a booking request
GET    /api/bookings/mine               (protected) ?role=buyer|seller&status=
GET    /api/bookings/:id                (protected, participants + admin only)
PATCH  /api/bookings/:id/status         (protected) — role-guarded status transitions

POST   /api/reviews                     (protected) — buyer reviews a completed booking
GET    /api/reviews/listing/:listingId
GET    /api/reviews/user/:userId
POST   /api/reviews/:id/flag            (protected) — report a review

GET    /api/notifications               (protected)
PATCH  /api/notifications/:id/read      (protected)
PATCH  /api/notifications/read-all      (protected)

GET    /api/messages/conversations      (protected) — list with last message + unread count
GET    /api/messages/with/:userId       (protected) — full history with one user

GET    /api/dashboard/summary           (protected) — real earnings/counts/recent activity

GET    /api/admin/stats                 (admin only)
GET    /api/admin/users                 (admin only) ?search&role&status&page
PATCH  /api/admin/users/:id/status      (admin only) — suspend/reactivate
GET    /api/admin/listings              (admin only) ?status&page
PATCH  /api/admin/listings/:id/status   (admin only) — approve/remove
GET    /api/admin/reports               (admin only) — flagged reviews
PATCH  /api/admin/reports/:id           (admin only) — { action: 'dismiss' | 'delete' }
```

## Socket.io events (real-time layer)

Connects with the same JWT access token as the REST API (`socket.handshake.auth.token`).
Each user is placed in a personal room (`user:<id>`) on connect.

```
Client → Server
  send_message   { recipientId, text }              → ack: { success, message }
  typing         { recipientId, isTyping }
  mark_read      { conversationId }

Server → Client
  receive_message   ChatMessage                       (to sender + recipient rooms)
  typing             { senderId, isTyping }
  messages_read      { conversationId, readBy }
  new_notification   Notification                     (booking/review events push here instantly)
```

## Booking status flow

```
pending --(seller accepts)--> accepted --(seller completes)--> completed
   |                              |
   +--(buyer cancels)--> cancelled <--(buyer or seller cancels)
   |
   +--(seller rejects)--> rejected
```
Every transition is guarded server-side by role — a buyer cannot accept their own
request, and neither party can skip straight from `pending` to `completed`.

## Prerequisites

- Node.js 18+
- A MongoDB connection string (free tier on MongoDB Atlas is fine)
- A Cloudinary account (free tier) — only needed starting Phase 2

## Running locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in:
- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — any long random strings
  (generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — from your
  Cloudinary dashboard (free tier). Required for creating listings with images.

```bash
npm run dev
```

API runs at `http://localhost:5000`. Confirm it's up:
```bash
curl http://localhost:5000/api/health
```

### 2. Frontend

In a new terminal:
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend runs at `http://localhost:3000`.

### 3. Try it end to end

1. Visit `http://localhost:3000` — landing page with the animated hero and
   the "Market Pulse" ticker.
2. Click **Get started** → register a real account. It hits the live backend,
   hashes the password with bcrypt, issues a JWT, and logs you straight into
   `/dashboard`.
3. From the dashboard, click **Create a listing** → fill the form, drag in
   1–6 images, and publish. The images upload to your Cloudinary account for real.
4. Go to **Browse** (`/listings`) — search by keyword, filter by category/type/
   price range, change sort order, page through results.
5. Open a listing → favorite it (heart icon), then check `/favorites` — it's there.
6. From **My listings** (`/my-listings`), open one you own → **Edit** → change
   fields or remove/add images → save. Try **Delete** on a test listing too.
7. Register a **second account** in an incognito window — you need two accounts
   to test booking (you can't book your own listing).
8. As account B, open account A's listing → **Request booking** → pick a date → submit.
9. As account A, go to **Bookings** → "As seller" tab → **Accept** the request,
   then **Mark completed**.
10. As account B, go to **Bookings** → open that booking → a review form appears →
    submit a star rating. Check the listing page — the rating now shows.
11. Check the bell icon in the navbar on both accounts — booking requests, status
    updates, and new reviews all generate real notifications, delivered instantly.
12. On the listing detail page (as account B), click **Message** — it opens a
    real-time chat with the seller. Type a message, watch it appear instantly
    for account A too (open a second browser window logged in as A on `/messages`).
    Try typing without sending — the other window shows a live "typing…" indicator.
13. Refresh any page — the session persists via the httpOnly refresh token cookie.

### Testing the admin panel

There's intentionally no public signup path to an admin account — that's a
security boundary, not an oversight. To test it locally, promote an existing
user directly in the database:

**Via MongoDB Atlas UI:** open your cluster → Browse Collections → `users` →
find your account → edit the `role` field from `"user"` to `"admin"` → save.

**Via `mongosh`:**
```js
use loka
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

Then log out and back in (the JWT carries the role, so it needs to be reissued).
You'll see an **Admin panel** button on `/dashboard`, or go straight to `/admin`.
From there:
- **Overview** — live platform stats (users, listings, bookings, GMV)
- **Users** — search, filter by status, suspend/reactivate any non-admin account
- **Listings** — approve pending listings or remove any listing
- **Reports** — dismiss or delete reviews that have been flagged via the 🚩
  icon on the listing detail page's review section

## Notes on what's real vs. placeholder right now

- Auth, JWT issuance/refresh, password hashing, and all six database schemas
  are fully functional against a real MongoDB instance — nothing here is mocked.
- Listings (create/edit/delete/search/filter/paginate/favorite) are fully
  functional against real MongoDB + Cloudinary — image uploads are real,
  not placeholder URLs.
- Bookings and reviews are fully functional: role-guarded status transitions,
  one-review-per-booking enforcement, and rating averages that are genuinely
  recalculated and written back to both the listing and the seller's profile.
- Chat is real-time over Socket.io: messages persist to MongoDB and are pushed
  live to both participants' open tabs; typing indicators and read receipts
  are live socket events, not simulated.
- Notifications are pushed instantly over the same socket connection the
  moment a booking/review event happens, with a 60-second poll kept purely
  as a backstop in case a client was briefly disconnected.
- Dashboard analytics are computed live from real data — earnings are an
  actual sum of your completed bookings, not a hardcoded number, and the
  admin stats page aggregates real counts across the whole database.
- The admin panel's actions are fully functional: suspending a user actually
  flips `isActive` and blocks their next login/API call; removing a listing
  actually changes its status and hides it from public browse; deleting a
  flagged review actually recalculates the listing's and seller's rating
  averages, not just soft-hides it.
- The landing page's "Market Pulse" ticker and category counts use clearly
  isolated sample data (`frontend/src/lib/mockData.ts`) since that's marketing
  copy for logged-out visitors, not a data endpoint.

## What's left

- **Phase 7** — deployment to Render (backend) + Vercel (frontend), environment
  variable setup for production, and generating the final API documentation
  and submission package (screenshots, ZIP) required by the task brief.
