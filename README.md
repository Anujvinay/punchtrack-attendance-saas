# PunchTrack — Attendance Management SaaS

PunchTrack is a full-stack MERN Attendance Management SaaS designed to manage employee attendance, working hours, overtime, team management, attendance verification, and reporting through role-based access control.

The system supports three roles:

- Admin
- Manager
- Employee

---

## Overview

PunchTrack provides a centralized attendance management workflow where employees can securely register and sign in, capture live selfies and their current location during attendance actions, track working hours, and request overtime.

Managers can manage and review their assigned teams, while Admins have system-wide management and verification access.

The application is built with a separation of frontend, backend, database, authentication, validation, and service layers.

---

## Features

### Authentication & Authorization

- Secure employee signup
- Secure login/logout
- JWT-based authentication
- httpOnly authentication cookies
- Role-based access control
- Protected frontend routes
- Protected backend routes
- Admin, Manager, and Employee permissions
- Password hashing with bcryptjs
- Login rate limiting
- Authentication state management with RTK Query

### Employee Management

- Employee self-registration
- Unique employee ID
- Department
- Designation
- Phone number
- Joining date
- Active/inactive employee status
- Employee profile updates
- Manager assignment
- Manager reassignment

### Manager Management

- Admin can create manager accounts
- Manager role-based access
- Admin can view managers
- Admin can assign employees to managers
- Managers can access only their assigned team

### Attendance

- Employee check-in
- Employee check-out
- Live camera selfie capture
- Current GPS location capture
- Latitude and longitude storage
- Server-side attendance timestamps
- Attendance history
- Working-hours calculation
- Standard 8-hour shift
- Attendance status tracking
- Duplicate check-in protection
- Duplicate check-out protection
- Check-out requires an existing check-in

### Attendance Verification

Admins and Managers can:

- View employee attendance
- View check-in selfie
- View check-out selfie
- View check-in location
- View check-out location
- Review punch times
- Approve attendance
- Reject attendance
- Add verification notes

Managers are restricted to attendance belonging to their assigned employees.

### Overtime

Employees can:

- View overtime-eligible attendance
- Create overtime requests
- Add an overtime reason
- Track overtime request status

Admins and Managers can:

- View overtime requests
- Approve overtime
- Reject overtime
- Add review notes

Overtime is calculated from working time beyond the standard 8-hour shift.

### Reports

- Attendance reports
- Daily attendance reports
- Overtime reports
- Date-range filtering
- Attendance status filtering
- Pagination where applicable
- Employee information
- Punch-in time
- Punch-out time
- Working hours
- Attendance status
- Verification status
- Selfie references
- Location information

### User Interface

- Modern SaaS design
- Responsive Admin interface
- Responsive Manager interface
- Responsive Employee interface
- Mobile support
- Tablet support
- Desktop support
- Responsive tables
- Responsive forms
- Responsive navigation
- Loading states
- Error states
- Empty states
- Consistent Tailwind CSS v4 design system
- React Icons

---

## Roles & Permissions
## Roles & Permissions

| Feature | Admin | Manager | Employee |
|---|:---:|:---:|:---:|
| Login | ✅ | ✅ | ✅ |
| Employee Signup | — | — | ✅ |
| View Employees | ✅ | Assigned Team | Own Profile |
| Create Manager | ✅ | — | — |
| Edit Employee | ✅ | — | — |
| Assign / Change Manager | ✅ | — | — |
| View Assigned Team | All Employees | Assigned Team | — |
| Check In | — | — | ✅ |
| Check Out | — | — | ✅ |
| View Own Attendance | ✅ | ✅ | ✅ |
| View Team Attendance | ✅ | ✅ | — |
| View All Attendance | ✅ | — | — |
| Verify Attendance | ✅ | ✅ | — |
| Create Overtime Request | — | — | ✅ |
| Review Overtime | ✅ | ✅ | — |
| View Reports | All Data | Team Data | Own Data |
---

## Attendance Workflow

```text
Employee Signup
      ↓
Employee Login
      ↓
Attendance Page
      ↓
Check In
      ↓
Live Selfie Capture
      ↓
Current Location Capture
      ↓
Attendance Record Created
      ↓
Working Time Tracking
      ↓
Check Out
      ↓
Selfie + Location Capture
      ↓
Final Working Minutes Calculated
      ↓
Attendance Verification
      ↓
Admin / Manager Review
      ↓
Approve / Reject + Note