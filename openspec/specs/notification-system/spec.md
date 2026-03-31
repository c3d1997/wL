# notification-system Specification

## Purpose

TBD - created by archiving change 'pm-tool-api'. Update Purpose after archive.

## Requirements

### Requirement: List Notifications

The system SHALL return notifications for the requesting user via `GET /notifications`.
The response SHALL only include notifications where `userId === req.user.id`.
Notifications SHALL be ordered by `createdAt` descending (newest first).

#### Scenario: User retrieves own notifications

- **WHEN** an authenticated user sends `GET /notifications`
- **THEN** the system returns HTTP 200 with an array of notifications belonging to that user, ordered newest first

#### Scenario: User with no notifications

- **WHEN** an authenticated user with no notifications sends `GET /notifications`
- **THEN** the system returns HTTP 200 with an empty array


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
### Requirement: Mark Single Notification as Read

The system SHALL allow users to mark a single notification as read via `PATCH /notifications/:id/read`.
The system SHALL return HTTP 403 if the notification does not belong to the requesting user.
The system SHALL return HTTP 404 if the notification does not exist.

#### Scenario: User marks own notification as read

- **WHEN** a user sends `PATCH /notifications/:id/read` for a notification they own
- **THEN** the system sets `isRead` to `true` and returns HTTP 200 with the updated notification

#### Scenario: User marks another user's notification

- **WHEN** a user sends `PATCH /notifications/:id/read` for a notification belonging to another user
- **THEN** the system returns HTTP 403


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
### Requirement: Mark All Notifications as Read

The system SHALL allow users to mark all their notifications as read via `PATCH /notifications/read-all`.
The system SHALL only update notifications where `userId === req.user.id`.

#### Scenario: User marks all notifications as read

- **WHEN** a user sends `PATCH /notifications/read-all`
- **THEN** the system sets `isRead` to `true` for all notifications belonging to that user and returns HTTP 200 with `{ count: N }` indicating how many were updated


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
### Requirement: Automatic Notification Creation on Task Assignment

The system SHALL automatically create a Notification record when a task is assigned.
The Notification SHALL have `userId` set to the task's `assigneeId`, `type` set to `task_assigned`, and `message` containing the task title.
The system SHALL asynchronously send an Email to the assignee via Resend after creating the notification.
Email sending failure SHALL be logged via `console.error` and SHALL NOT cause the task creation to fail.

#### Scenario: Task created triggers notification

- **WHEN** a PM user successfully creates a task via `POST /tasks`
- **THEN** the system creates a Notification record for the assignee with `type: "task_assigned"` and initiates an async Email send

#### Scenario: Email send failure does not block task creation

- **WHEN** the Resend API returns an error during task creation
- **THEN** the task and notification are still created successfully, the error is logged, and the API returns HTTP 201


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
### Requirement: Automatic Notification on Task Status Update

The system SHALL automatically create a Notification for the task's `creatorId` when a task's `status` field is updated.
The Notification SHALL have `type` set to `task_updated` and `message` indicating the new status and task title.
The system SHALL asynchronously send an Email to the task creator.

#### Scenario: Status update triggers notification to creator

- **WHEN** any user successfully updates a task's `status` field via `PATCH /tasks/:id`
- **THEN** the system creates a Notification for the task's creator with `type: "task_updated"` and initiates an async Email send

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