"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useCursorStore } from '@/store/useCursorStore';

interface HeroGateProps {
    onEnter: () => void;
}

export default function HeroGate({ onEnter }: HeroGateProps) {
    const [progress, setProgress] = useState(0);
    const { setCursorText, setIsHovered, setCursorVariant } = useCursorStore();

    // Use a ref for continuous value tracking
    const progressRef = useRef(0);
    const lastTimeRef = useRef<number>(0);
    const rafId = useRef<number | null>(null);
    const isHolding = useRef(false); // Keep this ref from original code

    const DURATION = 1500; // Time to reach 100%
    const DECAY_DURATION = 1000; // Time to decay from 100% to 0%

    const isCompleted = useRef(false);

    // Main loop for handling progress via physics-like delta
    const updateProgress = () => {
        const now = Date.now();
        const dt = now - lastTimeRef.current;
        lastTimeRef.current = now;

        if (isCompleted.current) {
            // Keep at 100% and don't decay
            progressRef.current = 1;
            setProgress(100);
            return;
        }

        if (isHolding.current) {
            // CHARGE
            progressRef.current += dt / DURATION;
        } else {
            // DECAY
            progressRef.current -= dt / DECAY_DURATION;
        }

        // Clamp 0 to 1
        progressRef.current = Math.max(0, Math.min(1, progressRef.current));

        // Sync to React state for render
        setProgress(progressRef.current * 100);

        // Check completion
        if (progressRef.current >= 1 && isHolding.current && !isCompleted.current) {
            isCompleted.current = true;
            // Add slight delay before transition for satisfaction
            setTimeout(() => {
                onEnter();
            }, 500); // 500ms delay
            return;
        }

        // Continue loop if there is non-zero progress or we are holding
        if (progressRef.current > 0 || isHolding.current) {
            rafId.current = requestAnimationFrame(updateProgress);
        } else {
            rafId.current = null;
        }
    };

    const startLoop = () => {
        if (!rafId.current) {
            lastTimeRef.current = Date.now();
            rafId.current = requestAnimationFrame(updateProgress);
        }
    };

    const handleMouseDown = () => {
        isHolding.current = true;
        // Start/Confirm loop is running
        startLoop();
    };

    const handleMouseUp = () => {
        isHolding.current = false;
        // Loop continues to handle decay via !isHolding check inside updateProgress
        // Eventually stops when progress hits 0
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        setCursorText("HOLD");
        setCursorVariant('default');
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setCursorText("");
        setCursorVariant('default');
        handleMouseUp();
    };

    // Cleanup on unmount to ensure cursor resets when gate opens/closes
    useEffect(() => {
        return () => {
            setIsHovered(false);
            setCursorText("");
            setCursorVariant('default');
        };
    }, [setIsHovered, setCursorText, setCursorVariant]);

    const handleTouchStart = handleMouseDown;
    const handleTouchEnd = handleMouseUp;

    // Scramble / Morph Logic
    const startText = "Atta Zulfahrizan";
    const endText = "Walaho";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_/-";

    // Helper for morph logic
    const resolveMorph = (progressPct: number, start: string, end: string) => {
        const p = Math.max(0, Math.min(1, progressPct / 100));
        if (p <= 0) return start;
        if (p >= 1) return end;

        // Peak scramble at 50%
        const randomThreshold = Math.sin(p * Math.PI);

        const currentLength = Math.floor(start.length + (end.length - start.length) * p);

        let str = "";
        for (let i = 0; i < currentLength; i++) {
            // Inject random noise based on threshold
            if (Math.random() < randomThreshold * 0.4) {
                str += chars[Math.floor(Math.random() * chars.length)];
            } else {
                // Determine if we pick from Start or End based on progress probability
                if (Math.random() < p) {
                    // Try to pick from End
                    str += (i < end.length) ? end[i] : "";
                } else {
                    // Try to pick from Start
                    str += (i < start.length) ? start[i] : "";
                }
            }
        }
        return str || start;
    };

    const displayedName = resolveMorph(progress, "Atta Zulfahrizan", "Walaho");
    const displayedTitle = resolveMorph(progress, "[ ATTA ZULFAHRIZAN'S PORTFOLIO ]", "[ WALAHO'S PORTFOLIO ]");

    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground select-none cursor-none overflow-hidden font-mono"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background Layer - Single Image */}
            <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
                <img
                    src="/img/img1.jpg"
                    alt=""
                    className="w-full h-full object-cover opacity-60"
                />
            </div>

            {/* Global Gradient Overlay for unified tone */}
            <div className="absolute inset-0 pointer-events-none bg-background/30 mix-blend-color" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-transparent to-background/50" />

            {/* --- 4 CORNER LAYOUT --- */}

            {/* Top Left */}
            <div className="absolute top-8 left-8 text-md text-gray-500 tracking-widest pointer-events-none z-10">
                {displayedTitle}
            </div>

            {/* Top Right */}
            <div className="absolute top-8 right-8 text-md text-gray-500 text-right pointer-events-none z-10">
                MEDAN, ID // 24.12.2005
            </div>

            {/* Bottom Left - IDENTITY MORPH */}
            <div className="absolute bottom-8 left-8 text-left pointer-events-none z-10 block">
                {/* Name Morph */}
                <h1 className="text-4xl md:text-4xl font-bold mb-2 text-white">
                    {displayedName}
                </h1>
                {/* Role */}
                <p className="text-sm md:text-base text-gray-300">
                    Creative Technologist
                </p>
                {/* Skills */}
                <p className="text-xs text-gray-500 uppercase mt-1">
                    Web • Photo • 3D • Mobile
                </p>
            </div>

            {/* Bottom Right - Interaction Hint */}
            <div className="absolute bottom-8 right-8 text-xl text-white animate-pulse pointer-events-none z-10">
                [ HOLD TO ENTER ]
            </div>

            {/* Bottom Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-foreground/10 z-20 pointer-events-none">
                <motion.div
                    className="h-full bg-foreground"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0 }}
                />
            </div>
        </motion.div>
    );
}