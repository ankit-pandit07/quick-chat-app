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
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" ref={scrollRef}>
            {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    No messages yet. Start the conversation!
                </div>
            ) : (
                messages.map((msg) => (
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
                ))
            )}
            {typingUsers && typingUsers.length > 0 && (
                <div className="flex justify-start">
                    <span className="text-xs text-muted-foreground italic animate-pulse">
                        {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                    </span>
                </div>
            )}
        </div>
    );
}
