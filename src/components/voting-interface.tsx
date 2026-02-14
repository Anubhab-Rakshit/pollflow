'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2, Share2, Clock } from 'lucide-react'
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
  <div className={`bg-muted animate-pulse rounded-lg ${className}`} />
)

export function VotingInterface({ initialPoll }: VotingInterfaceProps) {
  const { poll, setPoll, isConnected, presenceCount, activities } = useRealtimePoll(initialPoll);
  const fingerprint = useFingerprint()
  // const [poll, setPoll] = useState<Poll>(initialPoll) // Managed by hook
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)

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
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (expires) {
        if (expires <= now) {
          setStatus('ended');
          setTimeLeft("Poll Ended");
        } else {
          setStatus('active');
          const diff = expires.getTime() - now.getTime();
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / 1000 / 60) % 60);
          const seconds = Math.floor((diff / 1000) % 60);

          if (days > 0) setTimeLeft(`${days}d ${hours}h remaining`);
          else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m remaining`);
          else setTimeLeft(`${minutes}m ${seconds}s remaining`);
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

  // Calculate percentages
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.vote_count, 0)
  const optionsWithPercentage = poll.options.map((opt) => ({
    ...opt,
    percentage: totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0,
  }))

  const handleVote = async (optionId: string) => {
    if (hasVoted || isVoting || !fingerprint) return;
    if (status !== 'active') {
      toast.error(status === 'ended' ? "This poll has ended" : "This poll has not started yet");
      return;
    }

    setIsVoting(true)
    const previousSelection = selectedOption;
    const previousPollState = { ...poll };

    // Optimistic Update
    const optimisticOptions = poll.options.map(opt => {
      if (opt.id === optionId) {
        return { ...opt, vote_count: opt.vote_count + 1 };
      }
      return opt;
    });
    setPoll({ ...poll, options: optimisticOptions });

    setSelectedOption(optionId)

    try {
      const res = await fetch(`/api/polls/${poll.slug}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionId: optionId,
          fingerprint,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Revert optimistic update on error
        setPoll(previousPollState);

        if (res.status === 403) {
          setSelectedOption(previousSelection);
          toast.error(data.error || "You have already voted!");

          // Re-check status
          const statusRes = await fetch(`/api/polls/${poll.slug}/vote?fingerprint=${fingerprint}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.hasVoted) {
              setHasVoted(true);
              setSelectedOption(statusData.optionId);
            }
          }
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setHasVoted(true)
      localStorage.setItem(`poll_vote_${poll.id}`, optionId);
      toast.success("Vote recorded!")

      // Realtime update is handled by Supabase subscription in useRealtimePoll

      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)

    } catch (error: any) {
      setPoll(previousPollState);
      setSelectedOption(previousSelection);

      if (!navigator.onLine) {
        localStorage.setItem(`offline_vote_${poll.id}`, optionId);
        toast.info("You are offline. Vote queued and will sync automatically.");
      } else {
        toast.error(error.message || "Failed to vote");
      }
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-card rounded-2xl shadow-sm border border-border relative overflow-hidden">
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={200} recycle={false} colors={['#0800ff', '#1a1a1a', '#ffffff']} />}

      {/* Scheduled / Ended Banner */}
      {status === 'scheduled' && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
          <Clock className="w-12 h-12 text-primary mb-4 animate-pulse" />
          <h3 className="text-2xl font-bold mb-2">Poll Starts In</h3>
          <p className="text-4xl font-mono font-bold text-primary mb-4">{timeLeft}</p>
          <p className="text-muted-foreground">This poll is scheduled for {new Date(poll.scheduled_for!).toLocaleString()}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight px-1">
            {poll.question}
          </h2>
          <div className="flex items-center gap-4">
            <PresenceBadge count={presenceCount} />
            {status === 'active' && timeLeft && (
              <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeLeft}
              </span>
            )}
            {status === 'ended' && (
              <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md flex items-center gap-1">
                <Clock className="w-3 h-3" /> Poll Ended
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsShareOpen(true)}>
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-3 mb-6">
        {hasVoted && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm font-medium text-center animate-in fade-in slide-in-from-top-2">
            You have already voted on this poll.
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {optionsWithPercentage.map((option, index) => {
            const isWinner = option.percentage === Math.max(...optionsWithPercentage.map(o => o.percentage || 0)) && totalVotes > 0;
            const isSelected = selectedOption === option.id;

            return (
              <motion.div
                key={option.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                {hasVoted || status === 'ended' ? (
                  <div className={`relative overflow-hidden rounded-xl border ${isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'} bg-card transition-all`}>
                    {/* Background Bar */}
                    <div
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out ${isWinner ? 'bg-primary/20' : 'bg-muted/50'}`}
                      style={{ width: `${option.percentage}%` }}
                    />

                    <div className="relative p-4 flex justify-between items-center z-10">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">{option.option_text}</span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-semibold">
                            <Check className="w-3 h-3" /> You
                          </span>
                        )}
                        {isWinner && status === 'ended' && (
                          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-semibold">
                            🏆 Winner
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-foreground">
                          {option.percentage}%
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <span className="font-mono">
                            <CountUp end={option.vote_count} duration={1.5} preserveValue />
                          </span>
                          votes
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleVote(option.id)}
                    disabled={isVoting || status !== 'active'}
                    className="w-full text-left p-4 border-2 border-border rounded-xl transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:shadow-md active:scale-[0.99] group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-border group-hover:border-primary transition-colors flex items-center justify-center">
                        {isVoting && selectedOption === option.id && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                      </div>
                      <span className="text-foreground font-medium text-lg">
                        {option.option_text}
                      </span>
                    </div>
                  </button>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border mt-6">
        <div className="text-sm text-muted-foreground">
          Total votes: {totalVotes}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={`inline-block w-2.5 h-2.5 rounded-full transition-colors duration-500 ${isConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" : "bg-yellow-500 animate-pulse"}`} />
          <span className={`${isConnected ? "text-green-600/80" : "text-yellow-600/80"} font-medium transition-colors duration-500`}>
            {isConnected ? "Live Updates Active" : "Reconnecting..."}
          </span>
        </div>
      </div>

      <ActivityFeed activities={activities} />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={poll.question}
      />
    </div >
  )
}
