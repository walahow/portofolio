'use client';
import { useEffect, useState, useRef } from "react";
import { useCursorStore } from "@/store/useCursorStore";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

import { usePathname } from "next/navigation";

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { isHovered, cursorText, cursorVariant, setIsHovered, setCursorText, setCursorVariant } = useCursorStore();
    const pathname = usePathname();

    const [progress, setProgress] = useState(0);
    const isHolding = useRef(false);
    const startTime = useRef<number | null>(null);
    const animationFrame = useRef<number | null>(null);
    const DURATION = 1500;

    useEffect(() => {
        setIsHovered(false);
        setCursorText("");
        setCursorVariant('default');
    }, [pathname, setIsHovered, setCursorText, setCursorVariant]);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseDown = () => {
            isHolding.current = true;
            startTime.current = Date.now();

            const animate = () => {
                if (!isHolding.current || !startTime.current) return;
                const elapsed = Date.now() - startTime.current;
                const newProgress = Math.min(elapsed / DURATION, 1);
                setProgress(newProgress * 100);

                if (newProgress < 1) {
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
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            if (animationFrame.current) cancelAnimationFrame(animationFrame.current);

        };
    }, []);

    // Derived styles based on variant
    const isClickVariant = cursorVariant === 'click';

    // Base cursor (Project/Hold) size
    const baseSize = isHovered ? 80 : 16;
    const baseOffset = isHovered ? 40 : 8;

    // Click variant size (slightly smaller than Project card for elegance)
    const clickSize = 64;
    const clickOffset = 32;

    const cursorSize = isClickVariant && isHovered ? clickSize : baseSize;
    const cursorOffset = isClickVariant && isHovered ? clickOffset : baseOffset;

    return (
        <>
            <motion.div
                className={clsx(
                    "fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center rounded-full mix-blend-difference will-change-transform",
                    isHovered
                        ? isClickVariant
                            ? "bg-white" // Solid white for click
                            : "bg-transparent border border-white" // Outlined for default
                        : "bg-white" // Default small dot is solid
                )}
                animate={{
                    x: mousePosition.x - cursorOffset,
                    y: mousePosition.y - cursorOffset,
                    width: cursorSize,
                    height: cursorSize,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 150,
                    damping: 15,
                    mass: 0.1
                }}
            >
                <AnimatePresence mode="wait">
                    {isHovered && (
                        <motion.span
                            key={cursorText}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className={clsx(
                                "text-[10px] uppercase font-bold tracking-wider",
                                isClickVariant ? "text-black" : "text-white" // Black text on solid white cursor
                            )}
                        >
                            {cursorText || 'VIEW'}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Progress Circle (Only for 'default' variant which typically implies Hold/Project interactions, or if we want it for click too? Usually just for Hold) */}
            {/* The requirement said 'click' variant is distinct from 'hold'. So we hide the progress circle for 'click' variant if not needed, or keep it if hold is possible on click items. Assuming 'click' is instantaneous click, no hold progress needed. */}

            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center rounded-full mix-blend-difference will-change-transform"
                animate={{
                    x: mousePosition.x - (isHovered ? 60 : 24),
                    y: mousePosition.y - (isHovered ? 60 : 24),
                    width: isHovered ? 120 : 48,
                    height: isHovered ? 120 : 48,
                    opacity: progress > 0 && !isClickVariant ? 1 : 0 // Hide progress ring if we are in 'click' variant or no progress
                }}
                transition={{
                    x: { duration: 0 },
                    y: { duration: 0 },
                    width: { duration: 0.3, ease: "easeInOut" },
                    height: { duration: 0.3, ease: "easeInOut" },
                    opacity: { duration: 0.2 }
                }}
            >
                <svg className="w-full h-full -rotate-90">
                    <circle
                        cx="50%"
                        cy="50%"
                        r="48%"
                        stroke="white"
                        strokeWidth="1"
                        fill="transparent"
                        className="opacity-20"
                    />

                    <motion.circle
                        cx="50%"
                        cy="50%"
                        r="48%"
                        stroke="white"
                        strokeWidth="2"
                        fill="transparent"
                        pathLength={1}
                        strokeDasharray="1"
                        strokeDashoffset={1 - progress / 100}
                        strokeLinecap="round"
                    />
                </svg>
            </motion.div>
        </>
    );
}