'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export function Hero() {

  return (
    <section className="text-left py-12 lg:py-0">

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 backdrop-blur-sm"
      >
        <Sparkles className="w-4 h-4 text-foreground" />
        <span className="text-sm font-medium text-foreground/80">Realtime Polling Protocol</span>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-playfair text-foreground leading-[1.05] mb-6"
        style={{
          fontSize: 'clamp(3rem, 6vw, 5.5rem)'
        }}
      >
        The future of <br />
        <span className="font-sans font-light italic text-foreground/60">instant feedback</span>
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg font-light mb-10 max-w-xl text-foreground/70 leading-relaxed"
      >
        Decentralized peer-to-peer polling powered by real-time infrastructure. Connect your ideas and earn passive insights instantly.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap gap-4"
      >
        <button
          className="px-8 py-3.5 rounded-full bg-foreground text-background text-[0.95rem] font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
        >
          Explore Templates
        </button>
      </motion.div>

    </section>
  )
}
