import { Request, Response } from "express";
import { Conversation } from "../../models/conversation";
import { Message } from "../../models/messages";
import { User } from "../../models/user";

export const send_message = async (req: Request, res: Response) => {
  try {
    const { senderId, recipientId, message } = req.body;

    // Validation
    if (!senderId || !recipientId || !message) {
      return res.status(400).json({
        success: false,
        message: "Sender ID, Recipient ID, and message are required",
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

    // Prevent sending message to self
    if (senderId === recipientId) {
      return res.status(400).json({
        success: false,
        message: "Cannot send message to yourself",
      });
    }

    // Find or create conversation between two users
    let conversation = await Conversation.findOne({
      members: {
        $all: [senderId, recipientId],
      },
    });

    // If conversation doesn't exist, create one
    if (!conversation) {
      conversation = new Conversation({
        members: [senderId, recipientId],
      });
      await conversation.save();
    }

    // Create and save the message
    const newMessage = new Message({
      sender_id: senderId,
      message: message,
      conversation_id: conversation._id,
    });
    await newMessage.save();

    // Populate sender details in the message
    await newMessage.populate({
      path: "sender_id",
      model: "User",
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.log("Error sending message:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
