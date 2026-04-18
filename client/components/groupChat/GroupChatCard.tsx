import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";
import GroupChatCardMenu from "./GroupChatCardMenu";
import Link from "next/link";
import { CalendarIcon, LockKeyhole } from "lucide-react";

export default function GroupChatCard({
  group,
  user,
}: {
  group: ChatGroupType;
  user: CustomUser;
}) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20 flex flex-col h-full">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
      
      <CardHeader className="flex flex-row justify-between items-start pt-6 px-6 pb-4 relative z-10">
        <CardTitle className="text-xl font-semibold tracking-tight leading-none group-hover:text-primary transition-colors line-clamp-1">
          {group.title}
        </CardTitle>
        <div className="ml-4 -mt-2 -mr-2">
          <GroupChatCardMenu user={user} group={group} />
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-6 pt-0 flex-1 flex flex-col justify-end relative z-10 text-sm text-muted-foreground">
        <div className="space-y-2 mt-2 bg-muted/30 p-3 rounded-xl border border-border/50">
          <div className="flex items-center gap-2">
            <LockKeyhole className="w-4 h-4 text-primary/70" />
            <span>Passcode: <strong className="text-foreground tracking-widest">{group.passcode}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary/70" />
            <span>Created: <span className="text-foreground font-medium">{new Date(group.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
          </div>
        </div>
        
        <Link 
          href={`/chat/${group.id}`} 
          className="mt-5 w-full text-center py-2.5 rounded-xl bg-primary/10 text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-200"
        >
          Open Chat
        </Link>
      </CardContent>
    </Card>
  );
}