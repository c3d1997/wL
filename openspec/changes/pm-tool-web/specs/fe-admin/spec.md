## ADDED Requirements

### Requirement: Admin User List

The system SHALL display a user management page at `/admin/users` accessible to admin users only.
Each row SHALL display: name, email, role badge, and created date.

#### Scenario: Admin views user list

- **WHEN** an admin user navigates to `/admin/users`
- **THEN** the system displays all user accounts excluding passwordHash

### Requirement: Create User Account

The system SHALL provide a create user form on the admin user list page.
Required fields: name, email, password, role (select from admin / pm / rd).

#### Scenario: Admin creates a PM account

- **WHEN** an admin submits the create user form with valid fields and role "pm"
- **THEN** the system calls `POST /admin/users` and adds the new user to the list

#### Scenario: Duplicate email

- **WHEN** an admin submits a form with an already-registered email
- **THEN** the system displays the 409 error message returned by the API

### Requirement: Update User Role

The system SHALL allow admin users to change a user's role via an inline role selector on each user row.

#### Scenario: Admin changes user role

- **WHEN** an admin selects a new role from the role dropdown on a user row
- **THEN** the system calls `PATCH /admin/users/:id/role` and updates the displayed role badge
