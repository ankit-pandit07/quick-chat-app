import { Request, Response } from "express";
import prisma from "../config/db.js";
import { updateMessageSchema } from "../validations/index.js";

export class MessageController {
    static async index(req: Request, res: Response) {
        try {
            const { groupId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const skip = (page - 1) * limit;

            const messages = await prisma.message.findMany({
                where: {
                    group_id: groupId
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    }
                },
                orderBy: {
                    created_at: "asc"
                },
                take: limit,
                skip: skip
            });

            return res.json({
                message: "Messages fetched successfully!",
                data: messages
            });
        } catch (error) {
            console.error("Error fetching messages:", error);
            return res.status(500).json({
                message: "Something went wrong while fetching messages. Please try again!"
            });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const parsed = updateMessageSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ message: parsed.error.errors[0].message });
            }
            const { content } = parsed.data;
            
            const message = await prisma.message.update({
                where: { id },
                data: { content, is_edited: true },
                include: {
                    sender: {
                        select: { id: true, name: true, image: true }
                    }
                }
            });

            // Need to broadcast to room, but we don't have io here directly easily unless we export it.
            // Assuming io is exported from socket.ts
            // We will import io from index.ts or socket.ts
            const { io } = await import("../index.js");
            io.to(message.group_id).emit("message_updated", message);

            return res.json({ message: "Message updated successfully", data: message });
        } catch (error) {
            console.error("Error updating message", error);
            return res.status(500).json({ message: "Error updating message" });
        }
    }

    static async destroy(req: Request, res: Response) {
        try {
            const { id } = req.params;
            
            const message = await prisma.message.update({
                where: { id },
                data: { is_deleted: true, content: "This message was deleted" },
            });

            const { io } = await import("../index.js");
            io.to(message.group_id).emit("message_deleted", { id: message.id, group_id: message.group_id });

            return res.json({ message: "Message deleted successfully" });
        } catch (error) {
            console.error("Error deleting message", error);
            return res.status(500).json({ message: "Error deleting message" });
        }
    }
}
