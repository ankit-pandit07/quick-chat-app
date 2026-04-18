"use client"

import { getSocket } from "@/lib/socket.config"
import { useEffect, useMemo, useState } from "react"
import ChatWindow from "./ChatWindow"
import ChatInput from "./ChatInput"
import { CustomUser } from "@/app/api/auth/[...nextauth]/options"
import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"
import { MessageType, ChatGroupType } from "@/types"
import JoinRoomModal from "./JoinRoomModal"
import { API_URL } from "@/lib/apiEndPoints"

export default function ChatBase({ groupId, oldMessages, user, group }: { groupId: string, oldMessages: MessageType[], user: CustomUser | null, group: ChatGroupType | null }) {
    const [messages, setMessages] = useState<MessageType[]>(oldMessages);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [onlineUsersCount, setOnlineUsersCount] = useState<number>(0);
    const [activeUsers, setActiveUsers] = useState<{id: string, name: string}[]>([]);
    const [hasJoined, setHasJoined] = useState<boolean>(!!user);
    const [anonSession, setAnonSession] = useState<{id: number, name: string, groupId: string} | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);

    let socket = useMemo(() => {
        const socket = getSocket();
        socket.auth = { room: groupId };
        return socket.connect();
    }, [groupId]);

    useEffect(() => {
        // Check for anonymous session
        if (!user) {
            const stored = localStorage.getItem(`room_session_${groupId}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                setAnonSession(parsed);
                setHasJoined(true);
                // Also fetch messages for anon user since they weren't fetched server-side
                fetch(`${API_URL}/chat-group/${groupId}/messages`) // Assuming we make this public or pass something
                    .then(res => res.json())
                    .then(data => setMessages(data.data || []))
                    .catch(() => {});
            }
        }
    }, [groupId, user]);

    useEffect(() => {
        if (!hasJoined) return;

        const socketInstance = getSocket();
        
        if (!socketInstance.connected) {
            socketInstance.connect();
        }

        const handleConnect = () => {
            console.log("SOCKET CONNECTED TO SERVER");
            const currentName = user?.name || anonSession?.name || "Anonymous";
            socketInstance.emit("join-room", { groupId, username: currentName });
        };

        if (socketInstance.connected) {
            handleConnect();
        } else {
            socketInstance.on("connect", handleConnect);
        }

        socketInstance.on("receive-message", (data: MessageType) => {
            setMessages((prev) => {
                // If it has a temp_id, replace the optimistic message
                if (data.temp_id) {
                    const existingIndex = prev.findIndex(msg => msg.id === data.temp_id || msg.temp_id === data.temp_id);
                    if (existingIndex !== -1) {
                        const newMessages = [...prev];
                        newMessages[existingIndex] = { ...data, pending: false };
                        return newMessages;
                    }
                }
                if (prev.some((msg) => msg.id === data.id)) return prev;
                return [...prev, data];
            });
        });

        socket.on("message_updated", (data: MessageType) => {
            setMessages((prev) => prev.map(msg => msg.id === data.id ? data : msg));
        });

        socket.on("message_deleted", (data: { id: string, group_id: string }) => {
            setMessages((prev) => prev.map(msg => msg.id === data.id ? { ...msg, is_deleted: true, content: "This message was deleted", file_url: null } : msg));
        });

        socket.on("typing", (data: { name: string }) => {
            setTypingUsers((prev) => prev.includes(data.name) ? prev : [...prev, data.name]);
        });

        socket.on("stop_typing", (data: { name: string }) => {
            setTypingUsers((prev) => prev.filter(name => name !== data.name));
        });

        socket.on("users-update", (users: { id: string, name: string }[]) => {
            setOnlineUsersCount(users.length);
            setActiveUsers(users.filter(u => u.id !== socket.id)); // Keep 'You' separate
        });

        return () => {
            socket.off("receive-message");
            socket.off("message_updated");
            socket.off("message_deleted");
            socket.off("typing");
            socket.off("stop_typing");
            socket.off("users-update");
            socket.disconnect();
        };
    }, [socket, hasJoined, user, anonSession]);

    const handleSendMessage = (content: string, fileUrl?: string) => {
        console.log("SEND BUTTON CLICKED:", { content, fileUrl });
        const socketInstance = getSocket();
        console.log("SOCKET CONNECTED STATUS:", socketInstance.connected);

        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const senderId = user ? Number(user.id) : (anonSession ? anonSession.id : 0);
        const senderName = user?.name || anonSession?.name || "Anonymous";

        const optimisticMessage: MessageType = {
            id: tempId,
            temp_id: tempId,
            content,
            file_url: fileUrl,
            sender_id: senderId || 0,
            sender_name: senderName,
            group_id: groupId,
            created_at: new Date().toISOString(),
            pending: true,
            sender: user ? {
                id: senderId,
                name: senderName,
                image: user.image || null,
            } : null as any
        };

        // Instantly add to UI
        setMessages(prev => [...prev, optimisticMessage]);

        const payload = {
            temp_id: tempId,
            groupId: groupId,
            message: content,
            content: content,
            file_url: fileUrl,
            sender: {
                id: user ? senderId : null,
                name: senderName
            },
            sender_id: user ? senderId : null,
            sender_name: senderName,
        };
        console.log("BEFORE EMITTING 'send-message':", payload);
        socketInstance.emit("send-message", payload);
    };

    if (!hasJoined) {
        return <JoinRoomModal groupId={groupId} onJoined={(session) => {
            setAnonSession(session);
            setHasJoined(true);
            fetch(`${API_URL}/chat-group/${groupId}/messages`)
                .then(res => res.json())
                .then(data => setMessages(data.data || []))
                .catch(() => {});
        }} />;
    }

    const currentUserId = user ? Number(user.id) : (anonSession?.id || 0);
    const currentUserName = user?.name || anonSession?.name || "Anonymous";

    return (
        <div className="flex flex-col flex-1 bg-background overflow-hidden w-full max-w-6xl mx-auto border-x shadow-sm relative">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-card z-10 relative">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-muted rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            {group?.title || "Chat Room"}
                            <span className="text-xs font-normal px-2 py-1 bg-green-100 text-green-700 rounded-full">{onlineUsersCount} online</span>
                        </h2>
                        <p className="text-xs text-muted-foreground">Passcode: {group?.passcode || "***"}</p>
                    </div>
                </div>
                <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-muted rounded-full md:hidden">
                    <Users className="w-5 h-5 text-muted-foreground" />
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Main Chat Area */}
                <div className="flex flex-col flex-1 min-w-0">
                    <ChatWindow 
                        messages={messages} 
                        currentUserId={currentUserId} 
                        currentUserName={currentUserName}
                        typingUsers={typingUsers} 
                        userToken={user?.token || ""} 
                    />

                    <div className="p-4 bg-background border-t">
                        <ChatInput 
                            groupId={groupId} 
                            onSendMessage={handleSendMessage} 
                            userToken={user?.token || undefined} 
                            onTyping={(isTyping) => {
                                socket.emit(isTyping ? "typing" : "stop_typing", { name: user?.name || anonSession?.name || "Anonymous" });
                            }}
                        />
                    </div>
                </div>

                {/* Active Users Sidebar */}
                <div className={`absolute right-0 top-0 bottom-0 w-64 bg-card border-l transform transition-transform duration-200 ease-in-out z-20 md:relative md:transform-none ${showSidebar ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-semibold text-sm flex items-center gap-2"><Users className="w-4 h-4"/> Active Users</h3>
                        <button onClick={() => setShowSidebar(false)} className="md:hidden text-muted-foreground hover:text-foreground">✕</button>
                    </div>
                    <div className="p-2 overflow-y-auto">
                        <div className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium">{user?.name || anonSession?.name || "You"} (You)</span>
                        </div>
                        {activeUsers.map((u, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-sm truncate">{u.name || "User"}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
