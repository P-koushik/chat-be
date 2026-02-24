import mongoose, { Schema, Types, model } from "mongoose";
import { TConversation } from "../types/conversation-schema";

const Conversation_schema = new Schema<TConversation>(
  {
    members: [{ type: Types.ObjectId, ref: "user", required: true }],
  },
  {
    timestamps: true,
  }
);

export const Conversation =
  mongoose.models.Conversation || model<TConversation>("Conversation", Conversation_schema);
