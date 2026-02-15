'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Check, Loader2, Share2, Crown } from 'lucide-react'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import CountUp from 'react-countup'
import { useRealtimePoll } from "@/lib/use-realtime-poll"
import { useFingerprint } from "@/hooks/use-fingerprint"
import { toast } from "sonner"
import { ShareModal } from "@/components/share-modal"
import { motion, AnimatePresence } from "framer-motion"
import { PresenceBadge } from './presence-badge'
import { ActivityFeed } from './activity-feed'

interface PollOption {
  id: string
  option_text: string
  vote_count: number
  position: number
  poll_id: string
  percentage?: number
}

interface Poll {
  id: string
  question: string
  created_at: string;
  slug: string;
  options: PollOption[];
  expires_at?: string | null;
  scheduled_for?: string | null;
}

interface VotingInterfaceProps {
  initialPoll: Poll
}

// Ripple effect component
function Ripple({ x, y }: { x: number; y: number }) {
  return (
    <motion.span
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        background: 'rgba(59, 130, 246, 0.3)',
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ width: 0, height: 0, opacity: 1 }}
      animate={{ width: 300, height: 300, opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  )
}

// Skeleton loading component
function SkeletonCard() {
  return (
    <div className="w-full h-[72px] rounded-xl border-[1.5px] border-foreground/[0.06] bg-foreground/[0.03] flex items-center px-6 gap-4">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-5 h-5 rounded-full bg-foreground/10"
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
        className="h-4 rounded-lg bg-foreground/10"
        style={{ width: `${60 + Math.random() * 30}%` }}
      />
    </div>
  )
}

function SkeletonLoader({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <SkeletonCard />
        </motion.div>
      ))}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-full h-14 rounded-xl bg-foreground/[0.06] mt-6"
      />
    </div>
  )
}

export function VotingInterface({ initialPoll }: VotingInterfaceProps) {
  const { poll, setPoll, isConnected, presenceCount, activities } = useRealtimePoll(initialPoll);
  const fingerprint = useFingerprint()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [status, setStatus] = useState<'active' | 'ended' | 'scheduled'>('active');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; optId: string }[]>([]);
  const { width, height } = useWindowSize();
  const rippleIdRef = useRef(0);

  // Simulate initial loading for skeleton
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const recordView = async () => {
      try { await fetch(`/api/polls/${initialPoll.slug}/view`, { method: 'POST' }); } catch (err) { }
    };
    recordView();
  }, [initialPoll.slug]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const expires = poll.expires_at ? new Date(poll.expires_at) : null;
      const scheduled = poll.scheduled_for ? new Date(poll.scheduled_for) : null;

      if (scheduled && scheduled > now) {
        setStatus('scheduled');
      } else if (expires) {
        if (expires <= now) {
          setStatus('ended');
          setTimeLeft("Poll Ended");
        } else {
          setStatus('active');
        }
      } else {
        setStatus('active');
        setTimeLeft("");
      }
    };
    calculateTimeLeft();
  }, [poll.expires_at, poll.scheduled_for]);

  useEffect(() => {
    const voted = localStorage.getItem(`poll_vote_${poll.id}`);
    if (voted) {
      setHasVoted(true);
      setSelectedOption(voted);
    }
  }, [poll.id]);

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.vote_count, 0)
  const maxVotes = Math.max(...poll.options.map(o => o.vote_count))
  const optionsWithStats = poll.options.map(opt => ({
    ...opt,
    percentage: totalVotes === 0 ? 0 : Math.round((opt.vote_count / totalVotes) * 100),
    isWinner: totalVotes > 0 && opt.vote_count === maxVotes
  }))

  const handleOptionClick = useCallback((optionId: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (isVoting) return;

    // Ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newId = rippleIdRef.current++;
    setRipples(prev => [...prev, { id: newId, x, y, optId: optionId }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newId)), 600);

    // Haptic feedback (mobile)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    setSelectedOption(optionId);
  }, [isVoting]);

  const handleVote = async () => {
    if (!selectedOption || !fingerprint) return
    setIsVoting(true)

    // Optimistic update
    const previousPoll = { ...poll };
    setPoll(current => ({
      ...current,
      options: current.options.map(opt =>
        opt.id === selectedOption ? { ...opt, vote_count: opt.vote_count + 1 } : opt
      )
    }));

    try {
      const response = await fetch(`/api/polls/${poll.slug}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: selectedOption, fingerprint }),
      })
      if (!response.ok) throw new Error()

      // Artificial delay for smooth UX (min 1s total)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setHasVoted(true)
      localStorage.setItem(`poll_vote_${poll.id}`, selectedOption);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast.success("Vote recorded!")
    } catch (error) {
      // Revert optimistic update
      setPoll(previousPoll);
      toast.error("Failed to vote")
    } finally {
      setIsVoting(false)
    }
  }

  const votedOptionId = typeof window !== 'undefined' ? localStorage.getItem(`poll_vote_${poll.id}`) : null;

  return (
    <div className="w-full max-w-[700px] mx-auto relative z-10 py-10 px-5">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={200}
          recycle={false}
          gravity={0.3}
          colors={['#3b82f6', '#8b5cf6', '#ffffff']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
        />
      )}

      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} url={typeof window !== 'undefined' ? window.location.href : ''} title={poll.question} />

      {/* Header — stays in place during transition */}
      <div className="space-y-6 text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 backdrop-blur-sm">
          <PresenceBadge count={presenceCount} />
          {status === 'ended' && <span className="text-red-400 text-sm ml-2">Ended</span>}
        </div>
        <h1
          className="text-foreground font-bold tracking-tight leading-[1.1]"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
        >
          {poll.question}
        </h1>
      </div>

      {/* Skeleton / Voting / Results */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SkeletonLoader count={poll.options.length} />
          </motion.div>
        ) : !hasVoted && status === 'active' ? (
          <motion.div
            key="voting"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {optionsWithStats.map(option => (
              <motion.div
                key={option.id}
                onClick={(e) => handleOptionClick(option.id, e)}
                whileHover={!isVoting ? { y: -2, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)' } : {}}
                animate={selectedOption === option.id ? {
                  scale: [1, 1.02, 1],
                  transition: { duration: 0.3 }
                } : {}}
                transition={{ duration: 0.2 }}
                className={`relative overflow-hidden cursor-pointer transition-all duration-200 w-full h-[72px] flex items-center justify-between px-6 rounded-xl
                  ${isVoting && selectedOption !== option.id ? 'opacity-50 pointer-events-none' : ''}
                  ${selectedOption === option.id
                    ? 'border-2 border-blue-500 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                    : 'border-[1.5px] border-foreground/[0.08] bg-foreground/[0.03] hover:border-foreground/[0.15]'
                  }`}
              >
                {/* Ripples */}
                {ripples.filter(r => r.optId === option.id).map(ripple => (
                  <Ripple key={ripple.id} x={ripple.x} y={ripple.y} />
                ))}

                <div className="flex items-center gap-4 relative z-10">
                  {/* Custom Radio */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                      ${selectedOption === option.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-foreground/20'
                      }`}
                  >
                    <AnimatePresence>
                      {selectedOption === option.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-foreground font-medium text-lg">
                    {option.option_text}
                  </span>
                </div>

                {/* Animated checkmark */}
                <AnimatePresence>
                  {selectedOption === option.id && (
                    <motion.div
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      exit={{ scale: 0, rotate: 0 }}
                      transition={{ duration: 0.4, ease: [0.68, -0.55, 0.27, 1.55] }}
                      className="relative z-10"
                    >
                      <Check className="w-5 h-5 text-blue-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Vote Button */}
            <motion.button
              onClick={handleVote}
              disabled={!selectedOption || isVoting}
              whileHover={selectedOption && !isVoting ? { y: -2, boxShadow: '0 12px 24px rgba(59, 130, 246, 0.25)' } : {}}
              whileTap={selectedOption && !isVoting ? { scale: 0.98 } : {}}
              className="w-full h-14 flex items-center justify-center gap-2 text-white font-semibold rounded-xl mt-6 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
              style={{
                background: '#3b82f6',
                fontSize: '1rem',
              }}
            >
              {isVoting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Casting your vote...
                </>
              ) : (
                "Cast Your Vote"
              )}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-end mb-6 px-1">
              <h2 className="text-xl font-bold text-foreground">Results</h2>
              <span className="text-foreground/50 font-mono text-sm">
                <CountUp end={totalVotes} duration={0.8} /> votes
              </span>
            </div>

            {optionsWithStats.sort((a, b) => b.vote_count - a.vote_count).map((option, index) => {
              const isYourVote = votedOptionId === option.id;

              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  className="space-y-2"
                >
                  <motion.div
                    className="rounded-xl p-4"
                    animate={option.isWinner ? {
                      scale: [1, 1.02, 1],
                      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                    } : {}}
                    style={{
                      border: option.isWinner
                        ? '2px solid #fbbf24'
                        : isYourVote
                          ? '2px solid #3b82f6'
                          : '1.5px solid rgba(var(--foreground-rgb, 128, 128, 128), 0.08)',
                      boxShadow: option.isWinner
                        ? '0 0 20px rgba(251, 191, 36, 0.3)'
                        : 'none',
                      background: option.isWinner
                        ? 'rgba(251, 191, 36, 0.03)'
                        : isYourVote
                          ? 'rgba(59, 130, 246, 0.03)'
                          : 'rgba(var(--foreground-rgb, 128, 128, 128), 0.02)',
                    }}
                  >
                    <div className="flex justify-between text-sm px-1 mb-2">
                      <span className={`font-medium flex items-center gap-2 ${option.isWinner ? 'text-foreground' : 'text-foreground/70'}`}>
                        {option.isWinner && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        {option.option_text}
                        {isYourVote && (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" /> Your vote
                          </span>
                        )}
                      </span>
                      <span className="font-mono font-semibold text-foreground/80">
                        <CountUp end={option.percentage} duration={0.8} delay={0.2 + index * 0.1} />%
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full overflow-hidden bg-foreground/[0.06]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${option.percentage}%` }}
                        transition={{
                          duration: 0.8,
                          delay: 0.2 + index * 0.1,
                          ease: [0.34, 1.56, 0.64, 1],
                        }}
                        className="h-full rounded-full"
                        style={{
                          background: option.isWinner
                            ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                            : isYourVote
                              ? '#3b82f6'
                              : 'hsl(var(--foreground) / 0.15)',
                        }}
                      />
                    </div>
                    <div className="flex justify-end mt-1 px-1">
                      <span className="text-xs text-foreground/40 font-mono">
                        <CountUp end={option.vote_count} duration={0.8} delay={0.2 + index * 0.1} /> votes
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}

            <div className="pt-8 flex justify-center">
              <motion.button
                onClick={() => setIsShareOpen(true)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-transparent border border-foreground/15 text-foreground/80 text-sm font-medium hover:bg-foreground/5 hover:border-foreground/25 transition-all duration-200"
              >
                <Share2 className="w-4 h-4" /> Share Results
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 text-center text-sm text-foreground/40">
        <ActivityFeed activities={activities} />
      </div>
    </div>
  )
}
