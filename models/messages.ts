import mongoose, { model, Schema, Types } from "mongoose";
import { TMessage } from "../types/message-shema";

const message_schema = new Schema<TMessage>(
  {
    sender_id: { type: Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    conversation_id: { type: Types.ObjectId, ref: "Conversation", required: true },
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.models.message || model<TMessage>("message", message_schema);
