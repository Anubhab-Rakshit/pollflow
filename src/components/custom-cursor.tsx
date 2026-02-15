"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const TRAIL_COUNT = 4;
const TRAIL_OPACITIES = [0.3, 0.2, 0.15, 0.1];
const TRAIL_DELAYS = [50, 100, 150, 200]; // ms delay for each trail element

interface TrailPoint {
    x: number;
    y: number;
}

export const CustomCursor = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
    const [trails, setTrails] = useState<TrailPoint[]>(
        Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 }))
    );
    const [isMoving, setIsMoving] = useState(false);
    const mousePosRef = useRef({ x: -100, y: -100 });
    const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const trailTimersRef = useRef<NodeJS.Timeout[]>([]);

    useEffect(() => {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!isTouch) {
            setIsVisible(true);
            document.body.style.cursor = 'none';

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
            const handleMouseMove = (e: MouseEvent) => {
                const pos = { x: e.clientX, y: e.clientY };
                setMousePos(pos);
                mousePosRef.current = pos;
                setIsMoving(true);

                // Clear existing move timeout
                if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
                moveTimeoutRef.current = setTimeout(() => setIsMoving(false), 150);

                // Update trail positions with staggered delays
                trailTimersRef.current.forEach(t => clearTimeout(t));
                trailTimersRef.current = [];

                for (let i = 0; i < TRAIL_COUNT; i++) {
                    const timer = setTimeout(() => {
                        setTrails(prev => {
                            const newTrails = [...prev];
                            newTrails[i] = { ...mousePosRef.current };
                            return newTrails;
                        });
                    }, TRAIL_DELAYS[i]);
                    trailTimersRef.current.push(timer);
                }
            };

            window.addEventListener('mouseover', handleMouseOver);
            window.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('mousemove', handleMouseMove);

            return () => {
                document.body.style.cursor = 'auto';
                window.removeEventListener('mouseover', handleMouseOver);
                window.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('mousemove', handleMouseMove);
                trailTimersRef.current.forEach(t => clearTimeout(t));
                if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
            };
        }
    }, []);

    if (!isVisible) return null;

    return (
        <>
            {/* Trail elements (rendered first so they appear behind) */}
            {trails.map((trail, i) => (
                <motion.div
                    key={`trail-${i}`}
                    className="fixed top-0 left-0 rounded-full pointer-events-none z-[9997]"
                    style={{
                        width: 16,
                        height: 16,
                        background: 'rgba(59, 130, 246, var(--trail-opacity))',
                        // @ts-ignore
                        '--trail-opacity': isMoving ? TRAIL_OPACITIES[i] : 0,
                    } as React.CSSProperties}
                    animate={{
                        x: trail.x - 8,
                        y: trail.y - 8,
                        opacity: isMoving ? TRAIL_OPACITIES[i] : 0,
                    }}
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        y: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: isMoving ? 0.1 : 0.3 },
                    }}
                />
            ))}

            {/* Main Dot */}
            <motion.div
                className="fixed top-0 left-0 w-4 h-4 rounded-full bg-foreground mix-blend-difference pointer-events-none z-[9999]"
                animate={{
                    x: mousePos.x - 8,
                    y: mousePos.y - 8,
                    scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
                }}
                transition={{ type: "spring", stiffness: 1000, damping: 50, mass: 0.5 }}
            />

            {/* Trailing Glow ring */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border border-foreground/50 pointer-events-none z-[9998]"
                animate={{
                    x: mousePos.x - 16,
                    y: mousePos.y - 16,
                    scale: isClicking ? 1.2 : isHovering ? 2 : 1,
                    opacity: isHovering ? 0.8 : 0.3,
                    borderColor: isHovering ? 'var(--primary)' : 'var(--foreground)',
                }}
                transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.8 }}
            />
        </>
    );
};
