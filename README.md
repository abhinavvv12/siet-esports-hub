# SIET Esports Hub — Championship 2026

The complete full-stack management platform for the SIET Esports Club. Built to run real tournaments, manage registrations, verify payments, generate certificates, and publish content — all without touching source code.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v3 |
| State / Data | TanStack Query (React Query v5) |
| Forms | React Hook Form + Zod validation |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (HTTP-only cookies) + bcrypt |
| PDF | PDFKit |
| File Upload | Multer (local storage, swappable for S3) |
| Rate Limiting | express-rate-limit |
| Security | Helmet, CORS, input sanitization |

---

## Architecture

```
┌─────────────────────┐       ┌─────────────────────────┐
│   Public Website    │       │  Coordinator Dashboard  │
│   /                 │       │  /coordinator           │
│   /register         │       │  (Protected — JWT)      │
│   /certificates     │       └────────────┬────────────┘
│   /verify/:id       │                    │
└──────────┬──────────┘                    │
           │                               │
           └──────────────┬────────────────┘
                          ▼
                 Express REST API
                 /api/* endpoints
                          │
                     Prisma ORM
                          │
                    PostgreSQL
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

### 1. Clone & Install

```bash
git clone <repo>
cd siet-esports-hub
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` in the `server/` directory:

```bash
cd server
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/siet_esports"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
NODE_ENV="development"
PORT=4000
CLIENT_URL="http://localhost:5173"
```

### 3. Database Setup

```bash
cd server

# Create database (if not exists)
createdb siet_esports

# Run migrations
npx prisma migrate dev --name init

# Seed with initial data
npx ts-node prisma/seed.ts
```

### 4. Run Development Servers

```bash
# From project root — runs both client and server
npm run dev

# Or individually:
cd server && npm run dev   # http://localhost:4000
cd client && npm run dev   # http://localhost:5173
```

---

## Development Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@siet-esports.in | Admin@SIET2026 |
| Coordinator | coordinator@siet-esports.in | Coord@SIET2026 |

> **Never use these in production.** Create new accounts immediately after deployment.

---

## Project Structure

```
siet-esports-hub/
├── client/                   # React frontend
│   └── src/
│       ├── components/
│       │   ├── coordinator/  # Dashboard layout, ProtectedRoute
│       │   ├── layout/       # Navbar, Footer, PublicLayout
│       │   ├── sections/     # Homepage sections
│       │   └── ui/           # Shared UI (Badge, Modal, etc.)
│       ├── hooks/
│       │   └── useAuth.tsx   # Auth context
│       ├── lib/
│       │   └── api.ts        # Axios instance
│       ├── pages/
│       │   ├── auth/         # CoordinatorLogin
│       │   ├── coordinator/  # All dashboard pages
│       │   └── public/       # Homepage, Register, Certificates
│       └── types/            # TypeScript interfaces
│
└── server/                   # Express backend
    ├── prisma/
    │   ├── schema.prisma     # Database schema
    │   └── seed.ts           # Seed data
    └── src/
        ├── controllers/      # Business logic
        ├── lib/              # Prisma client
        ├── middleware/       # Auth, Audit
        ├── routes/           # API routes
        ├── types/            # TypeScript types
        └── utils/            # Helpers
```

---

## API Reference

### Public Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /api/tournaments/public | List open tournaments |
| GET | /api/content | Homepage CMS content |
| GET | /api/faculty | Faculty coordinators |
| GET | /api/students | Student coordinators |
| GET | /api/rules | Tournament rules |
| GET | /api/gallery | Gallery images |
| GET | /api/winners | Hall of Fame |
| GET | /api/announcements | Active announcements |
| POST | /api/registrations | Submit team registration |
| GET | /api/registrations/:id | View registration by ID |
| GET | /api/registrations/code/:code | View by registration code |
| POST | /api/certificates/verify-mobile | Verify by mobile number |
| GET | /api/certificates/verify/:certId | Verify certificate ID |
| GET | /api/certificates/download/:certId | Download PDF certificate |

### Protected (Coordinator / Admin)

| Method | Path | Description |
|---|---|---|
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |
| GET | /api/admin/dashboard | Dashboard stats |
| GET | /api/admin/registrations | List registrations (paginated, filterable) |
| GET | /api/admin/registrations/:id | Registration detail |
| PATCH | /api/admin/registrations/:id/approve | Approve team |
| PATCH | /api/admin/registrations/:id/reject | Reject with reason |
| PATCH | /api/admin/payments/:id/verify | Verify cash payment |
| POST | /api/admin/certificates/generate | Generate certificates |
| GET | /api/admin/export | Export CSV |
| PATCH | /api/admin/content | Update homepage CMS |
| POST | /api/admin/gallery | Upload image |
| POST | /api/admin/announcements | Create announcement |
| GET | /api/admin/audit-logs | View audit trail |

---

## Complete User Workflows

### 1. Team Registration Flow

1. Student opens `/register`
2. Selects tournament (BGMI or Free Fire MAX)
3. Enters team name + 4 players' details
4. Submits → status: **PENDING_APPROVAL**
5. Gets registration code to track status
6. Team visits coordinator for cash payment

### 2. Coordinator Approval Flow

1. Login to `/coordinator/dashboard`
2. See pending registrations in dashboard
3. Open `/coordinator/registrations` → filter by "Pending"
4. Open registration → review all 4 players
5. Click **Verify Payment** (after collecting cash)
6. Click **Approve** → status: **APPROVED**
7. Click **Generate Certificates** → 4 PDFs created

### 3. Certificate Download Flow

1. Student opens `/certificates`
2. Enters team leader's mobile number
3. System looks up approved registration
4. Shows all 4 players with Download buttons
5. Each certificate PDF is downloaded individually

### 4. Certificate Verification

1. Share `siet-esports.in/verify/SIET-ESPORTS-2026-000001`
2. Public page shows validity, name, team, game

---

## Database Schema (Key Models)

```
User → role: ADMIN | COORDINATOR | PARTICIPANT
Tournament → registrationOpen controls public access
Registration → status: PENDING_APPROVAL | APPROVED | REJECTED | CANCELLED
  └── Player (×4)
  └── Payment → status: PENDING | VERIFIED | REJECTED
  └── Certificate (one per player)
FacultyCoordinator
StudentCoordinator
TournamentRule
GalleryImage
Winner
Announcement
WebsiteContent (CMS key-value store)
AuditLog (all coordinator actions tracked)
```

---

## Production Deployment

### Build

```bash
cd client && npm run build    # outputs to client/dist/
cd server && npm run build    # outputs to server/dist/
```

### Environment

Set these additional production vars:

```env
NODE_ENV=production
JWT_SECRET=<random-256-bit-hex>
CLIENT_URL=https://your-domain.com
DATABASE_URL=postgresql://...@production-host/siet_esports
```

### Serve Static Files

In production, configure Express to serve `client/dist/`:

```typescript
app.use(express.static(path.join(__dirname, '../../client/dist')));
app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../../client/dist/index.html')));
```

### Run with PM2

```bash
npm install -g pm2
cd server && pm2 start dist/index.js --name siet-esports
```

---

## Email Configuration

When EMAIL credentials are available:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=esports@siddhartha.co.in
EMAIL_PASSWORD=your-app-password
```

The email service is structured in the backend — add nodemailer calls in `registration.controller.ts` on approve/reject events.

---

## File Storage

Default: local `server/uploads/` directory.

To migrate to S3:
1. Set `STORAGE_PROVIDER=s3` in `.env`
2. Add `AWS_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`
3. Replace the multer `storage` config in `routes/index.ts` with `multer-s3`

---

## Security Notes

- Passwords hashed with bcrypt (10 rounds)
- JWT stored in HTTP-only cookies
- Rate limiting on auth endpoints (20 req/15min)
- General API rate limit (200 req/15min)
- Helmet security headers
- CORS restricted to CLIENT_URL
- Server-side validation on all inputs
- SQL injection prevented by Prisma ORM
- File upload: type + size restricted (images only, 5MB max)
- All coordinator actions logged to AuditLog

---

## Troubleshooting

**"Cannot connect to database"**
→ Check `DATABASE_URL` in `.env`. Ensure PostgreSQL is running.

**"Prisma client not generated"**
→ Run `cd server && npx prisma generate`

**"Registrations not showing"**
→ Make sure tournament has `registrationOpen: true` and `status: REGISTRATION_OPEN`

**"Certificate download fails"**
→ Check that PDFKit is installed: `cd server && npm install pdfkit`

**"Image upload fails"**
→ Ensure `server/uploads/` directory exists and is writable
