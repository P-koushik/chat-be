import { Types } from "mongoose";
import { Conversation } from "../models/conversation";
import { Message } from "../models/messages";
import { User } from "../models/user";

type SendMessagePayload = {
  senderId: string;
  recipientId: string;
  message: string;
};

type MarkConversationReadPayload = {
  conversationId: string;
  userId: string;
};

const ensureObjectId = (value: string) => Types.ObjectId.isValid(value);

const ensureUsers = async (senderId: string, recipientId: string) => {
  const [sender, recipient] = await Promise.all([
    User.findById(senderId),
    User.findById(recipientId),
  ]);

  if (!sender || !recipient) {
    throw new Error("Sender or recipient not found");
  }
};

const ensureConversationMember = async (conversationId: string, userId: string) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const isMember = conversation.members.some(
    (member: Types.ObjectId) => member.toString() === userId
  );
  if (!isMember) {
    throw new Error("User is not a member of this conversation");
  }

  return conversation;
};

const findOrCreateConversation = async (senderId: string, recipientId: string) => {
  let conversation = await Conversation.findOne({
    members: { $all: [senderId, recipientId] },
  });

  if (!conversation) {
    conversation = new Conversation({
      members: [senderId, recipientId],
    });
    await conversation.save();
  }

  return conversation;
};

export const createConversationMessage = async ({
  senderId,
  recipientId,
  message,
}: SendMessagePayload) => {
  if (!senderId || !recipientId || !message) {
    throw new Error("Sender ID, recipient ID, and message are required");
  }

  if (!ensureObjectId(senderId) || !ensureObjectId(recipientId)) {
    throw new Error("Invalid sender or recipient ID");
  }

  if (senderId === recipientId) {
    throw new Error("Cannot send message to yourself");
  }

  const messageText = message.trim();
  if (!messageText) {
    throw new Error("Message cannot be empty");
  }

  await ensureUsers(senderId, recipientId);

  const conversation = await findOrCreateConversation(senderId, recipientId);

  const createdMessage = await Message.create({
    sender_id: senderId,
    message: messageText,
    conversation_id: conversation._id,
    read_by: [senderId],
  });

  const populatedMessage = await Message.findById(createdMessage._id).populate({
    path: "sender_id",
    model: "User",
  });

  if (!populatedMessage) {
    throw new Error("Failed to create message");
  }

  return {
    conversation,
    message: populatedMessage,
  };
};

export const getConversationWithMessages = async (conversationId: string) => {
  if (!conversationId || !ensureObjectId(conversationId)) {
    throw new Error("Valid conversation ID is required");
  }

  const conversation = await Conversation.findById(conversationId).populate({
    path: "members",
    model: "User",
  });

  if (!conversation) {
    return null;
  }

  const messages = await Message.find({
    conversation_id: conversationId,
  })
    .populate({
      path: "sender_id",
      model: "User",
    })
    .sort({ createdAt: 1 });

  return {
    conversation,
    messages,
  };
};

export const getConversationsForUser = async (userId: string) => {
  if (!userId || !ensureObjectId(userId)) {
    throw new Error("Valid user ID is required");
  }

  const conversations = await Conversation.find({
    members: userId,
  }).populate({
    path: "members",
    model: "User",
  });

  const enrichedConversations = await Promise.all(
    conversations.map(async (conversation) => {
      const [lastMessage, unreadCount] = await Promise.all([
        Message.findOne({
          conversation_id: conversation._id,
        })
          .populate({
            path: "sender_id",
            model: "User",
          })
          .sort({ createdAt: -1 }),
        Message.countDocuments({
          conversation_id: conversation._id,
          sender_id: { $ne: userId },
          read_by: { $ne: userId },
        }),
      ]);

      return {
        ...conversation.toObject(),
        last_message: lastMessage,
        unread_count: unreadCount,
      };
    })
  );

  enrichedConversations.sort((a, b) => {
    const aDate = a.last_message?.createdAt || a.updatedAt || a.createdAt;
    const bDate = b.last_message?.createdAt || b.updatedAt || b.createdAt;

    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  return enrichedConversations;
};

export const markConversationAsRead = async ({
  conversationId,
  userId,
}: MarkConversationReadPayload) => {
  if (!conversationId || !ensureObjectId(conversationId)) {
    throw new Error("Valid conversation ID is required");
  }

  if (!userId || !ensureObjectId(userId)) {
    throw new Error("Valid user ID is required");
  }

  await ensureConversationMember(conversationId, userId);

  const unreadMessages = await Message.find({
    conversation_id: conversationId,
    sender_id: { $ne: userId },
    read_by: { $ne: userId },
  }).select("_id");

  if (unreadMessages.length === 0) {
    return [];
  }

  const unreadMessageIds = unreadMessages.map((message) => message._id);

  await Message.updateMany(
    {
      _id: { $in: unreadMessageIds },
    },
    {
      $addToSet: { read_by: userId },
    }
  );

  return unreadMessageIds.map((id) => id.toString());
};
