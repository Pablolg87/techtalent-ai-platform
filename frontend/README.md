# TalentPilot AI frontend

The frontend is a React, TypeScript, and Vite workspace in the repository root's
npm workspace.

## Install

From the repository root, install workspace dependencies:

```sh
npm install
```

## Develop

Start the Vite development server from the repository root:

```sh
npm run dev:frontend
```

Alternatively, run the workspace script directly:

```sh
npm run dev --workspace frontend
```

Vite serves the application at `http://localhost:5173` by default. Its `/api`
development proxy forwards requests to the Node backend at
`http://localhost:4000`, removing the `/api` prefix.

## Sign in

The app starts at the login screen. Create an account with your name, email,
and a password of at least 12 characters, then sign in with that email and
password. Registration creates the account but does not sign you in
automatically. After login the frontend validates the access token with
`GET /api/auth/me` before showing Jobs, Candidates, and Matching.

The access token is held in memory only. It is sent as a Bearer token by the
shared API client for protected requests, cleared when you sign out, and
discarded when the page reloads. You must sign in again after a reload.
Missing, invalid, or expired sessions return the app to login with a message.
The frontend does not persist or expose the backend JWT signing secret.

For local development, start PostgreSQL and the Node backend with a configured
local `.env` and applied backend database migration, then start Vite. The
frontend does not call protected endpoints before a successful login.

## Build

```sh
npm run build --workspace frontend
```
