'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Plus, Loader2, Sparkles, Wand2, Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useFingerprint } from '@/hooks/use-fingerprint'
import { toast } from 'sonner'
import { Template, KEYWORD_SUGGESTIONS } from '@/lib/templates'

interface PollFormProps {
  initialTemplate?: Template | null;
}

export function PollForm({ initialTemplate }: PollFormProps) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [focused, setFocused] = useState<number | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])

  // Advanced Settings
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')

  // Auto-fill from template
  useEffect(() => {
    if (initialTemplate) {
      setQuestion(initialTemplate.question)
      const paddedOptions = [...initialTemplate.options]
      while (paddedOptions.length < 2) paddedOptions.push('')
      setOptions(paddedOptions)
      toast.success(`Loaded template: ${initialTemplate.name}`)
    }
  }, [initialTemplate])

  // Smart suggestions logic
  useEffect(() => {
    const lowerQuestion = question.toLowerCase();
    let foundSuggestions: string[] = [];

    // Simple keyword matching
    for (const [keyword, suggestedOptions] of Object.entries(KEYWORD_SUGGESTIONS)) {
      if (lowerQuestion.includes(keyword)) {
        foundSuggestions = suggestedOptions;
        break; // Stop at first match for now
      }
    }

    // Only show if we found something AND the current options are mostly empty
    const currentOptionsContent = options.filter(o => o.trim().length > 0).length;
    if (foundSuggestions.length > 0 && currentOptionsContent < 2) {
      setSuggestions(foundSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [question, options]);

  const applySuggestions = () => {
    setOptions(suggestions);
    setSuggestions([]);
    toast.success("Applied smart suggestions!");
  }

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, ''])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const fingerprint = useFingerprint()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validOptions = options.filter((opt) => opt.trim().length > 0)
    if (!question.trim() || validOptions.length < 2) {
      toast.error('Please enter a question and at least 2 options')
      return
    }

    // Validate dates
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      toast.error('Expiration time must be in the future')
      return
    }
    if (scheduledFor && expiresAt && new Date(scheduledFor) >= new Date(expiresAt)) {
      toast.error('Scheduled start must be before expiration')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          options: validOptions,
          creatorFingerprint: fingerprint,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Poll created successfully!");
      router.push(`/poll/${data.pollSlug}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create poll");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="poll-form" className="py-20 px-4 bg-gradient-to-b from-muted/20 to-background rounded-b-[3rem]">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Create Your Poll</h2>
          <p className="text-muted-foreground">Design your poll and start collecting votes instantly</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 ring-1 ring-black/5 relative overflow-hidden">
          {/* Smart Suggestion Banner */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-6 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-xl overflow-hidden"
              >
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Found suggestions for your question!</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={applySuggestions}
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900"
                  >
                    <Wand2 className="w-3 h-3 mr-2" />
                    Auto-fill
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question Input */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-foreground mb-3">Poll Question</label>
            <div className="relative">
              <input
                type="text"
                value={question}
                maxLength={100}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What's your favorite programming language?"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground placeholder-muted-foreground pr-12 text-base"
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs px-1 font-medium transition-colors ${question.length >= 100 ? 'text-red-500' :
                question.length >= 80 ? 'text-yellow-500' : 'text-muted-foreground'
                }`}>
                {question.length}/100
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-4">Options</label>
            <div className="space-y-3">
              <AnimatePresence initial={false} mode="popLayout">
                {options.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className="flex items-center gap-3 group"
                  >
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={option}
                        maxLength={50}
                        onChange={(e) => updateOption(index, e.target.value)}
                        onFocus={() => setFocused(index)}
                        onBlur={() => setFocused(null)}
                        placeholder={`Option ${index + 1}`}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground placeholder-muted-foreground pr-12 text-base"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background/80 px-1 pointer-events-none">
                        {option.length}/50
                      </span>
                    </div>

                    {/* Remove button - only show if more than 2 options */}
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label={`Remove option ${index + 1}`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}

                    {/* Placeholder for alignment */}
                    {options.length === 2 && (
                      <div className="w-9" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add Option Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full">
                    <motion.button
                      layout
                      type="button"
                      onClick={addOption}
                      disabled={options.length >= 5}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-muted text-muted-foreground rounded-xl hover:border-primary hover:text-primary transition-colors font-medium hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-5 h-5" />
                      Add Option
                    </motion.button>
                  </div>
                </TooltipTrigger>
                {options.length >= 5 && (
                  <TooltipContent>
                    <p>Maximum 5 options allowed</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {options.length === 5 && (
              <p className="mt-3 text-sm text-muted-foreground text-center animate-in fade-in slide-in-from-top-1">
                Maximum 5 options reached
              </p>
            )}
          </div>

          {/* Advanced Settings */}
          <div className="mb-8 border-t border-border/50 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-full justify-between"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Advanced Settings</span>
              </div>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Auto-close at
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={expiresAt}
                          onChange={(e) => setExpiresAt(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Poll will stop accepting votes after this time</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Schedule Start
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={scheduledFor}
                          onChange={(e) => setScheduledFor(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                        />
                        <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Poll will happen in the future</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !question.trim() || options.filter(o => o.trim()).length < 2}
            className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_25px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Poll...
              </>
            ) : (
              "Create & Share Poll"
            )}
          </Button>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            Your poll link will be ready to share immediately
          </p>
        </form>
      </div>
    </section>
  )
}
