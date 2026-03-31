## ADDED Requirements

### Requirement: Meeting List View

The system SHALL display a meeting list page at `/meetings` for all authenticated users.
Each meeting row SHALL display: title, meetingDate, and creator name.

#### Scenario: User views meeting list

- **WHEN** any authenticated user navigates to `/meetings`
- **THEN** the system displays all meetings ordered by date descending

### Requirement: Meeting Detail View

The system SHALL display a meeting detail page at `/meetings/:id` showing full meeting content and linked tasks.
Linked tasks SHALL display: title, status badge, and assignee name.

#### Scenario: User views meeting detail

- **WHEN** a user navigates to `/meetings/:id`
- **THEN** the system displays the meeting content and a list of associated tasks

#### Scenario: Meeting not found

- **WHEN** a user navigates to `/meetings/:id` with an invalid id
- **THEN** the system displays a 404 message

### Requirement: Create and Edit Meeting

The system SHALL allow PM and admin users to create meetings via a form button on the list page.
Required fields: title, meetingDate, content. Edit SHALL pre-fill existing values.

#### Scenario: PM creates a meeting

- **WHEN** a PM user submits the create meeting form with all required fields
- **THEN** the system calls `POST /meetings` and adds the meeting to the list

#### Scenario: PM edits a meeting

- **WHEN** a PM user submits the edit form
- **THEN** the system calls `PATCH /meetings/:id` and updates the meeting

### Requirement: Delete Meeting

The system SHALL show a delete button on each meeting row for PM and admin users.
The system SHALL show a confirmation dialog before deleting.
After deletion, linked tasks SHALL remain but their meeting association SHALL be cleared.

#### Scenario: PM deletes a meeting

- **WHEN** a PM user confirms the delete dialog
- **THEN** the system calls `DELETE /meetings/:id` and removes the meeting from the list

### Requirement: Generate Tasks from Meeting

The system SHALL provide a "Generate Tasks" button on the meeting detail page for PM and admin users.
The button SHALL open a form allowing the user to add multiple task entries (title, assignee required; description, dueDate optional).
The form SHALL allow adding and removing task entries dynamically.

#### Scenario: PM generates tasks from meeting

- **WHEN** a PM user submits the generate tasks form with at least one valid task entry
- **THEN** the system calls `POST /meetings/:id/tasks` and displays the created tasks in the meeting detail
