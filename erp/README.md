# 🚀 DevoPod ERP - Enterprise Resource Planning System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-61dafb.svg)

**A comprehensive, multi-tenant SaaS ERP platform with real-time collaboration features**

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Modules](#-modules) • [API Reference](#-api-reference)

</div>

---

## 📋 Overview

**DevoPod ERP** is a modern, full-stack Enterprise Resource Planning system designed for small to medium businesses. It combines traditional ERP modules (HR, Finance, Inventory, CRM) with modern collaboration tools including a **WhatsApp-style Teams Chat** system with real-time messaging, reactions, and file sharing.

### 🎯 Key Highlights

- **Multi-Tenant Architecture** - Support for multiple companies/organizations
- **Real-Time Collaboration** - WebSocket-powered chat with Microsoft Teams-like interface
- **Modern Tech Stack** - React 18 + Vite frontend, Node.js/Express backend
- **WhatsApp-Style Messaging** - Complete chat experience with reactions, replies, forwards, pins, and stars
- **Comprehensive ERP Modules** - HR, Finance, Inventory, CRM, Projects
- **B2B Marketplace** - Company directory with reviews and contact management

---

## ✨ Features

### 💬 Teams & Communication

| Feature | Description |
|---------|-------------|
| **Real-Time Chat** | Instant messaging with Socket.io |
| **Teams & Channels** | Create teams with multiple channels |
| **Direct Messages** | 1-on-1 private conversations |
| **Message Reactions** | Full emoji reactions (👍 ❤️ 😂 😮 😢 🎉) |
| **Reply & Forward** | Reply to specific messages, forward to others |
| **Star & Pin Messages** | Mark important messages for quick access |
| **File Sharing** | Send images, videos, PDFs, and documents |
| **Media Gallery** | Grid view for multiple images/videos |
| **Read Receipts** | Double-tick system for message status |
| **Typing Indicators** | See when others are typing |
| **Search Messages** | Full-text search within conversations |
| **Contact Info** | View shared media, starred messages, and more |

### 👥 Human Resources (HR)

| Feature | Description |
|---------|-------------|
| **Employee Management** | Add, edit, view employee profiles |
| **Department Management** | Organize structure with departments |
| **Attendance Tracking** | Clock in/out with daily records |
| **Leave Management** | Apply, approve, reject leave requests |
| **Holiday Calendar** | Manage company holidays |
| **Salary Structure** | Define components (basic, HRA, DA, etc.) |
| **Payslips** | Generate monthly payslips |

### 💰 Finance & Accounting

| Feature | Description |
|---------|-------------|
| **Chart of Accounts** | Assets, liabilities, equity, revenue, expenses |
| **Customer Management** | Track customers and receivables |
| **Vendor Management** | Manage suppliers and payables |
| **Invoice Generation** | Create and send professional invoices |
| **Payment Tracking** | Record and track all payments |
| **Journal Entries** | Double-entry bookkeeping |
| **Financial Statements** | Balance sheet, P&L, cash flow |
| **Expense Management** | Submit and approve expenses |
| **Budget Management** | Set and track budgets |

### 📦 Inventory Management

| Feature | Description |
|---------|-------------|
| **Product Catalog** | Manage products with SKU, pricing |
| **Categories** | Hierarchical product categories |
| **Stock Tracking** | Real-time stock levels |
| **Stock Movements** | Track in/out/adjustments |
| **Low Stock Alerts** | Notifications for reorder |
| **Purchase Orders** | Create and track POs |

### 📈 CRM (Customer Relationship Management)

| Feature | Description |
|---------|-------------|
| **Lead Management** | Capture and nurture leads |
| **Lead Pipeline** | Visual sales pipeline stages |
| **Activities** | Calls, emails, meetings tracking |
| **Customer Database** | Complete customer information |
| **Contact Requests** | Marketplace inquiry management |

### 📊 Projects & Tasks

| Feature | Description |
|---------|-------------|
| **Project Management** | Create and track projects |
| **Task Management** | Assign tasks with priorities |
| **Time Tracking** | Log hours on tasks |
| **Milestones** | Set and track project milestones |
| **Comments** | Discuss tasks with team |

### 🛒 B2B Marketplace

| Feature | Description |
|---------|-------------|
| **Company Directory** | Browse registered businesses |
| **Company Profiles** | Detailed company information |
| **Reviews & Ratings** | Customer reviews with ratings |
| **Contact Requests** | Send inquiries to companies |
| **Save Favorites** | Bookmark companies of interest |

### 📅 Calendar & Meetings

| Feature | Description |
|---------|-------------|
| **Event Calendar** | Visual calendar with events |
| **Meeting Scheduling** | Schedule online/in-person meetings |
| **Participant Management** | Invite and track RSVPs |
| **Zoom/Meet Integration** | Add video conference links |

### 🔔 Notifications

| Feature | Description |
|---------|-------------|
| **Real-Time Alerts** | Instant notifications via WebSocket |
| **Notification Center** | View all notifications |
| **Email Integration** | Optional email notifications |
| **In-App Badges** | Unread counts on navigation |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | UI library with hooks |
| **Vite** | Fast build tool and dev server |
| **React Router 6** | Client-side routing |
| **Tailwind CSS 4** | Utility-first styling |
| **Socket.io Client** | Real-time communication |
| **Axios** | HTTP client |
| **React Icons** | Icon library |
| **Recharts** | Data visualization |
| **React Toastify** | Toast notifications |
| **i18next** | Internationalization |
| **date-fns** | Date manipulation |
| **jsPDF** | PDF generation |
| **xlsx** | Excel export |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express** | Web framework |
| **Socket.io** | Real-time WebSocket server |
| **PostgreSQL** | Relational database |
| **pg** | PostgreSQL client |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Multer** | File upload handling |
| **Sharp** | Image processing |
| **Nodemailer** | Email sending |
| **Morgan** | HTTP request logging |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    React Application                         │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────────────────┐ │ │
│  │  │  Pages  │ │Components│ │ Context │ │     Services       │ │ │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └─────────┬──────────┘ │ │
│  │       │           │           │                 │            │ │
│  │       └───────────┴───────────┴─────────────────┘            │ │
│  │                          │                                    │ │
│  │              ┌───────────┴───────────┐                       │ │
│  │              │    Axios + Socket.io   │                       │ │
│  └──────────────┴───────────────────────┴───────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP + WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER (Node.js/Express)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Express App                            │  │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │  │
│  │  │ Routes  │ │Middleware│ │Controllers│ │   Socket.io   │  │  │
│  │  └────┬────┘ └────┬─────┘ └────┬─────┘ └───────┬───────┘  │  │
│  │       │           │            │                │          │  │
│  │       └───────────┴────────────┴────────────────┘          │  │
│  │                          │                                  │  │
│  │              ┌───────────┴───────────┐                     │  │
│  │              │      pg (Pool)         │                     │  │
│  └──────────────┴───────────────────────┴─────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Platform Tables │ HR Tables │ Finance │ Inventory │ Chat │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
erp/
├── 📂 backend/                    # Node.js/Express API Server
│   ├── 📂 src/
│   │   ├── 📂 config/             # Configuration files
│   │   ├── 📂 controllers/        # Request handlers
│   │   ├── 📂 db/                 # Database setup & migrations
│   │   │   ├── migrations/        # SQL migration files
│   │   │   ├── pool.js            # PostgreSQL connection pool
│   │   │   ├── schema.sql         # Base schema
│   │   │   └── schema_v2.sql      # Extended schema (multi-tenant)
│   │   ├── 📂 middleware/         # Express middleware
│   │   │   └── auth.js            # JWT authentication
│   │   ├── 📂 routes/             # API route definitions
│   │   │   ├── auth.js            # Authentication API
│   │   │   ├── teams.js           # Teams/Chat API
│   │   │   ├── hr.js              # HR module API
│   │   │   ├── finance.js         # Finance module API
│   │   │   ├── inventory.js       # Inventory API
│   │   │   ├── crm.js             # CRM API
│   │   │   ├── projects.js        # Projects API
│   │   │   ├── calendar.js        # Calendar/Events API
│   │   │   └── ...                # Other routes
│   │   ├── 📂 utils/              # Utility functions
│   │   ├── app.js                 # Express app setup
│   │   └── index.js               # Server entry point
│   ├── 📂 uploads/                # Uploaded files storage
│   ├── .env                       # Environment variables
│   └── package.json               # Dependencies
│
├── 📂 frontend/                   # React/Vite Application
│   ├── 📂 public/                 # Static assets
│   ├── 📂 src/
│   │   ├── 📂 api/                # API client setup
│   │   ├── 📂 components/         # Reusable UI components
│   │   │   ├── 📂 common/         # Generic components
│   │   │   ├── 📂 layout/         # Layout components
│   │   │   ├── Navbar.jsx         # Top navigation
│   │   │   ├── Sidebar.jsx        # Side navigation
│   │   │   ├── Chat.jsx           # Quick chat widget
│   │   │   └── ...                # Other components
│   │   ├── 📂 context/            # React context providers
│   │   │   ├── AuthContext.jsx    # Authentication state
│   │   │   ├── ThemeContext.jsx   # Theme management
│   │   │   └── NotificationContext.jsx
│   │   ├── 📂 hooks/              # Custom React hooks
│   │   ├── 📂 i18n/               # Internationalization
│   │   ├── 📂 pages/              # Page components
│   │   │   ├── 📂 admin/          # Admin panel pages
│   │   │   ├── 📂 auth/           # Login, Register, etc.
│   │   │   ├── 📂 crm/            # CRM pages
│   │   │   ├── 📂 finance/        # Finance module pages
│   │   │   ├── 📂 hr/             # HR module pages
│   │   │   ├── 📂 inventory/      # Inventory pages
│   │   │   ├── 📂 marketplace/    # Marketplace pages
│   │   │   ├── 📂 projects/       # Project management pages
│   │   │   ├── TeamsPage.jsx      # Teams chat (WhatsApp-style)
│   │   │   ├── CalendarPage.jsx   # Calendar & events
│   │   │   ├── DashboardPage.jsx  # Main dashboard
│   │   │   └── ...                # Other pages
│   │   ├── 📂 services/           # API service functions
│   │   ├── 📂 utils/              # Utility functions
│   │   ├── App.jsx                # Main app with routes
│   │   ├── main.jsx               # App entry point
│   │   └── index.css              # Global styles
│   ├── .env                       # Environment variables
│   ├── vite.config.js             # Vite configuration
│   └── package.json               # Dependencies
│
├── 📄 README.md                   # This file
└── 📄 .gitignore                  # Git ignore rules
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14.0
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/devopod-erp.git
cd devopod-erp
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb devopod_erp

# Or using psql
psql -U postgres
CREATE DATABASE devopod_erp;
\q
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations (auto-runs on start)
npm start
```

**Environment Variables (`.env`):**
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/devopod_erp
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

**Environment Variables (`.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

### Test Credentials

```
Email: employee1@test.com
Password: 192357

Email: employee2@test.com
Password: 192357

Email: employee3@test.com
Password: 192357
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/login` | Login and get JWT token |
| POST | `/api/auth/forgot-password` | Request password reset |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update user profile |

### Teams & Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | List all user's teams |
| POST | `/api/teams` | Create a new team |
| GET | `/api/teams/:id/channels` | List team channels |
| POST | `/api/teams/:id/channels` | Create new channel |
| GET | `/api/teams/:id/channels/:cid/messages` | Get channel messages |
| POST | `/api/teams/:id/channels/:cid/messages` | Send message |
| POST | `/api/teams/.../messages/:mid/react` | Add reaction |
| GET | `/api/teams/direct-messages` | List DM conversations |
| GET | `/api/teams/direct-messages/:uid` | Get DM history |
| POST | `/api/teams/direct-messages/:uid` | Send DM |
| GET | `/api/teams/users/search` | Search users for chat |

### HR Module

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hr/employees` | List employees |
| POST | `/api/hr/employees` | Create employee |
| GET | `/api/hr/departments` | List departments |
| GET | `/api/hr/attendance` | Get attendance records |
| POST | `/api/hr/attendance/check-in` | Clock in |
| POST | `/api/hr/attendance/check-out` | Clock out |
| GET | `/api/hr/leaves` | List leave requests |
| POST | `/api/hr/leaves` | Apply for leave |

### Finance Module

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/finance/accounts` | List chart of accounts |
| GET | `/api/finance/invoices` | List invoices |
| POST | `/api/finance/invoices` | Create invoice |
| GET | `/api/finance/payments` | List payments |
| POST | `/api/finance/payments` | Record payment |
| GET | `/api/finance/customers` | List customers |
| GET | `/api/finance/vendors` | List vendors |

### Inventory Module

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory/products` | List products |
| POST | `/api/inventory/products` | Create product |
| GET | `/api/inventory/categories` | List categories |
| GET | `/api/inventory/stock` | Get stock levels |
| POST | `/api/inventory/stock/movement` | Record stock movement |

### CRM Module

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/crm/leads` | List leads |
| POST | `/api/crm/leads` | Create lead |
| GET | `/api/crm/customers` | List CRM customers |
| GET | `/api/crm/requests` | List contact requests |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id/tasks` | List project tasks |
| POST | `/api/projects/:id/tasks` | Create task |

### Calendar

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calendar/events` | List calendar events |
| POST | `/api/calendar/events` | Create event |
| GET | `/api/meetings` | List meetings |
| POST | `/api/meetings` | Schedule meeting |

---

## 🔌 WebSocket Events

### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `join` | `{ userId, companyId }` | Join user's rooms |
| `join_channel` | `{ channelId }` | Join a channel room |
| `join_dm` | `{ recipientId }` | Join DM conversation |
| `typing_start` | `{ channelId/recipientId }` | User started typing |
| `typing_stop` | `{ channelId/recipientId }` | User stopped typing |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `channel_message` | `{ message }` | New channel message |
| `direct_message` | `{ message }` | New direct message |
| `message_reaction` | `{ messageId, reactions }` | Reaction update |
| `user_typing` | `{ userId, userName }` | User is typing |
| `notification` | `{ notification }` | New notification |

---

## 🎨 UI Themes

The application supports multiple themes:

- **Light Mode** - Clean, bright interface
- **Dark Mode** - Easy on the eyes for night use
- **System** - Follows OS preference

Toggle via Settings page or navbar theme button.

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **CORS Protection** - Configured allowed origins
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Express validator
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - React's built-in escaping
- **HTTPS Ready** - For production deployment

---

## 📊 Database Schema Overview

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts with roles |
| `companies` | Multi-tenant organizations |
| `departments` | Company departments |
| `roles` | Permission roles |

### HR Tables

| Table | Description |
|-------|-------------|
| `employees` | Extended employee info |
| `attendance` | Daily attendance records |
| `leave_requests` | Leave applications |
| `leave_types` | Types of leaves |
| `holidays` | Company holidays |
| `salary_structures` | Salary components |
| `payslips` | Monthly payslips |

### Finance Tables

| Table | Description |
|-------|-------------|
| `accounts` | Chart of accounts |
| `customers` | Customer records |
| `vendors` | Vendor records |
| `invoices` | Sales invoices |
| `payments` | Payment records |
| `journal_entries` | Accounting entries |
| `expenses` | Expense claims |
| `budgets` | Budget allocations |

### Inventory Tables

| Table | Description |
|-------|-------------|
| `products` | Product catalog |
| `product_categories` | Product categories |
| `stock_movements` | Inventory transactions |
| `purchase_orders` | Purchase orders |

### Communication Tables

| Table | Description |
|-------|-------------|
| `teams` | Chat teams |
| `team_channels` | Team channels |
| `channel_messages` | Channel messages |
| `direct_messages` | 1-on-1 messages |
| `message_reactions` | Message reactions |
| `notifications` | User notifications |

---

## 🚢 Deployment

### Production Build

```bash
# Frontend
cd frontend
npm run build
# Output in dist/ folder

# Backend
cd backend
npm start
```

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=very-long-random-secret
FRONTEND_URL=https://yourapp.com
```

### Docker (Optional)

```dockerfile
# docker-compose.yml coming soon
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- React Team for the amazing UI library
- Socket.io for real-time capabilities
- PostgreSQL for reliable data storage
- All open-source contributors

---

<div align="center">

**Built with ❤️ by DevoPod Team**

[Report Bug](https://github.com/your-username/devopod-erp/issues) • [Request Feature](https://github.com/your-username/devopod-erp/issues)

</div>
