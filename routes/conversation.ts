import { Router } from "express";
import { get_conversation } from "../controllers/conversation/get-conversation-by-id";
import { get_all_conversations } from "../controllers/conversation/get-all-conversations";
import { send_message } from "../controllers/conversation/send-messages-in-conversation";
import { mark_conversation_read } from "../controllers/conversation/mark-conversation-read";

const router = Router();

// This is the conversation that looks like chat's
router.get("/conversation/:id", get_conversation);
router.get("/conversation/", get_all_conversations);

// send chat messages
router.post("/conversation/send/message", send_message);
router.patch("/conversation/:id/read", mark_conversation_read);

export { router as Conversation_routes };
