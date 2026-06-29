# 🏷️ OrbitHR - Modern Human Resource Management Platform

## 📊 Metrics (100 Virtual Users)
> [!IMPORTANT]
> These metrics represent high-load performance and stress test results generated using **k6** with 100 concurrent virtual users.

### 📈 Summary Results
| Metric | Value | Status |
| :--- | :--- | :--- |
| **Total Requests** | 8,572 | ✅ Passed |
| **Success Rate** | 100% | ✅ Passed |
| **P(95) Response Time** | 13.08 ms | ✅ Passed |
| **Request Rate** | 131.26 req/s | ✅ High Performance |
| **Avg Response Time** | 3.42 ms | ✅ Passed |
| **Max Response Time** | 151.75 ms | ✅ Stable |

### 🔍 Detailed Performance Breakdown
*   **HTTP Request Duration**: Avg: 3.42ms | Median: 1.03ms | P(95): 13.08ms
*   **Infrastructure Checks**: 
    *   Backend (API): 100% Availability under high load
    *   Frontend (Vite): 100% Availability under high load
*   **Test Thresholds**:
    *   Latency (p95 < 500ms): **PASSED**
    *   Error Rate (< 1%): **PASSED**

---

## 📖 About the Project

OrbitHR is a complete, production-grade Employee Management & HR Operations System designed to streamline HR workflows, manage employee data, track attendance and leaves, and monitor skill proficiencies. It solves the problem of scattered HR data by providing a unified, dark-themed, highly responsive platform for Admins, Managers, and Employees. 

OrbitHR enables transparent communication, task management, dynamic payroll generation, and deep insights through robust analytics, making it a critical tool for modern organizational management. Whether tracking performance, approving time-off, or assigning daily tasks, OrbitHR ensures an efficient and modern user experience.

---

## 🚀 Features Overview

*   **Authentication & RBAC:** Secure JWT-based login with distinct roles (Admin, Manager, Employee).
*   **Employee Management:** Complete employee lifecycle tracking, team structuring, and dynamic search.
*   **Attendance & Leaves:** Real-time attendance check-ins, monthly summaries, and automated leave request workflows.
*   **Skill Matrix:** Track employee competencies, manage master skill libraries, and view visual skill radars.
*   **Task & Activity Management:** Assign tasks, update statuses, and monitor employee activity timelines.
*   **Payroll Integration:** Dynamic payslip generation based on salary, attendance, and leave records.
*   **Rich Dashboards & Analytics:** Role-specific dashboards featuring Recharts-powered analytics for attendance, skills, and organizational health.
*   **Document Management:** Upload and download important employee documentation securely.
*   **Communications:** Global system announcements and real-time user notifications.

👉 *“For detailed features, refer to `/features.md`”*

---

## 📁 Folder Structure Explanation

```text
OrbitHR/
├── backend/
│   ├── src/
│   │   ├── config/        # Database and server configuration files
│   │   ├── constants/     # Global constants and enums
│   │   ├── controllers/   # Business logic for all API routes (Auth, Employee, Attendance, etc.)
│   │   ├── middlewares/   # JWT verification, Role authorization, Multer file upload
│   │   ├── models/        # Mongoose schemas (User, Employee, Leave, Task, Skill, etc.)
│   │   ├── routes/        # Express API route definitions grouped by feature
│   │   └── utils/         # Helper functions, custom error classes, API response formatters
│   ├── uploads/           # Storage directory for uploaded employee documents
│   └── server.js          # Backend application entry point
└── frontend/
    ├── src/
    │   ├── api/           # Axios instance configuration and API call wrappers
    │   ├── components/    # Reusable UI components (Buttons, Modals, Forms, Layouts)
    │   ├── context/       # React Context providers (Auth, Theme)
    │   ├── features/      # Feature-specific state and logic slices
    │   ├── hooks/         # Custom React hooks (e.g., useAuth)
    │   ├── lib/           # Third-party library configs (Framer Motion, generic utilities)
    │   ├── pages/         # Page-level route components (Dashboards, Employee lists, Forms)
    │   └── routes/        # React Router DOM configuration and protected route guards
    ├── tailwind.config.js # Custom Tailwind CSS configuration (Dark mode, theming)
    └── index.html         # Frontend HTML entry point
```

**Explanation:**
The application is separated into a strict Client-Server model.
*   **Backend:** A Node.js + Express REST API handling database operations via Mongoose, authentication, and file processing. Organized via MVC principles (Models, Controllers, Routes).
*   **Frontend:** A React + Vite SPA with a modern Tailwind CSS UI, featuring Framer Motion for animations and Recharts for data visualization. Modularized by pages and reusable components.

---

## 🛠️ Tech Stack & Dependencies

### Frontend Technologies
*   **React (18.3):** Core UI library
*   **Vite:** Blazing fast build tool and dev server
*   **Tailwind CSS:** Utility-first CSS framework for rapid UI styling
*   **React Router DOM:** Client-side routing and protected routes
*   **Framer Motion:** High-performance UI animations and transitions
*   **Recharts:** Composable charting library for dashboard analytics
*   **Lucide React:** Beautiful, consistent icon set
*   **OGL:** Minimal WebGL library for advanced graphics
*   **Axios:** Promise-based HTTP client for API communication

### Backend Technologies
*   **Node.js & Express.js:** Fast, unopinionated web framework
*   **MongoDB with Mongoose:** NoSQL database with elegant object modeling
*   **JSON Web Token (JWT):** Secure, stateless authentication mechanism
*   **bcryptjs:** Secure password hashing algorithm
*   **Multer:** Middleware for handling multipart/form-data (File Uploads)
*   **dotenv:** Environment variable management

---

## 🔗 API Routes Documentation

### 🔐 Authentication & System
| Method | Route | Description | Access Control |
| ------ | ----- | ----------- | -------------- |
| **GET** | `/api/v1/health` | API Health check | Public |
| **POST** | `/api/v1/auth/register` | Register new user | Public |
| **POST** | `/api/v1/auth/login` | Authenticate user & get token | Public |
| **GET** | `/api/v1/auth/me` | Get current logged-in user | Authenticated |
| **POST** | `/api/v1/auth/logout` | Logout user session | Authenticated |
| **GET** | `/api/v1/search/global` | Global system search queries | Authenticated |

### 👥 Teams & Employees
| Method | Route | Description | Access Control |
| ------ | ----- | ----------- | -------------- |
| **GET** | `/api/v1/teams/options` | Get predefined teams | Public |
| **GET** | `/api/v1/teams` | Get all organization teams | Admin |
| **GET** | `/api/v1/team/my-team` | Get manager's managed team | Manager |
| **GET** | `/api/v1/employee/team` | Get employee's team info | Employee |
| **POST** | `/api/v1/join-request` | Create team join request | Employee |
| **GET** | `/api/v1/join-requests` | View pending join requests | Manager |
| **PATCH** | `/api/v1/join-request/:id` | Review team join request | Admin, Manager |
| **POST** | `/api/v1/employees` | Create new employee profile | Admin |
| **GET** | `/api/v1/employees` | List all employees | Admin, Manager |
| **GET** | `/api/v1/employees/my-team` | View direct reports list | Manager |
| **GET** | `/api/v1/employees/:id` | Get specific employee details | Admin, Manager |
| **GET** | `/api/v1/employees/user/:userId`| Get employee profile by User ID | Authenticated |
| **PUT** | `/api/v1/employees/:id` | Update employee details | Admin |
| **DELETE**| `/api/v1/employees/:id` | Delete employee profile | Admin |

### 📅 Attendance
| Method | Route | Description | Access Control |
| ------ | ----- | ----------- | -------------- |
| **POST** | `/api/v1/attendance/check-in` | Employee self check-in | Employee |
| **POST** | `/api/v1/attendance/check-out`| Employee self check-out | Employee |
| **POST** | `/api/v1/attendance` | Mark manual attendance | Admin |
| **GET** | `/api/v1/attendance` | Get all attendance history | Authenticated |
| **GET** | `/api/v1/attendance/my-today` | Get own today's attendance | Employee |
| **GET** | `/api/v1/attendance/today` | Get today's organization attendance | Admin |
| **GET** | `/api/v1/attendance/team` | Get team attendance records | Manager |
| **GET** | `/api/v1/attendance/:id` | Get specific attendance record | Authenticated |
| **PUT** | `/api/v1/attendance/:id` | Update attendance record | Admin |
| **DELETE**| `/api/v1/attendance/:id` | Delete attendance record | Admin |

### 🏖️ Leave Management
| Method | Route | Description | Access Control |
| ------ | ----- | ----------- | -------------- |
| **POST** | `/api/v1/leaves` | Submit a leave request | Authenticated |
| **GET** | `/api/v1/leaves` | View all leave requests | Authenticated |
| **GET** | `/api/v1/leaves/team` | Get team leave requests | Manager |
| **GET** | `/api/v1/leaves/:id` | View specific leave details | Authenticated |
| **PATCH** | `/api/v1/leaves/:id/status` | Approve or Reject a leave | Admin, Manager |
| **DELETE**| `/api/v1/leaves/:id` | Cancel/Delete a leave request | Authenticated |

### ✅ Task Management
| Method | Route | Description | Access Control |
| ------ | ----- | ----------- | -------------- |
| **POST** | `/api/v1/tasks` | Create new task assignment | Admin, Manager |
| **GET** | `/api/v1/tasks` | View all tasks | Authenticated |
| **GET** | `/api/v1/tasks/manager` | View tasks assigned by manager | Manager |
| **GET** | `/api/v1/tasks/employee` | View tasks assigned to employee | Authenticated |
| **PUT** | `/api/v1/tasks/:id` | Update task details | Authenticated |
| **PATCH** | `/api/v1/tasks/:id/status` | Update task status progress | Authenticated |
| **DELETE**| `/api/v1/tasks/:id` | Delete task assignment | Admin, Manager |

### 🎯 Skills Management
| Method | Route | Description | Access Control |
| ------ | ----- | ----------- | -------------- |
| **POST** | `/api/v1/skills` | Create master skill catalog entry | Admin |
| **GET** | `/api/v1/skills` | Get all master catalog skills | Authenticated |
| **PUT** | `/api/v1/skills/:id` | Update master skill entry | Admin |
| **DELETE**| `/api/v1/skills/:id` | Delete master skill entry | Admin |
| **POST** | `/api/v1/skills/assign` | Assign skill to an employee | Admin, Employee |
| **GET** | `/api/v1/skills/my` | View own skill matrix | Authenticated |
| **GET** | `/api/v1/skills/suggestions` | Get skill suggestions | Authenticated |
| **GET** | `/api/v1/skills/employee/:employeeId` | Get specific employee's skills | Authenticated |
| **PUT** | `/api/v1/skills/assign/:id` | Update assigned skill proficiency | Admin, Employee |
| **DELETE**| `/api/v1/skills/assign/:id` | Remove assigned skill | Admin, Employee |

### 📊 Dashboards & Analytics
| Method | Route | Description | Access Control |
| ------ | ----- | ----------- | -------------- |
| **GET** | `/api/v1/dashboard/admin-summary` | View Admin dashboard overview | Admin |
| **GET** | `/api/v1/dashboard/employee-summary`| View Employee dashboard overview | Authenticated |
| **GET** | `/api/v1/employees/stats` | View global employee statistics | Admin |
| **GET** | `/api/v1/attendance/summary/employee` | Get employee attendance summary | Authenticated |
| **GET** | `/api/v1/attendance/summary/organization` | Get org attendance summary | Admin |
| **GET** | `/api/v1/analytics/*` | Access various chart analytics | Admin, Manager |
| **GET** | `/api/v1/activity/:employeeId`| Get employee activity timeline | Authenticated |

### 📢 Announcements & Notifications
| Method | Route | Description | Access Control |
| ------ | ----- | ----------- | -------------- |
| **POST** | `/api/v1/announcements` | Create new announcement | Admin |
| **GET** | `/api/v1/announcements` | Get global announcements | Authenticated |
| **PUT** | `/api/v1/announcements/:id` | Update announcement | Admin |
| **DELETE**| `/api/v1/announcements/:id` | Delete announcement | Admin |
| **GET** | `/api/v1/notifications` | Get personal notifications | Authenticated |
| **PATCH** | `/api/v1/notifications/read-all`| Mark all notifications as read | Authenticated |
| **PATCH** | `/api/v1/notifications/:id/read`| Mark single notification as read | Authenticated |

### 📁 Documents & Payroll
| Method | Route | Description | Access Control |
| ------ | ----- | ----------- | -------------- |
| **POST** | `/api/v1/documents/upload` | Upload employee document | Authenticated |
| **GET** | `/api/v1/documents/employee/:id`| View employee documents | Authenticated |
| **GET** | `/api/v1/documents/:id/download`| Download specific document | Authenticated |
| **DELETE**| `/api/v1/documents/:id` | Delete specific document | Authenticated |
| **GET** | `/api/v1/payroll/my-slip` | View own generated payslip | Authenticated |
| **GET** | `/api/v1/payroll/team` | View team generated payslips | Admin, Manager |

---

## 🧠 System Architecture

The OrbitHR platform follows a modern, decoupled client-server architecture with a strict separation of concerns.

### Flow Explanation:
1.  **Frontend (Client):** The React Single Page Application (SPA) acts as the user interface. It manages routing via React Router, state using Context API/Custom hooks, and provides immediate visual feedback. It communicates with the backend asynchronously using Axios.
2.  **API Gateway (Server):** An Express.js RESTful API serving as the central engine. It intercepts HTTP requests from the frontend.
3.  **Authentication & Authorization:** Before reaching business logic, requests pass through custom `protect` and `authorize` middlewares. These modules decode the incoming JWT tokens, verify session validity, and confirm if the user's role (Admin, Manager, Employee) permits the requested action.
4.  **Business Logic (Controllers):** Validated requests are routed to specific controllers (e.g., `attendance.controller.js`). These controllers perform complex logic such as calculating leave days, formatting dates, or dynamically aggregating MongoDB pipelines for analytics.
5.  **Database & Storage:** Controllers interact with MongoDB via Mongoose Object Document Mapping (ODM). Relational aspects are handled via embedded documents or ObjectId references (e.g., linking a User to an Employee profile). File uploads (documents) are intercepted by Multer and saved locally to the `/uploads` directory, with paths stored in the DB.


    Controllers -- JSON Response Format --> API
    API -- Formatted Response --> Client
```
