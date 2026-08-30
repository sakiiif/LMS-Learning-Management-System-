# LMS — Learning Management System

Full-stack LMS built with **Strapi v5 (TypeScript)** on the backend and **Next.js (App Router, TypeScript, Tailwind CSS)** on the frontend, with four custom roles (Admin, Content Manager, Instructor, Student) and backend-enforced permissions.

- **Live Frontend:** `https://learning-management-system-nine-omega.vercel.app`
- **Live Backend:** `https://lms-learning-management-system-production-6cff.up.railway.app`

---

## Running Locally

### Prerequisites

- Node.js `[version]`, npm/yarn
- PostgreSQL running locally (or a Railway/hosted Postgres instance)

### 1. Backend (Strapi)

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=lms
DATABASE_USERNAME=[your_db_user]
DATABASE_PASSWORD=[your_db_password]
JWT_SECRET=[generate_a_secret]
ADMIN_JWT_SECRET=[generate_a_secret]
API_TOKEN_SALT=[generate_a_secret]
APP_KEYS=[generate_4_comma_separated_keys]
TRANSFER_TOKEN_SALT=[generate_a_secret]
```

Then start it:

```bash
npm run develop
```

Strapi admin panel runs at `http://localhost:1337/admin`. On first run, create an Admin account through the admin panel — all other roles (Content Manager, Instructor, Student) are then created/assigned from there, since public registration only allows the Student role.

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/` with:

```
NEXT_PUBLIC_API_URL=http://localhost:1337
```

Then start it:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`.

### 3. Seed roles/permissions (first-time setup)

In the Strapi admin panel, under **Settings → Users & Permissions → Roles**, confirm the four roles (Admin, Content Manager, Instructor, Student) exist with the permission matrix configured, then create one test user per role (or promote self-registered Student accounts via the Admin panel).

---

## Features Completed

### ✅ Backend

- Nine content types with two-way relations (Courses, Lessons, Quizzes, Questions, Enrollments, Lesson Progress, Quiz Results, Blog Posts, Users)
- Four-role permission matrix enforced server-side via custom policies and controller overrides — not just hidden UI
- Student-only public registration; all other roles assigned by Admin post-signup
- Custom Admin Panel API (`/api/admin-panel`) — user management (create, list, update role, delete with self-delete protection) and platform stats
- Ownership policies so Instructors can only manage their own courses/lessons/quizzes, and only view progress for their own students
- Real server-side MCQ auto-grading — client-submitted scores are ignored, and `correctAnswer` is stripped from all student-facing responses
- httpOnly-cookie-compatible auth (JWT with refresh) deployed on Railway with PostgreSQL

### ✅ Frontend 
  ### Student flow
    - Sign up / log in / log out (httpOnly cookie sessions)
    - Browse Courses → Enroll
    - My Courses (enrolled courses only)
    - Course Detail — lesson list with live progress bar
    - Lesson viewer (text and video content) with Mark Complete
    - Progress percentage — accurate per student, per course, persists across refreshes
    - Quiz-taking flow for Students (MCQ submission + auto-graded result display)
  ### Instructor flow
    - Instructor dashboard (course/lesson/quiz management)
    - View list of own courses (course ownership scoped by backend policy)
    - Add / edit / delete lessons under own courses (text or video URL content)
    - Create MCQ quizzes on own courses (question + options + correct answer)
  ### Admin flow
    - Admin dashboard (user management, platform stats)
    - Change/promote a user's role (Student → Instructor/Content Manager/Admin, etc.)
    - Delete a user (with self-delete protection surfaced in UI)
    - Platform stats view — total users per role, total courses, total enrollments
  ### Content Manager flow
  
  ### Frontend — In progress
    - [ ] Content Manager dashboard (blog post draft/publish management)
    - [ ] Public blog pages
---

## Tech Stack

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS | Vercel |
| Backend / CMS | Strapi v5 (TypeScript) | Railway |
| Database | PostgreSQL | Railway |
