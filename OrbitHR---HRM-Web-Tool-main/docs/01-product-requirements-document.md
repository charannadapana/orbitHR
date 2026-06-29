# OrbitHR Product Requirements Document (PRD)

## 1. Product Overview
OrbitHR is a modern HR management platform for small to medium organizations. It centralizes employee records, attendance, leave management, and skill visibility into a single web application with role-based access for admins and employees.

The product is designed as an academic and portfolio-grade MERN application. The architecture should remain simple, scalable, and easy to explain in interviews, presentations, and project reviews.

## 2. Product Vision
Build a clean, premium HR management system that helps organizations manage workforce operations efficiently while giving visibility into employee skills through a unique Skill Matrix.

## 3. Problem Statement
Many organizations still manage HR data using spreadsheets, chat messages, emails, or disconnected systems. This causes:

- Employee records being difficult to maintain
- Attendance data becoming inconsistent
- Leave approvals lacking visibility
- Skill information not being structured or measurable
- Decision-making relying on manual work instead of dashboards

OrbitHR solves this by offering one centralized platform for day-to-day HR workflows.

## 4. Objectives
### Primary Objectives
- Centralize employee and HR operations
- Reduce manual effort in attendance and leave tracking
- Provide role-based dashboards for admins and employees
- Visualize workforce skills using a Skill Matrix
- Maintain a clean codebase and explainable architecture

### Secondary Objectives
- Build a strong portfolio project with practical business value
- Demonstrate full-stack engineering and product design thinking
- Keep implementation beginner-friendly without overengineering

## 5. Target Users
### Admin
- HR manager
- Office administrator
- Team operations owner

### Employee
- Staff member who needs to view profile, attendance, leaves, and assigned skills

## 6. User Roles
### Admin
- Manage employees
- View organization-wide dashboards
- Track attendance
- Review leave requests
- Manage skills and employee proficiency

### Employee
- View personal dashboard
- View personal attendance
- Apply for leave
- View leave history
- View personal skills and profile

## 7. Scope
### In Scope
- JWT authentication
- Admin and employee roles
- Employee CRUD management
- Attendance tracking
- Leave request and approval flow
- Skill Matrix with proficiency levels
- Admin and employee dashboards
- Responsive dark-first UI

### Out of Scope for MVP
- Payroll
- Notifications
- Email automation
- Biometric attendance
- File/document uploads
- Multi-branch or multi-tenant architecture
- Advanced approval chains

## 8. Core User Stories
### Authentication
- As an admin, I want to log in securely so I can manage the platform.
- As an employee, I want to log in securely so I can access only my information.

### Employee Management
- As an admin, I want to create employee profiles so employee records are centralized.
- As an admin, I want to update or deactivate employee records when details change.
- As an admin, I want to delete employee records when needed.

### Attendance
- As an admin, I want to record or review attendance so daily workforce presence is visible.
- As an employee, I want to view my attendance history so I can track my attendance status.

### Leave
- As an employee, I want to request leave so I can submit absence plans formally.
- As an admin, I want to approve or reject leave so leave operations are controlled.

### Skills
- As an admin, I want to assign skills and proficiency levels to employees so team capabilities are measurable.
- As an employee, I want to view my assigned skills so I understand my tracked competencies.

### Dashboard
- As an admin, I want to see organization statistics and trends so I can make informed decisions.
- As an employee, I want to see my attendance, leave, and skill summaries in one place.

## 9. Functional Requirements
### Authentication
- Secure login using email and password
- Password hashing with bcrypt
- JWT token generation and validation
- Protected routes based on role

### Employee Management
- Create employee profile
- View employee list
- Search and filter employees
- Update employee information
- Delete or deactivate employee

### Attendance Management
- Mark attendance by date
- Store check-in and check-out times
- Track attendance status such as present, absent, late, half-day, and on-leave
- View employee attendance history

### Leave Management
- Apply for leave
- View leave history
- Approve or reject leave requests
- Track leave type and status

### Skill Matrix
- Maintain a master list of skills
- Assign skills to employees
- Track skill proficiency level
- View top skills and employee skill distribution

### Dashboards
- Admin dashboard with totals, trends, and top skills
- Employee dashboard with personal attendance, leave, and skills

## 10. Non-Functional Requirements
- Simple MVC backend structure
- RESTful API design
- Modular frontend and backend code
- Responsive layout for desktop and tablet at minimum
- Dark-first visual design
- Clean validation and error handling
- Clear naming conventions
- Easy explainability for academic review

## 11. Success Criteria
- Admin can manage employees without touching the database directly
- Employees can view their own attendance and leave status
- Admin can review pending leave requests quickly
- Skill Matrix data is visible and useful in dashboard insights
- The codebase is modular enough to extend without major refactoring

## 12. Risks and Assumptions
### Assumptions
- Organization size is small to medium
- Only two user roles are required for MVP
- Attendance is tracked manually through the application

### Risks
- Scope may expand into payroll or notifications too early
- Role-based access may become messy without consistent middleware
- Dashboard analytics may become harder if data models are not normalized enough

## 13. Product Design Direction
- Dark-first interface
- Black or near-black base colors
- White, gray, and soft cyan as subtle accents
- Minimal, premium SaaS feel
- Sidebar-based dashboard layout
- Clean card-based information grouping
