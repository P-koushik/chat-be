import { Types } from "mongoose";

export type TMessage = {
  sender_id: Types.ObjectId;
  message: string;
  conversation_id: Types.ObjectId;
};
