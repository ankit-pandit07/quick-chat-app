"use client";

import React, { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Send, Paperclip, X } from "lucide-react";
import { API_URL } from "@/lib/apiEndPoints";

export default function ChatInput({ onSendMessage, userToken, onTyping }: { onSendMessage: (msg: string, fileUrl?: string) => void, userToken?: string, onTyping?: (isTyping: boolean) => void }) {
    const [message, setMessage] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() && !file) return;

        let fileUrl = undefined;

        if (file) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            try {
                const res = await fetch(`${API_URL}/upload`, {
                    method: "POST",
                    headers: {
                        Authorization: userToken || "",
                    },
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    fileUrl = data.url;
                }
            } catch (err) {
                console.error("Upload failed", err);
            } finally {
                setIsUploading(false);
            }
        }

        onSendMessage(message, fileUrl);
        setMessage("");
        setFile(null);
        if (onTyping) onTyping(false);
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        if (onTyping) {
            onTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                onTyping(false);
            }, 2000);
        }
    };

    return (
        <form onSubmit={handleSend} className="p-4 border-t bg-background flex flex-col gap-2">
            {file && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md w-fit">
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    <button type="button" onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            <div className="flex items-center gap-2">
                <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    <Paperclip className="w-4 h-4" />
                </Button>
                <Input 
                    value={message} 
                    onChange={handleTextChange} 
                    placeholder="Type a message..." 
                    className="flex-1"
                    disabled={isUploading}
                />
                <Button type="submit" size="icon" disabled={isUploading || (!message.trim() && !file)}>
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </form>
    );
}
