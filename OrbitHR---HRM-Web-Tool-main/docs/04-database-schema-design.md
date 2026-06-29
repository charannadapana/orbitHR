# OrbitHR Database Schema Design

## 1. Database Approach
MongoDB will be used with Mongoose. Collections are designed to remain simple, readable, and compatible with dashboard analytics.

## 2. Collections Overview
- `users`
- `employees`
- `attendances`
- `leaves`
- `skills`
- `employeeSkills`

## 3. Collection Details

### 3.1 Users
Purpose: authentication and platform access

| Field | Type | Required | Notes |
|---|---|---|---|
| name | String | Yes | Display name |
| email | String | Yes | Unique login email |
| password | String | Yes | Hashed using bcrypt |
| role | String | Yes | `admin` or `employee` |
| employeeId | ObjectId | No | Links login to employee profile |
| isActive | Boolean | Yes | Default true |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

### 3.2 Employees
Purpose: employee master records

| Field | Type | Required | Notes |
|---|---|---|---|
| employeeCode | String | Yes | Unique employee code |
| firstName | String | Yes | Employee first name |
| lastName | String | Yes | Employee last name |
| email | String | Yes | Contact email |
| phone | String | No | Contact number |
| department | String | Yes | Department name |
| designation | String | Yes | Job title |
| joiningDate | Date | Yes | Date of joining |
| employmentType | String | No | Full-time, part-time, contract |
| status | String | Yes | `active` or `inactive` |
| managerName | String | No | Simple manager reference for MVP |
| address | String | No | Address text |
| dateOfBirth | Date | No | Personal info |
| gender | String | No | Optional |
| profileImage | String | No | Optional future field |
| createdBy | ObjectId | No | Admin creator |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

### 3.3 Attendances
Purpose: daily attendance data

| Field | Type | Required | Notes |
|---|---|---|---|
| employee | ObjectId | Yes | Reference to employee |
| date | Date | Yes | Attendance date |
| status | String | Yes | `present`, `absent`, `late`, `half-day`, `on-leave` |
| checkIn | String | No | Time string for MVP |
| checkOut | String | No | Time string for MVP |
| remarks | String | No | Optional notes |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

Recommended constraint:
- Unique compound index on `employee + date`

### 3.4 Leaves
Purpose: leave request workflow

| Field | Type | Required | Notes |
|---|---|---|---|
| employee | ObjectId | Yes | Reference to employee |
| leaveType | String | Yes | `casual`, `sick`, `earned`, `unpaid` |
| startDate | Date | Yes | Leave start |
| endDate | Date | Yes | Leave end |
| days | Number | Yes | Calculated duration |
| reason | String | Yes | Employee explanation |
| status | String | Yes | `pending`, `approved`, `rejected` |
| reviewedBy | ObjectId | No | Admin who reviewed |
| reviewedAt | Date | No | Review time |
| adminComment | String | No | Review remark |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

### 3.5 Skills
Purpose: master skill definitions

| Field | Type | Required | Notes |
|---|---|---|---|
| name | String | Yes | Skill name |
| category | String | No | Frontend, Backend, Soft Skill, etc. |
| description | String | No | Short summary |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

### 3.6 EmployeeSkills
Purpose: skill matrix mapping between employees and skills

| Field | Type | Required | Notes |
|---|---|---|---|
| employee | ObjectId | Yes | Reference to employee |
| skill | ObjectId | Yes | Reference to skill |
| level | Number | Yes | Proficiency from 1 to 5 |
| notes | String | No | Optional assessment note |
| lastAssessedAt | Date | No | Assessment date |
| createdAt | Date | Auto | Timestamp |
| updatedAt | Date | Auto | Timestamp |

Recommended constraint:
- Unique compound index on `employee + skill`

## 4. Relationship Summary
- One `user` may link to one `employee`
- One `employee` can have many `attendances`
- One `employee` can have many `leaves`
- One `employee` can have many `employeeSkills`
- One `skill` can belong to many `employeeSkills`

## 5. Design Notes

### Why separate `users` and `employees`
- Keeps authentication concerns isolated
- Avoids mixing HR profile data with login data
- Makes role management cleaner

### Why separate `employeeSkills`
- Better for many-to-many relationships
- Easier to query top skills and skill distribution
- More scalable than embedding everything in employee documents

## 6. Suggested Mongoose Conventions
- Use timestamps in every schema
- Use enums for status and role fields
- Hide password using schema select rules or response sanitization
- Add indexes for commonly filtered fields such as email, employeeCode, department, and status
