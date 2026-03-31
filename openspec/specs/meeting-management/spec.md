# meeting-management Specification

## Purpose

TBD - created by archiving change 'pm-tool-api'. Update Purpose after archive.

## Requirements

### Requirement: List Meetings

The system SHALL return all meetings via `GET /meetings` for all authenticated users.
The response SHALL include basic meeting info: `id`, `title`, `meetingDate`, `createdAt`, and `createdBy` (id, name).

#### Scenario: Authenticated user lists meetings

- **WHEN** any authenticated user (admin, pm, or rd) sends `GET /meetings`
- **THEN** the system returns HTTP 200 with an array of all meetings including createdBy info


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
### Requirement: Create Meeting

The system SHALL allow PM users to create meetings via `POST /meetings`.
Required fields: `title`, `meetingDate`, `content`.
The system SHALL set `createdById` to `req.user.id` automatically.

#### Scenario: PM creates a meeting

- **WHEN** a PM user sends `POST /meetings` with `{ title, meetingDate, content }`
- **THEN** the system creates the meeting record and returns HTTP 201 with the created meeting object

#### Scenario: Missing required fields

- **WHEN** `POST /meetings` is missing `title`, `meetingDate`, or `content`
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
### Requirement: Get Single Meeting

The system SHALL return a single meeting's full detail via `GET /meetings/:id` for all authenticated users.
The response SHALL include all meeting fields plus related `tasks` array (id, title, status, assignee id/name).

#### Scenario: Retrieve existing meeting

- **WHEN** an authenticated user sends `GET /meetings/:id` with a valid meeting id
- **THEN** the system returns HTTP 200 with full meeting details including associated tasks

#### Scenario: Meeting not found

- **WHEN** `GET /meetings/:id` is called with an id that does not exist
- **THEN** the system returns HTTP 404


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
### Requirement: Update Meeting

The system SHALL allow PM users to update meeting fields via `PATCH /meetings/:id`.
Updatable fields: `title`, `meetingDate`, `content`.
The system SHALL return HTTP 404 if the meeting does not exist.

#### Scenario: PM updates meeting content

- **WHEN** a PM user sends `PATCH /meetings/:id` with `{ content: "Updated notes" }`
- **THEN** the system updates the content field and returns HTTP 200 with the updated meeting


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
### Requirement: Delete Meeting

The system SHALL allow PM users to delete meetings via `DELETE /meetings/:id`.
Deleting a meeting SHALL NOT delete associated tasks; instead, the tasks' `meetingId` SHALL be set to null.
The system SHALL return HTTP 204 on success and HTTP 404 if not found.

#### Scenario: PM deletes a meeting

- **WHEN** a PM user sends `DELETE /meetings/:id` for an existing meeting
- **THEN** the system deletes the meeting, sets `meetingId` to null on associated tasks, and returns HTTP 204


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
### Requirement: Generate Tasks from Meeting

The system SHALL allow PM users to create multiple tasks from a meeting via `POST /meetings/:id/tasks`.
The request body SHALL contain an array `tasks`, each with `title`, `assigneeId`, and optional `description` and `dueDate`.
All generated tasks SHALL have `meetingId` set to the meeting's id and `creatorId` set to `req.user.id`.
For each created task, the system SHALL create a Notification for the assignee and asynchronously send an Email.

#### Scenario: PM generates tasks from meeting

- **WHEN** a PM user sends `POST /meetings/:id/tasks` with `{ tasks: [{ title, assigneeId }, ...] }`
- **THEN** the system creates all tasks linked to the meeting, creates notifications for each assignee, and returns HTTP 201 with the array of created tasks

#### Scenario: Empty tasks array

- **WHEN** `POST /meetings/:id/tasks` is called with an empty `tasks` array
- **THEN** the system returns HTTP 400 indicating at least one task is required

#### Scenario: Meeting not found

- **WHEN** `POST /meetings/:id/tasks` is called with a meeting id that does not exist
- **THEN** the system returns HTTP 404

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