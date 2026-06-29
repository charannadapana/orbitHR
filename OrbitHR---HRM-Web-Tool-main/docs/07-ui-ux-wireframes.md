# OrbitHR UI/UX Wireframes

## 1. Design Direction
- Dark-first interface
- Premium enterprise dashboard feel
- Minimal, clean, and high-contrast hierarchy
- Limited accent usage with soft cyan
- Rounded cards, clean spacing, subtle borders
- Top navigation layout instead of a sidebar
- Public landing hero uses an animated Prism background

## 2. Global App Layout

```txt
 -------------------------------------------------------------------------------
| OrbitHR | Dashboard | Employees | Attendance | Leaves | Skills | Profile      |
|------------------------------------------------------[ Search ] [ User Menu ]-|
| Page Title / Breadcrumbs                                      [ Actions ]      |
|-------------------------------------------------------------------------------|
| Main Content Area                                                              |
| Cards / Tables / Charts / Forms                                                |
|                                                                               |
 -------------------------------------------------------------------------------
```

### Layout Notes
- Navigation remains fixed at the top for all authenticated screens
- Search bar sits on the right side of the top navigation area
- Main content starts below the navigation with consistent page padding
- On smaller screens, nav links can collapse into a menu button while search moves below the nav row if needed

## 3. Public Landing Hero

```txt
 -------------------------------------------------------------------------------
| OrbitHR | Features | Product | About | Login        [ Search ] [ Get Started ]|
|-------------------------------------------------------------------------------|
| ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Prism Animated Background ~~~~~~~~~~~~~~~~~ |
|                                                                               |
|                     Modern HR management for growing teams                    |
|              Employee records, attendance, leaves, and skill insights         |
|                                                                               |
|                  [ Start Demo ]          [ View Features ]                    |
|                                                                               |
|                    Small trust stats / product highlights row                 |
|                                                                               |
 -------------------------------------------------------------------------------
```

### Hero Notes
- `Prism` should sit as the full hero background layer
- Text content should sit above it with a dark overlay for readability
- Use the effect only in the landing hero, not across all app pages
- Keep motion subtle enough to feel premium, not distracting

## 4. Login Screen

```txt
 ----------------------------------------------------
| OrbitHR Logo                          Dark Toggle  |
|                                                    |
|            Welcome back to OrbitHR                 |
|        Modern HR management for growing teams      |
|                                                    |
|         [ Email Input                        ]     |
|         [ Password Input                     ]     |
|         [ Sign In Button                     ]     |
|                                                    |
|      Small helper text / demo credentials          |
 ----------------------------------------------------
```

## 5. Admin Dashboard

```txt
 -------------------------------------------------------------------------------
| Dashboard Overview                          [ Search ] [ Date Filter ]         |
|-------------------------------------------------------------------------------|
| [Total Employees] [Present Today] [Pending Leaves] [Top Skills Count]         |
|-------------------------------------------------------------------------------|
| Attendance Trend Chart                    | Leave Status Chart                 |
|-------------------------------------------|-----------------------------------|
| Top Skills Table                          | Department Distribution            |
 -------------------------------------------------------------------------------
```

### Design Notes
- Top row should use compact stat cards
- Search stays in the same horizontal header band as filters
- Charts should have minimal grid lines
- Primary value hierarchy should be clear

## 6. Employee Dashboard

```txt
 -------------------------------------------------------------------------------
| My Dashboard                               [ Search ] [ This Month ]           |
|-------------------------------------------------------------------------------|
| [My Attendance] [Approved Leaves] [Pending Leaves] [Skill Summary]            |
|-------------------------------------------------------------------------------|
| Monthly Attendance Chart                 | My Skill Levels                     |
|------------------------------------------|------------------------------------|
| Recent Leave Requests                    | Profile Summary                     |
 -------------------------------------------------------------------------------
```

## 7. Employees List Screen

```txt
 -------------------------------------------------------------------------------
| Employees                      [ Search Employee ]            [+ Add Employee] |
|-------------------------------------------------------------------------------|
| Department Filter | Status Filter | Role Filter                                |
|-------------------------------------------------------------------------------|
| Table: Name | Department | Role | Status | Joining | Actions                  |
|-------------------------------------------------------------------------------|
| View | Edit | Delete                                                        |
 -------------------------------------------------------------------------------
```

### UX Notes
- Search remains in the page header for quick employee lookup
- Filters should sit directly below the page header
- Actions should be grouped in a compact column
- Status badges should be easy to scan

## 8. Employee Form Screen

```txt
 -------------------------------------------------------------------------------
| Add / Edit Employee                                        [ Save ] [ Cancel ] |
|-------------------------------------------------------------------------------|
| First Name                 Last Name                                           |
| Email                      Phone                                               |
| Department                 Designation                                         |
| Joining Date               Employment Type                                     |
| Address                                                                       |
 -------------------------------------------------------------------------------
```

## 9. Attendance Screen

```txt
 -------------------------------------------------------------------------------
| Attendance                                [ Search Employee ] [Mark Today]     |
|-------------------------------------------------------------------------------|
| Date Filter | Employee Filter | Status Filter                                  |
|-------------------------------------------------------------------------------|
| Table: Employee | Date | Check In | Check Out | Status                         |
 -------------------------------------------------------------------------------
```

## 10. Leave Management Screen

```txt
 -------------------------------------------------------------------------------
| Leave Requests                           [ Search Employee ]                   |
|-------------------------------------------------------------------------------|
| Status Filter | Date Range | Leave Type                                        |
|-------------------------------------------------------------------------------|
| Table: Employee | Leave Type | Dates | Days | Status                           |
|-------------------------------------------------------------------------------|
| Action: Approve / Reject / View Details                                        |
 -------------------------------------------------------------------------------
```

## 11. Employee Leave Screen

```txt
 -------------------------------------------------------------------------------
| My Leaves                                 [ Search ]         [+ Apply Leave]   |
|-------------------------------------------------------------------------------|
| Status Filter | Leave Type Filter                                              |
|-------------------------------------------------------------------------------|
| Table: Type | Start | End | Days | Status | Remarks                           |
 -------------------------------------------------------------------------------
```

## 12. Skill Matrix Screen

```txt
 -------------------------------------------------------------------------------
| Skill Matrix                         [ Search Skill / Employee ]  [+ Assign]   |
|-------------------------------------------------------------------------------|
| Employee Filter | Skill Category Filter                                        |
|-------------------------------------------------------------------------------|
| Table: Employee | Skill | Category | Level | Last Assessed                     |
|-------------------------------------------------------------------------------|
| Level badges: 1 Beginner ... 5 Expert                                          |
 -------------------------------------------------------------------------------
```

## 13. Employee Skills Screen

```txt
 -------------------------------------------------------------------------------
| My Skills                                  [ Search Skill ]                    |
|-------------------------------------------------------------------------------|
| Skill Cards / Table                                                           |
| Skill Name | Category | Proficiency | Last Assessed                           |
 -------------------------------------------------------------------------------
```

## 14. Profile Screen

```txt
 -------------------------------------------------------------------------------
| My Profile                                                    [ Edit Profile ] |
|-------------------------------------------------------------------------------|
| Avatar   Name   Role   Department                                              |
|-------------------------------------------------------------------------------|
| Contact Info                                                                   |
| Employment Details                                                             |
| Assigned Skills                                                                |
 -------------------------------------------------------------------------------
```

## 15. Theme Guidance

### Dark Mode
- Background: `#0A0A0A`
- Surface: `#121212` to `#171717`
- Border: subtle gray
- Text: white to gray scale
- Accent: soft cyan used sparingly

### Light Mode
- White background
- Soft gray cards
- Deep charcoal text
- Same cyan accent rules for consistency

## 16. UX Principles
- Keep navigation predictable and shallow with a top-level nav bar
- Keep search accessible from the top header area
- Reserve richer motion for the public hero section only
- Reduce clutter in forms and tables
- Show important summaries at the top
- Use charts only where they add decision value
- Make admin and employee experiences clearly distinct
