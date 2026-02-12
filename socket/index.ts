import type { Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";
import { createConversationMessage, markConversationAsRead } from "../services/chat";
import { getConversationRoom, getUserRoom } from "./rooms";

type MessageSendPayload = {
  senderId: string;
  recipientId: string;
  message: string;
};

type ConversationRoomPayload = {
  conversationId: string;
};

type ConversationReadPayload = {
  conversationId: string;
  userId: string;
};

type AckResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
};

let io: Server | null = null;

const userSocketMap = new Map<string, Set<string>>();
const socketUserMap = new Map<string, string>();

const getOnlineUserIds = () => Array.from(userSocketMap.keys());

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unexpected server error";
};

const emitOnlineUsersSnapshot = () => {
  io?.emit("presence:users", {
    onlineUserIds: getOnlineUserIds(),
  });
};

const registerUserSocket = (socket: Socket, userId: string) => {
  const existingUserId = socketUserMap.get(socket.id);
  if (existingUserId && existingUserId !== userId) {
    const existingSockets = userSocketMap.get(existingUserId);
    if (existingSockets) {
      existingSockets.delete(socket.id);
      if (existingSockets.size === 0) {
        userSocketMap.delete(existingUserId);
        io?.emit("presence:user-offline", { userId: existingUserId });
      }
    }
  }

  const activeSockets = userSocketMap.get(userId) ?? new Set<string>();
  const wasOffline = activeSockets.size === 0;

  activeSockets.add(socket.id);
  userSocketMap.set(userId, activeSockets);
  socketUserMap.set(socket.id, userId);

  socket.join(getUserRoom(userId));

  if (wasOffline) {
    io?.emit("presence:user-online", { userId });
  }

  emitOnlineUsersSnapshot();
};

const unregisterUserSocket = (socketId: string) => {
  const userId = socketUserMap.get(socketId);
  if (!userId) {
    return;
  }

  const activeSockets = userSocketMap.get(userId);
  if (!activeSockets) {
    socketUserMap.delete(socketId);
    return;
  }

  activeSockets.delete(socketId);
  socketUserMap.delete(socketId);

  if (activeSockets.size === 0) {
    userSocketMap.delete(userId);
    io?.emit("presence:user-offline", { userId });
  }

  emitOnlineUsersSnapshot();
};

const extractUserIdFromHandshake = (socket: Socket) => {
  const queryUserId = socket.handshake.query.userId;
  if (typeof queryUserId === "string" && queryUserId) {
    return queryUserId;
  }

  const authUserId = socket.handshake.auth.userId;
  if (typeof authUserId === "string" && authUserId) {
    return authUserId;
  }

  return "";
};

const parseConversationPayload = (
  payload: string | ConversationRoomPayload | undefined
): string => {
  if (!payload) {
    return "";
  }

  if (typeof payload === "string") {
    return payload;
  }

  return payload.conversationId ?? "";
};

export const initializeSocketServer = (server: HttpServer, allowedOrigins: string[]) => {
  if (io) {
    return io;
  }

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const handshakeUserId = extractUserIdFromHandshake(socket);
    if (handshakeUserId) {
      registerUserSocket(socket, handshakeUserId);
    } else {
      socket.emit("presence:users", {
        onlineUserIds: getOnlineUserIds(),
      });
    }

    socket.on("presence:join", (payload: string | { userId: string }) => {
      const userId = typeof payload === "string" ? payload : payload?.userId;
      if (!userId) {
        return;
      }

      registerUserSocket(socket, userId);
    });

    socket.on("conversation:join", (payload: string | ConversationRoomPayload) => {
      const conversationId = parseConversationPayload(payload);
      if (!conversationId) {
        return;
      }

      socket.join(getConversationRoom(conversationId));
    });

    socket.on("conversation:leave", (payload: string | ConversationRoomPayload) => {
      const conversationId = parseConversationPayload(payload);
      if (!conversationId) {
        return;
      }

      socket.leave(getConversationRoom(conversationId));
    });

    socket.on(
      "message:send",
      async (
        payload: MessageSendPayload,
        callback?: (
          response: AckResponse<{
            conversationId: string;
            message: Awaited<ReturnType<typeof createConversationMessage>>["message"];
          }>
        ) => void
      ) => {
        try {
          const { conversation, message } = await createConversationMessage(payload);
          const conversationId = conversation._id.toString();

          socket.join(getConversationRoom(conversationId));

          io?.to(getConversationRoom(conversationId)).emit("message:new", message);
          io?.to(getUserRoom(payload.senderId)).emit("conversation:updated", { conversationId });
          io?.to(getUserRoom(payload.recipientId)).emit("conversation:updated", { conversationId });

          callback?.({
            success: true,
            data: {
              conversationId,
              message,
            },
          });
        } catch (error) {
          callback?.({
            success: false,
            message: getErrorMessage(error),
          });
        }
      }
    );

    socket.on(
      "conversation:read",
      async (
        payload: ConversationReadPayload,
        callback?: (
          response: AckResponse<{ conversationId: string; messageIds: string[]; readerId: string }>
        ) => void
      ) => {
        try {
          const messageIds = await markConversationAsRead(payload);

          if (messageIds.length > 0) {
            io?.to(getConversationRoom(payload.conversationId)).emit("conversation:read:update", {
              conversationId: payload.conversationId,
              readerId: payload.userId,
              messageIds,
              readAt: new Date().toISOString(),
            });
          }

          io?.to(getUserRoom(payload.userId)).emit("conversation:updated", {
            conversationId: payload.conversationId,
          });

          callback?.({
            success: true,
            data: {
              conversationId: payload.conversationId,
              readerId: payload.userId,
              messageIds,
            },
          });
        } catch (error) {
          callback?.({
            success: false,
            message: getErrorMessage(error),
          });
        }
      }
    );

    socket.on("disconnect", () => {
      unregisterUserSocket(socket.id);
    });
  });

  return io;
};

export const getSocketServer = () => {
  if (!io) {
    throw new Error("Socket.IO server is not initialized");
  }

  return io;
};
