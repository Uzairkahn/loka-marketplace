<div align="center">

# 🏘️ Loka

### Smart Community Service & Local Marketplace Platform

*Find trusted local services, hire skilled freelancers nearby, and buy from people in your own neighborhood.*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-black?logo=socket.io)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Frontend-Live_on_Vercel-000000?logo=vercel)](https://loka-marketplace-tau.vercel.app/)
[![Render](https://img.shields.io/badge/Backend-Live_on_Render-46E3B7?logo=render)](https://loka-marketplace.onrender.com/api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[Live Demo](#-live-demo) · [Features](#-features) · [Tech Stack](#-tech-stack) · [Screenshots](#-screenshots) · [Getting Started](#-getting-started) · [API Reference](#-api-reference)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Live Demo](#-live-demo)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Real-Time Events (Socket.io)](#-real-time-events-socketio)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
  - [Testing the Admin Panel](#testing-the-admin-panel)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Author](#-author)
- [Acknowledgments](#-acknowledgments)

---

## 🎯 About the Project

**Loka** is a production-quality, full-stack local marketplace and community services platform, built as **Task FSWD-3** for the Teyzix Core Full-Stack Web Development Internship (June Batch).

The platform lets users list products **or** offer professional services, discover what's available nearby, book a service with a full request→accept→complete workflow, chat with sellers in real time, and build reputation through a genuine star-rating review system. It's built with the same architectural patterns used in production SaaS applications — a decoupled REST + WebSocket backend, JWT authentication with refresh-token rotation, role-based access control, and a fully typed frontend.

Every feature listed below is **fully implemented and functional** against a real MongoDB database and Cloudinary storage — nothing in this submission is a static mockup or placeholder UI.

---

## 🚀 Live Demo

| | Link |
|---|---|
| **Frontend** | [loka-marketplace-tau.vercel.app](https://loka-marketplace-tau.vercel.app/) |
| **Backend API** | [loka-marketplace.onrender.com/api](https://loka-marketplace.onrender.com/api) |
| **Repository** | [github.com/Uzairkahn/loka-marketplace](https://github.com/Uzairkahn/loka-marketplace) |

> ⚠️ The backend is on Render's free tier, which spins down after inactivity. The **first** request after idle can take 30–60 seconds to respond while the server wakes up — this is expected, not a bug. Subsequent requests are fast.

---

## 📸 Screenshots

> All screenshots below are from the live deployment. Place these image files in a `/screenshots` folder at the repo root, using the exact filenames shown (matching what's already referenced here).

### Landing Page

| Hero | Browse by Category | How It Works |
|---|---|---|
| ![Hero section](./screenshots/landingpage1.png) | ![Category grid](./screenshots/landingpage.png) | ![How it works](./screenshots/landingpage3.png) |

### Marketplace

| Browse & Filter | Filtered Results |
|---|---|
| ![Browse marketplace](./screenshots/browse.png) | ![Filtered by category](./screenshots/browsefilter.png) |

| Create a Listing | My Listings |
|---|---|
| ![Create listing form](./screenshots/createlisting.png) | ![My listings](./screenshots/mylisting.png) |

### Bookings & Messaging

| Bookings | Real-Time Chat |
|---|---|
| ![Bookings page](./screenshots/booking.png) | ![Messages / chat](./screenshots/messages.png) |

### Dashboard

![User dashboard](./screenshots/dashboard.png)

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure registration & login with **bcrypt** password hashing
- **JWT access + refresh token** rotation (short-lived access token, httpOnly refresh cookie)
- Forgot password / reset password flow
- Role-based access control (`user` / `admin`)
- Protected routes on both frontend and backend

### 👤 User Profiles
- Full name, bio, contact info, location, skills
- Live rating average & review count, computed from real completed bookings
- Favorites / saved listings

### 🛒 Product & Service Marketplace
- Unified listing model supporting **both** products and services
- Multi-image upload via **Cloudinary** (drag-and-drop, client-side validation)
- Full CRUD — create, edit, delete, view
- Keyword search, category filter, price range filter, type filter
- Sort by newest / price / rating, with server-side pagination
- Favorites / saved listings

### 📅 Booking System
- Request a booking with a preferred date & time
- Full status lifecycle: `pending → accepted/rejected → completed/cancelled`
- Every transition is **role-guarded server-side** (a buyer can't accept their own request; nobody can skip straight to completed)
- Booking history, filterable by role (buyer/seller) and status

### 💬 Real-Time Messaging
- **Socket.io**, authenticated with the same JWT as the REST API
- Persistent 1:1 conversations
- Live typing indicators
- Read receipts
- Conversation list with unread counts

### ⭐ Reviews & Ratings
- Star ratings tied to **completed bookings only** (one review per booking, enforced at the database level)
- Rating averages incrementally recalculated and written back to both the listing and the seller's profile
- Report / flag inappropriate reviews

### 🔔 Notifications
- Real-time push over Socket.io (booking requests, status updates, new reviews, new messages)
- Polling fallback for missed events
- Mark as read / mark all as read

### 📊 User Dashboard
- Real earnings, computed from actual completed bookings (no dummy data)
- Active listings, pending requests, saved items — all live counts
- Recent activity feed

### 🛡️ Admin Panel
- Platform-wide statistics (users, listings, bookings, GMV)
- User management — search, filter, suspend/reactivate accounts
- Listing moderation — approve or remove any listing
- Reported content queue — dismiss or delete flagged reviews (correctly recalculates rating averages on delete)

### 🎨 UI/UX
- Custom dark "dusk marketplace" design system — not a default template
- GSAP-powered animations: page-load sequences, scroll-triggered reveals, an infinite marquee of live platform activity
- A reusable 3D tilt component (real cursor-driven perspective rotation) applied across listing cards, category cards, and the hero section
- A fully animated 3D visual scene on the auth pages
- Fully responsive across mobile, tablet, and desktop
- Accessible: keyboard focus traps in modals, ARIA labeling, `prefers-reduced-motion` respected throughout

---

## 🛠️ Tech Stack

**Frontend**
- [Next.js 14](https://nextjs.org/) (App Router) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) — custom design system, no default theme
- [GSAP](https://gsap.com/) — animation & ScrollTrigger
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) — form handling & validation
- [TanStack Query](https://tanstack.com/query) — server state management
- [Socket.io Client](https://socket.io/) — real-time communication
- [Axios](https://axios-http.com/) — HTTP client with automatic token refresh

**Backend**
- [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) — REST API
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) — database & ODM
- [Socket.io](https://socket.io/) — real-time server
- [JWT](https://jwt.io/) (`jsonwebtoken`) — authentication
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) — password hashing
- [Multer](https://www.npmjs.com/package/multer) + [Cloudinary](https://cloudinary.com/) — image upload & storage
- [express-validator](https://express-validator.github.io/) — input validation
- [Helmet](https://helmetjs.github.io/) + [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) + [express-mongo-sanitize](https://www.npmjs.com/package/express-mongo-sanitize) — security middleware

**Tooling**
- Git & GitHub — version control
- Postman — API testing
- ESLint + TypeScript strict mode

---

## 🏗️ Architecture

Loka uses a **decoupled two-service architecture** — a standard production pattern for applications that need a persistent WebSocket connection alongside a stateless REST API:

```
┌─────────────────────┐         REST API          ┌──────────────────────┐
│                      │ ─────────────────────────▶│                      │
│   Next.js Frontend   │                            │  Express.js Backend  │
│   (Vercel)           │◀───────────────────────── │  (Render)            │
│                      │      Socket.io (WSS)       │                      │
└─────────────────────┘ ◀────────────────────────▶ └──────────┬───────────┘
                                                                │
                                                    ┌───────────┴───────────┐
                                                    │                       │
                                              ┌─────▼─────┐         ┌───────▼──────┐
                                              │  MongoDB   │         │  Cloudinary  │
                                              │  Atlas     │         │  (images)    │
                                              └───────────┘         └──────────────┘
```

- The **frontend** never talks to MongoDB or Cloudinary directly — every data operation goes through the authenticated REST API.
- **Socket.io** is attached to the same HTTP server as the REST API and authenticated with the same JWT, so there's no separate auth system to maintain.
- The refresh token lives in an **httpOnly cookie**; the access token lives in memory only (never `localStorage`), limiting the attack surface for XSS-based token theft.

---

## 🗄️ Database Schema

Six core collections, related as follows:

```
User ──┬──< Listing (owner)
       ├──< Booking (as buyer)
       ├──< Booking (as seller)
       ├──< Review (as reviewer)
       ├──< Review (as targetUser)
       ├──< Message (as sender/recipient)
       ├──< Notification
       └──  favorites: [Listing]

Listing ──< Booking
        ──< Review

Booking ──< Review (1:1, one review per booking)
```

| Model | Key Fields |
|---|---|
| **User** | `fullName`, `email`, `password` (hashed), `role`, `bio`, `location`, `skills[]`, `ratingAverage`, `ratingCount`, `favorites[]`, `isActive` |
| **Listing** | `owner`, `type` (product/service), `title`, `description`, `category`, `price`, `images[]`, `status`, `ratingAverage`, `ratingCount`, `favoritesCount` |
| **Booking** | `listing`, `buyer`, `seller`, `scheduledDate`, `status`, `priceAtBooking` (price snapshot) |
| **Review** | `booking`, `listing`, `reviewer`, `targetUser`, `rating`, `comment`, `isFlagged` |
| **Message** | `conversationId`, `sender`, `recipient`, `text`, `imageUrl`, `isRead` |
| **Notification** | `user`, `type`, `message`, `link`, `isRead` |

Indexes are set on frequently-queried fields (`email` unique, listing `status + category + createdAt` compound index, full-text index on `title/description/category`, `conversationId + createdAt` for chat history) to keep query performance production-realistic rather than relying on collection scans.

---

## ⚡ Real-Time Events (Socket.io)

The socket connection authenticates via the same JWT access token used by the REST API (`socket.handshake.auth.token`). Each user is placed in a personal room (`user:<id>`) on connect.

| Direction | Event | Payload |
|---|---|---|
| Client → Server | `send_message` | `{ recipientId, text }` → ack `{ success, message }` |
| Client → Server | `typing` | `{ recipientId, isTyping }` |
| Client → Server | `mark_read` | `{ conversationId }` |
| Server → Client | `receive_message` | Full message object |
| Server → Client | `typing` | `{ senderId, isTyping }` |
| Server → Client | `messages_read` | `{ conversationId, readBy }` |
| Server → Client | `new_notification` | Full notification object (pushed the instant a booking/review event fires) |

---

## 📡 API Reference

Base URL: `/api`

<details>
<summary><strong>Authentication</strong></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new account |
| POST | `/auth/login` | Public | Log in |
| POST | `/auth/logout` | Public | Log out |
| POST | `/auth/refresh` | Public | Exchange refresh cookie for a new access token |
| GET | `/auth/me` | Private | Get the current authenticated user |
| POST | `/auth/forgot-password` | Public | Request a password reset |
| POST | `/auth/reset-password` | Public | Reset password with a token |

</details>

<details>
<summary><strong>Listings</strong></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/listings` | Public | Search/filter/paginate — `?keyword&category&type&minPrice&maxPrice&city&sort&page&limit` |
| POST | `/listings` | Private | Create a listing (multipart: `images[]` + fields) |
| GET | `/listings/mine` | Private | Get the current user's own listings |
| GET | `/listings/favorites` | Private | Get the current user's favorited listings |
| GET | `/listings/meta/category-counts` | Public | Real per-category active-listing counts |
| GET | `/listings/:id` | Public | Get a single listing |
| PUT | `/listings/:id` | Private (owner/admin) | Update a listing |
| DELETE | `/listings/:id` | Private (owner/admin) | Delete a listing |
| POST | `/listings/:id/favorite` | Private | Toggle favorite |

</details>

<details>
<summary><strong>Bookings</strong></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/bookings` | Private | Create a booking request |
| GET | `/bookings/mine` | Private | List bookings — `?role=buyer\|seller&status=` |
| GET | `/bookings/:id` | Private (participants/admin) | Get a single booking |
| PATCH | `/bookings/:id/status` | Private | Role-guarded status transition |

</details>

<details>
<summary><strong>Reviews</strong></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/reviews` | Private | Review a completed booking |
| GET | `/reviews/listing/:listingId` | Public | Get reviews for a listing |
| GET | `/reviews/user/:userId` | Public | Get reviews for a user |
| POST | `/reviews/:id/flag` | Private | Report a review |

</details>

<details>
<summary><strong>Notifications</strong></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/notifications` | Private | List notifications |
| PATCH | `/notifications/:id/read` | Private | Mark one as read |
| PATCH | `/notifications/read-all` | Private | Mark all as read |

</details>

<details>
<summary><strong>Messages</strong></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/messages/conversations` | Private | List conversations with last message + unread count |
| GET | `/messages/with/:userId` | Private | Get full message history with a user |

</details>

<details>
<summary><strong>Dashboard</strong></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dashboard/summary` | Private | Real earnings, counts, and recent activity |

</details>

<details>
<summary><strong>Admin</strong></summary>

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/stats` | Admin | Platform-wide statistics |
| GET | `/admin/users` | Admin | List/search/filter users |
| PATCH | `/admin/users/:id/status` | Admin | Suspend/reactivate a user |
| GET | `/admin/listings` | Admin | List all listings by status |
| PATCH | `/admin/listings/:id/status` | Admin | Approve/remove a listing |
| GET | `/admin/reports` | Admin | List flagged reviews |
| PATCH | `/admin/reports/:id` | Admin | Dismiss or delete a flagged review |

</details>

---

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier is sufficient)
- A [Cloudinary](https://cloudinary.com/) account (free tier is sufficient)

### Installation

```bash
git clone https://github.com/Uzairkahn/loka-marketplace.git
cd loka-marketplace
```

### Environment Variables

**`backend/.env`** (copy from `backend/.env.example`):

| Variable | Description |
|---|---|
| `PORT` | Backend server port (default `5000`) |
| `CLIENT_URL` | Frontend origin, for CORS (`http://localhost:3000` locally) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Random secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Random secret for signing refresh tokens (different from above) |
| `JWT_ACCESS_EXPIRES_IN` | e.g. `15m` |
| `JWT_REFRESH_EXPIRES_IN` | e.g. `7d` |
| `CLOUDINARY_CLOUD_NAME` | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |

Generate strong JWT secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**`frontend/.env.local`** (copy from `frontend/.env.local.example`):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (`http://localhost:5000/api` locally) |

### Running Locally

**Backend:**
```bash
cd backend
npm install
npm run dev
```
API runs at `http://localhost:5000`. Verify with `curl http://localhost:5000/api/health`.

**Frontend** (in a new terminal):
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:3000`.

### Testing the Admin Panel

There's intentionally no public signup path to an admin account. To test it locally, promote a user directly in the database:

```js
// via mongosh
use loka
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

Log out and back in (the JWT carries the role) — you'll see an **Admin panel** link on `/dashboard`.

---

## ☁️ Deployment

This project is **already deployed and live** — see [Live Demo](#-live-demo) above. The steps below document exactly how, for reproducibility.

Loka's decoupled architecture deploys as two separate services.

### Backend → Render

1. Push this repo to GitHub (if not already).
2. On [Render](https://render.com/), click **New → Web Service**, connect your GitHub repo.
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free tier is fine for demo purposes
4. Add all the environment variables from `backend/.env` under the **Environment** tab (set `CLIENT_URL` to your Vercel URL, and `NODE_ENV=production`).
5. Deploy. Note your service URL.

> Free-tier Render services spin down after inactivity — the first request after idle can take 30–60s to respond. This is expected and not a bug.

### Frontend → Vercel

1. On [Vercel](https://vercel.com/), click **Add New → Project**, import the same GitHub repo.
2. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js (auto-detected)
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://<your-render-service>.onrender.com/api`
4. Deploy. Note your production URL.

### Final step

Go back to Render → your backend service → update `CLIENT_URL` to your actual Vercel URL, and redeploy the backend so CORS accepts requests from your live frontend.

---

## 📁 Project Structure

```
loka/
├── backend/
│   └── src/
│       ├── config/       # DB + Cloudinary setup
│       ├── models/       # Mongoose schemas
│       ├── controllers/  # Route handler logic
│       ├── routes/       # Express routers
│       ├── middleware/   # Auth guard, validation, error handling, rate limiting
│       ├── validators/   # express-validator rule sets
│       ├── socket/       # Socket.io setup (JWT auth, chat events)
│       ├── utils/        # Shared helpers
│       ├── app.js
│       └── server.js
└── frontend/
    └── src/
        ├── app/          # Next.js App Router pages
        ├── components/   # UI, landing, listings, bookings, reviews, chat, admin
        ├── context/       # AuthContext
        ├── lib/          # API clients, GSAP setup, Zod schemas
        └── types/        # Shared TypeScript types
```

---

## 🗺️ Roadmap

- [x] Authentication & role-based access control
- [x] Product & service listings with image upload
- [x] Booking system with role-guarded status transitions
- [x] Reviews & ratings
- [x] Real-time chat & notifications
- [x] User dashboard & admin panel
- [x] Animation, 3D visual polish, and accessibility pass
- [x] Deployment to production (Render + Vercel)
- [ ] Progressive Web App support
- [ ] Google Maps integration for nearby services

---

## 👤 Author

**Uzair Khan**

- GitHub: [@Uzairkahn](https://github.com/Uzairkahn)
- LinkedIn: [uzair-khan-616048385](https://linkedin.com/in/uzair-khan-616048385)
- Email: uzairkhan4645632@gmail.com

---

## 🙏 Acknowledgments

Built as **Task FSWD-3 — Smart Community Service & Local Marketplace Platform** for the **Teyzix Core Internship (June Batch)**.

---

<div align="center">

**⭐ If you found this project interesting, consider giving it a star!**

</div>
