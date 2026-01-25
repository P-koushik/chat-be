import { Request , Response } from "express";
import { Conversation } from "../../models/conversation";

export const get_all_conversations = async(req:Request , res:Response)=>{
    try {
        const { userId } = req.body

        // Validation
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            })
        }

        // Get all conversations for the user
        const conversations = await Conversation.find({
            members: userId
        }).populate({
            path: "members",
            model: "User"
        }).sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            message: "All conversations fetched successfully",
            data: conversations
        })
    } catch (error) {
        console.log("Error fetching conversations:", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}