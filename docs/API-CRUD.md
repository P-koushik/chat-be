# REST API (CRUD + Feature Endpoints)

Base path: `/api/v1`

## User

### Create user

- Method: `POST`
- Path: `/user/create`
- Body:

```json
{
  "email": "alice@example.com",
  "username": "alice"
}
```

- Success: `201`
- Errors:
  - `400` missing email/username
  - `409` email already exists
  - `500` internal error

### Read user by ID

- Method: `GET`
- Path: `/user/:userId`
- Success: `200`
- Errors:
  - `400` missing `userId`
  - `404` user not found
  - `500` internal error

### Read all users

- Method: `GET`
- Path: `/user`
- Success: `200`
- Errors:
  - `500` internal error

### Send user request (placeholder endpoint)

- Method: `POST`
- Path: `/user/request/send`
- Body:

```json
{
  "senderId": "USER_ID",
  "recipientId": "USER_ID"
}
```

- Success: `200`
- Errors:
  - `400` invalid payload / self-request
  - `404` sender or recipient not found
  - `500` internal error

Important: friend request persistence/business logic is not implemented yet.

## Conversation

### Read conversation by ID

- Method: `GET`
- Path: `/conversation/:id`
- Success: `200` with:
  - `conversation` (members populated)
  - `messages` (sender populated, sorted ascending by `createdAt`)
- Errors:
  - `400` invalid/missing conversation id
  - `404` conversation not found
  - `500` internal error

### Read all conversations for user

- Method: `GET`
- Path: `/conversation/`
- Query:

```text
userId=<USER_ID>
```

- Success: `200`, each conversation enriched with:
  - `last_message`
  - `unread_count`
- Errors:
  - `400` missing/invalid `userId`
  - `500` internal error

### Create message (conversation auto-create)

- Method: `POST`
- Path: `/conversation/send/message`
- Body:

```json
{
  "senderId": "USER_ID",
  "recipientId": "USER_ID",
  "message": "Hello"
}
```

- Behavior:
  - validates sender/recipient/message
  - creates conversation if sender-recipient pair has none
  - creates message with `read_by` containing sender
  - emits socket events when socket server is available
- Success: `201`
- Errors:
  - `400` validation errors / invalid ids / self-send / empty message
  - `404` sender or recipient missing
  - `500` internal error

### Mark conversation as read

- Method: `PATCH`
- Path: `/conversation/:id/read`
- Body:

```json
{
  "userId": "USER_ID"
}
```

- Behavior:
  - validates conversation and user
  - confirms user membership in conversation
  - marks unread incoming messages as read
  - emits read update socket event if any message changed
- Success: `200` with updated `messageIds`
- Errors:
  - `400` invalid ids
  - `403` user not in conversation
  - `404` conversation not found
  - `500` internal error

## CRUD Coverage Summary

- User: `Create`, `Read` implemented; `Update`, `Delete` missing.
- Conversation: `Read` implemented; creation is implicit through message creation.
- Message: `Create` implemented; direct `Read/Update/Delete` endpoints not implemented.
