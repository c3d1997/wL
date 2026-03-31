## ADDED Requirements

### Requirement: List All Users

The system SHALL allow admin users to retrieve all user accounts via `GET /admin/users`.
The response SHALL include all User fields except `passwordHash`.

#### Scenario: Admin lists users

- **WHEN** an admin user sends `GET /admin/users`
- **THEN** the system returns HTTP 200 with an array of all users, each excluding `passwordHash`

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
