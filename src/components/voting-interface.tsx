'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2, Share2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useSocket } from "@/components/providers/socket-provider"
import { useSocketPoll } from "@/lib/use-socket-poll"
import { useFingerprint } from "@/hooks/use-fingerprint"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ShareModal } from "@/components/share-modal" // We will create this
import { motion, AnimatePresence } from "framer-motion"

interface PollOption {
  id: string
  option_text: string
  vote_count: number
  position: number
  percentage?: number
}

interface Poll {
  id: string
  question: string
  created_at: string;
  slug: string;
  options: PollOption[];
}

interface VotingInterfaceProps {
  initialPoll: Poll
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-muted animate-pulse rounded-lg ${className}`} />
)

export function VotingInterface({ initialPoll }: VotingInterfaceProps) {
  const { poll, setPoll, isConnected } = useSocketPoll(initialPoll);
  const { socket } = useSocket();
  const fingerprint = useFingerprint()
  // const [poll, setPoll] = useState<Poll>(initialPoll) // Managed by hook
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)

  // Realtime updates handled by useSocketPoll hook

  // Calculate percentages
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.vote_count, 0)
  const optionsWithPercentage = poll.options.map((opt) => ({
    ...opt,
    percentage: totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0,
  }))

  // Check for existing vote on mount
  useEffect(() => {
    // 1. Check LocalStorage first for immediate feedback
    const localVote = localStorage.getItem(`poll_vote_${poll.id}`);
    if (localVote) {
      setHasVoted(true);
      setSelectedOption(localVote);
    }

    if (!poll.slug || !fingerprint) return;

    const checkVote = async () => {
      try {
        const res = await fetch(`/api/polls/${poll.slug}/vote?fingerprint=${fingerprint}`);
        if (res.ok) {
          const data = await res.json();
          if (data.hasVoted) {
            setHasVoted(true);
            setSelectedOption(data.optionId);
          }
        }
      } catch (error) {
        console.error("Failed to check vote status:", error);
      }
    };

    checkVote();
  }, [poll.slug, fingerprint]);

  // Offline Queue Processing
  useEffect(() => {
    const processQueue = async () => {
      const queuedVote = localStorage.getItem(`offline_vote_${poll.id}`);
      if (queuedVote && isConnected) { // Retry when socket/network connects
        const optionId = queuedVote;
        console.log("Processing queued vote:", optionId);

        try {
          // Re-attempt vote
          const res = await fetch(`/api/polls/${poll.slug}/vote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              optionId: optionId,
              fingerprint,
            }),
          });

          if (res.ok) {
            localStorage.removeItem(`offline_vote_${poll.id}`);
            setHasVoted(true);
            toast.success("Vote synced!");
          } else if (res.status === 403) {
            localStorage.removeItem(`offline_vote_${poll.id}`); // Clear if invalid
            setHasVoted(true);
          }
        } catch (e) {
          // Keep in queue
        }
      }
    };

    if (isConnected) {
      processQueue();
    }
  }, [isConnected, poll.id, poll.slug, fingerprint]);

  const handleVote = async (optionId: string) => {
    if (hasVoted || isVoting || !fingerprint) return

    setIsVoting(true)
    const previousSelection = selectedOption;
    const previousPollState = { ...poll };

    // Optimistic Update: Immediately increment the vote count for the selected option
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
          toast.error("You have already voted!");

          // Re-check status
          const statusRes = await fetch(`/api/polls/${poll.slug}/vote?fingerprint=${fingerprint}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.hasVoted) {
              setHasVoted(true);
              setSelectedOption(statusData.optionId);
              // We should also fetch the latest poll data to be sure
            }
          }
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setHasVoted(true)
      localStorage.setItem(`poll_vote_${poll.id}`, optionId); // Persist vote
      toast.success("Vote recorded!")

      // Emit socket event for others
      if (socket) {
        socket.emit("vote-cast", { pollId: poll.id })
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0800ff', '#1a1a1a', '#ffffff'],
      })

    } catch (error: any) {
      // Revert everything
      setPoll(previousPollState);
      setSelectedOption(previousSelection);

      // Check if it's a network error
      if (!navigator.onLine) {
        localStorage.setItem(`offline_vote_${poll.id}`, optionId);
        toast.info("You are offline. Vote queued and will sync automatically.");

        // Keep the optimistic state effectively? 
        // No, better to revert and show queued state or just queue it silently.
        // For now, reverting visual state but queuing logic.
        // Actually, if we queued it, maybe we should show "Pending"?
        // Use Simple approach: Revert, Queue, Notify.
      } else {
        toast.error(error.message || "Failed to vote");
      }
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-card rounded-2xl shadow-sm border border-border">
      <div className="flex justify-between items-start mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight px-1">
          {poll.question}
        </h2>
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
                {hasVoted ? (
                  <div className="relative overflow-hidden rounded-xl border border-border bg-card">
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
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-foreground">
                          {option.percentage}%
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <motion.span
                            key={option.vote_count}
                            initial={{ scale: 1.2, opacity: 0.5 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="font-mono"
                          >
                            {option.vote_count}
                          </motion.span>
                          votes
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleVote(option.id)}
                    disabled={isVoting}
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

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={poll.question}
      />
    </div>
  )
}
