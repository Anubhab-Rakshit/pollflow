
'use client'

import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function OfflineBanner() {
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        // Only access window/navigator on client
        if (typeof window === 'undefined') return

        setIsOnline(navigator.onLine)

        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-destructive text-destructive-foreground text-center"
                >
                    <div className="py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium">
                        <WifiOff className="w-4 h-4" />
                        <span>You are currently offline. Votes will be synced when connection is restored.</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
