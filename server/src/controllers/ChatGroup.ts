
import { Request,Response } from "express";
import prisma from "../config/db.js";
import { chatGroupSchema, joinRoomSchema } from "../validations/index.js";

class ChatGroup{

       static async index(req:Request,res:Response){
        try {
            const user=req.user;
            const groups=await prisma.chatGroup.findMany({
                where:{
                    user_id:user.id
                },
                orderBy:{
                    created_at:"desc"
                }
            })
            return res.json({
                message:"Chat group fetched successfully!",
                data:groups
            })
        } catch (error) {
            return res.status(500).json({
                message:"Something went wrong.Please try again!"
            })
            
        }
    }

       static async show(req:Request,res:Response){
        try {
           const {id}=req.params
           if(id){
            let group = null;
            try {
                group = await prisma.chatGroup.findUnique({
                    where:{
                        id:id,
                    }
                })
            } catch (err) {
                // If ID is malformed UUID, Prisma throws. We should just return 404.
                return res.status(404).json({ message: "No groups found" });
            }
            return res.json({data:group})
           }
            return res.status(404).json({
                message:"No groups found"
            })
        } catch (error) {
            console.error("SHOW GROUP ERROR:", error);
            return res.status(500).json({
                message:"Something went wrong.Please try again!"
            })
        }
    }

    static async joinRoom(req: Request, res: Response) {
        try {
            console.log("Join Params & Body:", req.params, req.body);
            
            const { groupId } = req.params;
            const roomId = groupId || req.params.id;
            const { name, passcode } = req.body || {};

            if (!roomId || roomId === 'undefined') {
                return res.status(400).json({ error: "Group ID required" });
            }

            if (!name || !passcode) {
                return res.status(400).json({ error: "Name and passcode required" });
            }

            let group = null;
            try {
                group = await prisma.chatGroup.findUnique({
                    where: { id: roomId },
                });
            } catch (prismaErr) {
                console.error("Prisma lookup error:", prismaErr);
                return res.status(404).json({ error: "Group not found" });
            }

            if (!group) {
                return res.status(404).json({ error: "Group not found" });
            }

            if (group.passcode !== passcode) {
                return res.status(400).json({ error: "Invalid passcode" });
            }

            return res.status(200).json({
                success: true,
                username: name,
                groupId: roomId
            });

        } catch (error) {
            console.error("JOIN ERROR:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static async store(req:Request,res:Response){
        try {
            const body=req.body;
            const parsed = chatGroupSchema.safeParse(body);
            if (!parsed.success) {
                return res.status(400).json({ message: parsed.error.errors[0].message });
            }
            const { title, passcode } = parsed.data;
            const user=req.user;
            await prisma.chatGroup.create({
                data:{
                    title,
                    passcode,
                    user_id:user.id
                }
            })
            return res.json({
                message:"Chat group created successfully!"
            })
        } catch (error) {
            return res.status(500).json({
                message:"Something went wrong.Please try again!"
            })
            
        }
    }

    static async update(req:Request,res:Response){
        try {
            const {id}=req.params;
            const body=req.body;
            const parsed = chatGroupSchema.safeParse(body);
            if (!parsed.success) {
                return res.status(400).json({ message: parsed.error.errors[0].message });
            }
            const { title, passcode } = parsed.data;

            if(id){
                await prisma.chatGroup.update({
                    data: { title, passcode },
                    where:{
                        id:id
                    }
                })
                return res.json({
                    message:"Group updated successfully!"
                })
            }
            return res.json({
                message:"No Groups found"
            })
        } catch (error) {
            return res.status(500).json({
                message:"Something went wrong.Please try again!"
            })
            
        }
    }

    static async destroy(req:Request,res:Response){
        try {
            const {id}=req.params;
                await prisma.chatGroup.delete({
                    where:{
                        id:id
                    }
                })
            return res.json({
                message:"Chat Deleted successfully!"
            })
        } catch (error) {
            return res.status(500).json({
                message:"Something went wrong.Please try again!"
            })
            
        }
    }

    
}
export default ChatGroup