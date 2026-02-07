import { Types } from "mongoose";

export type TConversation = {
  members: Types.ObjectId[];
};
