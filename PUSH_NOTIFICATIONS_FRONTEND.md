# WhoCan — Frontend Push Notifications Guide

Guide for implementing **Firebase Cloud Messaging (FCM)** push notifications in the **Buyer** and **Seller** mobile apps. Backend already creates in-app notification rows and sends FCM when a valid device token exists and the user has push enabled.

---

## 1. Overview

| Piece | Behavior |
|--------|----------|
| Delivery | Firebase Admin SDK → FCM |
| Token storage | `users.fcmToken` |
| Push gate | `users.appNotifications` must be `true` **and** `fcmToken` must be set |
| In-app inbox | Always saved to DB (even if push is skipped) |
| Routing | Use FCM `data.key` (+ ids in `data`) to open the right screen |

Push is **skipped** (but inbox row may still exist) when:

- `appNotifications` is off
- `fcmToken` is missing
- Firebase is not configured on the server
- FCM send fails

---

## 2. Prerequisites (app side)

1. Add the same Firebase project the backend uses (`FIREBASE_SERVICE_ACCOUNT_JSON` on the API).
2. Enable FCM for iOS / Android.
3. Request notification permission before fetching a token.
4. **Android:** create a high-importance notification channel. If the API sets `FCM_ANDROID_CHANNEL_ID`, the channel id on the device **must match**.
5. Do **not** show a second local notification when FCM already includes a `notification` payload and the OS showed the tray banner (foreground handling is the exception — see §6).

---

## 3. Register / refresh the FCM token

Send the device token after login and on every cold start. Prefer all three paths so tokens stay fresh.

### 3.1 Login (optional but recommended)

`POST /api/buyer/login` or `POST /api/seller/login`

```json
{
  "email": "user@example.com",
  "password": "••••••••",
  "fcmToken": "<FCM_DEVICE_TOKEN>",
  "deviceId": "<device-id>",
  "deviceType": "android"
}
```

### 3.2 App startup (required body)

Call after auth on app launch:

| App | Endpoint |
|-----|----------|
| Buyer | `POST /api/buyer/startup` |
| Seller | `POST /api/seller/startup` |

```json
{
  "fcmToken": "<FCM_DEVICE_TOKEN>"
}
```

Headers: `Authorization: Bearer <access_token>`

### 3.3 Explicit device-token update

| App | Endpoint |
|-----|----------|
| Buyer | `POST /api/buyer/notifications/device-token` |
| Seller | `POST /api/seller/notifications/device-token` |

```json
{
  "fcmToken": "<FCM_DEVICE_TOKEN>"
}
```

Use when:

- FCM token rotates (`onTokenRefresh`)
- User grants permission after login
- Logout → clear remote token: send `{ "fcmToken": null }` or `""`

### Suggested flow

```
App start (logged in)
  → request permission (if needed)
  → get FCM token
  → POST /startup { fcmToken }
  → listen for token refresh → POST /notifications/device-token
Logout
  → POST /notifications/device-token { fcmToken: null }
```

---

## 4. Push preference (`appNotifications`)

Backend **will not push** if `appNotifications` is `false`.

**Seller** can read/update:

- `GET /api/seller/profile/settings`
- `PUT /api/seller/profile/settings` with `{ "appNotifications": true | false }`

Ensure the toggle defaults to **on** for new users (DB default is typically enabled). If buyer settings UI does not expose this yet, keep the field `true` server-side or wire the same preference when available.

---

## 5. FCM message shape

Backend sends **both**:

1. `notification` — title/body for the system tray  
2. `data` — string map for deep linking (all values are **strings**)

### Example `data` payload

```json
{
  "key": "buyer_accepted",
  "notificationId": "123",
  "title": "Booking Accepted",
  "description": "Your booking request has been accepted by the seller.",
  "bookingId": "45",
  "favorId": "12",
  "audience": "buyer",
  "eventKey": "accepted",
  "createdBy": "seller",
  "favorType": "standard"
}
```

### Always present

| Field | Meaning |
|-------|---------|
| `key` | Primary routing key (see §7) |
| `notificationId` | Inbox row id — use to mark read |
| `title` | Same as tray title |
| `description` | Same as tray body |

### Common routing fields (booking / chat)

| Field | Meaning |
|-------|---------|
| `bookingId` | Favor booking id |
| `favorId` | Favor id |
| `audience` | `buyer` \| `seller` |
| `eventKey` | Semantic event (e.g. `accepted`, `chat_new_message`) |
| `createdBy` | `buyer` \| `seller` \| `admin` \| `system` |
| `favorType` | `standard` \| `custom` \| `""` |

### Chat extras

| Field | Meaning |
|-------|---------|
| `conversationId` | Booking chat conversation |
| `messageId` | Message id |

### Dispute support chat extras

| Field | Meaning |
|-------|---------|
| `id` / `ticketId` / `reportId` | Dispute ticket id (same value) |
| `threadId` | Support thread id |
| `messageId` | Support message id |

### Withdraw (seller)

| Field | Meaning |
|-------|---------|
| `withdrawId` | Withdrawal / transaction id |
| `amount` | Amount as string |
| `eventKey` | `withdraw_success` \| `withdraw_failed` |

> **Note:** Non-string values in `data` are JSON-stringified by the backend. Prefer `String(data.bookingId)` / `int.tryParse` on the client.

---

## 6. Handling incoming pushes

### Background / killed

- OS shows the `notification` title/body.
- On tap, read `message.data` (or platform equivalent) and navigate using `key` + ids.

### Foreground

- FCM may still deliver `notification` + `data`.
- Show **one** in-app banner/snackbar **or** a local notification — avoid duplicates.
- Optionally refresh the notification inbox badge.

### Tap / deep link

```
onNotificationOpened / getInitialMessage
  → parse data.key
  → route (table below)
  → PATCH .../notifications/:notificationId/read
```

---

## 7. Notification keys → suggested screens

Route primarily on **`key`**. Use ids from `data` for params.

### Buyer keys

| `key` | When | Open |
|-------|------|------|
| `buyer_seller_custom_favor_request` | Seller offered on buyer’s custom favor | Custom favor detail / requests (`favorId`, `bookingId`) |
| `buyer_new_custom_request` | (legacy/reserved) custom request | Custom favors |
| `buyer_accepted` | Seller accepted booking | Booking detail (`bookingId`) |
| `buyer_rejected` | Seller rejected | Booking detail |
| `buyer_canceled_seller` | Seller canceled | Booking detail |
| `buyer_in-progress` | Work started | Booking detail |
| `buyer_completed` | Seller marked complete | Booking detail (approve / review) |
| `buyer_booking_reported` | Seller filed a report | Dispute / booking report |
| `buyer_chat_new_message` | New booking chat message | Chat (`conversationId` / `bookingId`) |
| `buyer_dispute_support_message` | Admin support message | Dispute support chat (`reportId` / `ticketId` / `id`) |
| `buyer_dispute_resolved` | Admin resolved dispute | Booking / dispute result |
| `admin_message` | Admin broadcast / DM | Inbox / generic message |

### Seller keys

| `key` | When | Open |
|-------|------|------|
| `seller_new_request_onfavor` | Buyer booked a standard favor | Booking / requests (`bookingId`, `favorId`) |
| `seller_custom_favor_accepted` | Buyer accepted seller’s custom offer + paid | Booking detail |
| `seller_buyer_approved` | Buyer approved completed work | Booking / earnings |
| `seller_buyer_rejected` | Buyer requested changes | Booking detail |
| `seller_canceled` / `seller_canceled_buyer` | Buyer canceled / withdrew | Booking detail |
| `seller_review_added` | New review | Reviews / booking |
| `seller_booking_reported` | Buyer reported booking | Dispute / report |
| `seller_chat_new_message` | New booking chat message | Chat |
| `seller_dispute_support_message` | Admin support message | Dispute support chat (`reportId`) |
| `seller_dispute_resolved` | Dispute resolved | Booking / dispute |
| `seller_withdraw_success` | Payout succeeded | Wallet / withdraw history |
| `seller_withdraw_failed` | Payout failed | Wallet / withdraw history |
| `admin_message` | Admin message | Inbox |
| `seller_test_notification` | Test-only (`POST /api/seller/notifications/test-send`) | Ignore or debug screen |

### Fallback

Unknown `key` → open **Notifications** list.

---

## 8. In-app notification APIs (inbox)

Use the same base path for buyer or seller:

| Action | Method | Path |
|--------|--------|------|
| List | `GET` | `/api/{buyer\|seller}/notifications?page=1&limit=20` |
| Mark one read | `PATCH` | `/api/{buyer\|seller}/notifications/:notificationId/read` |
| Mark all read | `PATCH` | `/api/{buyer\|seller}/notifications/read-all` |
| Update FCM token | `POST` | `/api/{buyer\|seller}/notifications/device-token` |

### List item shape (approx.)

```json
{
  "id": 123,
  "title": "Booking Accepted",
  "description": "...",
  "message": "...",
  "key": "buyer_accepted",
  "payload": {
    "bookingId": "45",
    "favorId": "12",
    "audience": "buyer",
    "eventKey": "accepted",
    "createdBy": "seller",
    "favorType": "standard",
    "title": "Booking Accepted",
    "description": "..."
  },
  "isRead": false,
  "readAt": null,
  "createdAt": "...",
  "actor": {
    "id": 7,
    "fullName": "...",
    "profileImage": "..."
  },
  "visualType": "accepted"
}
```

`visualType` hints for icons: `accepted` | `declined` | `completed` | `bids_or_requests` | `chat` | `default`.

Tap inbox row → same routing as push (`key` + `payload`).

---

## 9. Seller test endpoint (dev)

```http
POST /api/seller/notifications/test-send
Authorization: Bearer <seller_token>
Content-Type: application/json

{
  "sellerUserId": 42,
  "title": "Test",
  "description": "Hello",
  "key": "seller_test_notification"
}
```

Requires the target seller to have `fcmToken` + `appNotifications: true`.

---

## 10. Implementation checklist

- [ ] Firebase configured (iOS + Android)
- [ ] Notification permission requested
- [ ] Token sent on login / startup / refresh / logout clear
- [ ] Android channel id matches backend (if `FCM_ANDROID_CHANNEL_ID` is set)
- [ ] Foreground handler does not double-notify
- [ ] Tap handlers for cold start + background
- [ ] Router covers all keys in §7
- [ ] Inbox list + mark read wired
- [ ] `appNotifications` respected (seller settings; buyer when available)
- [ ] All `data` values treated as strings

---

## 11. Quick curl references

```bash
# Startup (refresh token)
curl -X POST "$BASE/api/buyer/startup" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fcmToken":"DEVICE_FCM_TOKEN"}'

# Update token
curl -X POST "$BASE/api/buyer/notifications/device-token" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fcmToken":"DEVICE_FCM_TOKEN"}'

# Inbox
curl "$BASE/api/buyer/notifications?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"

# Mark read
curl -X PATCH "$BASE/api/buyer/notifications/123/read" \
  -H "Authorization: Bearer $TOKEN"
```

Replace `buyer` with `seller` for the seller app.

---

## 12. Troubleshooting

| Symptom | Check |
|---------|--------|
| No tray notification | Permission; `fcmToken` saved; `appNotifications` true; Firebase project matches backend |
| Inbox has row, no push | Token / preference / server Firebase config (`pushed: false` reasons on server) |
| Tap does nothing | Parse `data.key` from the opened message, not only `notification` |
| Duplicate banners | Don’t create a local notification when OS already displayed FCM `notification` |
| Wrong screen | Confirm `key` table; parse string ids with `int.parse` / `Number()` |

---

*Generated from WhoCan backend notification + booking + chat + dispute-support contracts.*
