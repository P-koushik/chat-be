# Setup

## Requirements

- Node.js (LTS recommended)
- npm
- MongoDB instance

## Environment Variables

Create `.env` in `chat-be`:

```env
PORT=8000
MONGO_URL=mongodb://localhost:27017/chat
```

Notes:

- If `MONGO_URL` is missing, code defaults to `NA` and runs without DB connection.
- Most features require MongoDB to function correctly.

## Install

```bash
npm install
```

## Run (dev)

```bash
npm run dev
```

Server boots from `index.ts` and exposes:

- REST API on `http://localhost:<PORT>/api/v1`
- Socket.IO on the same host/port

## Build

```bash
npm run build
```
