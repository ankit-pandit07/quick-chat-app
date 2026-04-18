import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, MoreVertical } from 'lucide-react';
import { ChatGroupType } from '@/types';
import UserAvatar from './UserAvatar';

interface ChatHeaderProps {
    group: ChatGroupType | null;
    onlineUsersCount: number;
    onSidebarToggle: () => void;
    showSidebar: boolean;
}

export default function ChatHeader({ group, onlineUsersCount, onSidebarToggle, showSidebar }: ChatHeaderProps) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20 sticky top-0 transition-all duration-300">
            <div className="flex items-center gap-3">
                <Link href="/dashboard" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors active:scale-95 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                
                <div className="flex items-center gap-3">
                    <UserAvatar name={group?.title || 'Group'} size="md" />
                    <div className="flex flex-col">
                        <h2 className="font-semibold text-base leading-tight flex items-center gap-2">
                            {group?.title || "Chat Room"}
                        </h2>
                        <div className="flex items-center gap-2 text-xs mt-0.5">
                            <span className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                {onlineUsersCount} online
                            </span>
                            <span className="text-muted-foreground opacity-50">•</span>
                            <span className="text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">
                                PIN: {group?.passcode || "***"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <button 
                    onClick={onSidebarToggle} 
                    className={`p-2 rounded-full transition-all active:scale-95 ${showSidebar ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    title="Toggle Participants"
                >
                    <Users className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-muted rounded-full transition-colors active:scale-95 text-muted-foreground hover:text-foreground hidden md:flex">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
