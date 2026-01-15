"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useMotionTemplate } from 'framer-motion';
import { useCursorStore } from '@/store/useCursorStore';

interface PersonaRevealSidebarProps {
    arcana: string;
}

export default function PersonaRevealSidebar({ arcana }: PersonaRevealSidebarProps) {
    // --- PARALLAX JARGON LOGIC ---
    const { scrollY } = useScroll();

    // Parallax Factor: 0.2 (Requested "x=x.2")
    // Looping Logic:
    // We render the text multiple times.
    // We assume a rough height for the text block to calculate the wrap point.
    // Text: "CHANGE MY OWN HEART" (19 chars + spaces) at text-[12rem] (approx 192px per em?).
    // Vertical writing text height is substantial.
    // Let's rely on percentage or a large enough pixel loop.
    // Better yet, use a repeating pattern with a CSS transform.

    // Let's try a pure transform approach.
    // Moving UP 2.0px for every 1px scrolled DOWN.
    const parallaxY = useTransform(scrollY, (value) => {
        const speed = 2.0; // 200% speed
        // We modulate by a "Loop Size". 
        // We need to estimate the loop size. 
        // Let's assume the text block height is roughly 2500px (12rem * ~12 chars visible? No, 12rem is font size).
        // Let's set a wrap point. If we render 2 copies, we wrap when we've moved 1 length.
        const loopHeight = 3000; // Approx height of one text block to wrap smoothly
        return - (value * speed) % loopHeight;
    });

    // --- INTERACTIVE SIDEBAR LOGIC ---
    const [status, setStatus] = useState<'idle' | 'hover' | 'revealed'>('idle');
    const [isActive, setIsActive] = useState(false);
    const [displayText, setDisplayText] = useState("PERSONA");

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
        fontFamily: "var(--font-mono), monospace",
        lineHeight: 1.0,
    };

    const mainStyle: React.CSSProperties = { ...baseStyle, color: "#FFFFFF" };

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

    // Repeated text for looping
    const PARALLAX_TEXT = "CHANGE MY OWN HEART // CHANGE MY OWN HEART // CHANGE MY OWN HEART // CHANGE MY OWN HEART // CHANGE MY OWN HEART";

    return (
        <>
            {/* 1. INTERACTIVE SIDEBAR (FIXED LEFT) */}
            <div
                className="fixed left-0 top-0 h-full w-[15%] flex flex-col items-start justify-start z-40 pointer-events-none mix-blend-difference select-none"
            >
                <div
                    className="relative flex items-center justify-center pointer-events-auto cursor-pointer"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleClick}
                >
                    {/* Layers */}
                    <motion.h1
                        className="text-7xl md:text-8xl font-bold tracking-tighter leading-none"
                        style={redChannelStyle}
                        variants={glitchVariants}
                        animate={animState}
                    >
                        {displayText}
                    </motion.h1>

                    <motion.h1
                        className="text-7xl md:text-8xl font-bold tracking-tighter leading-none"
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
                        className="text-7xl md:text-8xl font-bold tracking-tighter leading-none relative z-10"
                        style={mainStyle}
                    >
                        {displayText}
                    </motion.h1>
                </div>
            </div>

            {/* 2. PARALLAX JARGON (FIXED BACKGROUND) */}
            {/* 
                We use a tall container and translate it.
                Since it's fixed, we need to ensure the loop is seamless.
                Moving UP means negative Y.
            */}
            <motion.div
                className="fixed top-0 pointer-events-none z-0 select-none whitespace-nowrap overflow-visible"
                style={{
                    left: '1rem',
                    y: parallaxY,
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    fontFamily: "var(--font-mono), monospace",
                }}
            >
                <h1 className="text-[12rem] font-black tracking-tighter text-transparent stroke-white"
                    style={{
                        WebkitTextStroke: "2px rgba(255, 255, 255, 0.15)"
                    }}
                >
                    {PARALLAX_TEXT}
                </h1>
            </motion.div>
        </>
    );
}
