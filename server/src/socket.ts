import { Server, Socket } from "socket.io";
import prisma from "./config/db.js";

interface CustomSocket extends Socket {
    room?: string;
    username?: string;
}

const roomUsers: Record<string, { id: string, name: string }[]> = {};

export function setupSocket(io: Server) {
    io.on("connection", (socket: CustomSocket) => {
        console.log("SOCKET CONNECTED:", socket.id);

        socket.on("join-room", (data: { groupId: string, username: string }) => {
            if (!data.groupId) return;
            
            socket.room = data.groupId;
            socket.username = data.username || "Anonymous";
            socket.join(data.groupId);

            console.log("JOINED ROOM:", data.groupId, "USER:", socket.username);

            if (!roomUsers[data.groupId]) {
                roomUsers[data.groupId] = [];
            }

            // Remove existing socket connection if any to prevent duplicates
            roomUsers[data.groupId] = roomUsers[data.groupId].filter(u => u.id !== socket.id);
            roomUsers[data.groupId].push({ id: socket.id, name: socket.username });

            // Emit updated users list
            io.to(data.groupId).emit("users-update", roomUsers[data.groupId]);
        });

        socket.on("send-message", async (data) => {
            console.log("MESSAGE RECEIVED:", data);
            try {
                const roomId = data.groupId || socket.room;
                if (!roomId) return;

                const content = data.message || data.content || "";
                const senderName = data.sender?.name || data.sender_name || socket.username || "Anonymous";
                const senderId = data.sender?.id || data.sender_id || null;

                // Construct fallback broadcast payload upfront
                let broadcastData: any = {
                    id: `temp_db_${Date.now()}`,
                    temp_id: data.temp_id,
                    content: content,
                    file_url: data.file_url || null,
                    group_id: roomId,
                    sender_id: senderId ? Number(senderId) : null,
                    sender_name: senderName,
                    created_at: new Date().toISOString(),
                    sender: senderId ? { id: Number(senderId), name: senderName } : null
                };

                try {
                    // Save the message to the database
                    const savedMessage = await prisma.message.create({
                        data: {
                            content: content,
                            file_url: data.file_url || null,
                            chat_group: { connect: { id: roomId } },
                            ...(senderId && { sender: { connect: { id: Number(senderId) } } })
                        },
                        include: {
                            sender: {
                                select: { id: true, name: true, image: true }
                            }
                        }
                    });
                    console.log("MESSAGE SAVED", savedMessage?.id);
                    broadcastData = { ...savedMessage, temp_id: data.temp_id, sender_name: senderName };
                } catch (dbErr) {
                    console.error("Error saving message in DB:", dbErr);
                }

                io.to(roomId).emit("receive-message", broadcastData);
                console.log("MESSAGE EMITTED");
            } catch (err) {
                console.error("Critical error in socket send-message:", err);
            }
        });

        socket.on("typing", (data) => {
            if (socket.room) {
                socket.to(socket.room).emit("typing", data);
            }
        });

        socket.on("stop_typing", (data) => {
            if (socket.room) {
                socket.to(socket.room).emit("stop_typing", data);
            }
        });

        socket.on("disconnect", () => {
            console.log("SOCKET DISCONNECTED:", socket.id);
            if (socket.room && roomUsers[socket.room]) {
                roomUsers[socket.room] = roomUsers[socket.room].filter(u => u.id !== socket.id);
                io.to(socket.room).emit("users-update", roomUsers[socket.room]);
                // Notify call participants if the user disconnected
                io.to(socket.room).emit("user-left-call", { peerId: socket.id });
            }
        });

        // WebRTC Signaling Events
        socket.on("call-user", (data: { roomId: string, callerName: string, callType: string }) => {
            console.log("CALL INITIATED:", data.callerName, "type:", data.callType, "in room", data.roomId);
            socket.to(data.roomId).emit("incoming-call", { callerId: socket.id, callerName: data.callerName, callType: data.callType });
        });

        socket.on("user-busy", (data: { roomId: string, callerId: string }) => {
            io.to(data.callerId).emit("user-busy", { peerId: socket.id });
        });

        socket.on("join-call", (data: { roomId: string }) => {
            console.log("USER JOINED CALL:", socket.id);
            socket.to(data.roomId).emit("user-joined-call", { peerId: socket.id, peerName: socket.username });
        });

        socket.on("reject-call", (data: { roomId: string }) => {
            socket.to(data.roomId).emit("call-rejected", { peerId: socket.id });
        });

        socket.on("leave-call", (data: { roomId: string }) => {
            socket.to(data.roomId).emit("user-left-call", { peerId: socket.id });
        });

        socket.on("end-call", (data: { roomId: string, target?: string }) => {
            if (data.target) {
                io.to(data.target).emit("end-call", { peerId: socket.id });
            } else {
                socket.to(data.roomId).emit("end-call", { peerId: socket.id });
            }
        });

        socket.on("webrtc-offer", (data: { target: string, sdp: any }) => {
            io.to(data.target).emit("webrtc-offer", {
                caller: socket.id,
                callerName: socket.username,
                sdp: data.sdp
            });
        });

        socket.on("webrtc-answer", (data: { target: string, sdp: any }) => {
            io.to(data.target).emit("webrtc-answer", {
                caller: socket.id,
                sdp: data.sdp
            });
        });

        socket.on("webrtc-ice-candidate", (data: { target: string, candidate: any }) => {
            io.to(data.target).emit("webrtc-ice-candidate", {
                caller: socket.id,
                candidate: data.candidate
            });
        });
    });
}