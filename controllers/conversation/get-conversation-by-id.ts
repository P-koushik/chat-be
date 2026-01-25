import { Request , Response } from "express";
import { Conversation } from "../../models/conversation";
import { Message } from "../../models/messages";

export const get_conversation = async(req:Request , res:Response)=>{
    try {
        const { conversationId } = req.body

        // Validation
        if (!conversationId) {
            return res.status(400).json({
                success: false,
                message: "Conversation ID is required"
            })
        }

        // Get conversation with populated members
        const conversation = await Conversation.findById(conversationId).populate({
            path: "members",
            model: "User"
        })

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found"
            })
        }

        // Get all messages in the conversation
        const messages = await Message.find({
            conversation_id: conversationId
        }).sort({ createdAt: 1 })

        return res.status(200).json({
            success: true,
            message: "Conversation fetched successfully",
            data: {
                conversation,
                messages
            }
        })
    } catch (error) {
        console.log("Error fetching conversation:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}