import DashNav from "@/components/dashboard/DashNav";
import { getServerSession } from "next-auth";
import React from "react";
import { authOptions, CustomSession } from "../api/auth/[...nextauth]/options";
import CreateChat from "@/components/groupChat/CreateChat";
import { fetchChatGrouop } from "@/fetch/groupFetch";
import GroupChatCard from "@/components/groupChat/GroupChatCard";

export default async function dashboard() {
  const session: CustomSession | null = await getServerSession(authOptions);
  const groups: Array<ChatGroupType> | [] = await fetchChatGrouop(
    session?.user?.token!
  );
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashNav
        name={session?.user?.name!}
        image={session?.user?.image ?? undefined}
      />
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Your Chats</h2>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage and access your active chat groups.</p>
          </div>
          <CreateChat user={session?.user!} />
        </div>

        {groups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groups.map((item, index) => (
              <GroupChatCard group={item} key={index} user={session?.user!} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-card rounded-3xl border border-dashed border-border shadow-sm">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">No active chats</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              You haven&apos;t joined any chat groups yet. Create a new chat to get started.
            </p>
            <CreateChat user={session?.user!} />
          </div>
        )}
      </main>
    </div>
  );
}
