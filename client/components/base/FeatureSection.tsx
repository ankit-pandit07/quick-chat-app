import React from "react";
import FeatureCard from "./FeatureCard";

export default function FeatureSection() {
  return (
    <section
      id="features"
      className="py-24 px-4 bg-muted/30"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">Why choose QuickChat?</h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">Everything you need to start chatting with anyone, anywhere, instantly.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="🚀"
            title="Instant Setup"
            description="Generate a room link in seconds. No account required to join."
          />
          <FeatureCard
            icon="🔒"
            title="Secure by Default"
            description="Passcode protection ensures your private conversations stay private."
          />
          <FeatureCard
            icon="💻"
            title="Cross-Platform"
            description="Works seamlessly on any device with a modern web browser."
          />
        </div>
      </div>
    </section>
  );
}