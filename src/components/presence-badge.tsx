'use client'

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface PresenceBadgeProps {
    count: number;
}

export function PresenceBadge({ count }: PresenceBadgeProps) {
    const [prevCount, setPrevCount] = useState(count);
    const [flash, setFlash] = useState(false);

    useEffect(() => {
        if (count !== prevCount) {
            setFlash(true);
            const timer = setTimeout(() => {
                setFlash(false);
                setPrevCount(count);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [count, prevCount]);

    return (
        <div className="flex items-center gap-2.5">
            {/* Pulsing green dot */}
            <div className="relative flex h-2.5 w-2.5">
                <motion.span
                    animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.6, 0, 0.6],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inline-flex h-full w-full rounded-full bg-green-400"
                />
                <motion.span
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.6, 1, 0.6],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"
                />
            </div>

            {/* Animated count */}
            <span className="text-xs font-medium text-foreground/60 flex items-center gap-1">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={count}
                        initial={{ scale: 1, color: 'inherit' }}
                        animate={{
                            scale: flash ? [1, 1.2, 1] : 1,
                            color: flash ? ['inherit', '#3b82f6', 'inherit'] : 'inherit',
                        }}
                        transition={{ duration: 0.3 }}
                        className="inline-block tabular-nums font-semibold"
                    >
                        {count}
                    </motion.span>
                </AnimatePresence>
                {count === 1 ? 'person' : 'people'} here
            </span>
        </div>
    );
}
