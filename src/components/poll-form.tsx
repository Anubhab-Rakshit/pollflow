'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Plus, Loader2, Sparkles, Calendar, Clock, ChevronDown, ChevronUp, Wand2 } from 'lucide-react'
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
  const [isLoading, setIsLoading] = useState(false)

  // Advanced Settings
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')

  const fingerprint = useFingerprint()
  const router = useRouter()

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

    for (const [keyword, suggestedOptions] of Object.entries(KEYWORD_SUGGESTIONS)) {
      if (lowerQuestion.includes(keyword)) {
        foundSuggestions = suggestedOptions;
        break;
      }
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validOptions = options.filter((opt) => opt.trim().length > 0)
    if (!question.trim() || validOptions.length < 2) {
      toast.error('Please enter a question and at least 2 options')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          options: validOptions,
          fingerprint,
          expires_at: expiresAt || null,
          scheduled_for: scheduledFor || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to create poll')

      const data = await response.json()
      toast.success('Poll created successfully!')
      router.push(`/poll/${data.slug}`)
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div id="poll-form" className="w-full max-w-2xl mx-auto p-4 perspective-1000">
      <motion.div
        initial={{ opacity: 0, rotateX: 10 }}
        whileInView={{ opacity: 1, rotateX: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-card rounded-3xl p-8 sm:p-10 relative overflow-hidden"
      >
        {/* Decorative Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -z-10" />

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {/* Question Input */}
          <div className="space-y-2 group">
            <label className="text-sm font-medium text-white/60 ml-1 group-focus-within:text-white transition-colors">
              What would you like to ask?
            </label>
            <div className="relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What's your favorite framework?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-xl font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">
                {question.length}/100
              </span>
            </div>
          </div>

          {/* Suggestions Banner */}
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div
                  onClick={applySuggestions}
                  className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-indigo-500/20 transition-colors"
                >
                  <Wand2 className="w-5 h-5 text-indigo-400" />
                  <div className="flex-1">
                    <p className="text-sm text-indigo-200 font-medium">Auto-fill options?</p>
                    <p className="text-xs text-indigo-400/80 truncate">{suggestions.join(', ')}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-indigo-300 hover:text-indigo-100 hover:bg-indigo-500/30">Apply</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Options Inputs */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-white/60 ml-1">
              Poll Options
            </label>
            <AnimatePresence mode="popLayout">
              {options.map((option, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex gap-3 items-center group"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      onFocus={() => setFocused(index)}
                      onBlur={() => setFocused(null)}
                      placeholder={`Option ${index + 1}`}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all"
                    />
                  </div>

                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {options.length < 5 && (
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                className="w-full border-dashed border-white/20 bg-transparent text-white/50 hover:text-white hover:bg-white/5 hover:border-white/40 h-12 rounded-xl mt-2"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Option
              </Button>
            )}
          </div>

          {/* Advanced Settings Toggle */}
          <div className="pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Advanced Settings
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-white/60 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Auto-End Date
                      </label>
                      <input
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-white/60 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Schedule Start
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledFor}
                        onChange={(e) => setScheduledFor(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-primary/40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Poll...
                </>
              ) : (
                "Create & Share Poll"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
