'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { X, Plus, Loader2, Wand2, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFingerprint } from '@/hooks/use-fingerprint'
import { toast } from 'sonner'
import { Template, KEYWORD_SUGGESTIONS } from '@/lib/templates'

interface PollFormProps {
  initialTemplate?: Template | null;
}

export function PollForm({ initialTemplate }: PollFormProps) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')

  const fingerprint = useFingerprint()
  const router = useRouter()

  useEffect(() => {
    if (initialTemplate) {
      setQuestion(initialTemplate.question)
      const paddedOptions = [...initialTemplate.options]
      while (paddedOptions.length < 2) paddedOptions.push('')
      setOptions(paddedOptions)
    }
  }, [initialTemplate])

  useEffect(() => {
    const lowerQuestion = question.toLowerCase();
    let foundSuggestions: string[] = [];
    for (const [keyword, suggestedOptions] of Object.entries(KEYWORD_SUGGESTIONS)) {
      if (lowerQuestion.includes(keyword)) {
        foundSuggestions = suggestedOptions;
        break;
      }
    }
    if (foundSuggestions.length > 0 && options.filter(o => o.trim().length > 0).length < 2) {
      setSuggestions(foundSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [question, options]);

  const applySuggestions = () => {
    setOptions(suggestions);
    setSuggestions([]);
    toast.success("Applied smart suggestions");
  }

  const addOption = () => {
    if (options.length < 5) setOptions([...options, ''])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index))
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
      router.push(`/poll/${data.slug}`)
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div id="poll-form" className="w-full p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Question */}
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-widest text-foreground/40">
            Your Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What would you like to ask?"
            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all text-base"
            autoFocus
            autoComplete="off"
            autoCapitalize="sentences"
            autoCorrect="off"
          />
        </div>

        {/* AI Suggestions */}
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
                className="bg-foreground/5 border border-foreground/10 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-foreground/10 transition-colors"
              >
                <Wand2 className="w-4 h-4 text-foreground/60" />
                <div className="flex-1">
                  <p className="text-sm text-foreground/80 font-medium">Auto-fill options?</p>
                  <p className="text-xs text-foreground/40 truncate">{suggestions.join(', ')}</p>
                </div>
                <span className="text-xs text-foreground/60 border border-foreground/10 px-2 py-1 rounded-lg">Apply</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Options */}
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-widest text-foreground/40">
            Options
          </label>
          <AnimatePresence mode="popLayout">
            {options.map((option, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex gap-2 items-center group"
              >
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-all text-base"
                  autoComplete="off"
                  autoCapitalize="sentences"
                  autoCorrect="off"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 text-foreground/30 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {options.length < 5 && (
            <button
              type="button"
              onClick={addOption}
              className="w-full border border-dashed border-foreground/10 text-foreground/40 hover:text-foreground/70 hover:bg-foreground/5 h-10 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Add Option
            </button>
          )}
        </div>

        {/* Advanced */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs text-foreground/40 hover:text-foreground/60 transition-colors"
          >
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
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
                <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-foreground/40">Auto-End</label>
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-foreground/40">Schedule</label>
                    <input
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      className="w-full bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30 transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 min-h-[48px] bg-foreground text-background font-semibold text-base rounded-xl hover:opacity-90 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating your poll...
            </>
          ) : "Create Poll →"}
        </button>
      </form>
    </div>
  )
}
