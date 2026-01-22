'use client';
import { useEffect, useState, useRef } from "react";
import { useCursorStore } from "@/store/useCursorStore";
import { useIntroStore } from "@/store/useIntroStore"; // Added Import
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import clsx from "clsx";

import { usePathname } from "next/navigation";

export default function CustomCursor() {
    // 1. RAW MOUSE INPUT (Instant)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // 2. SPRING PHYSICS (Delayed Ring)
    // Smooth, loose spring for that "magnetic trailing" effect
    const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const { isHovered, cursorText, cursorVariant, setIsHovered, setCursorText, setCursorVariant, theme } = useCursorStore();
    const { isEntered } = useIntroStore(); // Added Hook Call
    const pathname = usePathname();

    const [progress, setProgress] = useState(0); // 0 to 100
    const [isVisible, setIsVisible] = useState(false);
    const rotate = useMotionValue(0);
    const isHolding = useRef(false);
    const progressRef = useRef(0);
    const lastTimeRef = useRef<number>(0);
    const rafId = useRef<number | null>(null);
    const DECAY_DURATION = 750;
    const DURATION = 1500;

    // --- HOLD LOGIC (Kept mostly same, just ensuring rotation works) ---
    const updateLoop = () => {
        if (useCursorStore.getState().cursorText !== "HOLD" && (isHolding.current || progressRef.current > 0)) {
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

        if (progressRef.current > 0) {
            const speed = 2 + Math.pow(progressRef.current * 10, 2.5) * 0.1;
            rotate.set(rotate.get() + speed);
        }

        if (progressRef.current > 0 || isHolding.current) {
            rafId.current = requestAnimationFrame(updateLoop);
        } else {
            rafId.current = null;
        }
    };

    const startLoop = () => {
        if (!rafId.current) {
            lastTimeRef.current = Date.now();
            rafId.current = requestAnimationFrame(updateLoop);
        }
    };

    useEffect(() => {
        setIsHovered(false);
        setCursorText("");
        setCursorVariant('default');
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
        let timer: NodeJS.Timeout;

        // Force hidden initially (fix for HMR/re-mount)
        setIsVisible(false);

        // Center cursor on mount
        if (typeof window !== 'undefined') {
            mouseX.set(window.innerWidth / 2);
            mouseY.set(window.innerHeight / 2);

            // Delay visibility - Increased to 2.5s to be obvious
            timer = setTimeout(() => {
                setIsVisible(true);
            }, 2500);
        }

        const updateMousePosition = (e: MouseEvent) => {
            // Update raw MotionValues directly
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleMouseDown = () => {
            if (useCursorStore.getState().cursorText !== "HOLD") return;
            isHolding.current = true;
            if (!rafId.current) lastTimeRef.current = Date.now();
            startLoop();
        };

        const handleMouseUp = () => {
            isHolding.current = false;
        };

        const updateTouchPosition = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mouseX.set(e.touches[0].clientX);
                mouseY.set(e.touches[0].clientY);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('touchmove', updateTouchPosition, { passive: true });
        window.addEventListener('touchstart', updateTouchPosition, { passive: true });

        // Bind both mouse and touch to hold logic
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('touchstart', handleMouseDown, { passive: true });

        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchend', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('touchmove', updateTouchPosition);
            window.removeEventListener('touchstart', updateTouchPosition);

            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('touchstart', handleMouseDown);

            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);

            if (rafId.current) cancelAnimationFrame(rafId.current);
            clearTimeout(timer);
        };
    }, []);

    // --- COLOR THEME LOGIC ---
    useEffect(() => {
        const root = document.documentElement;

        // If theme is explicitly set by ProjectDetailView (via store)
        if (theme) {
            // Logic:
            // If theme is LIGHT -> Content is Light -> Cursor should be DARK (Contrast)
            // If theme is DARK -> Content is Dark -> Cursor should be LIGHT (Contrast)

            if (theme === 'light') {
                // Light Content -> Dark Cursor
                root.style.setProperty('--cursor-color', 'hsl(0 0% 10%)');       // Dark Grey
                root.style.setProperty('--cursor-text-color', 'hsl(0 0% 95%)');  // Light Text
            } else {
                // Dark Content -> Light Cursor
                root.style.setProperty('--cursor-color', 'hsl(0 0% 95%)');       // Light Grey
                root.style.setProperty('--cursor-text-color', 'hsl(0 0% 10%)');  // Dark Text
            }
        } else {
            // Default/Fallback behavior (e.g. Home Page)
            // Revert to global CSS variable defaults (which adhere to global theme)
            // We can just remove the inline property to let globals.css take over
            root.style.removeProperty('--cursor-color');
            root.style.removeProperty('--cursor-text-color');
        }

    }, [theme]);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // LOGIC:
    // Desktop: Always Show
    // Mobile: Show ONLY if Home AND Gate Not Yet Open (!isEntered)
    const isHome = pathname === '/';
    const shouldShow = !isMobile || (isHome && !isEntered);

    useEffect(() => {
        if (shouldShow) {
            document.body.classList.add('force-no-cursor');
        } else {
            document.body.classList.remove('force-no-cursor');
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('force-no-cursor');
        }
    }, [shouldShow]);

    // Force reset if cursorText changes
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

    // If we shouldn't show the custom cursor, render nothing
    if (!shouldShow) return null;

    const isClickVariant = cursorVariant === 'click';

    // --- SIZES ---
    // --- SIZES ---
    // 1. INNER DOT (Constant size usually, maybe hides on hover?)
    const DOT_SIZE = 8; // Increased size

    // 2. OUTER RING (Dynamic size)
    const ringBaseSize = 60;
    const ringHoverSize = 100;
    const ringClickSize = 90;

    // Determine "Active" state (Clickable or Hold)
    const isHoldMode = cursorText === "HOLD";
    const isActive = isHovered || isHoldMode;

    let targetRingSize = ringBaseSize;
    if (isActive) targetRingSize = ringHoverSize;
    if (isHovered && isClickVariant) targetRingSize = ringClickSize;

    // Dash stuff for hold animation
    const dashLength = (progress / 100) * 0.5;
    const gapLength = 0.5 - dashLength;
    const dashArray = `${dashLength} ${gapLength}`;

    // Show delayed ring? Always true now, but style changes.
    const showDelayedRing = true;

    return (
        <motion.div
            className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >


            {/* ELEMENT 2: DELAYED RING (Normal State -> Solid Active State) */}
            <motion.div
                className={clsx(
                    "absolute top-0 left-0 flex items-center justify-center rounded-full will-change-transform",
                    !theme && "mix-blend-difference", // Blend mode should apply to both Ring (border) and Solid Circle
                    isActive
                        ? "" // Solid (color set via style)
                        : "bg-transparent border" // Ring
                )}
                style={{
                    x: springX,
                    y: springY,
                    // FORCE White background when active and no theme (Hybrid Mode)
                    backgroundColor: isActive ? (theme ? 'var(--cursor-color)' : '#ffffff') : 'transparent',
                    borderColor: isActive ? 'transparent' : (theme ? 'var(--cursor-color)' : 'white'),
                }}
                transformTemplate={({ x, y }) => `translate3d(${x}, ${y}, 0) translate(-50%, -50%)`}
                animate={{
                    width: targetRingSize,
                    height: targetRingSize,
                    opacity: 1,
                }}
                transition={{
                    opacity: { duration: 0.2 },
                    // Size transition
                    width: { type: 'spring', stiffness: 300, damping: 20 },
                    height: { type: 'spring', stiffness: 300, damping: 20 }
                }}
            />


            {/* ELEMENT 3: HOLD ANIMATION LAYERS (Restored Original) */}
            {/* These need to be INSTANT (bound to mouseX/Y) to feel unresponsive/locked if they use the spring */}
            {(isHolding.current || progress > 0) && (
                <>
                    {/* Layer 1: Inner components (120px) */}
                    <motion.div
                        className={clsx(
                            "absolute top-0 left-0 flex items-center justify-center rounded-full will-change-transform",
                            !theme && "mix-blend-difference"
                        )}
                        style={{
                            x: mouseX, // INSTANT
                            y: mouseY, // INSTANT
                            rotate: rotate
                        }}
                        transformTemplate={({ x, y, rotate }) => `translate3d(${x}, ${y}, 0) translate(-50%, -50%) rotate(${rotate})`}
                        initial={{ opacity: 0, width: 120, height: 120 }}
                        animate={{
                            width: 150,
                            height: 150,
                            opacity: 1
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <svg className="w-full h-full">
                            <motion.circle
                                cx="50%"
                                cy="50%"
                                r="40%"
                                stroke={theme ? "var(--cursor-color)" : "white"}
                                strokeWidth="4"
                                fill="transparent"
                                pathLength={1}
                                strokeDasharray={dashArray}
                                strokeLinecap="round"
                                style={{ rotate: 90 }}
                                animate={{ strokeDasharray: `${dashLength} ${gapLength} ${dashLength} ${gapLength}` }}
                                transition={{ duration: 0 }}
                            />
                        </svg>
                    </motion.div>

                    {/* Layer 2: Outer components (180px) */}
                    <motion.div
                        className={clsx(
                            "absolute top-0 left-0 flex items-center justify-center rounded-full will-change-transform",
                            !theme && "mix-blend-difference"
                        )}
                        style={{
                            x: mouseX, // INSTANT
                            y: mouseY, // INSTANT
                            rotate: rotate
                        }}
                        transformTemplate={({ x, y, rotate }) => `translate3d(${x}, ${y}, 0) translate(-50%, -50%) rotate(${rotate})`}
                        initial={{ opacity: 0, width: 160, height: 160 }}
                        animate={{
                            width: 210,
                            height: 210,
                            opacity: 1
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <svg className="w-full h-full">
                            <motion.circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                stroke={theme ? "var(--cursor-color)" : "white"}
                                strokeWidth="3"
                                fill="transparent"
                                pathLength={1}
                                strokeDasharray={dashArray}
                                strokeLinecap="round"
                                animate={{ strokeDasharray: `${dashLength} ${gapLength} ${dashLength} ${gapLength}` }}
                                transition={{ duration: 0 }}
                            />
                        </svg>
                    </motion.div>
                </>
            )}
            {/* ELEMENT 1: INSTANT LAYER (Dot OR Text) - MOVED TO END TO BE ON TOP */}
            <motion.div
                className={clsx(
                    "absolute top-0 left-0 flex items-center justify-center will-change-transform",
                    !theme && "mix-blend-difference" // Apply blend to container so it blends with siblings/bg
                )}
                style={{
                    x: mouseX,
                    y: mouseY,
                    pointerEvents: 'none', // Ensure it doesn't block clicks
                }}
                transformTemplate={({ x, y }) => `translate3d(${x}, ${y}, 0) translate(-50%, -50%)`}
            >
                {/* 1a. DOT: Visible when NOT active */}
                <motion.div
                    className="rounded-full"
                    // Removed mix-blend here since parent has it
                    style={{ backgroundColor: theme ? 'var(--cursor-color)' : 'white' }}
                    animate={{
                        width: isActive ? 0 : DOT_SIZE,
                        height: isActive ? 0 : DOT_SIZE,
                        opacity: isActive ? 0 : 1
                    }}
                    transition={{ duration: 0.2 }}
                />

                {/* 1b. TEXT: Visible when ACTIVE (Replaces Dot) */}
                <AnimatePresence mode="wait">
                    {isActive && (
                        <motion.span
                            key={cursorText}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className={clsx(
                                "absolute text-xs uppercase font-bold tracking-wider whitespace-nowrap font-serif",
                                !theme && "text-white" // Just white, parent handles blend
                            )}
                            style={{
                                color: theme ? 'var(--cursor-text-color)' : undefined,
                            }}
                        >
                            {cursorText || (isHoldMode ? 'HOLD' : 'VIEW')}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
