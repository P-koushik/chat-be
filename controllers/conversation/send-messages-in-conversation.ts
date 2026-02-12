import { Request, Response } from "express";
import { createConversationMessage } from "../../services/chat";
import { getSocketServer } from "../../socket";
import { getConversationRoom, getUserRoom } from "../../socket/rooms";

export const send_message = async (req: Request, res: Response) => {
  try {
    const { senderId, recipientId, message } = req.body;

    const { conversation, message: createdMessage } = await createConversationMessage({
      senderId,
      recipientId,
      message,
    });

    try {
      const io = getSocketServer();
      const conversationId = conversation._id.toString();
      io.to(getConversationRoom(conversationId)).emit("message:new", createdMessage);
      io.to(getUserRoom(senderId)).emit("conversation:updated", { conversationId });
      io.to(getUserRoom(recipientId)).emit("conversation:updated", { conversationId });
    } catch (socketError) {
      console.log("Socket emit skipped:", socketError);
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: createdMessage,
    });
  } catch (error) {
    console.log("Error sending message:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const statusCode =
      message === "Sender or recipient not found"
        ? 404
        : message === "Cannot send message to yourself" ||
            message === "Message cannot be empty" ||
            message === "Invalid sender or recipient ID" ||
            message === "Sender ID, recipient ID, and message are required"
          ? 400
          : 500;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
