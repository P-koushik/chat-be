# Chat Backend Documentation

This folder contains implementation-focused documentation for all current backend features.

## Documents

- `SETUP.md`: environment, install, run, build
- `API-CRUD.md`: all REST endpoints with request/response and status codes
- `SOCKETS.md`: Socket.IO connection model, rooms, events, and ACK contracts
- `DATA-MODELS.md`: MongoDB/Mongoose collections, fields, and indexes
- `FLOWS.md`: end-to-end feature flows (messaging, read receipts, presence)

## Scope

Current backend features include:

- User creation and retrieval
- Conversation listing and retrieval
- Message sending
- Read receipts (HTTP + Socket.IO)
- Real-time presence and conversation updates

Not yet implemented:

- User update/delete endpoints
- Persistent friend request workflow (route exists, logic is TODO)
