# Employee Task Management System

A full-stack task management system with role-based dashboards (Admin / Employee), employee management, task CRUD with file attachments, in-app notifications, and Excel/CSV reporting.

**Stack:** React + Redux Toolkit (frontend) · Node.js + Express (backend) · MySQL + Sequelize (database)

See [`docs/architecture.md`](docs/architecture.md) for architecture and flow diagrams.

---

## 1. Prerequisites

- Node.js 18+ and npm
- MySQL 8+ (or a compatible MySQL-as-a-service instance)

## 2. Project Structure

```
task-management-system/
├── backend/            # Express API
│   ├── config/         # DB connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # auth, upload, error handling
│   ├── models/         # Sequelize models
│   ├── routes/         # Express routers
│   ├── utils/          # validators, JWT, email, notifications
│   ├── __tests__/      # Jest unit tests
│   └── server.js
├── frontend/            # React + Redux Toolkit app (Vite)
│   └── src/
│       ├── app/         # Redux store
│       ├── api/         # Axios client
│       ├── features/    # auth, dashboard, employees, tasks, notifications, reports
│       ├── components/  # Layout, NotificationBell
│       └── routes/      # ProtectedRoute
├── database/
│   └── schema.sql       # MySQL schema + seed admin user
└── docs/
    └── architecture.md  # Mermaid diagrams
```

## 3. Database Setup

1. Start MySQL and create the schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   This creates the `task_management_db` database, all tables, indexes, and a seed **Admin** account:
   - Email: `admin@taskmanager.com`
   - Password: `Admin@123`

   You can also skip the seed user and register your own Admin via the app's registration screen.

## 4. Backend Setup

```bash
cd backend
cp .env.example .env
# edit .env: set DB_USER, DB_PASSWORD, JWT_SECRET, etc.
npm install
npm run dev        # starts on http://localhost:5000 with nodemon
```

The server auto-creates/syncs tables on boot (`sequelize.sync()`), so it will work even if you didn't run `schema.sql`; the SQL script is provided as the canonical, reviewable schema.

Run unit tests:
```bash
npm test
```

## 5. Frontend Setup

```bash
cd frontend
cp .env.example .env    # defaults to http://localhost:5000/api
npm install
npm run dev              # starts on http://localhost:5173
```

Open `http://localhost:5173`, register an account (or use the seeded Admin credentials above), and log in.

## 6. Environment Variables

**backend/.env**

| Variable | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | MySQL connection |
| `JWT_SECRET` | Secret used to sign JWTs — set a long random value |
| `JWT_EXPIRES_IN` / `JWT_REMEMBER_EXPIRES_IN` | Token lifetime, normal vs "Remember Me" |
| `MAX_FILE_SIZE_MB` | Upload size limit (default 5) |
| `EMAIL_ENABLED`, `SMTP_*` | Optional email notifications |
| `CLIENT_URL` | Frontend origin, used for CORS |

**frontend/.env**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

## 7. Features Implemented

- **Authentication:** Register (Full Name, Email, Password, Confirm Password, Role), login, JWT auth, Remember Me (30-day token vs 1-day), logout.
- **Validation:** unique email; password ≥ 8 chars with uppercase, lowercase, and a number (enforced both client- and server-side).
- **Dashboard:** Admin view (total employees, total/completed/pending tasks); Employee view (my/completed/pending/overdue tasks).
- **Employee Management (Admin only):** add, edit, delete, search, sort, paginate.
- **Task Management:** create/update/delete/view; Title, Description, Priority, Status, Start/Due Date, Assigned Employee; due date ≥ start date enforced; completed tasks are locked from editing; employees see only their own tasks.
- **Notifications:** in-app notifications on assignment, due-within-1-day (hourly cron job), and completion; optional email via Nodemailer.
- **File Upload:** PDF/JPG/PNG, max 5 MB, attached to tasks.
- **Reports:** Completed / Pending / Employee-wise, exportable to Excel (.xlsx) and CSV.
- **Bonus:** Remember Me, notifications, file upload, Excel/CSV export, Jest unit tests. Docker setup and email notifications are wired up in code (Nodemailer service) but Docker Compose files are not included — see note below if you'd like these added.

## 8. API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| POST | `/api/auth/logout` | Auth | Stateless logout |
| GET | `/api/auth/me` | Auth | Current user |
| GET | `/api/employees` | Admin | List (search/sort/paginate) |
| GET/POST/PUT/DELETE | `/api/employees/:id?` | Admin | Employee CRUD |
| GET | `/api/tasks` | Auth | List tasks (own tasks for Employees) |
| POST/PUT/DELETE | `/api/tasks/:id?` | Auth (create/delete: Admin) | Task CRUD, multipart for attachments |
| GET | `/api/dashboard` | Auth | Role-based stats |
| GET | `/api/notifications` | Auth | List notifications |
| PUT | `/api/notifications/:id/read` | Auth | Mark one read |
| PUT | `/api/notifications/read-all` | Auth | Mark all read |
| GET | `/api/reports?type=&format=` | Admin | Excel/CSV export |

## 9. Business Rules Enforced

- Due Date ≥ Start Date (frontend form validation + backend `express-validator` + DB `CHECK` constraint).
- Completed tasks cannot be edited (checked in `taskController.updateTask`).
- Employees see only their own tasks; Admins see all (enforced at the query layer, not just the UI).
- Employee email must be unique; user email must be unique.

## 10. Demo Video & Submission

Record a short walkthrough covering: registration/login, Admin dashboard, employee CRUD, task CRUD with file upload, notifications, and report export. Push this repo to GitHub, add the required collaborator, and submit per the assignment email's format.
