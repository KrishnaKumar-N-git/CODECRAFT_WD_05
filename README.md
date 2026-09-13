# CODECRAFT_WD_05

# CampusConnect — Student Social & Collaboration Platform

> **A Production-Ready Full-Stack MERN Academic Project for College & University Campuses**

[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_+_Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Security-JWT_+_Bcrypt-000000?logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary_CDN-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)

---

## 1. Project Abstract
**CampusConnect** is a specialized social networking and collaborative workspace engineered specifically for university ecosystems. Unlike generic commercial social networks, CampusConnect addresses the fragmented communication gap between students across academic departments (CSE, ECE, Mechanical, AI&DS). It unifies real-time campus social feeds, domain-centric student clubs/communities, verified peer project showcase galleries with GitHub repositories and live deployments, university workshops and hackathon RSVP tracking, fine-grained role-based moderation for university staff, and contextual notifications into a single secure platform.

---

## 2. Problem Statement
In contemporary universities:
1. **Siloed Academic Communication**: Students in different departments lack awareness of peer technical endeavors, leading to redundant project implementations and missed interdisciplinary collaboration.
2. **Scattered Information Channels**: College notices, club workshops, and hackathon schedules are dispersed across WhatsApp groups, Telegram channels, bulletin boards, and static institutional portals.
3. **Absence of a Verified Student Portfolio**: Students lack a central academic network to showcase working projects, GitHub repositories, and verifiable accomplishments directly to college recruiters and alumni mentors.
4. **Lack of Constructive Moderation**: Generic social media platforms are susceptible to spam, harassment, and distractions without academic accountability.

---

## 3. Project Objectives
- Build a secure, authenticated platform utilizing **JSON Web Tokens (JWT)** and **Bcrypt** password hashing.
- Develop dynamic campus social feeds supporting rich text, images, videos, and student tagging.
- Provide domain-specific **Student Communities** (e.g., Coding Club, AI Labs, Placement Prep, Robotics Guild).
- Implement a dedicated **Project Showcase** enabling students to present capstone and hackathon projects with live preview and source code links.
- Create an interactive **Campus Events & Hackathon RSVP** calendar with real-time attendee tracking.
- Deliver a role-based **Admin Governance Dashboard** providing platform analytics and content moderation.

---

## 4. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Vercel)                          │
│     React 19 + Vite 8 + Tailwind CSS v4 + React Router v7 + Axios     │
│         AuthContext | Responsive Grid Layout | Lucide Icons           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST (JSON)
┌───────────────────────────────────▼────────────────────────────────────┐
│                        API SERVER (Render)                            │
│                  Node.js + Express.js REST Engine                      │
│  ┌───────────────┬─────────────────┬────────────────┬──────────────┐  │
│  │ JWT & Auth    │ Rate Limiting   │ Multer Upload  │ Express Val. │  │
│  │ Middleware    │ & Helmet Shield │ & CDN Engine   │ Sanitization │  │
│  └───────────────┴─────────────────┴────────────────┴──────────────┘  │
│                               Controllers                              │
│   Auth │ Users │ Posts │ Comments │ Communities │ Projects │ Events   │
└───────────────────────┬───────────────────────────┬────────────────────┘
                        │ Mongoose ODM              │ Cloudinary SDK
┌───────────────────────▼───────┐           ┌───────▼────────────────────┐
│      DATABASE (MongoDB Atlas) │           │    MEDIA CDN (Cloudinary)  │
│   11 Collections with Indices │           │   Avatars, Posters, Videos │
│    Users, Posts, Projects...  │           │   Automated Compression    │
└───────────────────────────────┘           └────────────────────────────┘
```

---

## 5. Technology Stack

### Frontend
- **Framework**: React 19 (Hooks, Context API, Lazy loading)
- **Tooling & Bundler**: Vite 8 (Hot Module Replacement, optimized ES builds)
- **Styling**: Tailwind CSS v4 (Glassmorphism, custom CSS variables, responsive design)
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios with request/response interceptors
- **Icons**: Lucide React + custom Brand SVGs
- **Toasts**: React Hot Toast

### Backend
- **Runtime**: Node.js v20+ / v26
- **Web Framework**: Express.js
- **Database & ODM**: MongoDB with Mongoose 9
- **Authentication**: JWT (JSON Web Tokens) with HttpOnly cookies & Bearer headers
- **Password Security**: Bcrypt.js (12 salt rounds)
- **Media Uploads**: Multer with Cloudinary CDN storage and local disk fallback
- **Security Middleware**: Helmet, CORS, Express-Rate-Limit, Express-Validator

---

## 6. Database Models & Schema Design

| Model | Key Fields | Relationships & Indexes |
|---|---|---|
| **User** | `username`, `email`, `password`, `fullName`, `avatar`, `bio`, `department`, `college`, `year`, `skills`, `role`, `isActive` | Compound text index on `username`, `fullName`, `department` |
| **Post** | `author`, `content`, `media[]{url,type}`, `community`, `tags[]`, `likesCount`, `commentsCount`, `isDeleted` | Ref to `User`, `Community`. Index on `createdAt: -1` |
| **Comment** | `post`, `author`, `content`, `parent`, `likesCount`, `isDeleted` | Ref to `Post`, `User`. Self-ref `parent` for threaded replies |
| **Like** | `user`, `targetType ('Post'\|'Comment'\|'Project')`, `targetId` | Unique compound index on `{user, targetType, targetId}` |
| **Follow** | `follower`, `following` | Unique compound index on `{follower, following}` |
| **Notification** | `recipient`, `sender`, `type`, `referenceModel`, `referenceId`, `message`, `isRead` | Indexed on `{recipient, isRead, createdAt: -1}` |
| **Community** | `name`, `slug`, `description`, `category`, `avatar`, `creator`, `membersCount`, `postsCount` | Unique slug index, text index on `name` & `description` |
| **CommunityMember** | `community`, `user`, `role ('member'\|'moderator'\|'admin')` | Unique index on `{community, user}` |
| **Project** | `author`, `title`, `description`, `technologies[]`, `category`, `githubUrl`, `demoUrl`, `image`, `likesCount` | Ref to `User`. Text index on `title` & `description` |
| **Event** | `organizer`, `title`, `description`, `date`, `time`, `location`, `image`, `attendees[]`, `attendeesCount`, `status` | Indexed on `date: 1`, `status: 1` |
| **Report** | `reporter`, `targetType`, `targetId`, `reason`, `description`, `status ('pending'\|'reviewed'\|'resolved'\|'dismissed')` | Unique index on `{reporter, targetId, targetType}` |

---

## 7. REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new student profile
- `POST /api/auth/login` — Authenticate and receive JWT token
- `POST /api/auth/logout` — Invalidate session
- `GET  /api/auth/me` — Retrieve current authenticated user profile

### Students & Profiles (`/api/users`)
- `GET  /api/users` — Directory of students (filter by skill or department)
- `GET  /api/users/:username` — Public profile with follower counts
- `PUT  /api/users/profile` — Update bio, department, skills, and avatar
- `POST /api/users/:id/follow` — Follow a student
- `DELETE /api/users/:id/follow` — Unfollow a student
- `GET  /api/users/:id/posts` — Get all posts authored by student
- `GET  /api/users/:id/projects` — Get all showcase projects by student

### Social Feed & Posts (`/api/posts`)
- `GET  /api/posts/feed` — Paginated campus feed with like status
- `GET  /api/posts/trending` — Top posts in the last 24 hours
- `POST /api/posts` — Publish new post with up to 4 image/video attachments
- `DELETE /api/posts/:id` — Delete own post (or admin delete)
- `POST /api/posts/:id/like` — Like a post
- `DELETE /api/posts/:id/like` — Unlike a post

### Discussion Comments (`/api/comments`)
- `GET  /api/comments?post=:id` — Get threaded comments for a post
- `POST /api/comments` — Post a new comment
- `DELETE /api/comments/:id` — Remove own comment

### Student Communities (`/api/communities`)
- `GET  /api/communities` — List all campus clubs (filter by category)
- `GET  /api/communities/:slug` — Community overview and membership status
- `POST /api/communities` — Create a new student club
- `POST /api/communities/:id/join` — Join a club
- `DELETE /api/communities/:id/leave` — Leave a club
- `GET  /api/communities/:id/posts` — Posts published within this club

### Project Showcase (`/api/projects`)
- `GET  /api/projects` — Filterable repository of student projects
- `POST /api/projects` — Publish project showcase with demo and repo URLs
- `POST /api/projects/:id/like` — Star/like a project
- `DELETE /api/projects/:id` — Delete project

### Campus Events (`/api/events`)
- `GET  /api/events` — Upcoming hackathons, bootcamps, and workshops
- `POST /api/events` — Announce a new campus event
- `POST /api/events/:id/rsvp` — RSVP / cancel attendance toggle
- `DELETE /api/events/:id` — Delete event

### Notifications & Search (`/api/notifications`, `/api/search`)
- `GET  /api/notifications` — Notification inbox with unread counts
- `PUT  /api/notifications/read-all` — Mark all as read
- `GET  /api/search?q=...` — Global multi-category search across students, posts, projects, clubs, and events
- `GET  /api/search/trending` — Aggregated top content dashboard

### Administration (`/api/admin`)
- `GET  /api/admin/stats` — Platform KPIs (total users, posts, projects, reports)
- `GET  /api/admin/reports` — Moderation inbox of flagged content
- `PUT  /api/admin/reports/:id` — Resolve or dismiss reports
- `GET  /api/admin/users` — Administrative user moderation directory
- `PUT  /api/admin/users/:id/status` — Suspend or re-activate user account

---

## 8. Installation & Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas connection string)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/campusconnect.git
cd campusconnect
```

### 2. Configure Backend Environment
Navigate to `server/` and create `.env`:
```bash
cd server
npm install
```
Edit `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/campusconnect
JWT_SECRET=campusconnect_super_secret_jwt_key_2026_final_year
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary credentials (fallback saves to local /uploads if left as placeholder)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Seed Realistic University Data
Populate the database with 12 students, 6 communities, 10 projects, 6 events, and 21 posts:
```bash
node seed/seed.js
```

### 4. Start the Backend API
```bash
node index.js
```
*Backend runs on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)*

### 5. Start the React Frontend
In a separate terminal:
```bash
cd ../client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 9. Demo Credentials

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin Officer** | `admin@campusconnect.edu` | `Admin@123` | Full access to Admin Command Center |
| **Student** | `aarav.sharma@nit.edu` | `Password@123` | 4th Year CSE, SynchroCode Author |
| **Student** | `diya.patel@nit.edu` | `Password@123` | 3rd Year AI&DS, MedVision Author |
| **Student** | `priya.nair@nit.edu` | `Password@123` | 4th Year CSE, Placement Cell Mentor |
| **Student** | `rohan.verma@nit.edu` | `Password@123` | 4th Year IT, HackCampus Lead |

*(Tip: On the Login screen, click any **One-Click Quick Login** button to sign in immediately without typing).*

---

## 10. Deployment Guide

### A. Database (MongoDB Atlas)
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a free M0 cluster.
3. In **Network Access**, add `0.0.0.0/0` (Allow access from anywhere).
4. In **Database Access**, create a user and copy the connection URI:
   `mongodb+srv://<user>:<password>@cluster0.mongodb.net/campusconnect?retryWrites=true&w=majority`

### B. Backend (Render)
1. Connect your GitHub repository to [Render.com](https://render.com/).
2. Create a new **Web Service**.
3. Set **Root Directory**: `server`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node index.js`
6. Add Environment Variables:
   - `MONGODB_URI` = your Atlas connection string
   - `JWT_SECRET` = your 64-char secret
   - `CLIENT_URL` = your Vercel frontend URL
   - `NODE_ENV` = `production`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### C. Frontend (Vercel)
1. Import repository on [Vercel](https://vercel.com/).
2. Set **Root Directory**: `client`
3. Framework Preset: **Vite**
4. Set Environment Variable:
   - `VITE_API_URL` = `https://your-render-backend.onrender.com/api`
5. Deploy! The included `client/vercel.json` ensures full client-side routing on hard refreshes.

---

## 11. Final-Year Viva & Oral Defense FAQ

**Q1: Why choose MongoDB over a traditional relational database (MySQL/PostgreSQL)?**
*Answer*: Social applications feature unstructured, highly dynamic data (posts with mixed media arrays, varying tech stack tags, nested comment threads, and evolving user skills). MongoDB's BSON document model allows flexible embedded sub-documents without extensive join operations. Compound indexes ensure sub-5ms query performance.

**Q2: How is security handled during authentication?**
*Answer*: Passwords are never stored in plaintext; they are hashed using **Bcrypt with 12 salt rounds**. Authentication utilizes standard **JSON Web Tokens (JWT)** signed with an HMAC SHA-256 secret. Protected endpoints utilize Express middleware to verify token signatures, extract user IDs, and block unauthorized access.

**Q3: How are uploads handled if third-party credentials are not configured?**
*Answer*: The platform includes dual-mode storage logic in `server/middleware/upload.js`. If Cloudinary credentials are provided, it pipes files directly to the global CDN. If credentials are unset (e.g. during local testing), it seamlessly falls back to Multer disk storage and static Express file serving.

**Q4: How does the platform scale for hundreds of students?**
*Answer*: By implementing API-level pagination (`page` and `limit` with skip queries), compound index coverage on social graph lookups, text indexing for full-text search, and lazy asset loading on the React frontend.

---

## 12. Future Enhancements
- **WebRTC Peer Mentorship**: Integrated 1-on-1 audio/video peer mock interview rooms.
- **AI Resume Matcher**: Automated resume review recommending relevant student projects and clubs based on job descriptions.
- **Smart Campus Push Notifications**: ServiceWorker-based Web Push for real-time exam alerts and emergency notices.

---

## 13. License & Authors
Developed by Final Year Computer Science & Engineering Students as a Capstone Academic Project.
Licensed under the [MIT License](LICENSE).

