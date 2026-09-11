# CampusSettle — Database Connection & Backend Integration Guide

This guide details how to configure, connect, test, and integrate any database (PostgreSQL, Supabase, Neon, MongoDB, or MySQL) with the **CampusSettle** project and its frontend service layer.

---

## 1. Environment Variables Configuration (`.env`)

Create a `.env` file in the root of your backend project (or project root):

```bash
# Server Port
PORT=5000
NODE_ENV=development

# ============================================================
# OPTION A: PostgreSQL / Neon / Supabase (Recommended)
# ============================================================
DATABASE_URL="postgresql://postgres:your_secure_password@localhost:5432/campussettle_db?schema=public"

# If using Supabase directly:
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# ============================================================
# OPTION B: MongoDB (Alternative NoSQL)
# ============================================================
MONGODB_URI="mongodb://localhost:27017/campussettle_db"
# or MongoDB Atlas:
# MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/campussettle?retryWrites=true&w=majority"

# ============================================================
# Authentication / JWT
# ============================================================
JWT_SECRET="campussettle_super_secret_jwt_key_2026"
JWT_EXPIRES_IN="7d"

# Frontend Origin for CORS
CLIENT_URL="http://localhost:5174"
```

---

## 2. Option A: PostgreSQL Connection Setup (Native `pg` Pool)

### Step 1: Install Dependencies
```bash
npm install pg dotenv cors express
```

### Step 2: Connection Pool (`src/config/db.js`)
```javascript
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Max concurrent connection clients
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test and log connection on startup
export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Database connected successfully to:', client.database);
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    process.exit(1);
  }
};
```

---

## 3. Option B: Prisma ORM Connection Setup (Recommended)

### Step 1: Initialize Prisma
```bash
npm install @prisma/client
npm install prisma --save-dev
npx prisma init
```

### Step 2: Singleton Prisma Client (`src/config/prisma.js`)
```javascript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const testPrismaConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected to database successfully.');
  } catch (error) {
    console.error('❌ Prisma database connection error:', error.message);
    process.exit(1);
  }
};
```

### Step 3: Run Migrations & Generate Client
```bash
# Push schema to database
npx prisma db push

# Generate client
npx prisma generate
```

---

## 4. Option C: Supabase Client Integration

If using Supabase as Backend-as-a-Service:

```bash
npm install @supabase/supabase-js
```

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

---

## 5. Option D: MongoDB Mongoose Connection

If using MongoDB NoSQL:

```bash
npm install mongoose
```

```javascript
import mongoose from 'mongoose';

export const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
```

---

## 6. Complete REST API Route Mapping

To seamlessly connect the frontend React application (`myapp/src/services/*`), the backend API must implement these REST endpoints:

### Auth & Users (`/api/users` & `/api/auth`)
- `POST /api/auth/login` → `userService.login(email, password)`
  - **Body**: `{ email, password }`
  - **Returns**: `{ success: true, token, user }`
- `POST /api/auth/signup` → `userService.signup(data)`
  - **Body**: `{ name, email, password, college }`
  - **Returns**: `{ success: true, token, user }`
- `GET /api/users` → `userService.getAll()`
- `GET /api/users/:id` → `userService.getById(id)`
- `PUT /api/users/:id` → `userService.update(id, updates)`

### Groups (`/api/groups`)
- `GET /api/groups` → `groupService.getAll()`
  - **Returns**: Array of groups with members count and totals
- `GET /api/groups/:id` → `groupService.getById(id)`
  - **Returns**: Full group details with populated members and expenses
- `POST /api/groups` → `groupService.create(data)`
  - **Body**: `{ name, category, description, members }`
- `PUT /api/groups/:id` → `groupService.update(id, updates)`
- `DELETE /api/groups/:id` → `groupService.delete(id)` (Cascades expenses & settlements)

### Group Members (`/api/groups/:groupId/members`)
- `GET /api/groups/:groupId/members` → `memberService.getByGroupId(groupId)`
- `POST /api/groups/:groupId/members` → `memberService.create(groupId, memberData)`
  - **Body**: `{ name, email, role }`
- `PUT /api/groups/:groupId/members/:memberId` → `memberService.update(groupId, memberId, updates)`
- `DELETE /api/groups/:groupId/members/:memberId` → `memberService.delete(groupId, memberId)`

### Expenses (`/api/expenses`)
- `GET /api/expenses` → `expenseService.getAll()`
- `GET /api/expenses?groupId=:groupId` → `expenseService.getByGroupId(groupId)`
- `GET /api/expenses/:id` → `expenseService.getById(id)`
- `POST /api/expenses` → `expenseService.create(data)`
  - **Body**: `{ name, groupId, category, amount, paidBy, date, notes, splitMethod, items, participants, splits }`
- `PUT /api/expenses/:id` → `expenseService.update(id, updates)`
- `DELETE /api/expenses/:id` → `expenseService.delete(id)`

### Payments & Settlements (`/api/payments`)
- `GET /api/payments` → `paymentService.getAll()`
- `GET /api/payments?groupId=:groupId` → Filtered payments
- `POST /api/payments` → `paymentService.create(data)`
  - **Body**: `{ groupId, fromUser, toUser, amount, date, notes, reference }`
- `PUT /api/payments/:id` → `paymentService.update(id, updates)`

### Activity Feed (`/api/activities`)
- `GET /api/activities` → `activityService.getAll()`
- `POST /api/activities` → `activityService.create(activity)`

---

## 7. Connecting Frontend React App to Backend API

Currently, `myapp` uses a client-side localStorage service layer. To switch to a live database API, replace the methods in `myapp/src/services/` with this unified HTTP client:

### Step 1: Create API Client (`myapp/src/services/api.js`)
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('campussettle_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
};

export const api = {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: 'DELETE' }),
};
```

### Step 2: Example `expenseService.js` Connected to Database API
```javascript
import { api } from './api';

export const expenseService = {
  getAll: () => api.get('/expenses'),
  getById: (id) => api.get(`/expenses/${id}`),
  getByGroupId: (groupId) => api.get(`/expenses?groupId=${groupId}`),
  create: (data) => api.post('/expenses', data),
  update: (id, updates) => api.put(`/expenses/${id}`, updates),
  delete: (id) => api.delete(`/expenses/${id}`),
};
```

---

## 8. Database Health Check Endpoint (`server.js`)

Add this standard health-check route to confirm live database connectivity:

```javascript
import express from 'express';
import cors from 'cors';
import { pool } from './src/config/db.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, count(*) as user_count FROM users');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: result.rows[0].current_time,
      totalUsers: result.rows[0].user_count,
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```
