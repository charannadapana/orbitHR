# OrbitHR API Design

## 1. API Style
- REST API
- JSON request and response format
- Versioned base path: `/api/v1`
- JWT-protected endpoints for authenticated access

## 2. Standard Response Format

### Success
```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

### Error
```json
{
  "success": false,
  "message": "Error message"
}
```

## 3. Authentication Endpoints

### POST `/auth/login`
Purpose: authenticate user and issue JWT

Request:
```json
{
  "email": "admin@orbithr.com",
  "password": "123456"
}
```

Response:
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "u1",
    "name": "Admin User",
    "email": "admin@orbithr.com",
    "role": "admin"
  }
}
```

### POST `/auth/register-admin`
Purpose: bootstrap first admin account

### GET `/auth/me`
Purpose: fetch current authenticated user

## 4. Employee Endpoints

### GET `/employees`
Purpose: list employees

Query params:
- `search`
- `department`
- `status`
- `page`
- `limit`

Access:
- Admin only

### GET `/employees/:id`
Purpose: get employee detail

Access:
- Admin
- Same employee linked to this profile

### POST `/employees`
Purpose: create employee

Request:
```json
{
  "firstName": "Asha",
  "lastName": "Rao",
  "email": "asha@company.com",
  "phone": "9999999999",
  "department": "Engineering",
  "designation": "Frontend Developer",
  "joiningDate": "2026-04-01",
  "employmentType": "Full-time"
}
```

### PUT `/employees/:id`
Purpose: update employee

### DELETE `/employees/:id`
Purpose: delete or soft-delete employee

## 5. Attendance Endpoints

### GET `/attendance`
Purpose: list attendance records

Query params:
- `employeeId`
- `month`
- `date`
- `status`

Access:
- Admin sees all
- Employee sees only own attendance

### POST `/attendance`
Purpose: create attendance record

Request:
```json
{
  "employeeId": "emp1",
  "date": "2026-04-06",
  "status": "present",
  "checkIn": "09:15",
  "checkOut": "18:10",
  "remarks": "On time"
}
```

### PUT `/attendance/:id`
Purpose: update attendance record

### GET `/attendance/:employeeId/monthly-summary`
Purpose: get monthly summary for one employee

Query:
- `month=2026-04`

Response:
```json
{
  "success": true,
  "data": {
    "present": 20,
    "absent": 2,
    "late": 3,
    "halfDay": 1
  }
}
```

## 6. Leave Endpoints

### GET `/leaves`
Purpose: list leave requests

Access:
- Admin sees all
- Employee sees own requests

### POST `/leaves`
Purpose: create leave request

Request:
```json
{
  "leaveType": "sick",
  "startDate": "2026-04-10",
  "endDate": "2026-04-11",
  "reason": "Medical rest"
}
```

### GET `/leaves/:id`
Purpose: get leave detail

### PUT `/leaves/:id/status`
Purpose: approve or reject leave request

Request:
```json
{
  "status": "approved",
  "adminComment": "Approved"
}
```

## 7. Skill Endpoints

### GET `/skills`
Purpose: list all skills

### POST `/skills`
Purpose: create skill

Request:
```json
{
  "name": "React",
  "category": "Frontend",
  "description": "UI library for web apps"
}
```

### PUT `/skills/:id`
Purpose: update skill

### DELETE `/skills/:id`
Purpose: delete skill

## 8. Employee Skill Matrix Endpoints

### GET `/employee-skills`
Purpose: list employee skill mappings

Query params:
- `employeeId`
- `skillId`
- `category`

### POST `/employee-skills`
Purpose: assign skill to employee

Request:
```json
{
  "employeeId": "emp1",
  "skillId": "skill1",
  "level": 4,
  "notes": "Can build reusable dashboards"
}
```

### PUT `/employee-skills/:id`
Purpose: update assigned skill level

### DELETE `/employee-skills/:id`
Purpose: remove skill assignment

## 9. Dashboard Endpoints

### GET `/dashboard/admin`
Purpose: return admin dashboard insights

Response:
```json
{
  "success": true,
  "data": {
    "totalEmployees": 42,
    "activeEmployees": 39,
    "todayPresent": 34,
    "pendingLeaves": 5,
    "topSkills": [
      { "skill": "React", "count": 12 },
      { "skill": "Node.js", "count": 9 }
    ],
    "attendanceTrend": [
      { "date": "2026-04-01", "present": 30 },
      { "date": "2026-04-02", "present": 32 }
    ]
  }
}
```

### GET `/dashboard/employee`
Purpose: return personal dashboard insights

Response:
```json
{
  "success": true,
  "data": {
    "attendanceSummary": {
      "present": 18,
      "absent": 1,
      "late": 2
    },
    "leaveSummary": {
      "pending": 1,
      "approved": 3
    },
    "skills": [
      { "skill": "MongoDB", "level": 3 }
    ]
  }
}
```

## 10. Validation and Security Notes
- Protect all non-auth routes with JWT middleware
- Use role middleware for admin-only actions
- Validate request body fields before controller logic
- Sanitize responses to avoid leaking password or internal metadata
- Use pagination on large list endpoints
