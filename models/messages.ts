import mongoose, { model, Schema, Types } from "mongoose";
import { TMessage } from "../types/message-shema";

const message_schema = new Schema<TMessage>(
  {
    sender_id: { type: Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    conversation_id: { type: Types.ObjectId, ref: "Conversation", required: true },
    read_by: [{ type: Types.ObjectId, ref: "User", required: true }],
  },
  {
    timestamps: true,
  }
);

message_schema.index({ conversation_id: 1, createdAt: 1 });
message_schema.index({ conversation_id: 1, read_by: 1 });

export const Message = mongoose.models.message || model<TMessage>("message", message_schema);
