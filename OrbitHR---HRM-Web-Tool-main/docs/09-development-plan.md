# OrbitHR Application Development Plan (Phase by Phase)

## 1. Delivery Strategy
Build OrbitHR phase by phase so that each stage produces a visible, usable part of the application. Each phase should end with something that can be tested, reviewed, and demonstrated before moving to the next one.

Recommended build order:
1. Foundation and project setup
2. Core UI shell and branding
3. Authentication and access control
4. Employee management
5. Attendance management
6. Leave management
7. Skill Matrix
8. Dashboard insights
9. Polish, hardening, and deployment

## 2. Phase 1: Foundation and Project Setup
### Goal
Prepare the repository, tooling, backend server, frontend app, and database connection.

### Backend tasks
- Initialize Express application
- Setup MongoDB connection with Mongoose
- Add environment variable handling
- Add base middleware for JSON, CORS, and errors
- Create versioned API structure under `/api/v1`

### Frontend tasks
- Initialize React app with Vite
- Configure Tailwind CSS
- Setup React Router
- Setup Axios instance
- Create base app entry and route layout

### Deliverables
- Running frontend and backend locally
- Database connection working
- Empty route structure prepared

## 3. Phase 2: Core UI Shell and Brand System
### Goal
Create the shared visual system of the application before feature screens are built.

### Tasks
- Build top navigation layout
- Add global page container and app shell
- Add reusable card, button, input, badge, and table components
- Integrate `Prism` as the site-wide background language
- Create `GlobalPrismBackground` and `BackgroundOverlay`
- Use a stronger Prism treatment on the landing page and a more muted version inside the app
- Build LandingPage and LoginPage shells

### Deliverables
- Working public landing page
- Working top nav layout
- Shared design tokens and reusable UI components
- Site-wide background system ready for all screens

## 4. Phase 3: Authentication and Access Control
### Goal
Secure the application and separate admin and employee experiences.

### Backend tasks
- Create `User` model
- Hash passwords with bcrypt
- Create login endpoint
- Generate JWT tokens
- Add authentication middleware
- Add role middleware for admin and employee access

### Frontend tasks
- Build login form and validation
- Store auth token and user metadata
- Create `AuthContext`
- Add protected routes
- Add role-based route handling
- Redirect users to correct dashboard after login

### Deliverables
- Admin login working
- Employee login working
- Protected route flow working

## 5. Phase 4: Employee Management Module
### Goal
Enable admins to manage employee records and profiles.

### Backend tasks
- Create `Employee` model
- Build create, read, update, and delete endpoints
- Add request validation
- Add search, filter, and pagination support

### Frontend tasks
- Build employees list page
- Build employee form page
- Build employee detail page
- Add search and filters in top header/page controls
- Add status badges and actions

### Deliverables
- Admin can create, edit, view, and remove employees
- Employee data is visible in structured tables and forms

## 6. Phase 5: Attendance Management Module
### Goal
Track and review employee attendance in a simple, explainable way.

### Backend tasks
- Create `Attendance` model
- Add daily attendance creation endpoint
- Add list and filter endpoints
- Add monthly summary endpoint
- Prevent duplicate attendance records per employee per day

### Frontend tasks
- Build admin attendance page
- Build employee attendance history page
- Add status filters and date filters
- Show monthly summary in a compact analytics card or mini chart

### Deliverables
- Attendance records can be created and reviewed
- Employees can view their own attendance history

## 7. Phase 6: Leave Management Module
### Goal
Allow employees to request leave and admins to review it.

### Backend tasks
- Create `Leave` model
- Add leave request endpoint
- Add leave list endpoint
- Add approve/reject endpoint
- Compute leave day count

### Frontend tasks
- Build leave request form
- Build employee leave history page
- Build admin leave review page
- Add status badges and decision actions

### Deliverables
- Employees can apply for leave
- Admins can approve or reject requests
- Leave status updates appear in the UI

## 8. Phase 7: Skill Matrix Module
### Goal
Implement the distinguishing feature of OrbitHR by tracking employee skill proficiency.

### Backend tasks
- Create `Skill` model
- Create `EmployeeSkill` model
- Add skill CRUD endpoints
- Add employee-skill assignment endpoints
- Add validation for proficiency level range

### Frontend tasks
- Build skill matrix page
- Build skill assignment flow
- Build employee skills page
- Add level badges from beginner to expert
- Add employee and category filters

### Deliverables
- Admin can manage master skills
- Admin can assign skills to employees
- Employees can view their skill profile

## 9. Phase 8: Dashboard Insights Module
### Goal
Turn operational data into a useful dashboard for both roles.

### Backend tasks
- Build admin summary aggregation endpoint
- Build employee summary endpoint
- Format chart-ready attendance, leave, and skill data

### Frontend tasks
- Build admin dashboard cards and charts
- Build employee dashboard cards and charts
- Use Recharts or Chart.js for trends and summaries
- Keep cards readable over the global Prism background by using solid elevated surfaces

### Deliverables
- Admin dashboard with employee, attendance, leave, and top-skill insights
- Employee dashboard with personal summaries

## 10. Phase 9: Product Polish and Consistency
### Goal
Make the application feel production-ready without increasing architectural complexity.

### Tasks
- Refine spacing and typography
- Tune Prism intensity across public and app screens
- Improve loading, empty, and error states
- Improve mobile navigation behavior
- Add confirmation dialogs where needed
- Review all page headers for consistent search/action patterns

### Deliverables
- Visual consistency across all modules
- Better perceived quality and usability

## 11. Phase 10: Hardening, Testing, and Deployment
### Goal
Stabilize the application and prepare it for demo, review, and portfolio presentation.

### Tasks
- Validate all request payloads
- Review route permissions carefully
- Improve backend error responses
- Seed demo data
- Manually test all user flows
- Prepare screenshots and walkthrough notes
- Deploy frontend and backend
- Connect MongoDB Atlas

### Deliverables
- Demo-ready application
- Stable deployment
- Portfolio-ready documentation and screenshots

## 12. Recommended Workflow Inside Each Phase
For each module or screen, use this order:

1. Define data model and business rules
2. Build backend endpoint and validation
3. Test API in Postman or Thunder Client
4. Build frontend service layer
5. Build page UI and components
6. Add loading, empty, and error states
7. Verify role access and route behavior
8. Review visual quality against the design system

## 13. Phase Completion Checklist
A phase should be considered complete only when:
- Main flow works end to end
- API and UI are both connected
- Errors are handled reasonably
- Role restrictions are tested
- The page matches the visual system
- The feature is demonstrable without explanation-heavy workarounds

## 14. Suggested Timeline
- Phase 1 to Phase 3: 2 to 3 days
- Phase 4 to Phase 7: 4 to 5 days
- Phase 8 to Phase 10: 2 to 3 days

A focused MVP can reasonably be completed in 8 to 10 working days.
