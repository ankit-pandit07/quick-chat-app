"use client";
import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import LoginModal from "../auth/LoginModal";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";
import { MessageSquare } from "lucide-react";

export default function Navbar({user}:{user:CustomUser | null}) {
  return (
    <nav className="p-4 md:p-6 flex justify-between items-center bg-background/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-50 transition-all">
      <div className="container mx-auto max-w-7xl flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
          <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl leading-none">Q</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">QuickChat</h1>
        </Link>
        <div className="flex items-center space-x-4 md:space-x-8 text-foreground font-medium">
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          </div>
          {!user ? (
            <LoginModal />
          ) : (
            <Link href="/dashboard">
              <Button className="rounded-full px-6 font-semibold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">Dashboard</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}