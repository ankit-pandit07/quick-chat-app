"use client"

import { getSocket } from "@/lib/socket.config"
import { useEffect, useMemo, useState, useRef } from "react"
import ChatWindow from "./ChatWindow"
import ChatInput from "./ChatInput"
import { CustomUser } from "@/app/api/auth/[...nextauth]/options"
import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"
import { MessageType, ChatGroupType } from "@/types"
import JoinRoomModal from "./JoinRoomModal"
import { API_URL } from "@/lib/apiEndPoints"
import ChatHeader from "./ChatHeader"
import UserAvatar from "./UserAvatar"
import VideoCall from "./VideoCall"
import { Video, Phone } from "lucide-react"

export default function ChatBase({ groupId, oldMessages, user, group }: { groupId: string, oldMessages: MessageType[], user: CustomUser | null, group: ChatGroupType | null }) {
    const [messages, setMessages] = useState<MessageType[]>(oldMessages);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [onlineUsersCount, setOnlineUsersCount] = useState<number>(0);
    const [activeUsers, setActiveUsers] = useState<{id: string, name: string}[]>([]);
    const [hasJoined, setHasJoined] = useState<boolean>(!!user);
    const [anonSession, setAnonSession] = useState<{id: number, name: string, groupId: string} | null>(null);
    const [showSidebar, setShowSidebar] = useState(false);
    
    // Call States
    const [activeCallType, setActiveCallType] = useState<'none' | 'audio' | 'video'>('none');
    const [incomingCall, setIncomingCall] = useState<{ callerId: string, callerName: string, callType: 'audio' | 'video' } | null>(null);
    const isBusyRef = useRef(false);

    useEffect(() => {
        isBusyRef.current = activeCallType !== 'none';
    }, [activeCallType]);

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

        socket.on("incoming-call", (data: { callerId: string, callerName: string, callType: 'audio' | 'video' }) => {
            if (isBusyRef.current) {
                socket.emit("user-busy", { roomId: groupId, callerId: data.callerId });
            } else {
                setIncomingCall(data);
            }
        });

        socket.on("user-busy", () => {
            alert("The user you are trying to call is currently busy.");
            setActiveCallType('none');
        });

        socket.on("call-rejected", () => {
            console.log("Call was rejected by a peer");
        });

        socket.on("end-call", () => {
            setActiveCallType('none');
        });

        return () => {
            socket.off("receive-message");
            socket.off("message_updated");
            socket.off("message_deleted");
            socket.off("typing");
            socket.off("stop_typing");
            socket.off("users-update");
            socket.off("incoming-call");
            socket.off("user-busy");
            socket.off("call-rejected");
            socket.off("end-call");
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
        <div className="flex flex-col flex-1 bg-background overflow-hidden w-full h-full relative border border-border/50 md:shadow-2xl md:rounded-2xl md:max-h-[92vh] md:my-6 md:mx-auto max-w-[1400px]">
            <ChatHeader 
                group={group} 
                onlineUsersCount={onlineUsersCount} 
                onSidebarToggle={() => setShowSidebar(!showSidebar)} 
                showSidebar={showSidebar} 
                onStartCall={(type) => {
                    socket.emit("call-user", { roomId: groupId, callerName: currentUserName, callType: type });
                    setActiveCallType(type);
                }}
            />

            {/* Incoming Call Modal */}
            {incomingCall && activeCallType === 'none' && (
                <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-border text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            {incomingCall.callType === 'video' ? <Video className="w-8 h-8 text-primary" /> : <Phone className="w-8 h-8 text-primary" />}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Incoming {incomingCall.callType === 'video' ? 'Video' : 'Audio'} Call</h3>
                        <p className="text-muted-foreground mb-6">{incomingCall.callerName} is calling...</p>
                        <div className="flex gap-4 justify-center">
                            <button 
                                onClick={() => {
                                    socket.emit("reject-call", { roomId: groupId });
                                    setIncomingCall(null);
                                }}
                                className="px-6 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                            >
                                Decline
                            </button>
                            <button 
                                onClick={() => {
                                    setActiveCallType(incomingCall.callType);
                                    setIncomingCall(null);
                                }}
                                className="px-6 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Call Active */}
            {activeCallType !== 'none' && (
                <VideoCall 
                    socket={socket} 
                    groupId={groupId} 
                    currentUserId={currentUserId} 
                    currentUserName={currentUserName}
                    callType={activeCallType}
                    onEndCall={() => {
                        setActiveCallType('none');
                    }} 
                />
            )}

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
                <div className={`absolute right-0 top-0 bottom-0 w-72 bg-card border-l border-border transform transition-transform duration-300 ease-out z-20 md:relative md:transform-none ${showSidebar ? "translate-x-0 shadow-2xl" : "translate-x-full md:translate-x-0 md:shadow-none"}`}>
                    <div className="p-4 border-b border-border flex justify-between items-center bg-muted/10">
                        <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
                            <Users className="w-4 h-4 text-primary"/> 
                            Group Participants
                        </h3>
                        <button onClick={() => setShowSidebar(false)} className="md:hidden p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">✕</button>
                    </div>
                    <div className="p-3 overflow-y-auto h-full pb-20 flex flex-col gap-1">
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group">
                            <UserAvatar name={currentUserName} size="sm" isOnline={true} />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{currentUserName} <span className="text-xs text-muted-foreground font-normal">(You)</span></span>
                                <span className="text-[10px] text-green-500 font-medium">Online</span>
                            </div>
                        </div>
                        {activeUsers.map((u, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group">
                                <UserAvatar name={u.name || "User"} size="sm" isOnline={true} />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-[150px]">{u.name || "User"}</span>
                                    <span className="text-[10px] text-green-500 font-medium">Online</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
