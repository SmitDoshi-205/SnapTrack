# SnapTrack

A full-stack team project management platform built with React, Node.js, Express, PostgreSQL, and Socket.IO. Create boards, invite teammates via a shareable code, assign tasks, track progress, and receive automated email reminders — all in real time.

---

## What it does

SnapTrack lets teams manage work on a Kanban board. You create a project board, generate an invite code, share it with your team, and everyone can create and manage tasks together.

**Core features:**
- Kanban board with drag-and-drop between columns (To Do → In Progress → Done)
- Real-time collaboration — changes sync across all connected users via WebSockets
- JWT authentication with silent token refresh
- Invite teammates via a shareable link or 6-character code
- Assign tasks to one or more board members
- Priority-based auto-sorting (High → Medium → Low)
- Due date tracking with overdue indicators
- Automated email reminders for tasks due tomorrow
- File attachments on tasks via Cloudinary
- Comments on tasks
- Analytics dashboard — per-board and global views
- Dark / light mode with OS preference detection

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| State | Zustand, React Query |
| Drag & drop | @dnd-kit/core |
| Backend | Node.js, Express |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Real-time | Socket.IO |
| Auth | JWT (access + refresh tokens), bcryptjs |
| File uploads | Cloudinary via multer-storage-cloudinary |
| Email | Nodemailer (Gmail)|
| Background jobs | node-cron |
| Charts | Recharts |

---

## Project structure

```
SnapTrack/
├── client/                   React frontend
│   ├── src/
│   │   ├── api/              Axios instance + API call functions
│   │   ├── assets/           Logo and static files
│   │   ├── components/       Reusable UI components
│   │   │   ├── Boards/       BoardCard, BoardModal, InviteCodeDisplay
│   │   │   ├── Kanban/       Column, TaskCard, TaskModal, AttachmentSection
│   │   │   └── UI/           Badge, Button, Input, MemberAvatar, SkeletonCard, ThemeToggle
│   │   ├── Pages/            Full page components
│   │   └── Store/            Zustand stores (auth, theme)
│   ├── .env
│   └── package.json
│
└── server/                   Express backend
    ├── prisma/
    │   └── schema.prisma     Database schema
    ├── src/
    │   ├── config/           Database, Cloudinary, env validation
    │   ├── controllers/      Business logic for each resource
    │   ├── jobs/             Cron job for due date reminders
    │   ├── middleware/       Auth, error handling, validation
    │   ├── realtime/         Socket.IO setup
    │   ├── routes/           Express route definitions
    │   ├── services/         Email and file upload services
    │   ├── app.js            Express app setup
    │   └── server.js         HTTP server entry point
    ├── .env
    └── package.json
```

---

## Getting started

### Prerequisites

- Node.js v18 or higher
- A [Supabase](https://supabase.com) account (free) for PostgreSQL
- A [Cloudinary](https://cloudinary.com) account (free) for file uploads
- Either a Gmail account with App Password enabled, or a [Resend](https://resend.com) account for emails

### 1. Clone the repository

```bash
git clone https://github.com/SmitDoshi-205/SnapTrack.git
cd SnapTrack
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:

```env
PORT=5000
NODE_ENV=development

# Get these from your Supabase project → Settings → Database
DATABASE_URL="postgresql://postgres.xxx:password@pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@pooler.supabase.com:5432/postgres"

# Generate two long random strings — keep these secret
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_secret_here
REFRESH_TOKEN_EXPIRES_IN=7d

# Email — use gmail or resend
EMAIL_PROVIDER=gmail
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Cloudinary — get from cloudinary.com → Dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

Run the database migration:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Start the server:

```bash
npm run dev
```

The server runs at `http://localhost:5000`. Visit `/api/health` to confirm it is running.

### 3. Set up the frontend

```bash
cd ../client
npm install
```

Create a `.env` file in the `client/` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## How to use

### Creating a board

1. Register an account or log in
2. Click **+ New board** on the dashboard
3. Give the board a name and optional description
4. Three default columns are created automatically: To Do, In Progress, Done

### Inviting teammates

1. Open a board
2. Copy the invite code shown in the subbar (e.g. `SNAP-X7K2`) or click **Copy link**
3. Share the code or link with your teammate
4. They paste it into **Join with code** on their dashboard, or open the link directly
5. They are added to the board immediately and you receive an email notification

### Managing tasks

- Click **+ Add** on any column to create a task
- Fill in the title, priority, due date, tags, and assign to one or more members
- Click any task card to edit it, add comments, or attach files
- Drag cards between columns to update their status
- Tasks auto-sort by priority within each column (High first)

### Email reminders

The server runs a cron job every day at 9am. It finds all tasks due tomorrow and:
- Sends a personal reminder to each assigned member
- Sends a summary of all due tasks to the board owner

---

## Environment variables reference

### Server

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default 5000) |
| `DATABASE_URL` | Supabase connection pooling URL |
| `DIRECT_URL` | Supabase direct URL (used for migrations only) |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_EXPIRES_IN` | Access token lifetime (default 15m) |
| `REFRESH_TOKEN_SECRET` | Secret for signing refresh tokens |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifetime (default 7d) |
| `EMAIL_PROVIDER` | `gmail` or `resend` |
| `GMAIL_USER` | Gmail address (if using Gmail) |
| `GMAIL_APP_PASSWORD` | Gmail App Password (not your regular password) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend URL for CORS (default http://localhost:5173) |

### Client

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

---

## Scripts

### Server

| Command | Description |
|---|---|
| `npm run dev` | Start server with nodemon (auto-restart on changes) |
| `npm start` | Start server without nodemon |
| `npx prisma studio` | Open Prisma Studio to browse the database |
| `npx prisma migrate dev` | Run pending migrations in development |

### Client

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |

---

## Database schema

The database has 9 tables:

- **User** — registered accounts
- **RefreshToken** — active refresh tokens per user (enables multi-device logout)
- **Board** — project workspaces with a unique invite code
- **BoardMember** — join table linking users to boards with roles (owner/editor/viewer)
- **Column** — ordered stages within a board
- **Task** — work items within a column with priority, due date, and assignees
- **TaskTag** — many-to-many between tasks and tags
- **Comment** — comments on tasks
- **Attachment** — file metadata for task attachments (actual files live on Cloudinary)

---

## API endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in, returns JWT |
| POST | `/api/auth/logout` | Clear refresh token |
| POST | `/api/auth/refresh` | Issue new access token |
| GET  | `/api/auth/me` | Get current user |

### Boards
| Method | Path | Description |
|---|---|---|
| GET    | `/api/boards` | Get all boards for current user |
| POST   | `/api/boards` | Create a board |
| GET    | `/api/boards/:id` | Get single board with columns and tasks |
| PATCH  | `/api/boards/:id` | Update board name/description |
| DELETE | `/api/boards/:id` | Delete board (owner only) |
| POST   | `/api/boards/join/:code` | Join a board via invite code |
| DELETE | `/api/boards/:id/leave` | Leave a board (members only) |
| DELETE | `/api/boards/:id/members/:userId` | Remove a member (owner only) |

### Columns
| Method | Path | Description |
|---|---|---|
| POST   | `/api/boards/:boardId/columns` | Add a column |
| PATCH  | `/api/columns/:id` | Rename a column |
| DELETE | `/api/columns/:id` | Delete a column |
| PATCH  | `/api/boards/:boardId/columns/reorder` | Reorder columns |

### Tasks
| Method | Path | Description |
|---|---|---|
| POST   | `/api/columns/:columnId/tasks` | Create a task |
| GET    | `/api/tasks/:id` | Get task with comments and attachments |
| PATCH  | `/api/tasks/:id` | Update task details |
| DELETE | `/api/tasks/:id` | Delete a task |
| PATCH  | `/api/tasks/:id/move` | Move task to different column |

### Comments
| Method | Path | Description |
|---|---|---|
| GET    | `/api/tasks/:taskId/comments` | Get comments for a task |
| POST   | `/api/tasks/:taskId/comments` | Add a comment |
| DELETE | `/api/comments/:id` | Delete a comment |

### Attachments
| Method | Path | Description |
|---|---|---|
| POST   | `/api/tasks/:taskId/attachments` | Upload a file |
| GET    | `/api/tasks/:taskId/attachments` | Get attachments for a task |
| DELETE | `/api/attachments/:id` | Delete an attachment |

### Analytics
| Method | Path | Description |
|---|---|---|
| GET | `/api/analytics` | Global analytics across all boards |
| GET | `/api/boards/:boardId/analytics` | Per-board analytics |

