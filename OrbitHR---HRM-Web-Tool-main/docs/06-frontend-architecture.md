# OrbitHR Frontend Architecture

## 1. Frontend Goals
- Keep the frontend modular and beginner-friendly
- Use reusable components and layouts
- Separate public, admin, and employee flows clearly
- Make the UI look premium without becoming visually noisy
- Use a top navigation layout instead of a sidebar
- Reuse the Prism visual language across the website in a controlled way

## 2. Core Stack
- React with Vite
- Tailwind CSS
- React Router
- Axios for API calls
- Recharts or Chart.js for charts
- `ogl` for the Prism animated background effect

## 3. Architectural Principles
- Feature-based folder organization
- Shared UI component library
- Layout reuse through app shell
- Simple auth state through context
- API services separated from components
- Public marketing shell separate from authenticated app shell
- Global visual consistency through shared background wrappers and overlays

## 4. Main Frontend Layers

### Pages
Top-level route screens such as landing page, dashboards, employee list, or leave pages.

### Components
Reusable UI and module-specific building blocks such as tables, cards, forms, navigation, hero visuals, and background wrappers.

### Services
API request handlers responsible for backend communication.

### Context
Global auth state and logged-in user data.

### Routes
Protected and role-based route wrappers.

## 5. Suggested Pages

### Public Pages
- LandingPage
- LoginPage
- UnauthorizedPage
- NotFoundPage

### Admin Pages
- AdminDashboardPage
- EmployeesPage
- EmployeeFormPage
- EmployeeDetailsPage
- AttendancePage
- LeaveManagementPage
- SkillMatrixPage
- ProfilePage

### Employee Pages
- EmployeeDashboardPage
- MyAttendancePage
- MyLeavesPage
- MySkillsPage
- MyProfilePage

## 6. Shared Components

### Layout Components
- PublicNavbar
- AppTopNav
- TopSearchBar
- UserMenu
- PageHeader
- AppShell
- BackgroundShell
- BackgroundOverlay

### Background Components
- Prism
- GlobalPrismBackground
- HeroSection
- HeroStats
- HeroCTAs

### UI Components
- Button
- Input
- Select
- TextArea
- Card
- Badge
- Modal
- Table
- Loader
- EmptyState
- ConfirmDialog

### Feature Components
- EmployeeTable
- EmployeeForm
- AttendanceTable
- LeaveTable
- LeaveForm
- SkillMatrixTable
- DashboardStatCard
- AttendanceChart
- SkillsChart

## 7. Routing Design

```txt
/
/login

/admin/dashboard
/admin/employees
/admin/employees/new
/admin/employees/:id
/admin/employees/:id/edit
/admin/attendance
/admin/leaves
/admin/skills
/admin/profile

/employee/dashboard
/employee/attendance
/employee/leaves
/employee/skills
/employee/profile
```

## 8. Authentication Flow
1. User logs in from LoginPage.
2. Token and user data are stored in auth state.
3. Protected routes verify token presence.
4. Role-based route wrapper checks if path matches user role.
5. Unauthorized users are redirected.

## 9. State Management Strategy
- Use `AuthContext` for authentication state
- Use local component state for most forms and filters
- Use custom hooks for repeated logic
- Avoid Redux unless the project grows beyond current scope

## 10. API Layer Structure
Suggested service files:

- `authService.js`
- `employeeService.js`
- `attendanceService.js`
- `leaveService.js`
- `skillService.js`
- `dashboardService.js`

Each service should:
- Call a dedicated endpoint
- Return parsed response data
- Avoid UI-specific logic

## 11. Global Background Strategy
The website should reuse the Prism background style as a consistent brand element across public and app screens.

Recommended usage:
- Full-intensity animated Prism on the public landing hero
- Lower-intensity, darker, more muted Prism layer for login and authenticated app shells
- Strong overlay and surface cards above the background to preserve readability
- Avoid placing charts, tables, and form fields directly on the raw effect without a solid surface layer

Recommended structure:
- `GlobalPrismBackground` renders behind the main page shell
- `BackgroundOverlay` darkens and softens the animation
- Content containers use semi-opaque surfaces with border and blur where needed

Implementation guidance:
- Landing page: most visible Prism treatment
- Login page: medium visibility Prism treatment
- Dashboard and CRUD screens: subtle Prism treatment behind the app shell, not behind each card
- If performance becomes an issue, disable animation on low-power devices or reduce effect intensity

## 12. UI Design System Direction
- Near-black background
- Elevated charcoal cards
- Thin low-contrast borders
- Muted cyan accent for active states
- Strong spacing and typography hierarchy
- Compact enterprise-style dashboard composition
- Motion concentrated in background layers and key transitions, not every component

## 13. Responsive Design Notes
- Top nav collapses into a menu button on smaller screens
- Search bar can move below the nav row on tablet/mobile
- Tables should allow horizontal scrolling when needed
- Dashboard cards should stack cleanly on tablet/mobile
- Forms should switch from two-column to one-column on small screens
- Background effect should remain visually subtle and not reduce contrast on mobile
