# Data Models

## `User` collection

Defined in `models/user.ts`.

Fields:

- `email`: `string`, required, unique
- `username`: `string`, required
- `createdAt`, `updatedAt`: auto timestamps

Model name: `User`

## `Conversation` collection

Defined in `models/conversation.ts`.

Fields:

- `members`: `ObjectId[]`, required, references users
- `createdAt`, `updatedAt`: auto timestamps

Model name: `Conversation`

Note: schema uses `ref: "user"` (lowercase), while user model name is `User`.
Population elsewhere uses `model: "User"`.

## `message` collection

Defined in `models/messages.ts`.

Fields:

- `sender_id`: `ObjectId`, required, ref `User`
- `message`: `string`, required
- `conversation_id`: `ObjectId`, required, ref `Conversation`
- `read_by`: `ObjectId[]`, required, ref `User`
- `createdAt`, `updatedAt`: auto timestamps

Model name: `message` (lowercase)

Indexes:

- `{ conversation_id: 1, createdAt: 1 }`
- `{ conversation_id: 1, read_by: 1 }`

## Read State Logic

- New message starts with `read_by = [senderId]`.
- Unread count for a user = messages in user conversations where:
  - sender is not the user
  - user not present in `read_by`
- Mark-read operation adds userId into `read_by` with `$addToSet`.
