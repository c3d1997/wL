## ADDED Requirements

### Requirement: User Registration

The system SHALL allow registration of new user accounts via `POST /auth/register`.
The request body SHALL include `name`, `email`, and `password`.
The system SHALL store passwords as bcrypt hashes (minimum cost factor 10) and SHALL NOT store plaintext passwords.
The system SHALL reject registration if the email already exists, returning HTTP 409.

#### Scenario: Successful registration

- **WHEN** a POST request is sent to `/auth/register` with valid `name`, `email`, and `password`
- **THEN** the system creates a new User record with `role: rd` by default, and returns HTTP 201 with the created user object (excluding `passwordHash`)

#### Scenario: Duplicate email rejected

- **WHEN** a POST request is sent to `/auth/register` with an email that already exists
- **THEN** the system returns HTTP 409 with an error message indicating the email is already in use

#### Scenario: Missing required fields

- **WHEN** a POST request is sent to `/auth/register` with missing `name`, `email`, or `password`
- **THEN** the system returns HTTP 400 with a descriptive validation error

### Requirement: User Login

The system SHALL authenticate users via `POST /auth/login` with `email` and `password`.
On success, the system SHALL issue a JWT access token (valid for 15 minutes) and a refresh token (valid for 7 days).
The system SHALL return HTTP 401 for invalid credentials and SHALL NOT indicate whether email or password was incorrect separately.

#### Scenario: Successful login

- **WHEN** a POST request is sent to `/auth/login` with valid `email` and `password`
- **THEN** the system returns HTTP 200 with `{ accessToken, refreshToken, user }` where `user` excludes `passwordHash`

#### Scenario: Invalid credentials

- **WHEN** a POST request is sent to `/auth/login` with an email that does not exist or an incorrect password
- **THEN** the system returns HTTP 401 with a generic "Invalid credentials" error message

### Requirement: Token Refresh

The system SHALL issue a new access token via `POST /auth/refresh` when provided with a valid, non-revoked refresh token.
The system SHALL return HTTP 401 if the refresh token is expired, invalid, or blacklisted.

#### Scenario: Valid refresh token

- **WHEN** a POST request is sent to `/auth/refresh` with a valid refresh token in the request body
- **THEN** the system returns HTTP 200 with a new `{ accessToken }`

#### Scenario: Revoked or expired refresh token

- **WHEN** a POST request is sent to `/auth/refresh` with a refresh token that has been revoked (blacklisted) or is expired
- **THEN** the system returns HTTP 401

### Requirement: Logout

The system SHALL invalidate the refresh token via `POST /auth/logout`.
The system SHALL add the provided refresh token to a blacklist so it cannot be used again.
The system SHALL require a valid access token to call this endpoint.

#### Scenario: Successful logout

- **WHEN** an authenticated user sends a POST request to `/auth/logout` with their refresh token
- **THEN** the system adds the refresh token to the blacklist and returns HTTP 204

#### Scenario: Subsequent refresh after logout fails

- **WHEN** a user attempts `POST /auth/refresh` after the refresh token has been blacklisted via logout
- **THEN** the system returns HTTP 401

### Requirement: Auth Middleware

The system SHALL protect all routes (except `POST /auth/register` and `POST /auth/login`) with an auth middleware that validates the Bearer access token.
The middleware SHALL extract the user identity (`id`, `role`) from the verified token and attach it to `req.user`.
The middleware SHALL return HTTP 401 if the Authorization header is missing or the token is invalid/expired.

#### Scenario: Valid access token

- **WHEN** a request includes a valid `Authorization: Bearer <accessToken>` header
- **THEN** the middleware calls `next()` with `req.user` populated with `{ id, role }`

#### Scenario: Missing or invalid token

- **WHEN** a request is made to a protected route without a valid Authorization header
- **THEN** the middleware returns HTTP 401 before the request reaches the controller
