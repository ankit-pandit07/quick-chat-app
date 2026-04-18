import React, { memo } from "react";
import { MessageType } from "@/types";
import { Edit2, Trash2 } from "lucide-react";
import { API_URL } from "@/lib/apiEndPoints";
import UserAvatar from "./UserAvatar";

interface MessageBubbleProps {
    msg: MessageType;
    isMe: boolean;
    isEditing: boolean;
    editContent: string;
    userToken: string;
    onEditStart: (id: string, content: string) => void;
    onEditChange: (content: string) => void;
    onEditCancel: () => void;
    onEditSave: (id: string) => void;
}

const MessageBubble = memo(({
    msg,
    isMe,
    isEditing,
    editContent,
    userToken,
    onEditStart,
    onEditChange,
    onEditCancel,
    onEditSave
}: MessageBubbleProps) => {

    const handleDelete = async () => {
        try {
            await fetch(`${API_URL}/messages/${msg.id}`, { 
                method: "DELETE", 
                headers: { Authorization: userToken } 
            });
        } catch (error) {
            console.error("Failed to delete message", error);
        }
    };

    return (
        <div className={`flex w-full group animate-in slide-in-from-bottom-2 fade-in duration-300 ${isMe ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[85%] md:max-w-[70%] ${isMe ? "flex-row-reverse" : "flex-row"} items-end gap-2`}>
                
                {/* Avatar for others */}
                {!isMe && (
                    <div className="mb-1 hidden sm:block">
                        <UserAvatar name={msg.sender?.name || msg.sender_name || "User"} size="sm" />
                    </div>
                )}

                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && (msg.sender?.name || msg.sender_name) && (
                        <span className="text-[11px] font-medium text-muted-foreground ml-1 mb-1 sm:hidden">
                            {msg.sender?.name || msg.sender_name}
                        </span>
                    )}

                    <div className="flex items-center gap-2">
                        {isMe && !msg.is_deleted && (
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                <button onClick={() => onEditStart(msg.id, msg.content)} className="p-1.5 hover:bg-muted rounded-full text-muted-foreground transition-colors hover:text-foreground">
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={handleDelete} className="p-1.5 hover:bg-red-50 rounded-full text-red-400 hover:text-red-600 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        <div className={`relative px-4 py-3 rounded-[20px] transition-all duration-200 group-hover:shadow-md
                            ${isMe 
                                ? "bg-primary text-primary-foreground rounded-br-[4px] shadow-sm" 
                                : "bg-card border border-border/40 text-card-foreground rounded-bl-[4px] shadow-sm"} 
                            ${msg.is_deleted ? "italic opacity-70 bg-muted border-none text-muted-foreground shadow-none" : ""} 
                            ${msg.pending ? "opacity-70" : ""}`}
                        >
                            {msg.file_url && !msg.is_deleted && (
                                <div className="mb-2 -mx-2 -mt-1.5 rounded-t-[18px] overflow-hidden bg-black/5">
                                    {msg.file_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={`http://localhost:7000${msg.file_url}`} alt="Uploaded media" className={`w-full h-auto max-h-[250px] object-cover ${msg.pending ? 'animate-pulse' : ''}`} />
                                    ) : (
                                        <a href={`http://localhost:7000${msg.file_url}`} target="_blank" rel="noopener noreferrer" className="underline p-2 block text-sm">
                                            View Attachment
                                        </a>
                                    )}
                                </div>
                            )}
                            
                            {isEditing ? (
                                <div className="flex flex-col gap-3 min-w-[200px]">
                                    <input 
                                        value={editContent} 
                                        onChange={(e) => onEditChange(e.target.value)} 
                                        className="bg-primary-foreground/10 border-b-2 border-primary-foreground/30 focus:border-primary-foreground focus:outline-none text-[15px] p-1.5 transition-colors rounded-t-md" 
                                        autoFocus
                                    />
                                    <div className="flex gap-2 text-xs font-medium justify-end mt-1">
                                        <button onClick={onEditCancel} className="px-4 py-1.5 rounded-full hover:bg-primary-foreground/10 transition-colors">Cancel</button>
                                        <button onClick={() => onEditSave(msg.id)} className="px-4 py-1.5 bg-primary-foreground text-primary rounded-full hover:shadow-md transition-all shadow-sm font-semibold">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-end gap-3 flex-wrap">
                                    <span className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</span>
                                    <div className={`flex items-center gap-1.5 text-[10px] shrink-0 mt-1 sm:mt-0 ${isMe ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                        {msg.is_edited && !msg.pending && <span>(edited)</span>}
                                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {msg.pending && <span className="animate-pulse">⏳</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
