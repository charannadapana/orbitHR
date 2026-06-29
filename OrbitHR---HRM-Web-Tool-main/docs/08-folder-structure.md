# OrbitHR Folder Structure

## 1. Recommended Project Layout

```txt
OrbitHR/
  frontend/
  backend/
  docs/
```

## 2. Frontend Structure

```txt
frontend/
  src/
    api/
      axios.js
    app/
      router.jsx
      providers.jsx
    assets/
    components/
      background/
        GlobalPrismBackground.jsx
        BackgroundOverlay.jsx
        Prism.jsx
        Prism.css
      hero/
        HeroSection.jsx
        HeroStats.jsx
        HeroCTAs.jsx
      layout/
        AppShell.jsx
        PublicNavbar.jsx
        AppTopNav.jsx
        TopSearchBar.jsx
        UserMenu.jsx
        PageHeader.jsx
      ui/
        Button.jsx
        Input.jsx
        Select.jsx
        Modal.jsx
        Badge.jsx
        Card.jsx
        Table.jsx
        Loader.jsx
        EmptyState.jsx
    context/
      AuthContext.jsx
    features/
      auth/
        pages/
          LoginPage.jsx
        services/
          authService.js
      public/
        pages/
          LandingPage.jsx
      employees/
        components/
          EmployeeForm.jsx
          EmployeeTable.jsx
        pages/
          EmployeesPage.jsx
          EmployeeDetailsPage.jsx
          EmployeeFormPage.jsx
        services/
          employeeService.js
      attendance/
        components/
          AttendanceTable.jsx
        pages/
          AttendancePage.jsx
          MyAttendancePage.jsx
        services/
          attendanceService.js
      leaves/
        components/
          LeaveTable.jsx
          LeaveForm.jsx
        pages/
          LeaveManagementPage.jsx
          MyLeavesPage.jsx
        services/
          leaveService.js
      skills/
        components/
          SkillMatrixTable.jsx
        pages/
          SkillMatrixPage.jsx
          MySkillsPage.jsx
        services/
          skillService.js
      dashboard/
        components/
          DashboardStatCard.jsx
          AttendanceChart.jsx
          SkillsChart.jsx
        pages/
          AdminDashboardPage.jsx
          EmployeeDashboardPage.jsx
        services/
          dashboardService.js
      profile/
        pages/
          ProfilePage.jsx
    hooks/
      useAuth.js
      useRole.js
    pages/
      UnauthorizedPage.jsx
      NotFoundPage.jsx
    routes/
      ProtectedRoute.jsx
      RoleRoute.jsx
    utils/
      constants.js
      formatDate.js
    App.jsx
    main.jsx
  package.json
  vite.config.js
  tailwind.config.js
```

## 3. Backend Structure

```txt
backend/
  src/
    config/
      db.js
      env.js
    controllers/
      auth.controller.js
      employee.controller.js
      attendance.controller.js
      leave.controller.js
      skill.controller.js
      employeeSkill.controller.js
      dashboard.controller.js
    middlewares/
      auth.middleware.js
      role.middleware.js
      error.middleware.js
      validate.middleware.js
    models/
      User.js
      Employee.js
      Attendance.js
      Leave.js
      Skill.js
      EmployeeSkill.js
    routes/
      auth.routes.js
      employee.routes.js
      attendance.routes.js
      leave.routes.js
      skill.routes.js
      employeeSkill.routes.js
      dashboard.routes.js
    services/
      dashboard.service.js
    utils/
      jwt.js
      response.js
      calculateLeaveDays.js
    validators/
      auth.validator.js
      employee.validator.js
      attendance.validator.js
      leave.validator.js
      skill.validator.js
      employeeSkill.validator.js
    app.js
    server.js
  .env
  package.json
```

## 4. Why This Structure Works
- Clear separation between frontend and backend
- Feature-oriented frontend for maintainability
- MVC backend for readability
- Easy to explain in academic and interview settings
- Scales well without introducing unnecessary complexity
- Supports a reusable site-wide background system without mixing visual logic into feature code

## 5. Documentation Structure

```txt
docs/
  01-product-requirements-document.md
  02-feature-breakdown.md
  03-system-design-document.md
  04-database-schema-design.md
  05-api-design.md
  06-frontend-architecture.md
  07-ui-ux-wireframes.md
  08-folder-structure.md
  09-development-plan.md
```
