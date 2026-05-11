# Credit Helper

A full-stack Angular web application for guided credit repair. Users follow a structured multi-step workflow with progress tracking, document generation, and deadline management.

## Features

- **Authentication** — Email/password and Google sign-in via Firebase Auth
- **Progress Tracking** — Timeline dashboard showing status across all steps
- **Dispute Management** — Add and track dispute items per bureau with countdown timers
- **Letter Generation** — Auto-generated letters ready to print or copy
- **Secondary Bureau Checklist** — Track freeze status across secondary reporting agencies
- **Encrypted Storage** — Sensitive data encrypted with AES-GCM via Web Crypto API before being stored in Firestore

## Tech Stack

- Angular 19 (standalone components, signals)
- Firebase (Firestore, Authentication)
- Playwright (E2E tests)
- Karma/Jasmine (unit tests)
- Vercel (deployment)

## Prerequisites

- Node.js 18+
- A Firebase project with **Firestore** and **Authentication** (Email/Password + Google) enabled

## Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment template and fill in your Firebase config:
   ```bash
   cp src/environments/environment.template.ts src/environments/environment.ts
   ```

## Commands

| Command | Description |
|---|---|
| `npm start` | Start the dev server at `http://localhost:4200` |
| `npm run build` | Production build (output to `dist/`) |
| `npm test` | Run unit tests with Karma/Jasmine |
| `npm run e2e` | Run Playwright E2E tests (requires dev server running) |

## UI Mockups

Static HTML mockups are in `ui-designs/` and can be opened directly in a browser.
