## ADDED Requirements

### Requirement: Role Middleware

The system SHALL provide a `requireRole(...roles)` middleware factory that accepts one or more allowed role strings.
The middleware SHALL compare `req.user.role` against the allowed roles and return HTTP 403 if the user's role is not in the list.
The middleware SHALL assume `req.user` is already populated by the auth middleware and SHALL be applied after it.

#### Scenario: Authorized role

- **WHEN** a user with role `pm` accesses a route protected with `requireRole('pm')`
- **THEN** the middleware calls `next()` and the request proceeds to the controller

#### Scenario: Unauthorized role

- **WHEN** a user with role `rd` accesses a route protected with `requireRole('pm')`
- **THEN** the middleware returns HTTP 403 with an error message indicating insufficient permissions

#### Scenario: Multiple allowed roles

- **WHEN** a route is protected with `requireRole('pm', 'admin')` and a user with role `admin` accesses it
- **THEN** the middleware calls `next()` and the request proceeds

### Requirement: PM-Only Routes

The system SHALL restrict the following operations to users with role `pm` or `admin`:
- `POST /tasks` (create task)
- `DELETE /tasks/:id` (delete task)
- `POST /meetings` (create meeting)
- `PATCH /meetings/:id` (update meeting)
- `DELETE /meetings/:id` (delete meeting)
- `POST /meetings/:id/tasks` (generate tasks from meeting)

#### Scenario: PM creates a task

- **WHEN** a user with role `pm` sends `POST /tasks`
- **THEN** the request is authorized and proceeds to the task creation logic

#### Scenario: RD attempts to create a task

- **WHEN** a user with role `rd` sends `POST /tasks`
- **THEN** the system returns HTTP 403

### Requirement: RD-Scoped Task Access

The system SHALL restrict RD users so they can only read and update tasks assigned to themselves.
An RD user SHALL NOT be able to update fields other than `status` on a task.
An RD user attempting `PATCH /tasks/:id` on a task not assigned to them SHALL receive HTTP 403.

#### Scenario: RD updates status of own task

- **WHEN** an RD user sends `PATCH /tasks/:id` for a task where `assigneeId === req.user.id` with only `{ status: "in_progress" }`
- **THEN** the system updates the task status and returns HTTP 200

#### Scenario: RD updates task not assigned to them

- **WHEN** an RD user sends `PATCH /tasks/:id` for a task assigned to a different user
- **THEN** the system returns HTTP 403

#### Scenario: RD attempts to update non-status fields

- **WHEN** an RD user sends `PATCH /tasks/:id` with fields other than `status` (e.g., `title`, `assigneeId`)
- **THEN** the system ignores non-status fields and only applies the `status` change if present; if no `status` field is provided, the system returns HTTP 400

### Requirement: RD-Scoped Branch Access

The system SHALL restrict branch operations (`POST`, `PATCH`, `DELETE /branches/:id`) to users with role `rd`.
An RD user SHALL only be able to modify or delete branches they created (`createdById === req.user.id`).

#### Scenario: RD creates a branch

- **WHEN** an RD user sends `POST /branches` with valid data
- **THEN** the system creates the branch with `createdById` set to `req.user.id` and returns HTTP 201

#### Scenario: RD deletes own branch

- **WHEN** an RD user sends `DELETE /branches/:id` for a branch they created
- **THEN** the system deletes the branch and returns HTTP 204

#### Scenario: RD deletes another user's branch

- **WHEN** an RD user sends `DELETE /branches/:id` for a branch created by a different user
- **THEN** the system returns HTTP 403

### Requirement: Admin-Only Routes

The system SHALL restrict the following operations to users with role `admin`:
- `GET /admin/users`
- `POST /admin/users`
- `PATCH /admin/users/:id/role`

#### Scenario: Admin accesses user list

- **WHEN** an `admin` user sends `GET /admin/users`
- **THEN** the system returns the full user list

#### Scenario: Non-admin accesses admin routes

- **WHEN** a user with role `pm` or `rd` sends a request to any `/admin/*` route
- **THEN** the system returns HTTP 403
