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
`http://localhost:4000`, removing the `/api` prefix. The current application
shell is static and does not make API requests.

## Build

```sh
npm run build --workspace frontend
```
