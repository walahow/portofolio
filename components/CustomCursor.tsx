'use client';
import { useEffect, useState, useRef } from "react";
import { useCursorStore } from "@/store/useCursorStore";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import clsx from "clsx";

import { usePathname } from "next/navigation";

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { isHovered, cursorText, cursorVariant, setIsHovered, setCursorText, setCursorVariant } = useCursorStore();
    const pathname = usePathname();

    const [progress, setProgress] = useState(0); // 0 to 100
    const rotate = useMotionValue(0);
    const isHolding = useRef(false);
    const progressRef = useRef(0);
    const lastTimeRef = useRef<number>(0);
    const rafId = useRef<number | null>(null);
    const DECAY_DURATION = 750;
    const DURATION = 1500;

    const updateLoop = () => {
        // SAFETY: Check if we are still valid
        if (useCursorStore.getState().cursorText !== "HOLD" && (isHolding.current || progressRef.current > 0)) {
            // Force kill if context lost
            isHolding.current = false;
            progressRef.current = 0;
            setProgress(0);
            rotate.set(0);
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
                rafId.current = null;
            }
            return;
        }

        const now = Date.now();
        const dt = now - lastTimeRef.current;
        lastTimeRef.current = now;

        if (isHolding.current) {
            progressRef.current += dt / DURATION;
        } else {
            progressRef.current -= dt / DECAY_DURATION;
        }

        progressRef.current = Math.max(0, Math.min(1, progressRef.current));
        setProgress(progressRef.current * 100);

        // Rotation Logic
        // If holding, speed up. If releasing, slow down? 
        // Or just link speed to progress? 
        // "berputar makin kencang seiring user menekan".
        // If progress is high, speed is high.
        // Let's base speed on current progress intensity.
        // speed = base + (progress * multiplier)
        if (progressRef.current > 0) {
            const speed = 2 + Math.pow(progressRef.current * 10, 2.5) * 0.1;
            // Tuned approx to previous: duration based was elapsed/500. max elapsed 3500-> 7. 7^3 = 343.
            // Here progress 1 -> 10. 10^2.5 = 316. Similar range.
            rotate.set(rotate.get() + speed);
        }

        if (progressRef.current > 0 || isHolding.current) {
            rafId.current = requestAnimationFrame(updateLoop);
        } else {
            rafId.current = null;
            // Optionally reset rotation here if we want completely static start
            // rotate.set(0); 
        }
    };

    const startLoop = () => {
        if (!rafId.current) {
            lastTimeRef.current = Date.now();
            rafId.current = requestAnimationFrame(updateLoop);
        }
    };

    useEffect(() => {
        // Reset on nav
        setIsHovered(false);
        setCursorText("");
        setCursorVariant('default');
        // Also reset any ongoing hold animation
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
        }
        isHolding.current = false;
        progressRef.current = 0;
        setProgress(0);
        rotate.set(0);
    }, [pathname, setIsHovered, setCursorText, setCursorVariant]);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseDown = () => {
            // Only allow hold animation if we are explicitly on a "HOLD" target
            if (useCursorStore.getState().cursorText !== "HOLD") return;

            isHolding.current = true;
            // Ensure lastTime is fresh if starting form stop
            // If loop was already running (decaying), this acts as a seamless resumption
            if (!rafId.current) {
                lastTimeRef.current = Date.now();
            } else {
                // If loop running, we just need to update lastTime to avoid huge jumps if there was a glich? 
                // No, standard dt calculation works fine.
                // Just need to ensure `lastTime` isn't stale if we wake up a dormant loop?
                // Logic: loop stops when prog=0. So if we start, we set lastTime.
                // If loop is running, lastTime is being updated.
                // However, check logic: `lastTimeRef.current` is set in the loop. 
                // If we are "resuming" a decay, the loop is active!
                // So we do NOT reset lastTime if loop is active.
            }
            // If starting fresh loop:
            if (!rafId.current) {
                lastTimeRef.current = Date.now();
            }

            startLoop();
        };

        const handleMouseUp = () => {
            isHolding.current = false;
            // We do NOT stop the loop or clear progress here. 
            // We just flip the flag. The loop sees !isHolding and starts decaying.
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []); // Dependencies remain empty as listeners are set up once.

    // Force reset if cursorText changes (e.g. HeroGate unmounts -> cursorText becomes "")
    useEffect(() => {
        if (cursorText !== "HOLD" && (isHolding.current || progressRef.current > 0)) {
            isHolding.current = false;
            progressRef.current = 0;
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
                rafId.current = null;
            }
            setProgress(0);
        }
    }, [cursorText]);

    // Derived styles based on variant
    const isClickVariant = cursorVariant === 'click';

    // Base cursor size
    const baseSize = isHovered ? 80 : 16;
    const baseOffset = isHovered ? 40 : 8;
    const clickSize = 64;
    const clickOffset = 32;

    const cursorSize = isClickVariant && isHovered ? clickSize : baseSize;
    const cursorOffset = isClickVariant && isHovered ? clickOffset : baseOffset;

    // Calculate dash array for "2 dots growing"
    // Circumference fraction per dot. Max 0.5 (half circle)
    // 2 segments. Max length to fill circle is 0.5 each.
    // Length formula: (progress/100) * 0.5. 
    // At 0 progress: length is 0 (invisible).
    // At 100 progress: length is 0.5 (full semi-circle).
    const dashLength = (progress / 100) * 0.5;
    const gapLength = 0.5 - dashLength;
    const dashArray = `${dashLength} ${gapLength}`;

    return (
        <>
            {/* Main Cursor & Text - NO ROTATION on this container */}
            <motion.div
                className={clsx(
                    "fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center rounded-full mix-blend-difference will-change-transform",
                    // Base visual: white dot or circle
                    // If holding (progress > 0), maybe we hide the border? User said "text moves... no, lines outside move"
                    // Let's keep the base cursor design:
                    isHovered
                        ? isClickVariant
                            ? "bg-white"
                            : "bg-transparent border border-white"
                        : "bg-white"
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
                                isClickVariant ? "text-black" : "text-white"
                            )}
                        >
                            {cursorText || 'VIEW'}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Layer 1: Inner components (Top & Bottom) - Closest to cursor */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center rounded-full mix-blend-difference will-change-transform"
                style={{
                    rotate: rotate // Rotates with the same overdrive speed
                }}
                animate={{
                    x: mousePosition.x - (isHovered ? 60 : 60), // Increased size
                    y: mousePosition.y - (isHovered ? 60 : 60),
                    width: 120, // 100 -> 120
                    height: 120,
                    opacity: (isHolding.current || progress > 0) ? 1 : 0
                }}
                transition={{
                    x: { duration: 0 },
                    y: { duration: 0 },
                    opacity: { duration: 0.3 }
                }}
            >
                <svg className="w-full h-full">
                    <motion.circle
                        cx="50%"
                        cy="50%"
                        r="40%" // Keep relative radius
                        stroke="white"
                        strokeWidth="4" // 3 -> 4
                        fill="transparent"
                        pathLength={1}
                        strokeDasharray={dashArray}
                        strokeDashoffset={0}
                        strokeLinecap="round"
                        style={{ rotate: 90 }}
                        animate={{
                            strokeDasharray: `${dashLength} ${gapLength} ${dashLength} ${gapLength}`
                        }}
                        transition={{
                            duration: 0,
                            ease: "linear"
                        }}
                    />
                </svg>
            </motion.div>

            {/* Layer 2: Outer components (Left & Right) - Furthest from cursor */}
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center rounded-full mix-blend-difference will-change-transform"
                style={{
                    rotate: rotate // Rotates with the same overdrive speed
                }}
                animate={{
                    x: mousePosition.x - (isHovered ? 90 : 90), // Increased orbit (70 -> 90)
                    y: mousePosition.y - (isHovered ? 90 : 90),
                    width: 180, // 140 -> 180
                    height: 180,
                    opacity: (isHolding.current || progress > 0) ? 1 : 0
                }}
                transition={{
                    x: { duration: 0 },
                    y: { duration: 0 },
                    opacity: { duration: 0.3 }
                }}
            >
                <svg className="w-full h-full">
                    <motion.circle
                        cx="50%"
                        cy="50%"
                        r="45%" // Outer radius relative to this larger container
                        stroke="white"
                        strokeWidth="3" // 2 -> 3
                        fill="transparent"
                        pathLength={1}
                        strokeDasharray={dashArray}
                        strokeDashoffset={0}
                        strokeLinecap="round"
                        animate={{
                            strokeDasharray: `${dashLength} ${gapLength} ${dashLength} ${gapLength}`
                        }}
                        transition={{
                            duration: 0,
                            ease: "linear"
                        }}
                    />
                </svg>
            </motion.div>
        </>
    );
}