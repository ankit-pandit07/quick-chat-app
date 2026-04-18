import React from "react";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function UserReviews() {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">What Our Users Say</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Join thousands of people who use QuickChat for seamless communication.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="p-8 bg-card rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex gap-1 mb-6 text-yellow-400">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
            </div>
            <p className="text-lg md:text-xl text-foreground font-medium mb-8 leading-relaxed">
              “QuickChat is an absolute game-changer! It's simply the fastest and easiest way to start a secure chat room without any hassle.”
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xl">JD</div>
              <div>
                <div className="font-bold text-foreground">John Doe</div>
                <div className="text-sm text-muted-foreground">Software Developer</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-8 bg-card rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex gap-1 mb-6 text-yellow-400">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
            </div>
            <p className="text-lg md:text-xl text-foreground font-medium mb-8 leading-relaxed">
              “The passcode protection gives me peace of mind. I feel totally secure using QuickChat for discussing sensitive project details.”
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-600 text-xl">JS</div>
              <div>
                <div className="font-bold text-foreground">Jane Smith</div>
                <div className="text-sm text-muted-foreground">Product Designer</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
