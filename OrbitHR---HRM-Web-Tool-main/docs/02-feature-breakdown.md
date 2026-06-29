# OrbitHR Feature Breakdown

## 1. MVP Features

### Authentication and Authorization
- Login with email and password
- Password hashing using bcrypt
- JWT issuance after successful login
- Role-based route and API protection
- Admin and employee role separation

### Employee Management
- Create employee
- View all employees
- Search and filter employees
- Edit employee details
- Delete or deactivate employee
- Link employee profile with login account

### Attendance Management
- Mark attendance for employees
- Track status for each day
- Store check-in and check-out time
- View attendance by employee and date
- Monthly attendance summary

### Leave Management
- Employee leave request submission
- Admin leave request review
- Approve or reject leave requests
- Leave status tracking
- Leave history for employees

### Dashboard
- Admin dashboard summary cards
- Employee dashboard summary cards
- Attendance trend chart
- Leave status chart
- Top skills overview

### Skill Matrix
- Manage master skill list
- Assign skills to employees
- Set proficiency levels
- View employee skill records
- View skill distribution across employees

### UI/UX
- Dark-first design system
- Responsive sidebar dashboard layout
- Tables, forms, cards, badges, and charts
- Optional light mode later

## 2. Future Enhancements

### HR Operations
- Department management
- Designation management
- Holiday calendar
- Shift management
- Attendance import/export

### Employee Experience
- Self check-in and check-out
- Profile photo upload
- Notifications and reminders
- Manager comments on leave requests

### Analytics
- Department-wise performance insights
- Skill gap analysis
- Leave trend forecasting
- Attendance anomaly detection

### Platform Enhancements
- Email integration
- Audit logs
- PDF/CSV reports
- Multi-tenant support
- Role expansion for managers
- Activity timeline

## 3. Recommended MVP Boundaries
To keep OrbitHR clean and explainable, the first version should intentionally avoid:

- Payroll
- Real-time notifications
- Complex approval chains
- Microservices
- Socket-based live updates
- AI recommendations
- Advanced workflow engines

## 4. Priority Classification

### Must Have
- Authentication
- Employee CRUD
- Attendance tracking
- Leave request and approval
- Role-based dashboards
- Skill Matrix basics

### Should Have
- Search and filtering
- Monthly summaries
- Dashboard charts
- Responsive UI

### Nice to Have
- Light mode
- Exports
- Notifications
- Manager role

## 5. Reasoning for MVP Selection
The MVP includes the minimum set of features needed to make OrbitHR feel like a complete HR platform while still staying within academic and portfolio scope. The Skill Matrix is the differentiating feature, so it is included in the first version rather than being pushed to a later phase.
