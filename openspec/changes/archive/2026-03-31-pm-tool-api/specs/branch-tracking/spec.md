## ADDED Requirements

### Requirement: List Branches

The system SHALL return branches via `GET /branches` filtered to the requesting RD user's own branches (`createdById === req.user.id`).
The response SHALL include related `task` info (id, title, status).

#### Scenario: RD lists own branches

- **WHEN** an RD user sends `GET /branches`
- **THEN** the system returns HTTP 200 with all branches created by that user, each including the linked task's id, title, and status

### Requirement: Create Branch

The system SHALL allow RD users to create branch records via `POST /branches`.
Required fields: `name`, `type` (one of: feat, fix, hotfix, update, chore), `taskId`.
The system SHALL set `createdById` to `req.user.id` automatically.
The system SHALL return HTTP 400 if `taskId` does not correspond to an existing task.
The system SHALL return HTTP 400 if `type` is not one of the valid BranchType enum values.

#### Scenario: RD creates a branch record

- **WHEN** an RD user sends `POST /branches` with `{ name, type: "feat", taskId }`
- **THEN** the system creates the branch linked to the task, sets `createdById`, and returns HTTP 201 with the created branch

#### Scenario: Invalid task id

- **WHEN** `POST /branches` is called with a `taskId` that does not exist
- **THEN** the system returns HTTP 400 with an error indicating the task was not found

#### Scenario: Invalid branch type

- **WHEN** `POST /branches` is called with a `type` not in the BranchType enum
- **THEN** the system returns HTTP 400 with a validation error listing valid types

### Requirement: Update Branch

The system SHALL allow RD users to update their own branch records via `PATCH /branches/:id`.
Updatable fields: `name`, `type`.
The system SHALL return HTTP 403 if the requesting user is not the branch creator.
The system SHALL return HTTP 404 if the branch does not exist.

#### Scenario: RD updates own branch name

- **WHEN** an RD user sends `PATCH /branches/:id` for a branch they created with `{ name: "feat/new-name" }`
- **THEN** the system updates the name and returns HTTP 200 with the updated branch

#### Scenario: RD updates another user's branch

- **WHEN** an RD user sends `PATCH /branches/:id` for a branch created by a different user
- **THEN** the system returns HTTP 403

### Requirement: Delete Branch

The system SHALL allow RD users to delete their own branch records via `DELETE /branches/:id`.
The system SHALL return HTTP 403 if the requesting user is not the branch creator.
The system SHALL return HTTP 404 if the branch does not exist.
The system SHALL return HTTP 204 on successful deletion.

#### Scenario: RD deletes own branch

- **WHEN** an RD user sends `DELETE /branches/:id` for a branch they created
- **THEN** the system deletes the branch and returns HTTP 204

#### Scenario: Branch not found

- **WHEN** `DELETE /branches/:id` is called with an id that does not exist
- **THEN** the system returns HTTP 404
