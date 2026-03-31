## ADDED Requirements

### Requirement: Task List View

The system SHALL display a task list page at `/tasks` for all authenticated users.
PM and admin users SHALL see all tasks. RD users SHALL see only tasks assigned to themselves.
Each task row SHALL display: title, status badge, assignee name, due date (if set), and meeting title (if linked).
The list SHALL support filtering by status (all / pending / in_progress / done).

#### Scenario: PM views task list

- **WHEN** a PM user navigates to `/tasks`
- **THEN** the system displays all tasks with assignee names and status badges

#### Scenario: RD views task list

- **WHEN** an RD user navigates to `/tasks`
- **THEN** the system displays only tasks where the assignee is the current user

#### Scenario: Filter by status

- **WHEN** a user selects a status filter
- **THEN** the system updates the task list to show only tasks matching that status

### Requirement: Create Task

The system SHALL provide a task creation form accessible to PM and admin users via a button on the task list page.
Required fields: title, assigneeId (select from user list). Optional fields: description, dueDate, meetingId.
On success, the system SHALL close the form and refresh the task list.

#### Scenario: PM creates a task

- **WHEN** a PM user submits the create task form with valid title and assignee
- **THEN** the system calls `POST /tasks`, closes the form, and shows the new task in the list

#### Scenario: Missing required field

- **WHEN** a PM user submits the form without a title or assignee
- **THEN** the system displays inline validation errors and does not submit

### Requirement: Edit Task

The system SHALL allow PM users to edit all task fields via an edit form.
The system SHALL allow RD users to update only the status field of tasks assigned to them.
RD users SHALL NOT see edit controls for tasks not assigned to them.

#### Scenario: PM edits task title

- **WHEN** a PM user opens the edit form and changes the title
- **THEN** the system calls `PATCH /tasks/:id` and updates the task in the list

#### Scenario: RD updates task status

- **WHEN** an RD user changes the status dropdown on their own task
- **THEN** the system calls `PATCH /tasks/:id` with only the status field

### Requirement: Delete Task

The system SHALL show a delete button on each task row for PM and admin users only.
The system SHALL show a confirmation dialog before deleting.

#### Scenario: PM deletes a task

- **WHEN** a PM user confirms the delete dialog
- **THEN** the system calls `DELETE /tasks/:id` and removes the task from the list
