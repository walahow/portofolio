"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useMotionTemplate } from 'framer-motion';
import { useCursorStore } from '@/store/useCursorStore';

interface PersonaRevealSidebarProps {
    arcana: string;
}

export default function PersonaRevealSidebar({ arcana }: PersonaRevealSidebarProps) {
    // --- PARALLAX JARGON LOGIC ---
    // (Moved to PersonaParallaxText component)


    // --- INTERACTIVE SIDEBAR LOGIC ---
    const [status, setStatus] = useState<'idle' | 'hover' | 'revealed'>('idle');
    const [isActive, setIsActive] = useState(false);
    const [displayText, setDisplayText] = useState("ARCANA");

    // Cursor Store Integration
    const { setIsHovered, setCursorText, setCursorVariant } = useCursorStore();

    // Random Glitch Logic
    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        if (status === 'revealed' || isActive) return;

        let timeout: NodeJS.Timeout;

        const triggerGlitch = () => {
            setIsGlitching(true);
            setTimeout(() => setIsGlitching(false), 300);

            const minDelay = status === 'hover' ? 200 : 2000;
            const maxDelay = status === 'hover' ? 800 : 5000;
            const delay = Math.random() * (maxDelay - minDelay) + minDelay;

            timeout = setTimeout(triggerGlitch, delay);
        };

        triggerGlitch();
        return () => clearTimeout(timeout);
    }, [status, isActive]);


    // Match DynamicProjectHeader Glitch Variants
    const glitchVariants = {
        idle: { x: 0, y: 0, opacity: 0 },
        glitching: {
            x: [0, -5, 5, -3, 3, 0, -8, 8, 0],
            y: [0, 2, -2, 4, -4, 0, 3, -3, 0],
            opacity: [0, 0.9, 0.6, 1, 0.5, 0],
            transition: {
                duration: 0.8,
                times: [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 0.9, 1],
                ease: "linear" as const
            }
        }
    };

    // Scramble / Reveal Logic
    useEffect(() => {
        if (!isActive) return;

        const targetText = arcana.toUpperCase();
        const adjustedDuration = 1000;

        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const ratio = Math.min(progress / adjustedDuration, 1);

            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_!@#$%^&*()";
            if (ratio < 1) {
                const startLen = 7; // PERSONA
                const endLen = targetText.length;
                const currentLen = Math.floor(startLen + (endLen - startLen) * ratio);
                const resolvedCount = Math.floor(ratio * endLen);

                let result = "";
                for (let i = 0; i < currentLen; i++) {
                    if (i < resolvedCount) {
                        result += targetText[i] || "";
                    } else {
                        result += chars[Math.floor(Math.random() * chars.length)];
                    }
                }
                setDisplayText(result);
                animationFrame = requestAnimationFrame(animate);
            } else {
                setDisplayText(targetText);
                setStatus('revealed');
                setIsActive(false);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isActive, arcana]);


    // --- HANDLERS ---
    const handleMouseEnter = () => {
        if (status !== 'revealed') {
            setStatus('hover');
            setIsHovered(true);
            setCursorText("DECRYPT");
            setCursorVariant('click');
        }
    };

    const handleMouseLeave = () => {
        if (status !== 'revealed') {
            setStatus('idle');
            setIsHovered(false);
            setCursorText("");
            setCursorVariant('default');
        }
    };

    const handleClick = () => {
        if (status === 'revealed' || isActive) return;
        setIsActive(true);
        setIsGlitching(true);

        setIsHovered(false);
        setCursorText("");
        setCursorVariant('default');
    };

    // --- STYLES ---
    const baseStyle: React.CSSProperties = {
        writingMode: "vertical-lr",
        transform: "rotate(0deg)",
        fontFamily: "var(--font-playfair), serif",
        lineHeight: 1.0,
    };

    const mainStyle: React.CSSProperties = { ...baseStyle, color: "var(--arcana-text)" };

    // Glitch styles
    const glitchBase: React.CSSProperties = {
        ...baseStyle,
        position: 'absolute',
        pointerEvents: "none",
        zIndex: 0,
        mixBlendMode: 'screen'
    };
    const redChannelStyle: React.CSSProperties = { ...glitchBase, color: "rgba(255,0,0,1)" };
    const cyanChannelStyle: React.CSSProperties = { ...glitchBase, color: "rgba(0,255,255,1)" };

    const animState = (isActive || isGlitching) ? "glitching" : "idle";

    return (
        <div
            className="fixed left-0 md:-left-2 top-0 h-full w-24 md:w-64 flex flex-col items-start justify-start z-40 pointer-events-none select-none"
        >
            <div
                className="relative flex items-center justify-center pointer-events-auto cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >
                {/* Layers */}
                <motion.h1
                    className="text-5xl md:text-9xl font-black tracking-tighter leading-none uppercase"
                    style={redChannelStyle}
                    variants={glitchVariants}
                    animate={animState}
                >
                    {displayText}
                </motion.h1>

                <motion.h1
                    className="text-5xl md:text-9xl font-black tracking-tighter leading-none uppercase"
                    style={cyanChannelStyle}
                    variants={{
                        ...glitchVariants,
                        glitching: {
                            ...glitchVariants.glitching,
                            x: [0, 5, -5, 3, -3, 0, 8, -8, 0],
                        }
                    }}
                    animate={animState}
                >
                    {displayText}
                </motion.h1>

                <motion.h1
                    className="text-5xl md:text-9xl font-black tracking-tighter leading-none relative z-10 uppercase"
                    style={mainStyle}
                >
                    {displayText}
                </motion.h1>
            </div>
        </div>
    );
}

// --- NEW COMPONENT: SEPARATED PARALLAX TEXT ---
export function PersonaParallaxText() {
    const { scrollY } = useScroll();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Moving UP 2.0px for every 1px scrolled DOWN on Desktop.
    // Moving UP 1.0px for every 1px scrolled DOWN on Mobile (1:1).
    const parallaxY = useTransform(scrollY, (value) => {
        const speed = isMobile ? 1.0 : 2.0;
        const loopHeight = 3000;
        return - (value * speed) % loopHeight;
    });

    const PARALLAX_TEXT = "Change My Own Heart // Change My Own Heart // Change My Own Heart // Change My Own Heart // Change My Own Heart // Change My Own Heart Change My Own Heart // Change My Own Heart // Change My Own Heart // Change My Own Heart // Change My Own Heart // Change My Own Heart // Change My Own Heart // Change My Own Heart Change My Own Heart // Change My Own Heart //";

    return (
        <div className="fixed top-0 left-0 h-full w-24 md:w-67 z-20 pointer-events-none flex flex-col items-end justify-center">
            <motion.div
                className="whitespace-nowrap overflow-visible pr-[8px] md:pr-[16px]"
                style={{
                    y: parallaxY,
                    writingMode: "vertical-rl",
                    rotate: 180,
                    fontFamily: "var(--font-playfair), serif",
                }}
            >
                <h1
                    className="text-[4rem] md:text-[10rem] tracking-tighter italic transition-colors duration-500"
                    style={{ color: 'var(--parallax-text)' }}
                >
                    {PARALLAX_TEXT}
                </h1>
            </motion.div>
        </div>
    );
}
