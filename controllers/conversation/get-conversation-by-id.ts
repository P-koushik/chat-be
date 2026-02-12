import { Request, Response } from "express";
import { getConversationWithMessages } from "../../services/chat";

export const get_conversation = async (req: Request, res: Response) => {
  try {
    const conversationId = String(req.params.id ?? "");

    // Validation
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    const data = await getConversationWithMessages(conversationId);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation fetched successfully",
      data,
    });
  } catch (error) {
    console.log("Error fetching conversation:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const statusCode = message === "Valid conversation ID is required" ? 400 : 500;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
