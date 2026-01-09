"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useCursorStore } from '@/store/useCursorStore';

interface HeroGateProps {
    onEnter: () => void;
}

export default function HeroGate({ onEnter }: HeroGateProps) {
    const [progress, setProgress] = useState(0);
    const controls = useAnimation();
    const { setCursorText, setIsHovered, setCursorVariant } = useCursorStore();

    const isHolding = useRef(false);
    const startTime = useRef<number | null>(null);
    const animationFrame = useRef<number | null>(null);

    const DURATION = 1500;

    const handleMouseDown = () => {
        isHolding.current = true;
        startTime.current = Date.now();

        controls.start({ scale: 0.95, filter: 'blur(2px)' });

        const animate = () => {
            if (!isHolding.current || !startTime.current) return;

            const elapsed = Date.now() - startTime.current;
            const newProgress = Math.min(elapsed / DURATION, 1);

            setProgress(newProgress * 100);

            if (newProgress >= 1) {
                isHolding.current = true;
                onEnter();
            } else {
                animationFrame.current = requestAnimationFrame(animate);
            }
        };
        animationFrame.current = requestAnimationFrame(animate);
    };

    const handleMouseUp = () => {
        isHolding.current = false;
        startTime.current = null;
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
        }
        setProgress(0);
        controls.start({ scale: 1, filter: 'blur(0px)' })
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

    const handleTouchStart = handleMouseDown;
    const handleTouchEnd = handleMouseUp;

    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground select-none cursor-none overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
        >
            {/* Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none w-full h-full flex">
                {/* Left Image - img1 */}
                <div className="relative w-[60%] h-full">
                    <img
                        src="/img/img1.jpg"
                        alt=""
                        className="w-full h-full object-cover opacity-60"
                        style={{
                            maskImage: 'linear-gradient(to right, white 50%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, white 50%, transparent 100%)',
                            objectPosition: 'right', // Change 'center' to 'left', 'right', or '50% 50%' to adjust position
                        }}
                    />
                </div>

                {/* Right Image - img2 */}
                <div className="absolute right-0 top-0 w-[60%] h-full">
                    <img
                        src="/img/img2.jpg"
                        alt=""
                        className="w-full h-full object-cover opacity-60"
                        style={{
                            maskImage: 'linear-gradient(to left, white 50%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to left, white 50%, transparent 100%)',
                            objectPosition: 'right', // Change 'center' to 'left', 'right', or '50% 50%' to adjust position
                        }}
                    />
                </div>

                {/* Global Gradient Overlay for unified tone */}
                <div className="absolute inset-0 bg-background/30 mix-blend-color" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
            </div>

            <motion.div
                animate={controls}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative z-10 flex flex-col items-center justify-center w-64 h-64 border border-foreground/20 rounded-full backdrop-blur-md"
            >
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="1"
                        fill="transparent"
                        className="text-foreground/10"
                    />
                    <motion.circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="transparent"
                        className="text-foreground"
                        strokeDasharray="754"
                        strokeDashoffset={754 - (754 * progress) / 100}
                        strokeLinecap="square"
                    />
                </svg>

                <div className="flex flex-col items-center gap-2 z-10 pointer-events-none">
                    <h1 className="text-2xl font-bold tracking-tighter">Boku no Portofolio</h1>
                    <p className="text-[10px] opacity-50 tracking-[0.2em]">EST. 2026</p>
                </div>

                <div className="absolute top-4 w-1 h-1 bg-current rounded-full"></div>
                <div className="absolute bottom-4 w-1 h-1 bg-current rounded-full"></div>
                <div className="absolute left-4 w-1 h-1 bg-current rounded-full"></div>
                <div className="absolute right-4 w-1 h-1 bg-current rounded-full"></div>
            </motion.div>
            <div className="absolute bottom-12 text-xs opacity-40 uppercase tracking-widest z-10">
                Hold to enter
            </div>
        </motion.div>
    );
}