## ADDED Requirements

### Requirement: Branch List View

The system SHALL display a branch list page at `/branches` accessible to RD users only.
Each branch row SHALL display: branch name, type badge, and linked task title with status.

#### Scenario: RD views branch list

- **WHEN** an RD user navigates to `/branches`
- **THEN** the system displays all branches created by that user

### Requirement: Create Branch

The system SHALL provide a create branch form on the branch list page.
Required fields: name, type (select from feat / fix / hotfix / update / chore), taskId (select from user's assigned tasks).

#### Scenario: RD creates a branch

- **WHEN** an RD user submits the create branch form with valid fields
- **THEN** the system calls `POST /branches` and shows the new branch in the list

#### Scenario: Invalid branch type

- **WHEN** an RD user submits a form with an invalid type
- **THEN** the system displays a validation error

### Requirement: Edit and Delete Branch

The system SHALL allow RD users to edit (name, type) and delete their own branches.
The system SHALL show a confirmation dialog before deleting.

#### Scenario: RD edits branch name

- **WHEN** an RD user submits the edit form with a new name
- **THEN** the system calls `PATCH /branches/:id` and updates the branch

#### Scenario: RD deletes a branch

- **WHEN** an RD user confirms the delete dialog
- **THEN** the system calls `DELETE /branches/:id` and removes the branch from the list
