# AGENTS.md — Credit Helper

This file describes the project, coding conventions, and agent roles for any AI working on this repository.

## Project Overview

Credit Helper is an Angular 20 SPA that guides users through the 7-step credit repair process. It generates pre-filled dispute letters for the three major credit bureaus, tracks progress through each step, and stores user data securely in Firebase.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 20, TypeScript 5.8, standalone components |
| Auth | Firebase Auth (email/password + Google) |
| Database | Firestore (AngularFire v20) |
| Encryption | Web Crypto API (AES-GCM) |
| Unit tests | Karma + Jasmine |
| E2E tests | Playwright |
| CI | GitHub Actions |

## Firestore Data Model

```
users/{uid}/
  profile/data        — { name, address, dob, ssnLast4, encryptedSSN, encryptionIV }
  steps/{stepId}      — { status, startedAt, completedAt, checklistItems }
  disputes/{id}       — { bureau, accountName, accountNumber, type, status, round, sentAt, dueAt, responseAt }
  letters/{id}        — { type, bureau, generatedAt, disputeIds[] }
```

## Key Files

| File | Purpose |
|---|---|
| `src/app/app.config.ts` | Firebase providers, app bootstrap |
| `src/app/app.routes.ts` | All routes (lazy-loaded) |
| `src/app/models.ts` | Shared TypeScript interfaces |
| `src/environments/environment.template.ts` | Copy to `environment.ts` with real Firebase config |
| `src/app/utils/crypto.ts` | AES-GCM encrypt/decrypt utilities |

> ⚠️ Never commit `src/environments/environment.ts` — it contains Firebase API keys.

## Branch Naming

All work must happen on a branch. Never commit directly to `main`.

| Prefix | Use for |
|---|---|
| `feature/` | New functionality |
| `fix/` | Bug fixes |
| `chore/` | Config, deps, tooling, CI |
| `refactor/` | Code restructuring without behavior change |

Examples: `feature/firestore-rules`, `fix/letter-ssn-decrypt`, `chore/update-dependencies`

## Commit Messages (Conventional Commits)

```
feat: add reinvestigation letter template
fix: correct 30-day countdown calculation
chore: update AngularFire to v20.1
refactor: extract letter HTML to separate template files
test: add unit tests for FollowUpService
docs: update README with setup instructions
```

## Pull Request Requirements

Every PR must include:
1. **What changed** — brief description of the change
2. **How to test** — steps to verify the change works
3. **Screenshots** — for any UI changes
4. **Tests** — unit tests for any new/changed service logic

## Test Requirements

- Unit tests for all service methods containing logic
- Unit tests for all pure utility functions (`src/app/utils/`)
- E2E tests (Playwright) for critical user flows: auth, profile save, dispute add, letter generation
- Never hit real Firestore in unit tests — mock Firebase dependencies

## Agent Roles

Four specialized agents are available in `/Users/cole/agents/`. Use the right agent for the task:

### Senior Engineer (`senior-engineer.md`)
Use for: writing code, reviewing implementations, enforcing Angular patterns, branch/commit workflow.

### Project Manager (`project-manager.md`)
Use for: planning features, breaking work into branches, writing user stories, prioritizing tasks.

### Architect (`architect.md`)
Use for: structural decisions, Firestore data model changes, evaluating new dependencies, security review.

### UX Designer (`ux-designer.md`)
Use for: UI/UX feedback, accessibility review, mobile usability, component layout, user flow critique.

## Branch Protection (Manual Setup Required)

Go to: `https://github.com/ColeWill/credit-helper/settings/branches`

Add a protection rule for `main`:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - Required checks: `build`, `unit-tests`
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings
