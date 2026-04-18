import ChatBase from '@/components/chat/ChatBase'
import React from 'react'
import { getServerSession } from "next-auth";
import { authOptions, CustomSession } from "../../api/auth/[...nextauth]/options";
import { fetchChatMessages, fetchChatGroupById } from '@/fetch/groupFetch';

export default async function chat({params}:{params: Promise<{id:string}> | {id:string}}) {
    // Correctly extract groupId from route params (handles both Next 14 and 15)
    const resolvedParams = await params;
    const groupId = resolvedParams.id;

    const session: CustomSession | null = await getServerSession(authOptions);
    let messages: Array<MessageType> = [];
    let group: any = null;

    try {
        group = await fetchChatGroupById(groupId, session?.user?.token || "");
        if (session?.user?.token) {
            messages = await fetchChatMessages(groupId, session.user.token);
        }
    } catch (e) {
        console.error("Failed to fetch initial chat data", e);
    }
    
  return (
    <div className="h-screen flex flex-col bg-slate-50">
        <ChatBase groupId={groupId} oldMessages={messages} user={session?.user || null} group={group} />
    </div>
  )
}
