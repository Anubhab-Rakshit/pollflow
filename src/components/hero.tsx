'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export function Hero() {
  const handleCTAClick = () => {
    document.getElementById('poll-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 backdrop-blur-md"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Next-Gen Realtime Polling</span>
          </motion.div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.1]">
            Create polls. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-slow bg-[length:200%_auto]">
              Get instant results.
            </span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            The most beautiful way to gather feedback. No sign-ups required.
            Just create, share, and watch the votes pour in.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
            <Button
              onClick={handleCTAClick}
              size="lg"
              className="h-16 px-10 rounded-full text-lg font-semibold bg-white text-black hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              Start Polling <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-16 px-10 rounded-full text-lg border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm transition-all duration-300"
            >
              View Examples
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
    </section>
  )
}
