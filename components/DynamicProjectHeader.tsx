'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- HOOK: USE SCRAMBLE TEXT ---
function useScrambleText(targetText: string, duration: number = 500) {
    const [display, setDisplay] = useState(targetText);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_!@#$%^&*()";

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const ratio = Math.min(progress / duration, 1);

            // Calculate how many characters should be "resolved" (correct)
            const length = targetText.length;
            const resolvedCount = Math.floor(ratio * length);

            let result = "";
            for (let i = 0; i < length; i++) {
                if (i < resolvedCount) {
                    result += targetText[i];
                } else {
                    // Random character
                    result += chars[Math.floor(Math.random() * chars.length)];
                }
            }

            setDisplay(result);

            if (progress < duration) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setDisplay(targetText); //  Ensure final state is correct
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [targetText, duration]);

    return display;
}

interface DynamicProjectHeaderProps {
    title: string;
    role: string;
}

export default function DynamicProjectHeader({ title, role }: DynamicProjectHeaderProps) {
    // 1. SCRAMBLE LOGIC
    // We trigger the hook whenever the 'title' prop changes
    const scrambleTitle = useScrambleText(title.toUpperCase(), 450); // Slower scramble (was 300)

    // 2. IS GLITCHING STATE
    // We want the glitch mainly active during the transition
    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        setIsGlitching(true);
        const t = setTimeout(() => setIsGlitching(false), 450); // Slower glitch (was 300)
        return () => clearTimeout(t);
    }, [title]);

    // 3. FRAMER VARIANTS FOR GLITCH
    const glitchVariants = {
        idle: {
            x: 0,
            y: 0,
            opacity: 0
        },
        glitching: {
            x: [0, -5, 5, -3, 3, 0, -8, 8, 0], // Increased offsets
            y: [0, 2, -2, 4, -4, 0, 3, -3, 0], // Increased offsets
            opacity: [0, 0.9, 0.6, 1, 0.5, 0],
            transition: {
                duration: 0.45, // Slower glitch variant (was 0.3)
                times: [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 0.9, 1],
                ease: "linear" as any
            }
        }
    };

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none mix-blend-difference">

            {/* TITLE CONTAINER (GLITCH + SCRAMBLE) */}
            <div className="relative mb-2 min-h-[2rem] flex items-center justify-center">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={title} // Trigger exit/enter on title change
                        initial={{ opacity: 0, scale: 0.9, filter: "blur(0px)" }} // Removed blur for visibility
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)", transition: { duration: 0.15 } }}
                        transition={{ duration: 0.45, ease: "circOut" }}
                        className="relative"
                    >
                        {/* Layer 1: Red Channel (Left Offset) */}
                        <motion.div
                            className="absolute inset-0 text-red-500 pointer-events-none select-none mix-blend-screen"
                            variants={glitchVariants}
                            animate={isGlitching ? "glitching" : "idle"}
                        >
                            <span className="font-bold text-4xl md:text-5xl tracking-tighter font-mono">
                                {scrambleTitle}
                            </span>
                        </motion.div>

                        {/* Layer 2: Blue Channel (Right Offset) */}
                        <motion.div
                            className="absolute inset-0 text-blue-500 pointer-events-none select-none mix-blend-screen"
                            variants={{
                                ...glitchVariants,
                                glitching: {
                                    ...glitchVariants.glitching,
                                    x: [0, 5, -5, 3, -3, 0, 8, -8, 0], // Inverted X for separation
                                }
                            }}
                            animate={isGlitching ? "glitching" : "idle"}
                        >
                            <span className="font-bold text-4xl md:text-5xl tracking-tighter font-mono">
                                {scrambleTitle}
                            </span>
                        </motion.div>

                        {/* Layer 3: Main White Text */}
                        <span className="relative z-10 font-bold text-4xl md:text-5xl tracking-tighter font-mono text-white">
                            {scrambleTitle}
                        </span>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ROLE CONTAINER (CLEAN SLIDE UP) */}
            <div className="overflow-hidden h-6 flex items-start justify-center">
                <AnimatePresence mode='wait'>
                    <motion.p
                        key={role} // Key triggers animation on change
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 0.6 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
                        className="text-xs md:text-sm font-mono uppercase tracking-[0.2em] text-white/80"
                    >
                        {role}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
}
