import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border/40 bg-background text-foreground mt-auto">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4 tracking-tight">QuickChat</h3>
            <p className="text-muted-foreground max-w-sm">
              The modern way to communicate. Create secure chat links and start conversations instantly, with zero setup.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <div className="flex flex-col space-y-3 text-sm text-muted-foreground">
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Stay updated</h4>
            <div className="flex flex-col space-y-3">
              <Input
                placeholder="Enter your email"
                className="bg-muted/50 border-transparent focus:border-primary focus:bg-background rounded-xl transition-all"
              />
              <Button className="w-full rounded-xl font-medium">Subscribe</Button>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/40 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} QuickChat. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex gap-4">
             {/* Social links placeholder */}
          </div>
        </div>
      </div>
    </footer>
  );
}