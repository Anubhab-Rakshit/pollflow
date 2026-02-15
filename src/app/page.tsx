'use client';

import { Hero } from "@/components/hero";
import { PollForm } from "@/components/poll-form";
import { useState } from "react";
import { Template } from "@/lib/templates";
import { motion } from "framer-motion";

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center p-6 lg:p-12 gap-12 relative overflow-hidden">
      {/* Left Side: Hero Text */}
      <div className="w-full lg:w-1/2 flex justify-center lg:justify-end z-10">
        <Hero />
      </div>

      {/* Right Side: Poll Form (Glass Card) */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full lg:w-1/2 max-w-md z-10"
      >
        <div className="relative">
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="backdrop-blur-xl bg-foreground/[0.03] border border-foreground/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-foreground/5">
              <h3 className="text-xl font-medium text-foreground font-playfair">Start a new poll</h3>
              <p className="text-sm text-foreground/50">Instant results, no signup required.</p>
            </div>
            <div className="bg-foreground/[0.02]">
              <PollForm initialTemplate={selectedTemplate} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
