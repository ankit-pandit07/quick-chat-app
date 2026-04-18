"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { API_URL } from "@/lib/apiEndPoints";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function JoinRoomModal({ groupId, onJoined }: { groupId?: string, onJoined: (session: any) => void }) {
    const params = useParams();
    const resolvedGroupId = groupId || (params?.id as string);

    const [name, setName] = useState("");
    const [passcode, setPasscode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!resolvedGroupId) {
            toast.error("Invalid room ID. Please check the link.");
            return;
        }

        setLoading(true);

        try {
            const finalName = name.trim() || "Ankit";
            const res = await fetch(`${API_URL}/chat-group/${resolvedGroupId}/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: finalName, passcode })
            });

            const data = await res.json();
            console.log("Join API Response:", data);
            
            if (!res.ok || !data.success) {
                toast.error(data.error || data.message || "Failed to join room");
                setLoading(false);
                return;
            }

            toast.success("Joined room successfully!");
            
            try {
                // Save session in localStorage
                const sessionData = {
                    id: Math.floor(Math.random() * 1000000), // Temp session ID
                    name: data.username,
                    groupId: data.groupId
                };
                localStorage.setItem(`room_session_${resolvedGroupId}`, JSON.stringify(sessionData));
                onJoined(sessionData);
            } catch (err) {
                console.error("Error setting session data:", err);
            }

        } catch (error) {
            console.error("Network error:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-background w-full max-w-md rounded-xl shadow-xl border overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">Join Room</h2>
                    <p className="text-muted-foreground mb-6">Enter your name and the room passcode to join this conversation.</p>
                    
                    <form onSubmit={handleJoin} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Your Name</label>
                            <input 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="E.g. Ankit"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Room Passcode</label>
                            <input 
                                required
                                type="password"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter 4+ digit passcode"
                            />
                        </div>
                        <Button type="submit" className="w-full mt-2" disabled={loading}>
                            {loading ? "Joining..." : "Join Chat"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
