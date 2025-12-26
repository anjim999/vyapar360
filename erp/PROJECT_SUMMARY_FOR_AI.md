# DevoPod ERP - Project Summary for AI Coding Rules Generation

## 📋 PROMPT FOR AI

Copy everything below and paste to ChatGPT/Claude with this request:

> "Based on this project summary, give me comprehensive coding rules, best practices, and guidelines for vibe coding. Include rules for file naming, component structure, API design, database patterns, error handling, testing, and code style. Make the rules specific to this tech stack and project type."

---

## PROJECT OVERVIEW

**Type**: Multi-tenant SaaS ERP (Enterprise Resource Planning) System
**Industry**: B2B Business Software
**Primary Feature**: WhatsApp-style real-time team collaboration + Traditional ERP modules

---

## TECH STACK

### Frontend
- **Framework**: React 18.3.1 (with Hooks, no class components)
- **Build Tool**: Vite 5.4.8
- **Styling**: Tailwind CSS 4.1.17
- **Routing**: React Router DOM 6.30.2
- **State Management**: React Context API + useState/useReducer
- **HTTP Client**: Axios 1.13.2
- **Real-Time**: Socket.io Client 4.8.1
- **Icons**: React Icons 5.5.0
- **Charts**: Recharts 3.6.0
- **Date Handling**: date-fns 4.1.0
- **Notifications**: React Toastify 10.0.6
- **i18n**: i18next + react-i18next
- **PDF Export**: jsPDF + jsPDF-autotable
- **Excel Export**: xlsx

### Backend
- **Runtime**: Node.js (ES Modules - "type": "module")
- **Framework**: Express 4.22.1
- **Database**: PostgreSQL (via pg 8.16.3)
- **Real-Time**: Socket.io 4.8.1
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Password Hashing**: bcryptjs 2.4.3
- **File Upload**: Multer 2.0.2
- **Image Processing**: Sharp 0.34.5
- **Email**: Nodemailer 7.0.11
- **Validation**: express-validator 7.3.1
- **Rate Limiting**: express-rate-limit 8.2.1
- **Logging**: Morgan 1.10.1

### Database
- **Type**: PostgreSQL (Relational)
- **Pattern**: Multi-tenant (company_id on most tables)
- **Connection**: Connection pooling with pg-pool

---

## PROJECT STRUCTURE

```
erp/
├── backend/
│   └── src/
│       ├── config/            # DB config, constants
│       ├── controllers/       # Business logic (15 controllers)
│       ├── db/
│       │   ├── migrations/    # SQL migration files
│       │   ├── pool.js        # PostgreSQL connection pool
│       │   └── schema_v2.sql  # Complete schema
│       ├── middleware/        # auth.js, error handling
│       ├── routes/            # 22 route files
│       ├── services/          # Business services
│       ├── utils/             # Helper functions
│       ├── app.js             # Express app setup
│       └── index.js           # Server entry + Socket.io
│
└── frontend/
    └── src/
        ├── api/               # Axios instance setup
        ├── components/        # 27 reusable components
        │   ├── common/        # Buttons, Modals, Cards, etc.
        │   └── layout/        # Sidebar, Navbar
        ├── context/           # 4 contexts (Auth, Theme, Notification, Search)
        ├── hooks/             # 5 custom hooks
        ├── i18n/              # Translations
        ├── pages/             # 55+ page components
        │   ├── admin/         # Platform admin pages
        │   ├── auth/          # Login, Register, Forgot Password
        │   ├── crm/           # Leads, Customers
        │   ├── finance/       # Invoices, Payments, Accounts
        │   ├── hr/            # Employees, Attendance, Leaves
        │   ├── inventory/     # Products, Stock
        │   ├── marketplace/   # Company directory
        │   ├── projects/      # Tasks, Projects
        │   ├── TeamsPage.jsx  # Main chat (8000+ lines)
        │   └── CalendarPage.jsx
        ├── services/          # 13 API service modules
        └── utils/             # Helpers, formatters
```

---

## MAIN MODULES & FEATURES

### 1. Teams Chat (WhatsApp Clone) - CORE FEATURE
- Real-time messaging via Socket.io
- Teams → Channels → Messages hierarchy
- Direct Messages (1-on-1)
- Message reactions (emoji)
- Reply, Forward, Edit, Delete messages
- Star/Pin messages
- File attachments (images, videos, PDFs)
- Media gallery grid view
- Read receipts (ticks)
- Typing indicators
- Message search
- Contact info sidebar

### 2. HR Module
- Employee CRUD with profiles
- Department management
- Attendance check-in/check-out
- Leave requests & approvals
- Holiday calendar
- Salary structures
- Payslip generation

### 3. Finance Module
- Chart of accounts (double-entry)
- Customer/Vendor management
- Invoice generation & PDF export
- Payment tracking
- Journal entries
- Financial statements
- Expense management
- Budget tracking

### 4. Inventory Module
- Product catalog with SKU
- Hierarchical categories
- Stock level tracking
- Stock movements (in/out/adjust)
- Purchase orders

### 5. CRM Module
- Lead management with pipeline
- Lead activities (calls, emails, meetings)
- Customer database
- Contact requests handling

### 6. Projects Module
- Project CRUD
- Task management with assignments
- Priority levels
- Time logging
- Milestones
- Task comments

### 7. B2B Marketplace
- Company profiles
- Industry categorization
- Reviews & ratings
- Service listings
- Contact request system
- Saved favorites

### 8. Calendar & Meetings
- Event management
- Meeting scheduling
- Participant RSVPs
- Zoom/Meet link integration

---

## AUTHENTICATION FLOW

1. User registers → Password hashed with bcrypt → Stored in `users` table
2. User logs in → Verify password → Generate JWT token (7 days expiry)
3. Frontend stores token in localStorage
4. All API requests include `Authorization: Bearer <token>` header
5. Backend middleware validates token and attaches `req.user`
6. Multi-tenant: User can only access their `company_id` data

---

## REAL-TIME ARCHITECTURE (Socket.io)

### Server Setup
```javascript
// User joins rooms on connect
socket.join(`user_${userId}`);
socket.join(`company_${companyId}`);

// Joining specific channels/DMs
socket.join(`channel_${channelId}`);
socket.join(`dm_${sortedUserIds}`);
```

### Events
- `channel_message` - New message in channel
- `direct_message` - New DM
- `message_reaction` - Reaction added/removed
- `message_edited` - Message updated
- `message_deleted` - Message removed
- `user_typing` - Typing indicator
- `notification` - System notification

---

## DATABASE PATTERNS

### Multi-Tenant
- Most tables have `company_id` foreign key
- All queries filter by user's company
- `users` table linked to `companies` table

### Key Tables Count: 40+
- Platform: companies, users, roles, industries
- HR: departments, attendance, leave_requests, holidays, salary_structures, payslips
- Finance: accounts, invoices, customers, vendors, payments, journal_entries
- Inventory: products, product_categories, stock_movements, purchase_orders
- Chat: teams, team_channels, channel_messages, direct_messages, message_reactions
- CRM: leads, lead_activities, contact_requests
- Projects: projects, tasks, milestones, task_comments, time_logs

### Common Columns
- `id` SERIAL PRIMARY KEY
- `company_id` INTEGER (for multi-tenancy)
- `created_at` TIMESTAMP DEFAULT NOW()
- `updated_at` TIMESTAMP DEFAULT NOW()
- `is_active` BOOLEAN DEFAULT TRUE
- `created_by` / `updated_by` INTEGER

---

## API PATTERNS

### Route Structure
```
/api/auth/*           - Public auth routes
/api/teams/*          - Chat/messaging
/api/hr/*             - Human resources
/api/finance/*        - Financial operations
/api/inventory/*      - Stock management
/api/crm/*            - Customer relations
/api/projects/*       - Project management
/api/calendar/*       - Events & meetings
/api/uploads/*        - File uploads
/api/exports/*        - PDF/Excel exports
```

### Response Format
```javascript
// Success
{ success: true, data: {...} }
{ success: true, message: "Created", data: {...} }

// Error
{ success: false, error: "Error message" }
{ success: false, errors: [{field, message}] }
```

### HTTP Methods Used
- GET - Fetch data (list, single item)
- POST - Create new resources
- PUT - Full update
- PATCH - Partial update
- DELETE - Remove resources

---

## FRONTEND PATTERNS

### Component Types
1. **Pages** - Full page views in `/pages/`
2. **Components** - Reusable UI in `/components/`
3. **Layouts** - AppLayout, PublicLayout wrappers
4. **Contexts** - Global state providers

### State Management
- Local state: `useState`, `useReducer`
- Global state: Context API (Auth, Theme, Notifications)
- Server state: Direct API calls with useEffect

### Styling Approach
- Tailwind CSS utility classes
- Dark mode support via CSS variables
- Custom `theme-*` utility classes

### File Naming
- Components: PascalCase (e.g., `UserProfile.jsx`)
- Hooks: camelCase with `use` prefix (e.g., `useDebounce.js`)
- Services: camelCase with `Service` suffix (e.g., `hrService.js`)
- Pages: PascalCase with `Page` suffix (e.g., `DashboardPage.jsx`)

---

## CURRENT CODEBASE STATS

- **Frontend Pages**: 55+
- **Frontend Components**: 27
- **Backend Routes**: 22 files
- **Backend Controllers**: 15
- **Database Tables**: 40+
- **Largest File**: TeamsPage.jsx (~8000 lines) - needs refactoring

---

## KNOWN TECHNICAL DEBT

1. TeamsPage.jsx is too large - needs component extraction
2. Some API endpoints lack proper validation
3. Missing comprehensive error boundaries
4. No unit/integration tests
5. Some inline styles mixed with Tailwind
6. Duplicate code in some service files

---

## REQUIREMENTS FOR CODING RULES

Please provide comprehensive coding rules covering:

1. **File & Folder Organization**
2. **Naming Conventions** (files, components, variables, functions)
3. **React Component Patterns** (functional components, hooks usage)
4. **State Management Best Practices**
5. **API/Service Layer Patterns**
6. **Error Handling** (frontend & backend)
7. **Database Query Patterns**
8. **Socket.io Event Handling**
9. **Security Best Practices**
10. **Performance Optimization**
11. **Code Style & Formatting**
12. **Testing Guidelines**
13. **Git Commit Conventions**
14. **Documentation Standards**

Make the rules specific, actionable, and tailored to this React + Node.js + PostgreSQL + Socket.io stack.
