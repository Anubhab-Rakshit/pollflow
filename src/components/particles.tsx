"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Particles = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Generate random particles
    const particles = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
    }));

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-white"
                    initial={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        opacity: 0,
                        scale: 0,
                    }}
                    animate={{
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.5, 1],
                        y: [0, -100], // Move up slightly
                        x: [0, Math.random() * 50 - 25], // Drift
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: p.delay,
                    }}
                    style={{
                        width: p.size,
                        height: p.size,
                    }}
                />
            ))}
        </div>
    );
};
