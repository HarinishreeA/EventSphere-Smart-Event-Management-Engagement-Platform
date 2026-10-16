# EventSphere 🌐✨
### Smart Event Management & Engagement Platform

> A full-stack campus event platform that goes beyond simple scheduling — EventSphere combines real-time RSVP management, automated waitlisting, QR-based attendance tracking, gamified engagement (points & badges), and email-confirmed digital passes into a single cohesive system.

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-black?logo=socket.io)](https://socket.io/)
[![License](https://img.shields.io/badge/License-ISC-yellow)](LICENSE)

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Project Folder Structure](#5-project-folder-structure)
6. [Prerequisites](#6-prerequisites)
7. [Installation and Setup](#7-installation-and-setup)
8. [Environment Variables](#8-environment-variables)
9. [API Overview](#9-api-overview)
10. [User Roles and Workflow](#10-user-roles-and-workflow)
11. [Testing](#11-testing)
12. [Deployment Guide](#12-deployment-guide)
13. [Security Notes](#13-security-notes)
14. [Future Enhancements](#14-future-enhancements)
15. [Author and Repository](#15-author-and-repository)

---

## 1. Project Overview

Campus events are often managed through scattered spreadsheets, WhatsApp groups, and manual check-in sheets — leading to overbooking, lost registrations, and zero engagement data. **EventSphere** solves this by providing a structured, real-time platform for students and administrators alike.

**Students** can browse events, filter by category or date, RSVP with a single click, and receive an emailed digital pass with a unique QR ticket code. If an event is full, they are automatically added to an ordered waitlist and promoted seamlessly when a spot opens.

**Administrators** can create and manage events (with optional image upload), monitor live attendee counts via WebSocket broadcasts, view attendee rosters, and scan QR codes at the venue gate to record check-ins — all from the same web interface.

Every confirmed check-in awards gamification points to the student, and milestone badges (`First Step`, `Regular`, `Campus Star`) are unlocked automatically, making attendance rewarding.

---

## 2. Key Features

### 👨‍🎓 Student Capabilities

| Feature | Details |
|---|---|
| **Event Catalog** | Paginated event listing with configurable page sizes (6, 12, 24 per page) |
| **Search and Filtering** | Full-text search across title, description, location, and organizer; filter by category and date range |
| **RSVP** | One-click RSVP with instant capacity enforcement and live attendee count broadcast via Socket.IO |
| **Waitlist Management** | Automatic placement on an ordered waitlist when capacity is reached; automatic promotion to confirmed when a spot opens |
| **Digital Pass** | Confirmed attendees receive a unique `ESP-xxxx-xxxx` ticket code rendered as a scannable QR code |
| **My RSVPs Dashboard** | Dedicated view separating confirmed registrations from waitlisted entries, with quick RSVP cancellation |
| **Attendance History** | View past events where a check-in was recorded |
| **Email Confirmations** | Automated email on RSVP confirmation, waitlist addition, waitlist promotion, and event cancellation (via Nodemailer) |
| **Gamification Points** | 10 points awarded per confirmed check-in (QR scan or manual admin toggle) |
| **Milestone Badges** | Automatic badge unlock: *First Step* (1 check-in), *Regular* (5 check-ins), *Campus Star* (10 check-ins) |
| **Leaderboard** | Top-10 student ranking by points, accessible to all logged-in users |

### 🛡️ Admin Capabilities

| Feature | Details |
|---|---|
| **Event CRUD** | Create, edit, and delete events with title, description, category, date, time, location, organizer, capacity, and optional banner image |
| **Image Upload** | Upload event banner images via Multer (local storage) or provide a direct image URL |
| **Status Management** | Set event status: `upcoming`, `ongoing`, `completed`, or `cancelled` |
| **Cancellation Emails** | When an event is cancelled, all confirmed and waitlisted registrants are automatically emailed |
| **Attendee Roster** | View complete attendee roster (name, email, department, student ID, registration timestamp) split into confirmed and waitlisted |
| **QR Scanner** | Scan attendee QR codes at the venue using the browser camera (`html5-qrcode`) to validate and record check-in |
| **Manual Attendance Toggle** | Mark any confirmed attendee as present or absent from the roster — points and badges update accordingly |
| **Live Check-in Stats** | Real-time check-in count and percentage for any event via Socket.IO broadcast |
| **Dashboard Analytics** | Total events, upcoming events, confirmed RSVPs, waitlist count, total students, check-in rate, and category breakdown |

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | React | ^18.2.0 | Component-based SPA |
| **Frontend Build Tool** | Vite | ^5.1.6 | Fast dev server and production bundler |
| **Styling** | Tailwind CSS | ^3.4.1 | Utility-first CSS with glassmorphism aesthetic |
| **Icons** | Lucide React | ^0.344.0 | Consistent icon library |
| **HTTP Client** | Axios | ^1.6.8 | API calls with JWT interceptor |
| **QR Generation** | qrcode.react | ^4.2.0 | Render QR codes for digital passes |
| **QR Scanning** | html5-qrcode | ^2.3.8 | Camera-based QR code scanner |
| **Real-Time (Client)** | socket.io-client | ^4.7.4 | Subscribe to live event and check-in updates |
| **Backend Runtime** | Node.js | v18+ | Server-side JavaScript runtime |
| **Backend Framework** | Express | ^5.2.1 | REST API with middleware pipeline |
| **Database** | MongoDB + Mongoose | ^9.9.4 | Document store with schema validation and text indexes |
| **Authentication** | JWT + bcryptjs | jsonwebtoken ^9.0.3 / bcryptjs ^3.0.3 | Signed tokens and password hashing |
| **Real-Time (Server)** | Socket.IO | ^4.8.3 | WebSocket broadcast for RSVP and check-in events |
| **File Uploads** | Multer | ^2.3.0 | Multipart/form-data image handling |
| **Email** | Nodemailer | ^10.0.13 | SMTP email delivery for confirmations |
| **Testing** | Jest + Supertest + mongodb-memory-server | ^30.5.0 / ^7.2.2 / ^11.2.0 | Isolated integration and unit test suite |
| **Dev Tool** | Nodemon | ^3.1.14 | Auto-restart on server file changes |

---

## 4. System Architecture

```
+-------------------------------------------------------------+
|                    Browser (Client)                         |
|   React SPA --- Tailwind CSS --- Axios HTTP Client          |
|   Socket.IO Client --- QR Scanner / QR Generator           |
+------------------------------+------------------------------+
                               |  HTTP REST / WebSocket
+------------------------------v------------------------------+
|              Express API Server (Node.js)                   |
|                                                             |
|  [ /auth ]  [ /events ]  [ /rsvp ]  [ /admin ]             |
|                    [ /attendance ]                          |
|                                                             |
|  Middleware: JWT Auth | RBAC (role.middleware) | Multer     |
|              Error Handler | CORS                           |
|                                                             |
|  Socket.IO Server                                           |
|    notifyAttendeeUpdate()    (RSVP / cancel)                |
|    notifyAttendanceCheckin() (QR scan / manual toggle)      |
|                                                             |
|  Email Service (Nodemailer) --- SMTP transporter            |
+------------------------------+------------------------------+
                               |  Mongoose ODM
+------------------------------v------------------------------+
|                      MongoDB                                |
|   Collections: users | events | rsvps                      |
+-------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility |
|---|---|
| **Frontend (React + Vite)** | Renders the SPA; manages auth state via `AuthContext`; subscribes to real-time updates via `SocketContext`; proxies `/api` and `/socket.io` to the backend during development |
| **REST API (Express)** | Validates requests, enforces JWT authentication and role-based access, executes business logic, and returns JSON responses |
| **MongoDB (Mongoose)** | Stores users (with points and badges), events, and RSVP records. Compound unique index prevents duplicate RSVPs. Text index enables full-text search. Sparse unique index on `ticketCode` supports fast QR lookups |
| **Socket.IO** | Broadcasts `attendee_update` on RSVP/cancel and `attendance_checkin` on check-in. Clients join event-specific rooms (`event_<id>`) for scoped updates and also receive global broadcasts |
| **Email Service** | Builds HTML email templates and dispatches via SMTP. Gracefully degrades to a console log stub if no SMTP credentials are configured |

---

## 5. Project Folder Structure

```
EventSphere project/
+-- package.json                  # Root scripts: dev:server, dev:client, seed
|
+-- server/                       # Node.js + Express backend
|   +-- src/
|   |   +-- app.js                # Express app, route mounting, middleware wiring
|   |   +-- server.js             # HTTP server + Socket.IO initialisation
|   |   +-- config/               # Mongoose database connection
|   |   +-- controllers/
|   |   |   +-- auth.controller.js        # Register, login, profile, leaderboard
|   |   |   +-- event.controller.js       # CRUD, pagination, search, filtering
|   |   |   +-- rsvp.controller.js        # RSVP, cancel, waitlist promotion, digital pass
|   |   |   +-- admin.controller.js       # Dashboard stats, attendee roster
|   |   |   +-- attendance.controller.js  # QR check-in, manual toggle, stats
|   |   +-- middleware/
|   |   |   +-- auth.middleware.js        # JWT token verification (protect)
|   |   |   +-- role.middleware.js        # Role-based access control (authorize)
|   |   |   +-- upload.middleware.js      # Multer image upload handler
|   |   |   +-- error.middleware.js       # Centralised error handler
|   |   +-- models/
|   |   |   +-- User.js    # name, email, password, role, department, studentId, points, badges
|   |   |   +-- Event.js   # title, description, category, date, time, location, organizer,
|   |   |   |              # capacity, attendeeCount, waitlistCount, imageUrl, status
|   |   |   +-- RSVP.js    # user, event, status, ticketCode, checkedIn, checkedInAt,
|   |   |                  # checkedInBy, checkInMethod, registeredAt
|   |   +-- routes/
|   |   |   +-- auth.routes.js
|   |   |   +-- event.routes.js
|   |   |   +-- rsvp.routes.js
|   |   |   +-- admin.routes.js
|   |   |   +-- attendance.routes.js
|   |   +-- services/
|   |   |   +-- email.service.js  # Nodemailer transporter + HTML email templates
|   |   +-- socket/
|   |   |   +-- socket.js         # Socket.IO init, room management, broadcast helpers
|   |   +-- seed/
|   |       +-- seed.js           # Database seeder: demo events + default accounts
|   +-- tests/                    # Jest + Supertest integration test suites
|   |   +-- setup.js              # MongoMemoryServer lifecycle hooks
|   |   +-- auth.test.js
|   |   +-- event.crud.test.js
|   |   +-- pagination.test.js
|   |   +-- rbac.test.js
|   |   +-- rsvp.test.js
|   |   +-- attendance.test.js
|   +-- uploads/                  # Local image upload storage directory
|   +-- .env.example              # Environment variable template (safe to commit)
|   +-- package.json
|
+-- client/                       # React + Vite frontend
    +-- src/
    |   +-- main.jsx              # React DOM entry point
    |   +-- App.jsx               # Root component, tab routing, global state and handlers
    |   +-- index.css             # Tailwind CSS directives + custom design tokens
    |   +-- context/
    |   |   +-- AuthContext.jsx   # Auth state provider (user, token, login, logout)
    |   |   +-- SocketContext.jsx # Socket.IO client provider
    |   +-- pages/
    |   |   +-- EventListings.jsx       # Public event catalog with search, filter, pagination
    |   |   +-- MyEventsDashboard.jsx   # Student: My RSVPs, digital pass, QR viewer, history
    |   |   +-- AdminDashboard.jsx      # Admin: stats, event list, QR scanner
    |   |   +-- LoginPage.jsx
    |   |   +-- RegisterPage.jsx
    |   +-- components/
    |   |   +-- Navbar.jsx              # Navigation bar with role-aware links
    |   |   +-- EventCard.jsx           # Single event card with RSVP action
    |   |   +-- EventDetailModal.jsx    # Full event detail overlay
    |   |   +-- EventFormModal.jsx      # Admin create/edit event form
    |   |   +-- EventFilter.jsx         # Category, date, search filter bar
    |   |   +-- Pagination.jsx          # Page navigator
    |   |   +-- AttendeeListModal.jsx   # Admin attendee roster with manual toggle
    |   |   +-- DigitalPassModal.jsx    # Student QR pass viewer
    |   |   +-- QRScannerModal.jsx      # Admin camera-based QR scanner
    |   |   +-- Toast.jsx              # Global toast notification
    |   +-- services/
    |       +-- api.js                 # Axios instance with JWT Bearer interceptor
    +-- index.html
    +-- vite.config.js            # Dev proxy: /api, /uploads, /socket.io -> localhost:5000
    +-- tailwind.config.js
    +-- postcss.config.js
    +-- package.json
```

---

## 6. Prerequisites

| Requirement | Minimum Version | Notes |
|---|---|---|
| **Node.js** | v18.0.0 | Includes npm v9+ |
| **MongoDB** | v6+ | Local instance **or** MongoDB Atlas connection string |
| **Git** | Any recent version | For cloning the repository |
| **SMTP credentials** *(optional)* | — | Gmail, Outlook, or any SMTP provider. If omitted, email actions are logged to the console only |

---

## 7. Installation and Setup

### Step 1 — Clone the repository

```bash
git clone https://github.com/HarinishreeA/EventSphere.git
cd EventSphere
```

---

### Step 2 — Backend setup (`server/`)

```bash
cd server
npm install
```

Create your local environment file from the template:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `server/.env` and fill in your values — see [Section 8](#8-environment-variables) for a full description of every key.

**Seed the database** with demo events and default accounts:

```bash
npm run seed
```

> **Default accounts created by the seeder:**
>
> | Role | Email | Password |
> |---|---|---|
> | Admin | `admin@campus.edu` | `admin123` |
> | Student | `student1@campus.edu` | `student123` |
> | Student | `student2@campus.edu` | `student123` |

Start the backend development server:

```bash
npm run dev
```

The API server will be available at **`http://localhost:5000`**.

---

### Step 3 — Frontend setup (`client/`)

Open a **second terminal** in the project root:

```bash
cd client
npm install
npm run dev
```

The React application will be available at **`http://localhost:5173`**.

The Vite dev server automatically proxies `/api`, `/uploads`, and `/socket.io` requests to `http://127.0.0.1:5000`, so no additional CORS configuration is needed during development.

---

### Convenience scripts from the project root

The root `package.json` exposes the following shortcuts:

```bash
npm run dev:server   # Start the Express backend (nodemon)
npm run dev:client   # Start the Vite frontend dev server
npm run seed         # Seed the database
```

---

## 8. Environment Variables

The backend requires a `server/.env` file. **Never commit this file to version control** — it is already listed in `.gitignore`.

Copy `server/.env.example` as your starting point and fill in your values:

```env
# --- Server ---
PORT=5000

# --- Database ---
# Local MongoDB:
MONGO_URI=mongodb://127.0.0.1:27017/campus_event_manager
# Or replace with your MongoDB Atlas connection string

# --- Authentication ---
# Use a long, cryptographically random string — never use a weak placeholder in production
JWT_SECRET=replace_with_a_strong_random_secret

# --- CORS ---
CLIENT_URL=http://localhost:5173

# --- Email / SMTP (all optional — omit to fall back to console logging) ---
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
EMAIL_FROM="EventSphere <noreply@eventsphere.edu>"
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Port the Express server listens on |
| `MONGO_URI` | Yes | MongoDB connection URI (local or Atlas) |
| `JWT_SECRET` | Yes | Secret key used to sign and verify JWTs — keep this strong and private |
| `CLIENT_URL` | Yes | Frontend origin URL; used by Socket.IO CORS policy |
| `SMTP_HOST` | No | SMTP server hostname |
| `SMTP_PORT` | No | SMTP port (`587` for STARTTLS, `465` for SSL) |
| `SMTP_USER` | No | SMTP authentication username |
| `SMTP_PASS` | No | SMTP authentication password or app password |
| `EMAIL_FROM` | No | Sender display name and address for outgoing emails |

> **Note:** If `SMTP_HOST`, `SMTP_USER`, or `SMTP_PASS` are absent, the email service falls back to a development stub that prints the email subject and recipient to the console without dispatching a real message. All other functionality remains unaffected.

---

## 9. API Overview

All routes are prefixed with `/api`. Uploaded images are served statically at `/uploads/<filename>`.

### Route Groups

| Prefix | Description |
|---|---|
| `/api/auth` | User registration, login, current user profile, leaderboard |
| `/api/events` | Public paginated and filterable event listing, single event detail, admin CRUD, student RSVP and cancellation |
| `/api/rsvp` | Student's own RSVP list, attendance history, confirmed digital pass |
| `/api/admin` | Admin dashboard statistics, per-event attendee and waitlist roster |
| `/api/attendance` | QR ticket check-in validation, live check-in statistics, manual attendance toggle |

### Endpoint Reference

```
# Authentication
POST   /api/auth/register           Public   Register a new user (student or admin)
POST   /api/auth/login              Public   Authenticate and receive a JWT
GET    /api/auth/me                 Auth     Get the current user's profile
GET    /api/auth/leaderboard        Auth     Top-10 students ranked by points

# Events
GET    /api/events                  Public   List events with pagination, search, and filters
GET    /api/events/:id              Public   Get a single event by ID
POST   /api/events                  Admin    Create a new event (supports image upload)
PUT    /api/events/:id              Admin    Update an event
DELETE /api/events/:id              Admin    Delete an event and all its RSVPs
POST   /api/events/:id/rsvp         Student  RSVP to an event (auto-waitlists if full)
DELETE /api/events/:id/rsvp         Student  Cancel an RSVP (auto-promotes next waitlisted user)

# RSVP
GET    /api/rsvp/my-events          Student  List own active RSVPs (confirmed + waitlisted)
GET    /api/rsvp/my-history         Auth     List events where the user was checked in
GET    /api/rsvp/:eventId/my-pass   Auth     Get the confirmed digital pass for a specific event

# Admin
GET    /api/admin/stats                      Admin   Platform-wide dashboard statistics
GET    /api/admin/events/:id/attendees       Admin   Confirmed and waitlisted roster for an event

# Attendance
POST   /api/attendance/check-in              Admin   Validate a QR ticket code and record check-in
GET    /api/attendance/event/:eventId/stats  Admin   Live check-in statistics for an event
POST   /api/attendance/manual-toggle         Admin   Manually set or clear an attendee's check-in
```

### Real-Time Socket.IO Events

Clients connect to the Socket.IO server and may emit `join_event` with an `eventId` to join an event-specific room for scoped updates.

| Event (server → client) | Payload | Triggered when |
|---|---|---|
| `attendee_update` | `{ eventId, attendeeCount, waitlistCount, capacity }` | A student RSVPs or cancels |
| `global_event_update` | Same as above | Broadcast globally to all connected clients |
| `attendance_checkin` | `{ eventId, rsvpId, attendeeName, checkedInAt, totalCheckedIn, totalConfirmed }` | QR scan or manual toggle |
| `global_attendance_update` | Same as above | Broadcast globally to all connected clients |

---

## 10. User Roles and Workflow

### Student Workflow

```
Register / Login
       |
       v
Browse Event Catalog --> Filter by category / date / keyword
       |
       v
Click RSVP on an event
       |
       +-- Capacity available --> Status: Confirmed
       |                          - Unique ticket code generated (ESP-xxxx-xxxx)
       |                          - Confirmation email sent with QR pass
       |
       +-- Event is full -------> Status: Waitlisted
                                  - Waitlist email sent
                                  - Auto-promoted when a spot opens (email sent on promotion)
       |
       v
My RSVPs Dashboard
  - View confirmed passes with QR code (DigitalPassModal)
  - View waitlisted entries
  - Cancel RSVP at any time
  - View attendance history, earned points, and badges
  - Check the leaderboard
```

### Admin Workflow

```
Login with admin account
       |
       v
Admin Dashboard
  - View platform stats (events, RSVPs, check-in rate, category breakdown)
  - Create / Edit / Delete events
  - Set event status (upcoming -> ongoing -> completed / cancelled)
       |
       v
View Attendees for an event
  - See confirmed roster and waitlist queue
  - Manually toggle check-in status per attendee
  - Points and badges update on each manual toggle
       |
       v
QR Scanner (at the venue)
  - Open QRScannerModal (camera-based via html5-qrcode)
  - Camera reads attendee's QR code
  - Backend validates the ticket code against the specified event
  - Check-in recorded; 10 points awarded; badge milestone evaluated
  - Live check-in stats broadcast to all connected clients via Socket.IO
```

---

## 11. Testing

The backend includes a comprehensive automated test suite using **Jest**, **Supertest**, and **mongodb-memory-server**. Tests run against an in-memory database — no external MongoDB instance is required.

### Run the test suite

```bash
cd server
npm test
```

> The test script runs: `cross-env NODE_ENV=test jest --runInBand --detectOpenHandles --forceExit`

### Test File Coverage

| Test File | What is tested |
|---|---|
| `auth.test.js` | User registration, login, JWT generation, and profile retrieval |
| `rbac.test.js` | Students receive `403 Forbidden` on admin-only endpoints; admins have full write access |
| `event.crud.test.js` | Create, read, update, and delete events |
| `pagination.test.js` | Pagination edge cases — empty pages, out-of-range page numbers, category filters, keyword search |
| `rsvp.test.js` | RSVP success, duplicate prevention (`400`), capacity-triggered waitlisting, automatic waitlist promotion on cancellation |
| `attendance.test.js` | Ticket code generation on confirmed RSVP, no ticket on waitlisted RSVP, ticket on promotion, QR check-in (success and all rejection paths), duplicate check-in prevention, invalid ticket code, wrong-event rejection, non-confirmed pass rejection, attendance stats, manual toggle, points and badge award |

---

## 12. Deployment Guide

> **Important:** This project is not yet deployed to a live public URL. The instructions below describe the general deployment approach for reference.

### Frontend — React + Vite

1. Build the production bundle from the `client/` directory:

   ```bash
   cd client
   npm run build
   ```

   Optimised static files are written to `client/dist/`.

2. Deploy the `dist/` folder to a static hosting provider such as **Vercel**, **Netlify**, or **GitHub Pages**.

3. In the hosting provider's environment settings, set:

   ```
   VITE_API_URL=https://your-deployed-backend-url.com/api
   ```

### Backend — Node.js + Express

1. Deploy the `server/` directory to a Node.js-compatible host such as **Render**, **Railway**, **Fly.io**, or a self-managed VPS.

2. Set all environment variables from [Section 8](#8-environment-variables) in the host's settings panel — **do not upload the `.env` file**.

3. Ensure your MongoDB instance (e.g., MongoDB Atlas) allows inbound connections from the server's IP address.

4. The production start command is:

   ```bash
   npm start
   # Runs: node src/server.js
   ```

5. Set `CLIENT_URL` to the deployed frontend origin so that Socket.IO CORS permits WebSocket connections from the correct domain.

---

## 13. Security Notes

- **`.env` must never be committed to GitHub.** It is listed in `.gitignore`. The `.env.example` file is a safe, credential-free template that is intentionally committed.
- **`JWT_SECRET`** must be a long, cryptographically random string in any non-development environment. A weak or guessable secret can allow token forgery.
- **Passwords** are hashed with `bcryptjs` at 10 salt rounds before storage. Plaintext passwords are never persisted to the database.
- **SMTP credentials and app passwords** must live only in environment variables — never hardcoded in source files.
- **Multer** stores uploaded images in `server/uploads/` on the local filesystem. In production, ensure this directory is not publicly listable and consider migrating to cloud object storage.
- **Role enforcement** is performed server-side via `role.middleware.js`. Client-side role checks (e.g., hiding the Admin Portal tab) are UI conveniences only and must never be relied upon for access control.

---

## 14. Future Enhancements

The following features are **not yet implemented** and represent genuine next steps for the project:

- **React Router** — Replace the current tab-based navigation with URL routing to enable deep-linking, browser history, and bookmarkable pages.
- **Push Notifications** — Browser push notifications or an in-app notification centre for waitlist promotions and event reminders.
- **Calendar Export** — Allow students to add confirmed events to Google Calendar or download `.ics` files directly from the digital pass.
- **Advanced Admin Analytics** — Charts and trend graphs showing RSVP volume over time and department-wise registration breakdown.
- **Student Profile Page** — Dedicated page displaying personal points, earned badge collection, and complete event history in one place.
- **Forgot Password / Email Reset** — Self-service account recovery via email OTP or a time-limited token link.
- **Rate Limiting** — Add `express-rate-limit` middleware to protect authentication endpoints against brute-force attacks.
- **Cloud Image Storage** — Replace local Multer storage with Cloudinary or AWS S3 for scalable, CDN-delivered banner images in production.
- **Automated CI/CD Pipeline** — GitHub Actions workflow to automatically run the test suite on every push and pull request.

---

## 15. Author and Repository

| | |
|---|---|
| **GitHub Repository** | [https://github.com/HarinishreeA/EventSphere](https://github.com/HarinishreeA/EventSphere) |
| **Author** | HarinishreeA |
| **License** | ISC |

---

*EventSphere — Built as a college capstone project demonstrating full-stack development with real-time WebSocket communication, QR-based attendance, gamification, and automated email workflows.*
