# Firebase Notification Service

This project includes a Firebase-based notification system supporting:

- **Admin campaigns** (broadcast + targeted) stored once in `campaigns/`
- **Personal notifications** stored per user in `users/{uid}/notifications/`
- **Per-user campaign receipts** (read/dismiss/click) stored in `users/{uid}/campaignReceipts/`
- **Near real-time** updates via Firestore listeners
- **Optional Web Push** via FCM (requires VAPID key + Admin SDK on backend)

## Firestore Data Model

### `campaigns/{campaignId}`

Stored once per campaign (no per-user duplication for scale).

Example:

```json
{
  "name": "New Feature Released",
  "title": "New Feature Released",
  "message": "Try our new AI interview practice mode",
  "type": "popup",
  "display": "popup",
  "link": "/aiinterviewselect",
  "target": { "kind": "all" },
  "priority": 10,
  "startAt": "2026-03-16T12:00:00.000Z",
  "endAt": "2026-03-20T12:00:00.000Z",
  "status": "active",
  "createdBy": "admin_uid",
  "createdAt": "2026-03-16T11:59:00.000Z",
  "updatedAt": "2026-03-16T11:59:00.000Z"
}
```

### `users/{uid}/notifications/{notificationId}`

Personal notifications.

```json
{
  "title": "Interview Feedback Ready",
  "message": "Check your AI interview evaluation",
  "kind": "personal",
  "display": "feed",
  "link": "/dashboard/interview-results",
  "createdAt": "2026-03-16T12:00:00.000Z",
  "readAt": null
}
```

### `users/{uid}/campaignReceipts/{campaignId}`

Per-user state for a campaign (read/dismiss/click). This is what enables scalable unread/read tracking for campaigns.

```json
{
  "firstSeenAt": "2026-03-16T12:00:10.000Z",
  "shownAt": "2026-03-16T12:00:12.000Z",
  "readAt": null,
  "clickedAt": null,
  "dismissedAt": null,
  "updatedAt": "2026-03-16T12:00:12.000Z"
}
```

### `userProfiles/{uid}/fcmTokens/{tokenId}`

Web push tokens (optional).

```json
{
  "token": "<fcm_token>",
  "platform": "web",
  "createdAt": "2026-03-16T12:00:00.000Z",
  "lastSeenAt": "2026-03-16T12:00:00.000Z"
}
```

## Frontend

- **Bell + unread badge**: `src/components/NotificationBell.jsx`
- **Notification center**: `src/NotificationCenter.jsx` (route: `/notifications`)
- **Popup/toasts**: `src/components/NotificationPopupManager.jsx` (mounted globally in `src/App.jsx`)

## Backend (Render)

- **Register Web Push token**: `POST /api/notifications/register-token`
- **Admin campaigns**
  - `GET /api/admin/notifications/campaigns`
  - `POST /api/admin/notifications/campaigns`
  - `PATCH /api/admin/notifications/campaigns/:id`
  - `POST /api/admin/notifications/campaigns/:id/activate` with `{ "push": true|false }`
  - `POST /api/admin/notifications/campaigns/:id/end`
  - `GET /api/admin/notifications/campaigns/:id/analytics`

## Required Firestore Indexes

The app listens for active campaigns with:

- `where(status == "active")`
- `where(startAt <= nowIso)`
- `orderBy(startAt desc)`

Create a composite index on:

- `campaigns`: `status` (asc) + `startAt` (desc)

## Web Push (FCM) Setup

1. In Firebase Console, enable **Cloud Messaging** for Web and create a Web Push certificate / VAPID key.
2. Set frontend env:
   - `VITE_FIREBASE_VAPID_KEY=<your vapid key>`
3. Ensure backend has Firebase Admin SDK configured (`FIREBASE_SERVICE_ACCOUNT_KEY`) so it can store tokens and send pushes.

