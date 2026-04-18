import { z } from "zod";

export const chatGroupSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  passcode: z.string().min(4, "Passcode must be at least 4 characters").max(20),
});

export const joinRoomSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  passcode: z.string().min(4, "Passcode must be at least 4 characters").max(20),
});

export const updateMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(1000),
});
