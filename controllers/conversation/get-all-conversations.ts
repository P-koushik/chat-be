import { Request, Response } from "express";
import { getConversationsForUser } from "../../services/chat";

export const get_all_conversations = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const conversations = await getConversationsForUser(userId);

    return res.status(200).json({
      success: true,
      message: "All conversations fetched successfully",
      data: conversations,
    });
  } catch (error) {
    console.log("Error fetching conversations:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const statusCode = message === "Valid user ID is required" ? 400 : 500;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
