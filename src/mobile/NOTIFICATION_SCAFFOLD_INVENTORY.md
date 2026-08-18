# Mobile Notification Scaffold — Inventory & Plan

## Why this document exists

We audited the existing notification code in the mobile app. **Most of the notification product is already built but not connected.** This doc records what exists, what actually works today, and the recommended path forward — starting with **local, device-driven notifications** before investing in server push (FCM).

---

## Current state (executive summary)

| Status | Count | Detail |
|--------|-------|--------|
| **Working today** | 1 | My Places success/error toasts (#6) |
| **Built but not wired** | 5 | Local notifications (#1–#5) |
| **Built but deferred** | 4 | Server push via FCM (#7–#10) |
| **Separate (not OS notifications)** | 1 | Learn tab survey badge (UI only) |

**Bottom line for PM:** We are not starting from zero. We have scaffold code for air quality alerts and survey prompts — the work is **wiring and testing**, not building from scratch. Server push (Firebase) can wait.

---

## How notifications are categorised

**Local OS** — appears in the phone notification shade (`flutter_local_notifications`).

**Local in-app** — overlay, banner, or dialog while the app is open.

**FCM** — message sent from our backend via Firebase (Android + iOS). Requires Firebase setup and backend integration.

> None of the scaffold notifications are **scheduled background jobs** yet. Local ones fire when the app runs relevant code; FCM ones fire when the server sends a push.

---

## Inventory — what exists in the scaffold

### Local (device-driven)

| # | Notification | Where it shows | Wired? | Code |
|---|--------------|----------------|--------|------|
| 1 | **Nearby air quality alert** | Local OS (shade) | No | ```372:377:src/mobile/lib/src/app/shared/services/notification_helper.dart``` |
| 2 | **Survey prompt (modal)** | Local in-app (dialog) | No | Trigger: ```289:289:src/mobile/lib/src/app/surveys/services/survey_trigger_service.dart``` → UI: ```83:94:src/mobile/lib/src/app/shared/services/notification_manager.dart``` |
| 3 | **Air quality alert banner** (from survey AQ trigger) | Local in-app (top banner) | No | Trigger: ```393:425:src/mobile/lib/src/app/surveys/services/survey_trigger_service.dart``` → UI: ```244:257:src/mobile/lib/src/app/shared/services/notification_manager.dart``` |
| 4 | **Survey banner** (tap-to-open) | Local in-app (top banner) | No (dead code) | ```492:502:src/mobile/lib/src/app/shared/services/notification_manager.dart``` |
| 5 | **Permission prompt** (“Enable notifications…”) | Local in-app (bottom toast) | No | ```48:73:src/mobile/lib/src/app/shared/services/notification_manager.dart``` called from ```30:50:src/mobile/lib/src/app/shared/services/notification_helper.dart``` |
| 6 | **Status toast** (success/error) | Local in-app (bottom toast) | **Yes** (My Places only) | UI: ```16:44:src/mobile/lib/src/app/shared/services/notification_manager.dart``` → caller: ```227:227:src/mobile/lib/src/app/dashboard/widgets/my_places_view.dart``` |

### FCM (server-driven) — deferred for now

| # | Notification | Where it shows | Wired? | Code |
|---|--------------|----------------|--------|------|
| 7 | **FCM → local OS mirror** (any push while app is open) | Local OS (shade) | No | ```273:284:src/mobile/lib/src/app/shared/services/push_notification_service.dart``` |
| 8 | **`air_quality_alert` push** | Local in-app (top banner) | No | Route: ```74:75:src/mobile/lib/src/app/shared/services/notification_helper.dart``` → UI: ```114:123:src/mobile/lib/src/app/shared/services/notification_helper.dart``` |
| 9 | **`survey` push** | Local in-app (simple toast) | No | ```127:141:src/mobile/lib/src/app/shared/services/notification_helper.dart``` |
| 10 | **`general` push** | Local in-app (simple toast) | No | ```148:158:src/mobile/lib/src/app/shared/services/notification_helper.dart``` |

FCM routing entry point (all three push types above):

```73:84:src/mobile/lib/src/app/shared/services/notification_helper.dart
    switch (type) {
      case 'air_quality_alert':
        _showAirQualityNotification(context, message);
        break;
      case 'survey':
        _showSurveyNotification(context, message);
        break;
      case 'general':
      default:
        _showGeneralNotification(context, message);
        break;
    }
```

### Not in this scaffold

- **Learn tab survey badge** — UI badge only, not an OS or push notification (`SurveyNotificationService` + `NavPage`).

---

## Key decision: local-first, defer FCM

The scaffold bundles **local notifications** and **Firebase push (FCM)** in one service. They serve different needs:

| Approach | Who decides to notify | Example | Needed now? |
|----------|----------------------|---------|-------------|
| **Local** | The app on the user's device | “Air near you is Unhealthy” when dashboard loads | **Yes** |
| **FCM (push)** | Our server | City-wide alert broadcast to all users | **No** (later) |

**Recommendation:** Wire up **#1–#5** first. Leave **#7–#10** uninitialised until product requires server-initiated alerts (e.g. admin broadcasts, campaigns). This avoids Firebase setup, backend token storage, and duplicate logic while we validate the core user experience.

---

## Recommended plan

### Phase 1 — Wire existing local scaffold (target: ~1 sprint)

Connect code that is already written. No new notification types — just make the scaffold work.

| Step | What | Maps to | User-facing outcome |
|------|------|---------|---------------------|
| 1 | Initialise local notifications + request OS permissions | Foundation for #1, #5 | App can legally show notifications in the shade |
| 2 | Fix navigation key so in-app dialogs can open | Foundation for #2, #3 | Survey prompts don't silently fail |
| 3 | Hook nearby AQ check to dashboard / app resume | **#1** | User gets OS alert when air near them is Unhealthy+ |
| 4 | Start survey trigger service with live data | **#2**, **#3** | User gets in-app survey prompt based on location, time, or AQ |
| 5 | Show permission prompt at the right moment | **#5** | User is asked once to enable notifications, not spammed |
| 6 | Add tap routing on OS alerts | **#1** (enhancement) | Tapping an AQ alert opens the app to the relevant screen |

**Phase 1 success criteria:**
- User receives an **OS notification** when air quality near their location is Unhealthy or worse (with 6-hour cooldown already in code).
- User sees an **in-app survey dialog** when trigger conditions are met.
- Permission flow works on Android 13+ and iOS.
- My Places toasts (#6) continue to work as today.

### Phase 2 — Clean up & decide (after Phase 1 validates UX)

| Item | Question for PM | Options |
|------|-----------------|---------|
| **#4 Survey banner** | Do we want a top banner *in addition to* the survey modal? | Wire it, or remove as duplicate |
| **#7–#10 FCM** | Do we need server-sent alerts this quarter? | Keep dormant, or plan a separate push initiative |
| **Notification settings** | Should users control alert types? | Add settings screen once local alerts are live |

### Phase 3 — True background & advanced (future)

Not in the current scaffold. Requires separate scoping:

- Alerts when the app is fully closed (needs push or background tasks)
- Scheduled reminders (daily digest, learn nudges)
- Quiet hours and per-category preferences

---

## What we are explicitly not doing in Phase 1

- Firebase / FCM setup and token registration
- Backend push integration
- Notification preferences screen
- Deleting FCM code (leave it dormant until team agrees on push scope)

---

## Suggested first sprint breakdown

| Days | Engineering focus |
|------|-------------------|
| 1–2 | Local notification init, permissions, navigation fix |
| 3 | Connect nearby air quality alert (#1) to dashboard |
| 4 | Connect survey trigger service (#2, #3) |
| 5 | QA on Android + iOS: permissions granted/denied, cooldown, tap routing |

---

## Train of thought (summary for PM)

1. **Audited the codebase** → found 10 notification touchpoints; only 1 works today.
2. **Separated local vs push** → most value is in local alerts we can ship without backend work.
3. **Prioritised wiring over building** → #1–#5 already exist; Phase 1 is connection and QA.
4. **Deferred FCM** → #7–#10 stay off until we need server-driven broadcasts.
5. **Defined clear success** → user gets AQ OS alerts and contextual survey prompts; then we iterate on settings and push.

---

## Inventory totals

**6 local** (1 OS + 5 in-app) · **4 FCM** (1 OS mirror + 3 in-app handlers) · **1 working today** (#6)

**Phase 1 focus:** #1–#5 · **Deferred:** #7–#10
