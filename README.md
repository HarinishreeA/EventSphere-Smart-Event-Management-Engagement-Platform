# Campus Event Manager 🎓⚡

A modern, full-stack Campus Event Management application built following the architecture and tech stack patterns of React (Vite) + Tailwind CSS on the frontend, Node.js + Express on the backend, MongoDB + Mongoose for database persistence, JWT + bcrypt for role-based authentication, and Socket.io for real-time live attendee count updates.

---

## 🌟 Key Features

### 👨‍🎓 Student Capabilities
- **Paginated Event Catalog**: Browse campus fests, workshops, guest lectures, coding competitions, cultural galas, and sports meets with configurable page sizes (6, 12, 24).
- **Advanced Search & Filtering**: Filter events by category, date range, or keyword search across title, description, location, and organizer.
- **RSVP & Real-Time Capacity Tracking**: One-click RSVP with instant live attendee count updates via Socket.io WebSockets.
- **Automatic Waitlist Management**: When an event reaches maximum capacity, students are automatically added to an ordered waitlist. If a spot opens up upon cancellation, the first waitlisted student is automatically promoted to confirmed!
- **My RSVPs Dashboard**: Dedicated personal pass view separating confirmed RSVPs and waitlisted entries with quick cancellation.

### 🛡️ Admin Capabilities (Faculty / Organizers)
- **Full Event CRUD**: Create, edit, and delete campus events with image upload support (local file upload via Multer or direct image URL).
- **Capacity Management**: Specify capacity limits per event and update capacities dynamically.
- **Attendee Roster Management**: View complete attendee rosters and waitlist queues for any event, including student name, email, department, student ID, and registration timestamp.
- **Analytics Overview**: Admin dashboard showing total events, active RSVPs, waitlisted queue counts, and registered student metrics.

---

## 🛠️ Tech Stack

| Layer | Tool | Description |
|---|---|---|
| **Frontend** | React (Vite) + Tailwind CSS | Fast SPA with modern glassmorphism aesthetic & Lucide icons |
| **Backend** | Node.js + Express | RESTful API server with RBAC middleware & error handling |
| **Database** | MongoDB + Mongoose | Schema validation, text indexing, and compound unique constraints |
| **Real-Time** | Socket.io | WebSockets for broadcasting live attendee count changes |
| **Auth** | JWT + bcryptjs | Secure password hashing & role-based token authentication |
| **File Uploads** | Multer | Local image upload handling for event banners |
| **Testing** | Jest + Supertest + MongoMemoryServer | 19 automated integration & unit tests |

---

## 📁 Codebase Structure

```
d:\Campus Management demo\
├── server\
│   ├── src\
│   │   ├── config\         # Database connection configuration (Mongoose)
│   │   ├── controllers\    # Auth, Event, RSVP, and Admin controllers
│   │   ├── middleware\     # JWT Auth, Role RBAC, Multer Upload, Error Handler
│   │   ├── models\         # User, Event, and RSVP Mongoose models
│   │   ├── routes\         # Express router modules
│   │   ├── socket\         # Socket.io real-time broadcast handlers
│   │   ├── seed\           # Database seeder script
│   │   ├── app.js          # Express app definition (used for tests & server)
│   │   └── server.js       # HTTP server & Socket.io launcher
│   ├── tests\              # Automated Jest & Supertest test suites
│   ├── uploads\            # Local file upload directory
│   ├── .env.example        # Environment variables template
│   └── package.json
└── client\
    ├── src\
    │   ├── components\     # EventCard, Navbar, Pagination, FilterBar, Modals, Toast
    │   ├── context\        # AuthContext, SocketContext
    │   ├── pages\          # EventListings, MyEventsDashboard, AdminDashboard, Login, Register
    │   ├── services\       # Axios API client wrapper
    │   ├── App.jsx         # Root app router & state management
    │   └── index.css       # Tailwind CSS & glassmorphism design system
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Quick Setup & Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) OR MongoDB Atlas URI. *(Note: Automated tests run standalone using `mongodb-memory-server` without requiring local MongoDB daemon!)*

---

### Step 1: Backend Setup (`server`)

1. Open terminal and navigate to `server`:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment configuration `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/campus_event_manager
   JWT_SECRET=campus_event_manager_secret_key_2026
   CLIENT_URL=http://localhost:5173
   ```

4. **Seed Database** with initial campus events and demo user accounts:
   ```bash
   npm run seed
   ```

   **Default Accounts Created by Seeder:**
   - **Admin Account**: Email: `admin@campus.edu` | Password: `admin123`
   - **Student Account 1**: Email: `student1@campus.edu` | Password: `student123`
   - **Student Account 2**: Email: `student2@campus.edu` | Password: `student123`

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

---

### Step 2: Frontend Setup (`client`)

1. Open a new terminal tab and navigate to `client`:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The client web application will run on `http://localhost:5173`.*

---

## 🧪 Running Automated Tests

The repository includes 19 comprehensive unit and integration tests written with **Jest**, **Supertest**, and **MongoMemoryServer** (in-memory MongoDB database).

To run the automated test suite:
```bash
cd server
npm test
```

### Verified Test Scope:
- ✅ **Auth Flow Tests**: User registration, login token generation, password hashing, and profile retrieval.
- ✅ **Role-Based Access Control (RBAC) Tests**: Verify students receive `403 Forbidden` on admin endpoints, and admins have full write access.
- ✅ **Event CRUD Tests**: Create, read, update capacity, and delete events.
- ✅ **Pagination & Filtering Edge Cases**: Edge case testing for empty pages, out-of-range page numbers, negative bounds, category filters, and search queries.
- ✅ **RSVP & Waitlist Promotion Logic**: Prevention of duplicate RSVPs (`400 Bad Request`), automatic waitlisting when capacity is reached, and automatic promotion of the next waitlisted student when a spot opens up.

---

## 📄 License
This project is open-source and free to use for campus event management demonstrations.
