# OrbitHR System Design Document

## 1. Architecture Overview
OrbitHR follows a standard full-stack MERN architecture:

- Frontend: React with Vite and Tailwind CSS
- Backend: Node.js with Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT with bcrypt
- Visualization: Recharts or Chart.js

The design goal is to keep the architecture simple, modular, and explainable.

## 2. Architectural Style
- Monolithic application for backend
- Feature-driven frontend
- MVC pattern in backend
- REST API communication
- Role-based access control

This approach is appropriate because the project is academic and portfolio-level, and does not need the overhead of microservices or event-driven systems.

## 3. High-Level Components

### Frontend
- Login and protected routing
- Admin dashboard views
- Employee self-service views
- Shared layout and reusable UI components

### Backend
- Routes
- Controllers
- Models
- Middleware
- Utilities and optional services

### Database
- Users
- Employees
- Attendance
- Leaves
- Skills
- EmployeeSkills

## 4. High-Level Data Flow
1. User opens the frontend application.
2. User logs in using email and password.
3. Frontend sends request to backend API.
4. Backend validates credentials using bcrypt.
5. Backend generates JWT on success.
6. Frontend stores token and attaches it to protected requests.
7. Middleware verifies token and role.
8. Controllers process the request.
9. Mongoose reads or writes MongoDB data.
10. Backend sends JSON response.
11. Frontend updates cards, tables, forms, and charts.

## 5. Request Lifecycle

### Example: Create Employee
1. Admin submits employee form.
2. Frontend validates required fields.
3. Frontend calls `POST /employees`.
4. Auth middleware confirms admin role.
5. Controller validates payload.
6. Model saves employee document.
7. Backend returns success response.
8. Frontend refreshes employee list.

### Example: Employee Applies for Leave
1. Employee fills leave form.
2. Frontend sends request to `POST /leaves`.
3. Auth middleware identifies logged-in employee.
4. Controller calculates leave duration and stores request.
5. Leave record is created with `pending` status.
6. Response returns success.
7. Employee dashboard shows updated leave summary.

## 6. Role-Based Access Design

### Admin Access
- Full access to employee, attendance, leave, skill, and dashboard modules

### Employee Access
- Access only to own profile, own attendance, own leave, own skills, and employee dashboard

### Authorization Pattern
- `authMiddleware` verifies JWT
- `roleMiddleware` checks allowed role
- Resource-level checks ensure employees cannot access another employee's records

## 7. Dashboard Analytics Flow
The dashboard should not directly query multiple collections from the frontend. Instead:

1. Frontend requests a summary endpoint.
2. Backend aggregates data from required collections.
3. Backend formats chart-ready responses.
4. Frontend only renders the returned data.

This keeps frontend code simple and avoids over-fetching.

## 8. Suggested Deployment Design

### Frontend
- Vercel or Netlify

### Backend
- Render, Railway, or similar Node-friendly hosting

### Database
- MongoDB Atlas

## 9. Security Design
- Password hashing with bcrypt
- JWT-based route protection
- Role-based authorization
- Basic input validation
- Hide password in model responses
- Avoid exposing internal fields unnecessarily

## 10. Scalability Approach
The project should scale through modularity rather than complexity.

Recommended practices:
- Keep modules isolated
- Use reusable middleware
- Use service logic only where needed
- Avoid premature abstraction
- Normalize skill-related data enough for analytics

## 11. Design Tradeoffs

### Why MVC
- Easy to explain
- Common in Express applications
- Keeps route, controller, and model responsibilities clear

### Why REST
- Simple and widely understood
- Easy to test using Postman
- Suitable for React dashboard apps

### Why MongoDB
- Flexible schema
- Easy integration with MERN stack
- Practical for rapid academic project development
