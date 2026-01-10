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

    // Main loop for handling progress via physics-like delta
    const updateProgress = () => {
        const now = Date.now();
        const dt = now - lastTimeRef.current;
        lastTimeRef.current = now;

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
        if (progressRef.current >= 1 && isHolding.current) {
            onEnter();
            // Don't stop loop immediately, or do we? 
            // If we enter, the component might unmount. 
            // If it stays, we keep it at 100%.
            return;
        }

        // Continue loop if there is non-zero progress or we are holding
        // (Even if 0, if holding, we need to start growing, but isHolding check above covers that)
        // Actually, if progress is 0 and not holding, we can stop to save resources.
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

    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground select-none cursor-none overflow-hidden"
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

            {/* Center Content - Text Only */}
            <div className="relative z-10 flex flex-col items-center gap-2 pointer-events-none">
                <h1 className="text-4xl font-bold tracking-tighter">Boku no Portofolio</h1>
                <p className="text-xs opacity-50 tracking-[0.2em]">EST. 2026</p>
            </div>

            {/* Bottom Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-foreground/10 z-20">
                <motion.div
                    className="h-full bg-foreground"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0 }}
                />
            </div>

            <div className="absolute bottom-12 text-xs opacity-40 uppercase tracking-widest z-10 pointer-events-none">
                Hold to enter
            </div>
        </motion.div>
    );
}