# Credit Helper

A web application that guides users through the 7-step credit repair process. It provides step-by-step instructions, generates pre-filled dispute letters for the three major credit bureaus (Experian, TransUnion, Equifax), and tracks your progress through the entire repair workflow.

## Features

- **Authentication** — Email/password and Google sign-in via Firebase Auth
- **Progress Tracking** — Timeline dashboard showing status of all 7 steps
- **Dispute Management** — Add and track individual dispute items per bureau with 30-day countdown timers
- **Letter Generation** — Pre-filled dispute letters (Round 1, Follow-up, Reinvestigation, Escalation, Personal Info Update) ready to print or copy
- **Secondary Bureau Checklist** — Track security freezes across 9 secondary reporting agencies
- **Encrypted Storage** — SSN encrypted with AES-GCM via Web Crypto API before being stored in Firestore

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

## The Credit Repair Process

The app walks users through a structured, multi-step credit repair workflow. Each step includes detailed guidance, relevant letter templates, and progress tracking.
