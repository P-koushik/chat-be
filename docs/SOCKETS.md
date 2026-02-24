# Socket.IO Documentation

Socket server is initialized in `socket/index.ts` and shares the same HTTP server as Express.

## Connection

- CORS origins are inherited from backend allowed origins list.
- User identity can be provided at handshake:
  - `query.userId`
  - `auth.userId`

If userId is present, server registers the socket to user presence and `user:<userId>` room.

## Rooms

- User room: `user:<userId>`
- Conversation room: `conversation:<conversationId>`

## Client -> Server Events

### `presence:join`

Registers socket as online for user.

- Payload:

```json
{ "userId": "USER_ID" }
```

or string `"USER_ID"`.

### `conversation:join`

Join a conversation room.

- Payload:

```json
{ "conversationId": "CONVERSATION_ID" }
```

or string `"CONVERSATION_ID"`.

### `conversation:leave`

Leave a conversation room (same payload format as join).

### `message:send` (with ACK)

- Payload:

```json
{
  "senderId": "USER_ID",
  "recipientId": "USER_ID",
  "message": "Hello"
}
```

- ACK success:

```json
{
  "success": true,
  "data": {
    "conversationId": "CONVERSATION_ID",
    "message": {}
  }
}
```

- ACK failure:

```json
{
  "success": false,
  "message": "Validation or server error message"
}
```

### `conversation:read` (with ACK)

- Payload:

```json
{
  "conversationId": "CONVERSATION_ID",
  "userId": "USER_ID"
}
```

- ACK success:

```json
{
  "success": true,
  "data": {
    "conversationId": "CONVERSATION_ID",
    "readerId": "USER_ID",
    "messageIds": ["MESSAGE_ID"]
  }
}
```

- ACK failure:

```json
{
  "success": false,
  "message": "Validation or server error message"
}
```

## Server -> Client Events

### Presence

- `presence:users`
  - `{ "onlineUserIds": ["USER_ID"] }`
- `presence:user-online`
  - `{ "userId": "USER_ID" }`
- `presence:user-offline`
  - `{ "userId": "USER_ID" }`

### Messaging

- `message:new`
  - emitted to `conversation:<id>` when new message is created
- `conversation:updated`
  - emitted to sender/recipient user rooms for list refresh
  - payload: `{ "conversationId": "CONVERSATION_ID" }`
- `conversation:read:update`
  - emitted to conversation room when reads are updated
  - payload includes `conversationId`, `readerId`, `messageIds`, `readAt`

## Presence Tracking Behavior

- User can have multiple sockets (stored in `Map<userId, Set<socketId>>`).
- User is considered offline only when last socket disconnects.
- Every join/disconnect emits a full `presence:users` snapshot.
