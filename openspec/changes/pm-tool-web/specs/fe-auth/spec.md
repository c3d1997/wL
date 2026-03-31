## ADDED Requirements

### Requirement: Login Page

The system SHALL provide a login page at `/login` with email and password fields.
Unauthenticated users SHALL be redirected to `/login` when accessing protected routes.
On successful login, the system SHALL store the accessToken in memory (Pinia store) and refreshToken in localStorage, then redirect to `/tasks`.
On failed login, the system SHALL display an error message without clearing the form.

#### Scenario: Successful login

- **WHEN** a user submits valid email and password on the login page
- **THEN** the system stores tokens, navigates to `/tasks`, and displays the user's name in the header

#### Scenario: Failed login

- **WHEN** a user submits invalid credentials
- **THEN** the system displays the error message returned by the API without navigating away

#### Scenario: Redirect unauthenticated user

- **WHEN** an unauthenticated user navigates to any protected route
- **THEN** the system redirects them to `/login`

### Requirement: Logout

The system SHALL provide a logout action in the navigation header.
On logout, the system SHALL call `POST /auth/logout`, clear the auth store, remove refreshToken from localStorage, and redirect to `/login`.

#### Scenario: User logs out

- **WHEN** a user clicks the logout button
- **THEN** the system clears all auth state and redirects to `/login`

### Requirement: Token Auto-Refresh

The system SHALL automatically refresh the accessToken using the refreshToken when an API call returns HTTP 401.
After refreshing, the system SHALL retry the original request with the new accessToken.
If the refresh fails, the system SHALL redirect the user to `/login`.

#### Scenario: Access token expires mid-session

- **WHEN** an API call returns 401 and a valid refreshToken exists in localStorage
- **THEN** the system calls `/auth/refresh`, updates the accessToken, and retries the original request transparently

#### Scenario: Refresh token is invalid or missing

- **WHEN** an API call returns 401 and the refresh attempt also fails
- **THEN** the system clears auth state and redirects to `/login`

### Requirement: Session Restore on Page Reload

The system SHALL attempt to restore the session on application startup if a refreshToken exists in localStorage.
If the refresh succeeds, the user SHALL remain on the current page.
If the refresh fails, the user SHALL be redirected to `/login`.

#### Scenario: User reloads the page with a valid refresh token

- **WHEN** the application mounts and a refreshToken exists in localStorage
- **THEN** the system calls `/auth/refresh`, restores the accessToken, and renders the page normally

### Requirement: Role-Based Route Guard

The system SHALL restrict access to routes based on the authenticated user's role.
Routes requiring specific roles SHALL redirect unauthorized users to a 403 page.

#### Scenario: RD user accesses admin route

- **WHEN** an RD user navigates to `/admin`
- **THEN** the system redirects them to `/403`

#### Scenario: PM user accesses branch route

- **WHEN** a PM user navigates to `/branches`
- **THEN** the system redirects them to `/403`
