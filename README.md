# AI Cognitive Gaming & Memory Assistance Platform for Elderly Dementia Patients (NER)

**Smart India Hackathon 2026 — Problem Statement 26003**
Organization: Ministry of Development of North Eastern Region (MDoNER)
Category: Software · Theme: MedTech / BioTech / HealthTech

An offline-first Progressive Web App that gives elderly dementia patients in remote NER
areas adaptive cognitive games, medicine/routine reminders, and voice-guided,
culturally-relevant interaction — with a caregiver dashboard for monitoring and alerts.

---

## What this is (and isn't)

This is a **cognitive stimulation, training, and assistance platform** — not a
diagnostic tool and not a medical treatment. It doesn't diagnose dementia, stage its
severity, or claim to cure/reverse cognitive decline. It supports early, low-barrier
engagement, tracks performance trends for caregivers to act on, and reduces daily burden
through reminders — all explicitly scoped to what PS 26003 asks for.

---

## System architecture

```
PATIENT APP (PWA)
│
├─ App opens
│    │
│    ▼
├─ REMINDER CHECK ────────────────► checks 4 reminder types:
│    │                                • medicines
│    │                                • hydration
│    │                                • daily activities
│    │                                • medical appointments
│    ▼
├─ Home screen ───────────────────► today's plan + streak + family cheers
│    │
│    ▼
├─ GAME SELECTION ENGINE
│    │
│    ├── Patient profile (onboarding)      ─┐  health history +
│    │                                       │  language/cultural theme
│    ├── Current performance (recent data) ──┼──► combines both
│    │                                       │
│    ▼                                       ▼
├─ Personalized game ─────────────► picks from 5 categories:
│    │                                • memory improvement
│    │                                • attention & concentration
│    │                                • daily routine recall
│    │                                • pattern/object recognition
│    │                                • emotional & mental engagement
│    │                              + difficulty level
│    │                              + regional visuals/language/sounds
│    ▼
├─ Game screen ────────────────────► voice-guided, culturally themed play
│    │                                (solo, or facilitated group mode)
│    ▼
├─ Session result ────────────────► accuracy, time, streak
│    │        │
│    │        └───↻ feeds back into "current performance" above
│    ▼
├─ Completion summary ────────────► positive feedback only, plus any
│    │                                family/caregiver reaction (social
│    │                                touchpoint)
│    └───↻ returns to "home screen" above
│    ▼
└─ Local queue ────────────────────► stores session + reminder data,
                                       encrypted at rest
     │
     │  (sync when online, encrypted in transit)
     ▼
────────────────────────────────────────────────────────────────
SECURE DATA LAYER — encryption at rest & in transit, role-based
access control, audit logging. Wraps every hop below:
local queue ⇄ sync ⇄ backend API ⇄ database
────────────────────────────────────────────────────────────────
BACKEND (FastAPI)
│
├─ Backend API ────────────────────► processes + stores synced data
│    │
│    ▼
├─ Alert rules check ─────────────► e.g. missed dose, inactivity,
│    │                                 performance drop
│    ▼
├─ Alert created ─────────────────► stored + timestamped
│    │
│    ▼
└─ Backend API ────────────────────► pushes reminders + difficulty +
     │                                cultural content config back down
     │                                (applied on the app's next sync)
     ▼
────────────────────────────────────────────────────────────────
DASHBOARD
│
├─ Caregiver login ───────────────► role-based access (secure layer)
│    │
│    ▼
├─ Patient list ───────────────────► select a patient
│    │
│    ▼
├─ Patient overview ───────────────► activity, streak, alerts
│    │                                 ▲
│    │                                 └── fed by "alert created" above
│    ▼
├─ Detail tabs ────────────────────► analytics, reminders, health
│    │                                 profile, cultural/language
│    │                                 settings
│    ▼
└─ Social touchpoint ──────────────► send a cheer/voice note to the
                                       patient, or schedule a group
                                       session with other patients
```

---

## How this maps to PS 26003

| PS requirement | Where it's addressed |
|---|---|
| a. Games for memory, attention, routine recall, pattern/object recognition, emotional engagement | `Personalized game` — five named categories, selected per session |
| b. AI/ML adapts difficulty by performance + cognitive condition | `Game selection engine` combining `Patient profile` (static) and `Current performance` (dynamic) |
| c. Multilingual, voice-assisted interaction | Voice-guided `Game screen`; language set in `Patient profile` |
| d. Culturally familiar themes/visuals/sounds/regional language | Carried in `Patient profile` and applied to `Personalized game` content |
| e. Reminders — medicines, hydration, daily activities, appointments | `Reminder check`, all four types named explicitly |
| f. Caregiver/health-worker monitoring via dashboard + activity levels | `Patient overview`, `Detail tabs` |
| g. Offline / low-connectivity functionality | `Local queue` → `Sync when online`, fully local gameplay |
| h. Mobile/tablet, simple elderly-friendly UI | Linear screen flow, no branching navigation, large-target design |
| Adaptive gaming and memory training modules | `Game selection engine` → `Personalized game` |
| Cognitive performance tracking and analytics dashboard | `Detail tabs: analytics` |
| Caregiver monitoring and alert system | `Alert rules check` → `Alert created` → `Patient overview` |
| Offline synchronization support | `Local queue` / `Sync when online` loop |
| Secure patient data management system | `Secure data layer` (encryption, RBAC, audit log) |
| Simple and accessible UI/UX | Patient app screen flow (App opens → Home → Game → Summary) |
| Social interaction | `Social touchpoint` — caregiver cheers, optional facilitated group sessions |

---

## Tech stack

**Frontend (PWA)**
- React + Vite
- `vite-plugin-pwa` (Workbox) — service worker, offline caching, installability
- Dexie.js (IndexedDB) — local session/reminder queue
- Tailwind CSS
- i18next — multilingual UI strings
- Web Speech API — voice prompts/input (prototype scope; regional-language coverage is a known limitation, noted for future work)
- Recharts — dashboard analytics

**Backend**
- FastAPI
- SQLAlchemy + Pydantic
- PostgreSQL
- `python-jose` / `fastapi-users` — JWT auth, role-based access
- WebSockets (native) — live alerts to an open dashboard
- `pywebpush` (VAPID) — push notifications when the dashboard isn't open
- APScheduler — server-side reminder/alert backup checks

**Sync**
- `POST /sync/push` — client sends queued session/reminder data
- `GET /sync/pull` — client fetches updated reminders/difficulty/cultural config
- Timestamp-based, last-write-wins per field

**Deployment (prototype)**
- Frontend: Vercel / Netlify
- Backend + Postgres: Render / Railway

---

## Explicit non-goals

This platform does **not**:
- Diagnose dementia or determine its severity
- Provide medical treatment or claim to reverse/cure cognitive decline
- Replace clinical care — it surfaces trends for caregivers/health workers to act on, it doesn't act on them itself
