# API Routes Documentation

## Base URL

```
http://localhost:<PORT>/api/v1
```

The server runs on a configurable port (specified in environment variables). All routes are prefixed with `/api/v1`.

---

## User Routes

### 1. Create User

- **Method:** `POST`
- **Endpoint:** `/user/create`
- **Description:** Creates a new user in the system
- **Full URL:** `POST /api/v1/user/create`

### 2. Get User by ID

- **Method:** `GET`
- **Endpoint:** `/user/:userId`
- **Description:** Retrieves a specific user by their ID
- **Parameters:**
  - `userId` (path parameter): The ID of the user to retrieve
- **Full URL:** `GET /api/v1/user/:userId`

### 3. Get All Users

- **Method:** `GET`
- **Endpoint:** `/user`
- **Description:** Retrieves a list of all users in the system
- **Full URL:** `GET /api/v1/user`

### 4. Send User Request (Friend Request)

- **Method:** `POST`
- **Endpoint:** `/user/request/send`
- **Description:** Sends a user request (friend request) to another user
- **Full URL:** `POST /api/v1/user/request/send`

---

## Conversation Routes

### 1. Get Conversation by ID

- **Method:** `GET`
- **Endpoint:** `/conversation/:id`
- **Description:** Retrieves a specific conversation (chat) by its ID
- **Parameters:**
  - `id` (path parameter): The ID of the conversation to retrieve
- **Full URL:** `GET /api/v1/conversation/:id`

### 2. Get All Conversations

- **Method:** `GET`
- **Endpoint:** `/conversation/`
- **Description:** Retrieves all conversations in the system
- **Full URL:** `GET /api/v1/conversation/`

### 3. Send Message in Conversation

- **Method:** `POST`
- **Endpoint:** `/conversation/send/message`
- **Description:** Sends a message in a conversation (chat)
- **Full URL:** `POST /api/v1/conversation/send/message`

---

## Summary

| Method | Endpoint                            | Description                        |
| ------ | ----------------------------------- | ---------------------------------- |
| POST   | `/api/v1/user/create`               | Create a new user                  |
| GET    | `/api/v1/user/:userId`              | Get user by ID                     |
| GET    | `/api/v1/user`                      | Get all users                      |
| POST   | `/api/v1/user/request/send`         | Send user request (friend request) |
| GET    | `/api/v1/conversation/:id`          | Get conversation by ID             |
| GET    | `/api/v1/conversation/`             | Get all conversations              |
| POST   | `/api/v1/conversation/send/message` | Send message in conversation       |
