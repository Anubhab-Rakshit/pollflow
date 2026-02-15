"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeTransition() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

        setTimeout(() => {
            setTheme(nextTheme);
        }, 300);

        setTimeout(() => {
            setIsTransitioning(false);
        }, 800);
    };

    if (!mounted) return null;

    const isDark = resolvedTheme === "dark";

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={toggleTheme}
                className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
                }}
                aria-label="Toggle Theme"
            >
                <AnimatePresence mode="wait">
                    {isDark ? (
                        <motion.div
                            key="sun"
                            initial={{ rotate: -90, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            exit={{ rotate: 90, scale: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Sun className="w-5 h-5 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="moon"
                            initial={{ rotate: -90, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            exit={{ rotate: 90, scale: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Moon className="w-5 h-5 text-black" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>

            {/* Transition Overlay */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Celestial body traversal */}
                        <motion.div
                            initial={{ x: "90vw", y: "-10vh", scale: 0.3, opacity: 0.8 }}
                            animate={{ x: "-10vw", y: "110vh", scale: 1.2, opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="absolute"
                            style={{
                                width: '200px',
                                height: '200px',
                                borderRadius: '50%',
                                background: isDark
                                    ? 'radial-gradient(circle, rgba(250,204,21,0.4), transparent 70%)'
                                    : 'radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)',
                                filter: 'blur(40px)',
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
