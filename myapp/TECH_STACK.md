# CampusSettle — Complete Technology Stack & Architecture (Master Tables)

Yeh document **CampusSettle** project me use hone wali har ek technology, library, framework, package, aur algorithm ko **Complete Table Format** me detail karta hai.

---

## 1. Master Technology Stack Table (All-in-One Overview)

| Category | Technology | Version | Project Files (`src/`) | Kaam Kya Karta Hai (Role & Responsibility) | Kyun Choose Kiya (Why Selected) | Code Usage Snippet / Syntax |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UI Framework** | **React** | `^19.2.8` | `src/App.jsx`<br>`src/pages/*`<br>`src/components/*` | Component-based dynamic rendering, lifecycle & local state management via hooks (`useState`, `useMemo`, `useEffect`). | Modern React 19 architecture; fast Virtual DOM re-rendering, no external state stores (Redux/Zustand) required. | `const [expenses, setExpenses] = useState([]);`<br>`const net = useMemo(() => calc(expenses), [expenses]);` |
| **Bundler & Server** | **Vite** | `^8.3.0` | `vite.config.js`<br>`package.json`<br>`index.html` | Ultra-fast local development server with instant Hot Module Replacement (HMR) and optimized Rollup/OxC production bundling. | Instant cold server start (<300ms) compared to Webpack; native ES Modules (ESM) support with zero bundle lag. | `import { defineConfig } from 'vite';`<br>`export default defineConfig({ plugins: [...] });` |
| **Styling Engine** | **Tailwind CSS v4** | `^4.3.3` | `src/index.css`<br>All `.jsx` files | Complete design system: responsive flex/grid layouts, modern color palettes, translucent glassmorphism, badges, and card styles. | Utility-first CSS without bloated configs (`@import "tailwindcss";`); produces tiny compiled CSS bundle sizes. | `<div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 shadow-xs">` |
| **Vite Compiler** | **@tailwindcss/vite** | `^4.3.3` | `vite.config.js` | Direct Vite plugin that natively compiles Tailwind CSS v4 stylesheets during Vite build and dev cycles. | Eliminates PostCSS config overhead; lightning-fast hot reloading of style edits. | `import tailwindcss from '@tailwindcss/vite';`<br>`plugins: [react(), tailwindcss()]` |
| **Client Routing** | **React Router DOM** | `^7.18.3` | `src/App.jsx`<br>`src/components/layout/Sidebar.jsx`<br>`src/components/layout/ProtectedRoute.jsx` | Single Page Application (SPA) client-side routing, URL parameters (`/groups/:id`, `/expenses/:id`), and protected route guards. | Smooth zero-reload navigation between dashboard, expenses, groups, balances, and settings. | `<Routes><Route path="/expenses/:id" element={<ExpenseDetails />} /></Routes>` |
| **Data Visualization** | **Recharts** | `^3.10.1` | `src/components/dashboard/SpendingChart.jsx` | Dynamic monthly spending bar charts with linear gradients, and category percentage breakdown donut charts. | Declarative SVG-based charting; 100% responsive (`ResponsiveContainer`) across mobile and desktop devices. | `<BarChart data={data}><Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} /></BarChart>` |
| **Iconography** | **Lucide React** | `^1.44.0` | `src/components/*`<br>`src/pages/*` | Consistent, crisp, modern SVG icons for navigation items, buttons, form inputs, status chips, and action triggers. | Feather-style clean vector icons; lightweight, tree-shakeable with zero pixelation or external font downloads. | `<Sparkles className="w-5 h-5 text-blue-600" />`<br>`<Phone className="w-4 h-4 text-slate-400" />` |
| **Motion & Physics** | **Framer Motion** | `^13.2.0` | `src/components/common/Modal.jsx`<br>`src/components/dashboard/StatCard.jsx` | Spring-based entrance transitions, modal backdrop fade-ins, and interactive scale animations. | Enhances perceived performance and delivers a state-of-the-art interactive user experience. | `<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>` |
| **Date Calculations** | **date-fns** | `^4.4.0` | `src/utils/`<br>`src/pages/Activity.jsx`<br>`src/pages/Expenses.jsx` | Relative time calculations ("2 hours ago"), calendar date formatting, and current month/year filters. | Modular, functional, immutable date arithmetic (90% smaller bundle footprint than legacy Moment.js). | `formatDistanceToNow(new Date(date), { addSuffix: true })`<br>`format(new Date(), 'MMM dd, yyyy')` |
| **Alerts & Toasts** | **React Hot Toast** | `^2.6.0` | `src/App.jsx`<br>`src/pages/*`<br>`src/services/*` | Floating, animated toast alerts for create, update, delete, payment settlement, and error feedback. | Elegant, non-blocking asynchronous user notifications replacing disruptive browser `window.alert()` modals. | `toast.success('Payment recorded successfully!');`<br>`toast.error('Invalid email or password');` |
| **Code Quality** | **ESLint** | `^10.10.0` | `eslint.config.js` | Enforces JavaScript syntax rules, forbids dead code/unused imports, and validates React Hooks dependencies. | Prevents subtle stale closure bugs in `useEffect` / `useMemo` and ensures clean production-ready code. | `npm run lint` |
| **Typography** | **Google Fonts (Inter)** | Cloud CDN | `index.html`<br>`src/index.css` | High-legibility modern sans-serif typography across headings, tables, form inputs, and financial numbers. | Clean, neutral, high-readability font designed specifically for user interfaces and numeric tabular data. | `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">` |
| **Data Persistence** | **Browser LocalStorage** | Web API | `src/utils/storage.js`<br>`src/services/*` | Instantaneous, zero-latency client-side data persistence across browser sessions and tab reloads. | Allows the entire expense sharing, splitting, and settlement engine to run offline and self-contained without API lag. | `localStorage.setItem(key, JSON.stringify(val));`<br>`JSON.parse(localStorage.getItem(key));` |
| **Target Database** | **PostgreSQL / Supabase** | 15+ / Cloud | `DATABASE_SCHEMA.md`<br>`DATABASE_CONNECTION.md` | Relational storage for users, groups, members, expenses, line items, debt splits, and settlement payments. | Strong ACID compliance, foreign key constraints (`ON DELETE CASCADE`), decimal currency precision, and indexes. | `CREATE TABLE expenses (id VARCHAR(64) PRIMARY KEY, amount NUMERIC(12,2) NOT NULL, ...);` |
| **Target ORM** | **Prisma** | 6.x | `DATABASE_SCHEMA.md` | Auto-generated type-safe database client and automated database migration generator. | Eliminates raw SQL vulnerabilities; provides auto-completion for relations (`expense.items`, `group.members`). | `prisma.expense.create({ data: { ... } });` |

---

## 2. Dependencies vs DevDependencies Table (`package.json`)

| Package Name | Type | Version | Purpose in Project |
| :--- | :--- | :--- | :--- |
| `react` | Dependency | `^19.2.8` | Core UI library for reactive component trees |
| `react-dom` | Dependency | `^19.2.8` | DOM rendering engine for web browsers |
| `react-router-dom` | Dependency | `^7.18.3` | SPA router with path matching and route guards |
| `tailwindcss` | Dependency | `^4.3.3` | Modern utility-first CSS styling engine |
| `@tailwindcss/vite` | Dependency | `^4.3.3` | Direct Vite compiler integration plugin for Tailwind |
| `lucide-react` | Dependency | `^1.44.0` | Comprehensive vector SVG icon set |
| `framer-motion` | Dependency | `^13.2.0` | Spring animations and UI transitions |
| `recharts` | Dependency | `^3.10.1` | Financial analytics charts (Bars & Donut) |
| `date-fns` | Dependency | `^4.4.0` | Lightweight date math and relative timestamps |
| `react-hot-toast` | Dependency | `^2.6.0` | Floating notification alerts |
| `vite` | DevDependency | `^8.3.0` | Dev server and production builder |
| `@vitejs/plugin-react` | DevDependency | `^6.1.1` | Fast Refresh and JSX transformation |
| `eslint` | DevDependency | `^10.10.0` | Code quality and syntax validation |
| `eslint-plugin-react-hooks` | DevDependency | `^7.1.1` | React Hooks best-practice linting rules |
| `eslint-plugin-react-refresh` | DevDependency | `^0.5.6` | HMR validation for React components |
| `@types/react` | DevDependency | `^19.2.18` | Type definitions for React |
| `@types/react-dom` | DevDependency | `^19.2.7` | Type definitions for React DOM |
| `globals` | DevDependency | `^17.12.0` | Standard global variable definitions for linting |

---

## 3. Internal Custom Algorithmic & Financial Engines Table

| Engine Name | File Path | Core Function / Method | Algorithmic Mechanism | Real World Problem Solved |
| :--- | :--- | :--- | :--- | :--- |
| **Equal Split Engine** | `src/utils/splitCalculator.js` | `calculateEqualSplit(total, ids)` | $\text{Base} = \lfloor \frac{\text{Total}}{N} \times 100 \rfloor / 100$. Remainder cents/paise are distributed 1-by-1 to the first participants round-robin. | Solves the 1/3 penny rounding problem: ₹100 divided by 3 results in ₹33.34 + ₹33.33 + ₹33.33 = **Exact ₹100.00** without losing a single paisa. |
| **Item-Based Split Engine** | `src/utils/splitCalculator.js` | `calculateItemBasedSplit(items)` | Line items (e.g., Pizza, Coffee, Taxi) calculate independent shares and aggregate per-user totals: $\sum \text{ItemShares}$. | Solves unfair bill splitting in restaurants: students pay only for the exact food items they consumed. |
| **Split Verification Engine** | `src/utils/splitCalculator.js` | `validateSplits(total, splits)` | Checks absolute difference: $\|\text{Expected Total} - \sum \text{Splits}\| < 0.01$. | Guarantees mathematically that total shares equal total bill amount before allowing expense creation. |
| **Pairwise Ledger Engine** | `src/utils/balanceCalculator.js` | `calculateGroupBalances(expenses, payments, members)` | Maintains a 2D matrix $\text{pairwiseMatrix}[D][C]$ tracking debtor-to-creditor debts and historical itemized references. | Determines exactly who owes whom and builds the expandable itemized bill breakdown list. |
| **Greedy Debt Simplifier** | `src/utils/settlementCalculator.js` | `calculateOptimizedSettlements(netBalances, membersMap)` | Sorts net debtors and net creditors descending, matching $\min(\|D\|, \|C\|)$ in a greedy graph traversal. | Minimizes payment transactions: If A owes B ₹200 and B owes C ₹200, it simplifies to **A pays C ₹200 directly** (reduces 2 transactions to 1). |
| **Multi-Currency Engine** | `src/utils/currencyFormatter.js` | `formatCurrency(amount, code)` | Integrates `Intl.NumberFormat('en-IN')` with dynamic currency symbols (`₹`, `$`, `€`, `£`). | Enables real-time currency switching across the entire application without page reload. |
| **Storage Safety Engine** | `src/utils/storage.js` | `getData(key, defaultVal)`<br>`setData(key, val)` | Wrapped `try...catch` serialization layer with corrupted-data fallback handling. | Prevents browser crashes and blank screens if `localStorage` is disabled or filled to quota. |

---

## 4. Frontend Component & Layer Architecture Table

| Architectural Layer | File / Directory | Key Responsibilities | Technologies Employed |
| :--- | :--- | :--- | :--- |
| **Application Root** | `src/App.jsx`<br>`src/main.jsx` | Router setup, global toast provider, layout mounting, and seed data initialization. | React 19, React Router v7, React Hot Toast |
| **Layout Layer** | `src/components/layout/` | Responsive sidebar navigation, mobile drawer menu, sticky header with user avatar, and protected route wrapper. | Tailwind CSS v4, Lucide React, React Router |
| **Common UI Primitives** | `src/components/common/` | Reusable design system: `Button` (primary, secondary, outline, danger), `Input` (with validation & icons), `Select`, `Modal`, `Avatar`, `StatusBadge`, `Tabs`, `EmptyState`. | Tailwind CSS, Lucide React, Framer Motion |
| **Dashboard Widgets** | `src/components/dashboard/` | Net Balance cards, Quick Action triggers, interactive Recharts spending analytics, and recent activity timeline. | Recharts, Lucide React, Tailwind CSS |
| **Expense Wizard** | `src/components/expenses/` | 4-step bill creation wizard: Bill Details, Split Method selector, Member selector, and Line Items editor. | Custom Split Engines, Tailwind CSS, Lucide |
| **Settlement Cards** | `src/components/settlements/` | Smart settlement recommendation cards, debt simplification displays, and payment confirmation modal. | Greedy Debt Simplifier, Lucide React |
| **Services Layer** | `src/services/` | Decoupled data access objects: `expenseService`, `groupService`, `memberService`, `paymentService`, `userService`, `activityService`. | Pure JavaScript, LocalStorage API |
| **State Persistence** | `src/constants/storageKeys.js`<br>`src/utils/storage.js` | Single source of truth for all storage keys and safe JSON read/write operations. | LocalStorage Web API |

---

## 5. Storage Keys & Data Structures Table

| Storage Key Constant | LocalStorage String Key | Entity Stored | Data Schema Structure |
| :--- | :--- | :--- | :--- |
| `STORAGE_KEYS.USERS` | `campussettle_users` | Registered Users | Array of `{ id, name, email, phone, password, avatar, avatarColor, college, joinedDate }` |
| `STORAGE_KEYS.CURRENT_USER` | `campussettle_current_user` | Active Session | Object `{ id, name, email, phone, avatar, avatarColor, college }` |
| `STORAGE_KEYS.GROUPS` | `campussettle_groups` | Sharing Groups | Array of `{ id, name, category, description, createdBy, createdAt, members: [...] }` |
| `STORAGE_KEYS.EXPENSES` | `campussettle_expenses` | Bills & Expenses | Array of `{ id, name, groupId, category, amount, paidBy, date, splitMethod, items, participants, splits, status }` |
| `STORAGE_KEYS.PAYMENTS` | `campussettle_payments` | Debt Settlements | Array of `{ id, groupId, fromUser, toUser, amount, date, status, notes, reference }` |
| `STORAGE_KEYS.ACTIVITIES` | `campussettle_activities` | Global Audit Feed | Array of `{ id, type, description, userId, userName, groupId, groupName, entityId, entityType, date }` |
| `STORAGE_KEYS.SETTINGS` | `campussettle_settings` | App Preferences | Object `{ currency: 'INR', theme: 'light', notifications: true, emailAlerts: true }` |
