## ADDED Requirements

### Requirement: Notification Bell

The system SHALL display a notification bell icon in the navigation header showing the count of unread notifications.
The bell SHALL show a badge with the unread count. If count is 0, the badge SHALL be hidden.

#### Scenario: User has unread notifications

- **WHEN** an authenticated user has unread notifications
- **THEN** the header bell icon displays a badge with the unread count

### Requirement: Notification List View

The system SHALL display a notification list page at `/notifications`.
Each notification row SHALL display: message, type, and creation time (relative, e.g. "3 分鐘前").
Unread notifications SHALL be visually distinct from read ones.

#### Scenario: User views notifications

- **WHEN** a user navigates to `/notifications`
- **THEN** the system displays all notifications ordered newest first, with unread ones highlighted

### Requirement: Mark Notifications as Read

The system SHALL allow users to mark a single notification as read by clicking on it.
The system SHALL provide a "Mark All as Read" button that marks all notifications as read at once.
After marking, the unread badge count in the header SHALL update accordingly.

#### Scenario: User marks single notification as read

- **WHEN** a user clicks on an unread notification
- **THEN** the system calls `PATCH /notifications/:id/read` and removes the highlight from that notification

#### Scenario: User marks all notifications as read

- **WHEN** a user clicks the "Mark All as Read" button
- **THEN** the system calls `PATCH /notifications/read-all` and clears all highlights and the header badge
