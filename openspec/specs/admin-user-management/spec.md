# admin-user-management Specification

## Purpose

TBD - created by archiving change 'pm-tool-api'. Update Purpose after archive.

## Requirements

### Requirement: List All Users

The system SHALL allow admin users to retrieve all user accounts via `GET /admin/users`.
The response SHALL include all User fields except `passwordHash`.

#### Scenario: Admin lists users

- **WHEN** an admin user sends `GET /admin/users`
- **THEN** the system returns HTTP 200 with an array of all users, each excluding `passwordHash`


<!-- @trace
source: pm-tool-api
updated: 2026-03-31
code:
  - pm-tool-api/src/controllers/notificationController.js
  - pm-tool-api/index.js
  - pm-tool-api/src/controllers/authController.js
  - pm-tool-api/src/middleware/roleMiddleware.js
  - pm-tool-api/src/routes/adminRoutes.js
  - pm-tool-api/src/controllers/meetingController.js
  - pm-tool-api/src/routes/meetingRoutes.js
  - pm-tool-api/src/lib/jwtHelper.js
  - pm-tool-api/src/controllers/branchController.js
  - pm-tool-api/src/routes/branchRoutes.js
  - pm-tool-api/src/routes/notificationRoutes.js
  - pm-tool-api/src/lib/notificationHelper.js
  - pm-tool-api/src/controllers/taskController.js
  - pm-tool-api/src/routes/authRoutes.js
  - pm-tool-api/src/routes/taskRoutes.js
  - pm-tool-api/src/lib/resendHelper.js
  - pm-tool-api/src/middleware/authMiddleware.js
  - pm-tool-api/src/controllers/adminController.js
-->

---
### Requirement: Create User Account

The system SHALL allow admin users to create new accounts via `POST /admin/users`.
Required fields: `name`, `email`, `password`, `role`.
`role` SHALL be one of: admin, pm, rd.
The system SHALL hash the password with bcrypt (minimum cost factor 10) before storing.
The system SHALL return HTTP 409 if the email already exists.

#### Scenario: Admin creates a PM account

- **WHEN** an admin user sends `POST /admin/users` with `{ name, email, password, role: "pm" }`
- **THEN** the system creates the account with the specified role and returns HTTP 201 with the user object (excluding `passwordHash`)

#### Scenario: Duplicate email

- **WHEN** `POST /admin/users` is called with an email already in use
- **THEN** the system returns HTTP 409

#### Scenario: Invalid role

- **WHEN** `POST /admin/users` is called with a `role` not in the Role enum
- **THEN** the system returns HTTP 400 with a validation error


<!-- @trace
source: pm-tool-api
updated: 2026-03-31
code:
  - pm-tool-api/src/controllers/notificationController.js
  - pm-tool-api/index.js
  - pm-tool-api/src/controllers/authController.js
  - pm-tool-api/src/middleware/roleMiddleware.js
  - pm-tool-api/src/routes/adminRoutes.js
  - pm-tool-api/src/controllers/meetingController.js
  - pm-tool-api/src/routes/meetingRoutes.js
  - pm-tool-api/src/lib/jwtHelper.js
  - pm-tool-api/src/controllers/branchController.js
  - pm-tool-api/src/routes/branchRoutes.js
  - pm-tool-api/src/routes/notificationRoutes.js
  - pm-tool-api/src/lib/notificationHelper.js
  - pm-tool-api/src/controllers/taskController.js
  - pm-tool-api/src/routes/authRoutes.js
  - pm-tool-api/src/routes/taskRoutes.js
  - pm-tool-api/src/lib/resendHelper.js
  - pm-tool-api/src/middleware/authMiddleware.js
  - pm-tool-api/src/controllers/adminController.js
-->

---
### Requirement: Update User Role

The system SHALL allow admin users to change a user's role via `PATCH /admin/users/:id/role`.
The request body SHALL contain `role`, which MUST be one of: admin, pm, rd.
The system SHALL return HTTP 404 if the target user does not exist.
The system SHALL return HTTP 400 if `role` is not a valid Role enum value.

#### Scenario: Admin changes user role to PM

- **WHEN** an admin user sends `PATCH /admin/users/:id/role` with `{ role: "pm" }`
- **THEN** the system updates the user's role and returns HTTP 200 with the updated user object (excluding `passwordHash`)

#### Scenario: Target user not found

- **WHEN** `PATCH /admin/users/:id/role` is called with a user id that does not exist
- **THEN** the system returns HTTP 404

#### Scenario: Invalid role value

- **WHEN** `PATCH /admin/users/:id/role` is called with `{ role: "superuser" }` or any non-enum value
- **THEN** the system returns HTTP 400 with a validation error

<!-- @trace
source: pm-tool-api
updated: 2026-03-31
code:
  - pm-tool-api/src/controllers/notificationController.js
  - pm-tool-api/index.js
  - pm-tool-api/src/controllers/authController.js
  - pm-tool-api/src/middleware/roleMiddleware.js
  - pm-tool-api/src/routes/adminRoutes.js
  - pm-tool-api/src/controllers/meetingController.js
  - pm-tool-api/src/routes/meetingRoutes.js
  - pm-tool-api/src/lib/jwtHelper.js
  - pm-tool-api/src/controllers/branchController.js
  - pm-tool-api/src/routes/branchRoutes.js
  - pm-tool-api/src/routes/notificationRoutes.js
  - pm-tool-api/src/lib/notificationHelper.js
  - pm-tool-api/src/controllers/taskController.js
  - pm-tool-api/src/routes/authRoutes.js
  - pm-tool-api/src/routes/taskRoutes.js
  - pm-tool-api/src/lib/resendHelper.js
  - pm-tool-api/src/middleware/authMiddleware.js
  - pm-tool-api/src/controllers/adminController.js
-->