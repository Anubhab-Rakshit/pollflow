import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";

export interface ActivityItem {
    id: string;
    type: "vote" | "join";
    text: string;
    timestamp: number;
    color: string;
}

interface ActivityFeedProps {
    activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new activity arrives
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activities]);

    if (activities.length === 0) return null;

    return (
        <div className="w-full max-w-md mx-auto mt-6">
            <div className="relative h-32 overflow-hidden bg-gradient-to-b from-transparent via-white/5 to-white/10 dark:via-black/5 dark:to-black/10 rounded-xl border border-white/10 p-4">
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />

                <div
                    ref={scrollRef}
                    className="h-full overflow-y-auto no-scrollbar space-y-2 flex flex-col justify-end"
                >
                    <AnimatePresence initial={false} mode="popLayout">
                        {activities.map((activity) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: "auto" }}
                                exit={{ opacity: 0, x: 20, height: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="flex items-center gap-3 text-sm"
                            >
                                <div
                                    className="w-2 h-8 rounded-full shrink-0"
                                    style={{ backgroundColor: activity.color }}
                                />
                                <span className="text-gray-600 dark:text-gray-300 font-medium">
                                    {activity.text}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
