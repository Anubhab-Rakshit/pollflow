"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useMouse } from "react-use";

export const CustomCursor = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);

    // Only show on non-touch devices
    useEffect(() => {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!isTouch) {
            setIsVisible(true);
            document.body.style.cursor = 'none';

            // Add hover listeners to clickable elements
            const handleMouseOver = (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a') || target.getAttribute('role') === 'button') {
                    setIsHovering(true);
                } else {
                    setIsHovering(false);
                }
            };

            const handleMouseDown = () => setIsClicking(true);
            const handleMouseUp = () => setIsClicking(false);

            window.addEventListener('mouseover', handleMouseOver);
            window.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.body.style.cursor = 'auto';
                window.removeEventListener('mouseover', handleMouseOver);
                window.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, []);

    const { docX, docY } = useMouse(typeof document === 'undefined' ? null : { current: document.body } as any);

    if (!isVisible) return null;

    return (
        <>
            {/* Main Dot */}
            <motion.div
                className="fixed top-0 left-0 w-4 h-4 rounded-full bg-white mix-blend-difference pointer-events-none z-[9999]"
                style={{
                    x: docX - 8,
                    y: docY - 8,
                }}
                animate={{
                    scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
                }}
                transition={{ type: "spring", stiffness: 1000, damping: 50 }}
            />

            {/* Trailing Glow ring */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white/50 pointer-events-none z-[9998]"
                style={{
                    x: docX - 16,
                    y: docY - 16,
                }}
                animate={{
                    scale: isClicking ? 1.2 : isHovering ? 2 : 1,
                    opacity: isHovering ? 0.8 : 0.3,
                    borderColor: isHovering ? 'var(--accent)' : 'white',
                }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
            />
        </>
    );
};
