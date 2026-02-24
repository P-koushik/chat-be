# Feature Flows

## 1. Send Message Flow

1. Client calls REST `POST /conversation/send/message` or socket `message:send`.
2. Server validates sender/recipient/message.
3. Server verifies both users exist.
4. Server finds existing conversation for both members or creates one.
5. Server creates message with sender auto-marked as read.
6. Server emits:
   - `message:new` to conversation room
   - `conversation:updated` to sender and recipient user rooms
7. API returns `201` (REST) or `success: true` ACK (socket).

## 2. Get Conversation Detail Flow

1. Client calls `GET /conversation/:id`.
2. Server validates conversation id.
3. Server fetches conversation with populated members.
4. Server fetches conversation messages sorted ascending by creation time.
5. API returns conversation + messages payload.

## 3. Get Conversation List Flow

1. Client calls `GET /conversation/?userId=<id>`.
2. Server validates user id.
3. Server queries conversations where user is a member.
4. For each conversation, server calculates:
   - last message
   - unread count for requesting user
5. Results are sorted by most recent message/activity descending.
6. API returns enriched conversation list.

## 4. Mark Read Flow

1. Client calls REST `PATCH /conversation/:id/read` or socket `conversation:read`.
2. Server validates conversation and user ids.
3. Server confirms user belongs to conversation.
4. Server finds unread incoming messages for that user.
5. Server updates `read_by` for those messages.
6. If updates happened, server emits `conversation:read:update` to room.
7. Server emits `conversation:updated` to reader user room in socket flow.
8. API/ACK returns changed message ids.

## 5. Presence Flow

1. Client connects socket with `query.userId` or `auth.userId` (or sends `presence:join`).
2. Server maps socket to user and joins user room.
3. If first active socket for user, server emits `presence:user-online`.
4. Server emits `presence:users` snapshot after presence changes.
5. On disconnect, socket is removed.
6. If no sockets remain for user, server emits `presence:user-offline`.
