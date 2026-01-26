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
    projectId: string;
    projectIndex: string;
}

export default function DynamicProjectHeader({ title, role, projectId, projectIndex }: DynamicProjectHeaderProps) {
    // 1. SCRAMBLE LOGIC
    // We trigger the hook whenever the 'title' prop changes
    const scrambleTitle = useScrambleText(title, 800); // Significantly slower scramble (was 450)

    // 2. IS GLITCHING STATE
    // We want the glitch mainly active during the transition
    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        setIsGlitching(true);
        const t = setTimeout(() => setIsGlitching(false), 800); // Slower glitch (was 450)
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
                duration: 0.8, // Slower glitch variant (was 0.45)
                times: [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 0.9, 1],
                ease: "linear" as any
            }
        }
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-[70] mix-blend-difference flex flex-col justify-between py-4 md:py-8">
            {/* TOP CENTER: HEADER */}
            <div className="flex flex-col items-center w-full">
                {/* TITLE CONTAINER (GLITCH + SCRAMBLE) */}
                <div className="relative mb-2 min-h-[2rem] flex items-center justify-center">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={title} // Trigger exit/enter on title change
                            initial={{ opacity: 0, scale: 0.9, filter: "blur(0px)" }} // Removed blur for visibility
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)", transition: { duration: 0.15 } }}
                            transition={{ duration: 0.8, ease: "circOut" }}
                            className="relative"
                        >
                            {/* Layer 1: Red Channel (Left Offset) */}
                            <motion.div
                                className="absolute inset-0 text-red-500 pointer-events-none select-none mix-blend-screen"
                                variants={glitchVariants}
                                animate={isGlitching ? "glitching" : "idle"}
                            >
                                <span className="font-bold text-5xl md:text-8xl tracking-tighter font-playfair whitespace-nowrap">
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
                                <span className="font-bold text-5xl md:text-8xl tracking-tighter font-playfair whitespace-nowrap">
                                    {scrambleTitle}
                                </span>
                            </motion.div>

                            {/* Layer 3: Main White Text */}
                            <span className="relative z-10 font-bold text-5xl md:text-8xl tracking-tighter font-playfair text-white whitespace-nowrap">
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
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut", delay: 0.05 }}
                            className="text-xs md:text-lg font-mono uppercase tracking-[0.2em] text-white/80"
                        >
                            {role}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>

            {/* BOTTOM FOOTER: PROJECT ID & INDEX */}
            <div className="w-full px-4 md:px-12 flex justify-center items-end gap-2 md:gap-2 pb-4">
                {/* Project ID */}
                <div className="overflow-hidden">
                    <span className="text-md md:text-xl font-playfair font-bold uppercase tracking-widest text-white/95">
                        {projectId}
                    </span>
                </div>

                <span className="text-white/40 text-xs md:text-sm font-playfair mb-[2px]">/</span>

                {/* Index */}
                <div className="overflow-hidden">
                    <span className="text-md md:text-xl font-playfair font-bold tracking-widest text-white/95">
                        07
                    </span>
                </div>
            </div>
        </div>
    );
}
