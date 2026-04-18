"use client";

import React, { useRef, useState } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { API_URL } from "@/lib/apiEndPoints";

export default function ChatInput({ groupId, onSendMessage, userToken, onTyping }: { groupId?: string, onSendMessage: (msg: string, fileUrl?: string) => void, userToken?: string, onTyping?: (isTyping: boolean) => void }) {
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
        <div className="p-3 md:p-4 bg-background border-t border-border z-20 w-full shrink-0">
            <form onSubmit={handleSend} className="relative flex flex-col gap-2 max-w-4xl mx-auto w-full">
                {file && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-xl w-fit mb-1 border border-border shadow-sm animate-in slide-in-from-bottom-2 fade-in">
                        <div className="w-8 h-8 bg-background rounded flex items-center justify-center shadow-sm">
                            <Paperclip className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium truncate max-w-[150px] md:max-w-[300px] text-foreground">{file.name}</span>
                        <button type="button" onClick={() => setFile(null)} className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors ml-1">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                
                <div className="flex items-center gap-2 bg-muted/40 p-1 md:p-1.5 rounded-full border border-border/50 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
                    <input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        accept="image/*,application/pdf"
                    />
                    
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all shrink-0 active:scale-95 flex items-center justify-center"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    
                    <input 
                        value={message} 
                        onChange={handleTextChange} 
                        placeholder="Type a message..." 
                        className="flex-1 bg-transparent border-none focus:outline-none py-3 px-2 text-[15px] text-foreground placeholder:text-muted-foreground/60"
                        disabled={isUploading}
                        autoComplete="off"
                    />
                    
                    <button 
                        type="submit" 
                        disabled={isUploading || (!message.trim() && !file)}
                        className={`p-3 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                            message.trim() || file 
                            ? 'bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95' 
                            : 'bg-muted text-muted-foreground'
                        }`}
                    >
                        {isUploading ? (
                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                            <Send className={`w-5 h-5 ${(message.trim() || file) ? 'translate-x-0.5 translate-y-[1px]' : ''}`} />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
