"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

interface Point {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

export const MeshNetwork = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme, systemTheme } = useTheme();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detect touch / small screen
        const checkMobile = () => {
            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isSmall = window.innerWidth < 768;
            setIsMobile(isTouch || isSmall);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let points: Point[] = [];
        const POINT_COUNT = isMobile ? 20 : 40; // Reduced on mobile
        const CONNECTION_DISTANCE = isMobile ? 120 : 150;
        const MOUSE_DISTANCE = 200;

        let mouseX = -1000;
        let mouseY = -1000;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initPoints();
        };

        const initPoints = () => {
            points = [];
            for (let i = 0; i < POINT_COUNT; i++) {
                points.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5), // Slower on mobile
                    vy: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
                });
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const currentTheme = theme === "system" ? systemTheme : theme;
            const isDark = currentTheme === "dark";

            const pointColor = isDark ? "255, 255, 255" : "0, 0, 0";
            const opacity = isDark ? 0.08 : 0.15;

            points.forEach((point, i) => {
                point.x += point.vx;
                point.y += point.vy;

                if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
                if (point.y < 0 || point.y > canvas.height) point.vy *= -1;

                // Skip mouse interaction on mobile for performance
                if (!isMobile) {
                    const dx = mouseX - point.x;
                    const dy = mouseY - point.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < MOUSE_DISTANCE) {
                        const force = (MOUSE_DISTANCE - dist) / MOUSE_DISTANCE;
                        point.x += (dx / dist) * force * 0.5;
                        point.y += (dy / dist) * force * 0.5;
                    }
                }

                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${pointColor}, ${opacity * 2})`;
                ctx.fill();

                for (let j = i + 1; j < points.length; j++) {
                    const p2 = points[j];
                    const dx2 = point.x - p2.x;
                    const dy2 = point.y - p2.y;
                    const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                    if (dist2 < CONNECTION_DISTANCE) {
                        ctx.beginPath();
                        ctx.moveTo(point.x, point.y);
                        ctx.lineTo(p2.x, p2.y);
                        const lineOpacity = (1 - dist2 / CONNECTION_DISTANCE) * opacity;
                        ctx.strokeStyle = `rgba(${pointColor}, ${lineOpacity})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        window.addEventListener("resize", handleResize);
        if (!isMobile) {
            window.addEventListener("mousemove", handleMouseMove);
        }

        handleResize();
        render();

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme, systemTheme, isMobile]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[-1] pointer-events-none transition-colors duration-1000 ease-in-out"
        />
    );
};
