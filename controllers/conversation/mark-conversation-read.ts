import { Request, Response } from "express";
import { markConversationAsRead } from "../../services/chat";
import { getSocketServer } from "../../socket";
import { getConversationRoom } from "../../socket/rooms";

export const mark_conversation_read = async (req: Request, res: Response) => {
  try {
    const conversationId = String(req.params.id ?? "");
    const userIdValue = req.body.userId as string | string[] | undefined;
    const userId = Array.isArray(userIdValue) ? userIdValue[0] : userIdValue;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const messageIds = await markConversationAsRead({
      conversationId,
      userId,
    });

    if (messageIds.length > 0) {
      try {
        const io = getSocketServer();
        io.to(getConversationRoom(conversationId)).emit("conversation:read:update", {
          conversationId,
          readerId: userId,
          messageIds,
          readAt: new Date().toISOString(),
        });
      } catch (socketError) {
        console.log("Socket emit skipped:", socketError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Conversation marked as read",
      data: {
        conversationId,
        readerId: userId,
        messageIds,
      },
    });
  } catch (error) {
    console.log("Error marking conversation as read:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const statusCode =
      message === "Conversation not found"
        ? 404
        : message === "User is not a member of this conversation"
          ? 403
          : message === "Valid conversation ID is required" ||
              message === "Valid user ID is required"
            ? 400
            : 500;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
