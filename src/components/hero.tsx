'use client'

import { Button } from '@/components/ui/button'

export function Hero() {
  const handleCTAClick = () => {
    document.getElementById('poll-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
      {/* Animated gradient background mesh */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-blue-500/30 to-pink-500/30 opacity-60 animate-blob mix-blend-multiply filter blur-[80px]"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-green-500/30 via-yellow-500/30 to-red-500/30 opacity-60 animate-blob [animation-delay:2000ms] mix-blend-multiply filter blur-[80px]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-indigo-500/30 to-orange-500/30 opacity-60 animate-blob [animation-delay:4000ms] mix-blend-multiply filter blur-[80px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="space-y-6 sm:space-y-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-balance tracking-tighter">
            Create polls.{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Get instant results.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Share polls with anyone. Watch votes pour in real-time with beautiful, live-updating results.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              onClick={handleCTAClick}
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Create Your First Poll
            </Button>
            <button className="px-8 py-3 border-2 border-muted text-foreground font-semibold rounded-full hover:bg-muted transition-colors duration-200">
              View Examples
            </button>
          </div>
        </div>
      </div>

    </section>
  )
}
