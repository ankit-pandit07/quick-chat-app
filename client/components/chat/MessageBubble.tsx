import React, { memo } from "react";
import { MessageType } from "@/types";
import { Edit2, Trash2 } from "lucide-react";
import { API_URL } from "@/lib/apiEndPoints";

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
        <div className={`flex group ${isMe ? "justify-end" : "justify-start"}`}>
            {isMe && !msg.is_deleted && (
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 mr-2 transition-opacity">
                    <button onClick={() => onEditStart(msg.id, msg.content)} className="p-1 hover:bg-muted rounded text-muted-foreground">
                        <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={handleDelete} className="p-1 hover:bg-muted rounded text-red-500">
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            )}
            <div className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && msg.sender?.name && (
                    <span className="text-xs text-muted-foreground ml-1 mb-1">{msg.sender.name}</span>
                )}
                <div className={`p-3 rounded-2xl ${isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"} ${msg.is_deleted ? "italic opacity-70" : ""} ${msg.pending ? "opacity-70" : ""}`}>
                    {msg.file_url && !msg.is_deleted && (
                        <div className="mb-2">
                            {msg.file_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={`http://localhost:7000${msg.file_url}`} alt="Uploaded media" className={`rounded-md max-w-full h-auto max-h-[300px] object-contain ${msg.pending ? 'animate-pulse' : ''}`} />
                            ) : (
                                <a href={`http://localhost:7000${msg.file_url}`} target="_blank" rel="noopener noreferrer" className="underline">
                                    View Attachment
                                </a>
                            )}
                        </div>
                    )}
                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            <input 
                                value={editContent} 
                                onChange={(e) => onEditChange(e.target.value)} 
                                className="bg-transparent border-b border-primary-foreground/50 focus:outline-none text-sm" 
                                autoFocus
                            />
                            <div className="flex gap-2 text-xs">
                                <button onClick={() => onEditSave(msg.id)}>Save</button>
                                <button onClick={onEditCancel}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <span>{msg.content}</span>
                    )}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-muted-foreground opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.pending && <span className="text-[10px] text-muted-foreground ml-1">⏳</span>}
                    {msg.is_edited && !msg.pending && <span className="text-[10px] text-muted-foreground opacity-50">(edited)</span>}
                </div>
            </div>
        </div>
    );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
