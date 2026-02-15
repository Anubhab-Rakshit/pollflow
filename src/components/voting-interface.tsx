'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2, Share2, Clock, Crown } from 'lucide-react'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import CountUp from 'react-countup'
import { useRealtimePoll } from "@/lib/use-realtime-poll"
import { useFingerprint } from "@/hooks/use-fingerprint"
import { Button } from "@/components/ui/button"
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

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-white/5 animate-pulse rounded-2xl ${className}`} />
)

export function VotingInterface({ initialPoll }: VotingInterfaceProps) {
  const { poll, setPoll, isConnected, presenceCount, activities } = useRealtimePoll(initialPoll);
  const fingerprint = useFingerprint()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null)

  // Record View on Mount
  useEffect(() => {
    const recordView = async () => {
      try {
        await fetch(`/api/polls/${initialPoll.slug}/view`, { method: 'POST' });
      } catch (err) {
        console.error('Failed to record view:', err);
      }
    };
    recordView();
  }, [initialPoll.slug]);

  // Timer State
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [status, setStatus] = useState<'active' | 'ended' | 'scheduled'>('active');
  const { width, height } = useWindowSize()
  const [showConfetti, setShowConfetti] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const expires = poll.expires_at ? new Date(poll.expires_at) : null;
      const scheduled = poll.scheduled_for ? new Date(poll.scheduled_for) : null;

      if (scheduled && scheduled > now) {
        setStatus('scheduled');
        const diff = scheduled.getTime() - now.getTime();
        setTimeLeft(formatTime(diff));
      } else if (expires) {
        if (expires <= now) {
          setStatus('ended');
          setTimeLeft("Poll Ended");
        } else {
          setStatus('active');
          const diff = expires.getTime() - now.getTime();
          setTimeLeft(formatTime(diff) + " remaining");
        }
      } else {
        setStatus('active');
        setTimeLeft("");
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [poll.expires_at, poll.scheduled_for]);

  const formatTime = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const seconds = Math.floor((ms / 1000) % 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
  };

  // Calculate percentages and winner
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.vote_count, 0)
  const maxVotes = Math.max(...poll.options.map(o => o.vote_count));

  const optionsWithStats = poll.options.map(opt => ({
    ...opt,
    percentage: totalVotes === 0 ? 0 : Math.round((opt.vote_count / totalVotes) * 100),
    isWinner: totalVotes > 0 && opt.vote_count === maxVotes
  }))

  const handleVote = async () => {
    if (!selectedOption || !fingerprint) return

    setIsVoting(true)
    try {
      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionId: selectedOption,
          fingerprint: fingerprint
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          setHasVoted(true)
          toast.error("You have already voted!");
        } else {
          throw new Error(data.error || 'Failed to vote')
        }
      } else {
        setHasVoted(true)
        setVotedOptionId(selectedOption);
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
        toast.success("Vote recorded successfully!")
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsVoting(false)
    }
  }

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!poll) return (
    <div className="w-full max-w-2xl mx-auto space-y-4 p-4">
      <Skeleton className="h-12 w-3/4 mb-8" />
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
    </div>
  )

  return (
    <div className="w-full max-w-2xl mx-auto relative z-10 perspective-1000">
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={200} recycle={false} colors={['#6366f1', '#8b5cf6', '#ec4899', '#fbbf24']} />}

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={poll.question}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="text-center space-y-4 relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-white/90 shadow-lg"
          >
            <PresenceBadge count={presenceCount} />
            {status === 'ended' && <span className="text-red-400 border-l border-white/20 pl-2 ml-2">Ended</span>}
            {timeLeft && <span className="text-blue-300 font-mono border-l border-white/20 pl-2 ml-2 flex items-center gap-1"><Clock className="w-3 h-3" /> {timeLeft}</span>}
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-xl tracking-tight leading-tight">
            {poll.question}
          </h1>

          <div className="flex justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsShareOpen(true)}
              className="text-white/60 hover:text-white hover:bg-white/10 transition-all rounded-full"
            >
              <Share2 className="w-4 h-4 mr-2" /> Share Poll
            </Button>
          </div>
        </div>

        {/* Voting / Results Area */}
        <div className="space-y-4 min-h-[400px]">
          <AnimatePresence mode="wait">
            {!hasVoted && status === 'active' ? (
              <motion.div
                key="voting"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {optionsWithStats.map((option) => (
                  <motion.div
                    key={option.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedOption(option.id)}
                    className={`
                      relative group cursor-pointer rounded-2xl p-6 border transition-all duration-300
                      ${selectedOption === option.id
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30 hover:shadow-xl'
                      }
                      backdrop-blur-md
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                        ${selectedOption === option.id
                          ? 'border-indigo-400 bg-indigo-500 scale-110'
                          : 'border-white/30 group-hover:border-white/60'
                        }
                      `}>
                        {selectedOption === option.id && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="w-3.5 h-3.5 text-white" /></motion.div>}
                      </div>
                      <span className={`text-xl font-medium transition-colors ${selectedOption === option.id ? 'text-white' : 'text-white/80'}`}>
                        {option.option_text}
                      </span>
                    </div>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="pt-6"
                >
                  <Button
                    onClick={handleVote}
                    disabled={!selectedOption || isVoting}
                    className={`
                      w-full h-14 text-lg font-semibold rounded-xl shadow-2xl transition-all duration-300
                      ${!selectedOption
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] text-white'
                      }
                    `}
                  >
                    {isVoting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Casting Vote...
                      </>
                    ) : (
                      "Cast Your Vote"
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="text-center pb-4">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {hasVoted ? "🎉 Vote Recorded!" : "Live Results"}
                  </h2>
                  <p className="text-white/60">
                    Total Votes: <CountUp end={totalVotes} duration={1} />
                  </p>
                </div>

                {optionsWithStats.sort((a, b) => b.vote_count - a.vote_count).map((option, index) => (
                  <div key={option.id} className="relative group">
                    <div className="flex justify-between text-sm mb-2 px-1">
                      <span className={`font-medium flex items-center gap-2 ${option.isWinner ? 'text-yellow-400' : 'text-white/90'}`}>
                        {option.isWinner && <Crown className="w-4 h-4 fill-yellow-400 animate-bounce" />}
                        {option.option_text}
                        {votedOptionId === option.id && <span className="text-xs bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-500/30">Your Vote</span>}
                      </span>
                      <span className="font-mono text-white/70">
                        {option.percentage}% ({option.vote_count})
                      </span>
                    </div>

                    {/* Bar Container */}
                    <div className="h-14 relative bg-white/5 rounded-xl overflow-hidden border border-white/10">
                      {/* Gradient Bar */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${option.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
                        className={`
                          absolute top-0 left-0 h-full 
                          ${option.isWinner
                            ? 'bg-gradient-to-r from-yellow-500/40 to-orange-500/40 border-r-2 border-yellow-400/50'
                            : 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30'
                          }
                        `}
                      />

                      {/* Pattern Overlay */}
                      <div className="absolute inset-0 opacity-20 bg-[url('/bg-pattern.png')] bg-repeat opacity-[0.03]" />
                    </div>
                  </div>
                ))}

                {status === 'active' && !hasVoted && (
                  <div className="text-center pt-8">
                    <Button variant="link" onClick={() => setHasVoted(false)} className="text-white/50 hover:text-white">
                      Change Vote (Debug Mode)
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Activity Feed at Bottom */}
      <div className="mt-16 border-t border-white/10 pt-8">
        <ActivityFeed activities={activities} />
      </div>
    </div>
  )
}
