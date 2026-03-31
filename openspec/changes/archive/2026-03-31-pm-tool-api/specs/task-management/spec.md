## ADDED Requirements

### Requirement: List Tasks

The system SHALL return tasks via `GET /tasks`.
PM users SHALL receive all tasks in the system.
RD users SHALL only receive tasks where `assigneeId === req.user.id`.
The response SHALL include related `assignee` (id, name, email) and `meeting` (id, title) fields.

#### Scenario: PM retrieves all tasks

- **WHEN** a PM user sends `GET /tasks`
- **THEN** the system returns HTTP 200 with all tasks in the database, each including assignee and meeting info

#### Scenario: RD retrieves only assigned tasks

- **WHEN** an RD user sends `GET /tasks`
- **THEN** the system returns HTTP 200 with only tasks where `assigneeId` equals the requesting user's id

### Requirement: Create Task

The system SHALL allow PM users to create tasks via `POST /tasks`.
Required fields: `title`, `assigneeId`.
Optional fields: `description`, `meetingId`, `dueDate`.
The system SHALL set `creatorId` to `req.user.id` automatically.
The system SHALL set initial `status` to `pending`.
Upon creation, the system SHALL create a Notification for the assignee and asynchronously send an Email via Resend.

#### Scenario: PM creates a task

- **WHEN** a PM user sends `POST /tasks` with `{ title, assigneeId }`
- **THEN** the system creates the task, creates a notification for the assignee, and returns HTTP 201 with the created task object

#### Scenario: Invalid assigneeId

- **WHEN** a PM user sends `POST /tasks` with an `assigneeId` that does not correspond to an existing user
- **THEN** the system returns HTTP 400 with an error indicating the assignee does not exist

#### Scenario: Missing required fields

- **WHEN** a POST request to `/tasks` is missing `title` or `assigneeId`
- **THEN** the system returns HTTP 400 with a validation error

### Requirement: Update Task

The system SHALL allow updating a task via `PATCH /tasks/:id`.
PM users SHALL be able to update any field: `title`, `description`, `status`, `assigneeId`, `dueDate`.
RD users SHALL only be able to update `status` on tasks assigned to themselves.
When `status` is updated by any role, the system SHALL create a Notification for the task's `creatorId` and asynchronously send an Email.
When `assigneeId` is changed by a PM, the system SHALL create a Notification for the new assignee.

#### Scenario: PM updates task title and status

- **WHEN** a PM user sends `PATCH /tasks/:id` with `{ title: "New Title", status: "in_progress" }`
- **THEN** the system updates both fields and returns HTTP 200 with the updated task

#### Scenario: Status change triggers notification to creator

- **WHEN** any user updates the `status` field of a task
- **THEN** the system creates a Notification record for the task's `creatorId` with type `task_updated`

#### Scenario: Task not found

- **WHEN** `PATCH /tasks/:id` is called with an id that does not exist
- **THEN** the system returns HTTP 404

### Requirement: Delete Task

The system SHALL allow PM users to delete tasks via `DELETE /tasks/:id`.
The system SHALL return HTTP 204 on successful deletion.
The system SHALL return HTTP 404 if the task does not exist.
Deleting a task SHALL cascade-delete related Branch and Notification records.

#### Scenario: PM deletes an existing task

- **WHEN** a PM user sends `DELETE /tasks/:id` with a valid task id
- **THEN** the system deletes the task and all related branches and notifications, returning HTTP 204

#### Scenario: Delete non-existent task

- **WHEN** `DELETE /tasks/:id` is called with an id that does not exist
- **THEN** the system returns HTTP 404
