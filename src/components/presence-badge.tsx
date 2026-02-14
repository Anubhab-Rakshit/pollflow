import { motion } from "framer-motion";
import { Users } from "lucide-react";

interface PresenceBadgeProps {
    count: number;
}

export function PresenceBadge({ count }: PresenceBadgeProps) {
    return (
        <div className="flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-sm dark:bg-black/50 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="relative flex h-2.5 w-2.5">
                <motion.span
                    animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {count} {count === 1 ? 'person' : 'people'} here
            </span>
        </div>
    );
}
