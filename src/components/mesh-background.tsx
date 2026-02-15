"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    baseSize: number;
}

export default function MeshBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let nodes: Node[] = [];
        let animationFrameId: number;
        let mouseX = -1000;
        let mouseY = -1000;

        const NODE_COUNT = 90;
        const CONNECTION_DISTANCE = 160;
        const MOUSE_RADIUS = 200;

        const isDark = resolvedTheme === "dark" || !resolvedTheme;

        // Colors based on theme
        const lineColor = isDark ? "255, 255, 255" : "0, 0, 0";
        const nodeOpacity = isDark ? 0.5 : 0.3;
        const lineMaxOpacity = isDark ? 0.2 : 0.12;

        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = window.innerWidth + "px";
            canvas.style.height = window.innerHeight + "px";
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            initNodes();
        };

        const initNodes = () => {
            nodes = [];
            const w = window.innerWidth;
            const h = window.innerHeight;
            for (let i = 0; i < NODE_COUNT; i++) {
                nodes.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.35,
                    vy: (Math.random() - 0.5) * 0.35,
                    baseSize: Math.random() * 1.5 + 1,
                });
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const render = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            ctx.clearRect(0, 0, w, h);

            nodes.forEach((node, i) => {
                node.x += node.vx;
                node.y += node.vy;

                if (node.x < 0 || node.x > w) node.vx *= -1;
                if (node.y < 0 || node.y > h) node.vy *= -1;

                // Mouse repulsion
                const mdx = node.x - mouseX;
                const mdy = node.y - mouseY;
                const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (mDist < MOUSE_RADIUS && mDist > 0) {
                    const force = (MOUSE_RADIUS - mDist) / MOUSE_RADIUS;
                    node.x += (mdx / mDist) * force * 2;
                    node.y += (mdy / mDist) * force * 2;
                }

                // Draw node
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.baseSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${lineColor}, ${nodeOpacity})`;
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < nodes.length; j++) {
                    const other = nodes[j];
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECTION_DISTANCE) {
                        const opacity = (1 - dist / CONNECTION_DISTANCE) * lineMaxOpacity;
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);
        render();

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [resolvedTheme]);

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: -1,
            }}
            className="bg-white dark:bg-black transition-colors duration-700"
        >
            <canvas
                ref={canvasRef}
                style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                }}
            />
        </div>
    );
}
