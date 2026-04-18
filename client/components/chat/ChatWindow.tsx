"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { API_URL } from "@/lib/apiEndPoints";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages, currentUserId, currentUserName, typingUsers, userToken }: { messages: MessageType[], currentUserId: number, currentUserName: string, typingUsers?: string[], userToken?: string }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState<string>("");

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleEditStart = useCallback((id: string, content: string) => {
        setEditingMsgId(id);
        setEditContent(content);
    }, []);

    const handleEditSave = useCallback(async (id: string) => {
        await fetch(`${API_URL}/messages/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: userToken || "" },
            body: JSON.stringify({ content: editContent })
        });
        setEditingMsgId(null);
    }, [editContent, userToken]);

    const handleEditCancel = useCallback(() => {
        setEditingMsgId(null);
    }, []);

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 scroll-smooth bg-muted/10 relative" ref={scrollRef}>
            {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground h-full min-h-[200px] animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <span className="text-2xl">👋</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">Welcome to the Chat</h3>
                    <p className="text-sm">No messages yet. Say hello to start the conversation!</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 pb-2">
                    {messages.map((msg) => (
                        <MessageBubble 
                            key={msg.id}
                            msg={msg}
                            isMe={msg.sender_id ? msg.sender_id === currentUserId : msg.sender_name === currentUserName}
                            isEditing={editingMsgId === msg.id}
                            editContent={editContent}
                            userToken={userToken || ""}
                            onEditStart={handleEditStart}
                            onEditChange={setEditContent}
                            onEditCancel={handleEditCancel}
                            onEditSave={handleEditSave}
                        />
                    ))}
                </div>
            )}
            {typingUsers && typingUsers.length > 0 && (
                <div className="flex justify-start items-center gap-2 mt-2 px-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-card border border-border/50 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"></span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium">
                            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is typing" : "are typing"}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
