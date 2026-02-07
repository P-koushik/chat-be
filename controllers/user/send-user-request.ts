import { Request, Response } from "express";
import { User } from "../../models/user";

export const sendUserRequest = async (req: Request, res: Response) => {
  try {
    const { senderId, recipientId } = req.body;

    // Validation
    if (!senderId || !recipientId) {
      return res.status(400).json({
        success: false,
        message: "Sender ID and Recipient ID are required",
      });
    }

    // Check if both users exist
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    if (!sender || !recipient) {
      return res.status(404).json({
        success: false,
        message: "Sender or recipient not found",
      });
    }

    // Prevent sending request to self
    if (senderId === recipientId) {
      return res.status(400).json({
        success: false,
        message: "Cannot send request to yourself",
      });
    }

    // TODO: Implement friend request logic with database
    // For now, return success response
    return res.status(200).json({
      success: true,
      message: "User request sent successfully",
    });
  } catch (error) {
    console.log("Error sending user request:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
