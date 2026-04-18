import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, MessageSquare } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-20 md:py-32 overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10" />
      
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Sparkles className="w-4 h-4" />
        <span>The modern way to communicate</span>
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight max-w-4xl mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
        Instant Chat Links for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Seamless Conversations</span>
      </h1>
      
      <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
        QuickChat makes it effortless to create secure chat rooms and start conversations in seconds, with zero setup required.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
        <Link href="/dashboard">
          <Button size="lg" className="rounded-full px-8 h-14 text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1 group">
            Start Chatting Free
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
        <Link href="#features">
          <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg font-semibold border-border/50 hover:bg-muted transition-all hover:-translate-y-1">
            Learn More
          </Button>
        </Link>
      </div>

      <div className="mt-20 w-full max-w-5xl flex justify-center px-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden border border-border/50 shadow-2xl bg-card/50 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
            <div className="absolute inset-0 flex flex-col items-center justify-center -z-10">
                <MessageSquare className="w-16 h-16 mb-4 opacity-30 text-primary" />
                <span className="font-medium text-lg">Interactive Chat Preview</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/conversation.svg"
              alt=""
              className="w-full h-full object-cover opacity-90 transition-opacity"
            />
          </div>
        </div>
      </div>
    </section>
  );
}