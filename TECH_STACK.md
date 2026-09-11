# CampusSettle — Complete Technology Stack & Specifications

This document provides the structured reference for all technologies, frameworks, libraries, engines, and utilities powering **CampusSettle**.

---

## 1. Core Architecture & Frontend Framework

| Technology | Version | Category | Primary Responsibility | Key Files (`src/`) | Why Chosen (Core Benefit) |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **React** | `19.2.8` | UI Library | Component hierarchy, state hooks (`useState`, `useMemo`), and reactive rendering. | `App.jsx`, `pages/*`, `components/*` | Modern React 19 Virtual DOM; handles real-time financial math without external state store overhead. |
| **Vite** | `8.3.0` | Build Tool | Development server, instant Hot Module Replacement (HMR), and production bundler. | `vite.config.js`, `package.json` | 10x-100x faster cold starts than Webpack via native ES Modules (ESM) and OxC/Rollup tooling. |
| **Tailwind CSS** | `4.3.3` | Styling | Responsive grid/flex layouts, glassmorphism (`backdrop-blur`), badges, and theme tokens. | `index.css`, all JSX files | Zero-config modern styling with `@import "tailwindcss"`; generates tiny optimized CSS bundles. |
| **@tailwindcss/vite** | `4.3.3` | Vite Plugin | Seamless compilation of Tailwind CSS v4 directly inside the Vite build pipeline. | `vite.config.js` | Direct engine integration without needing separate PostCSS configurations or build steps. |
| **React Router DOM** | `7.18.3` | Client Routing | SPA routing, protected route guards, URL parameters (`/groups/:id`, `/expenses/:id`). | `App.jsx`, `components/layout/` | Seamless client-side navigation without full page reloads; robust route parameter extraction. |
| **Google Fonts (Inter)** | Cloud | Typography | Modern, high-legibility sans-serif font designed for UI and financial figures. | `index.html`, `index.css` | High visual clarity for numeric tables, currency symbols, and compact student ledgers. |

---

## 2. Visuals, Data Analytics & User Experience

| Technology | Version | Category | UI Purpose & Features | Key Files (`src/`) | Why Chosen (Core Benefit) |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Recharts** | `3.10.1` | Analytics | Interactive monthly spending bar charts and category percentage donut charts. | `components/dashboard/SpendingChart.jsx` | Declarative SVG-based charting; 100% responsive across mobile and desktop viewport sizes. |
| **Lucide React** | `1.44.0` | Icons | Feather-style vector SVG icons for navigation, buttons, status chips, and form inputs. | `components/*`, `pages/*` | Clean, modern vector icons with zero pixelation; tree-shakeable and lightweight. |
| **Framer Motion** | `13.2.0` | Animations | Modal scale-in transitions, backdrop fade-ins, and tab switching indicators. | `components/common/Modal.jsx`, `StatCard.jsx` | Delivers smooth spring physics-based micro-interactions for a premium application feel. |
| **React Hot Toast** | `2.6.0` | Notifications | Floating toast banners for create, edit, delete, settle, and error feedback. | `App.jsx`, `pages/*`, `services/*` | Elegant, non-blocking asynchronous alerts replacing disruptive browser `window.alert()` dialogs. |
| **date-fns** | `4.4.0` | Date Utilities | Relative time calculations ("3 hours ago"), formatted dates, and monthly filtering. | `utils/`, `pages/Activity.jsx` | Lightweight, modular, and immutable date arithmetic (90% smaller than legacy Moment.js). |

---

## 3. Custom Financial & Algorithmic Engines

| Engine | Implementation File | Mathematical Formula / Mechanism | Problem Solved |
| :--- | :--- | :--- | :--- |
| **Equal Split Engine** | `src/utils/splitCalculator.js` | $\text{Base} = \lfloor \frac{\text{Total}}{N} \times 100 \rfloor / 100$<br>Remainder paise distributed round-robin ($1\text{¢} \times R$) | Solves the 1/3 penny rounding issue: ₹100 split 3 ways yields ₹33.34 + ₹33.33 + ₹33.33 = **Exact ₹100.00**. |
| **Itemized Split Engine** | `src/utils/splitCalculator.js` | $\text{UserShare} = \sum_{\text{items}} \left( \frac{\text{ItemPrice}}{\text{ItemParticipantsCount}} \right)$ | Solves unfair group dining splits: students only pay for items they consumed (e.g. Pizza, Drinks). |
| **Split Validator** | `src/utils/splitCalculator.js` | $\|\text{Total Amount} - \sum \text{Splits}\| < 0.01$ | Mathematically ensures every bill's total matches the sum of participant debts before submission. |
| **Pairwise Debt Ledger** | `src/utils/balanceCalculator.js` | $\text{Net} = \text{TotalPaid} - \text{TotalShare}$<br>Directional matrix: $\text{matrix}[\text{Debtor}][\text{Creditor}]$ | Computes who owes whom across overlapping bills and builds expandable itemized debt breakdowns. |
| **Greedy Debt Simplifier** | `src/utils/settlementCalculator.js` | Sorts net debtors & creditors descending; matches $\min(\|\text{Debtor}\|, \|\text{Creditor}\|)$ | Minimizes transactions: If A owes B ₹200 and B owes C ₹200, it reduces to **A pays C ₹200 directly**. |
| **Multi-Currency Engine** | `src/utils/currencyFormatter.js` | `Intl.NumberFormat('en-IN')` with dynamic currency codes (`INR`, `USD`, `EUR`, `GBP`) | Enables instantaneous global currency switching (`₹`, `$`, `€`, `£`) across all screens without reloading. |
| **Storage Safety Engine** | `src/utils/storage.js` | Wrapped `try...catch` serialization layer with corrupted-data fallback | Prevents blank screens and application crashes if localStorage is full or corrupted. |

---

## 4. State Persistence & LocalStorage Model

| Storage Key Constant | LocalStorage Key Name | Entity Stored | Data Structure |
| :--- | :--- | :--- | :--- |
| `STORAGE_KEYS.USERS` | `campussettle_users` | User Accounts | Array of `{ id, name, email, phone, password, avatar, avatarColor, college, joinedDate }` |
| `STORAGE_KEYS.CURRENT_USER` | `campussettle_current_user` | Active Session | Object `{ id, name, email, phone, avatar, avatarColor, college }` |
| `STORAGE_KEYS.GROUPS` | `campussettle_groups` | Expense Groups | Array of `{ id, name, category, description, createdBy, createdAt, members: [...] }` |
| `STORAGE_KEYS.EXPENSES` | `campussettle_expenses` | Bills & Line Items | Array of `{ id, name, groupId, category, amount, paidBy, date, splitMethod, items, splits, status }` |
| `STORAGE_KEYS.PAYMENTS` | `campussettle_payments` | Debt Settlements | Array of `{ id, groupId, fromUser, toUser, amount, date, status, notes, reference }` |
| `STORAGE_KEYS.ACTIVITIES` | `campussettle_activities` | Global Audit Feed | Array of `{ id, type, description, userId, userName, groupId, groupName, entityId, date }` |
| `STORAGE_KEYS.SETTINGS` | `campussettle_settings` | App Preferences | Object `{ currency: 'INR', theme: 'light', notifications: true, emailAlerts: true }` |

---

## 5. `package.json` Dependencies Manifest

### Runtime Dependencies
| Package | Version | Type | Official Purpose |
| :--- | :---: | :--- | :--- |
| `react` | `^19.2.8` | Production | Core UI component tree and rendering runtime |
| `react-dom` | `^19.2.8` | Production | React renderer for Web DOM |
| `react-router-dom` | `^7.18.3` | Production | Client-side routing and navigation |
| `tailwindcss` | `^4.3.3` | Production | Utility-first CSS framework |
| `@tailwindcss/vite` | `^4.3.3` | Production | Vite plugin for native Tailwind v4 compilation |
| `recharts` | `^3.10.1` | Production | SVG charting library for React |
| `lucide-react` | `^1.44.0` | Production | Feather-inspired SVG icon system |
| `framer-motion` | `^13.2.0` | Production | Animation and gesture library for React |
| `date-fns` | `^4.4.0` | Production | Modern JavaScript date utility library |
| `react-hot-toast` | `^2.6.0` | Production | Toast notification system for React |

### Development & Tooling Dependencies
| Package | Version | Type | Official Purpose |
| :--- | :---: | :--- | :--- |
| `vite` | `^8.3.0` | Development | Next-generation frontend build tool |
| `@vitejs/plugin-react` | `^6.1.1` | Development | React Fast Refresh and JSX support in Vite |
| `eslint` | `^10.10.0` | Development | Pluggable JavaScript linter |
| `eslint-plugin-react-hooks` | `^7.1.1` | Development | Lints React Hooks usage for correct dependencies |
| `eslint-plugin-react-refresh` | `^0.5.6` | Development | Validates Hot Module Replacement (HMR) constraints |
| `@types/react` | `^19.2.18` | Development | TypeScript type definitions for React |
| `@types/react-dom` | `^19.2.7` | Development | TypeScript type definitions for React DOM |
| `globals` | `^17.12.0` | Development | Global variables definitions for ESLint |

---

## 6. Target Production Database Stack (Backend Ready)

| Layer | Recommended Technology | Role in Architecture |
| :--- | :--- | :--- |
| **Relational Database** | **PostgreSQL 15+ / Supabase / Neon** | ACID-compliant storage with foreign keys, cascade deletes, and numeric precision. |
| **ORM / Data Client** | **Prisma ORM (`@prisma/client`)** | Type-safe database queries, relationship joins, and automated schema migrations. |
| **Backend API** | **Node.js + Express.js REST API** | JSON endpoints matching the methods defined in `src/services/*.js`. |
| **Security & Auth** | **bcryptjs + JSON Web Tokens (JWT)** | Secure password hashing and stateless token-based authorization headers. |
| **Alternative NoSQL** | **MongoDB + Mongoose** | Flexible document model storing nested line items and split distributions. |
