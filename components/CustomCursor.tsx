'use client';
import { useEffect, useRef } from "react";
import { useCursorStore } from "@/store/useCursorStore";
import {
    motion,
    AnimatePresence,
    useMotionValue,
    useSpring,
    useTransform,
} from "framer-motion";
import clsx from "clsx";
import { usePathname } from "next/navigation";

export default function CustomCursor() {
    const { isHovered, cursorText, cursorVariant, setIsHovered, setCursorText, setCursorVariant } = useCursorStore();
    const pathname = usePathname();

    // 1. Motion Values for Input
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // 2. Physics for Dot (Fast, Responsive, "Snappy")
    const dotSpringConfig = { stiffness: 1000, damping: 50, mass: 0.2 };
    const dotX = useSpring(mouseX, dotSpringConfig);
    const dotY = useSpring(mouseY, dotSpringConfig);

    // 3. Physics for Ring (Delayed, "Heavy", "Cinematic")
    const ringSpringConfig = { stiffness: 300, damping: 30, mass: 0.1 }; // Increased stiffness for less lag
    const ringX = useSpring(mouseX, ringSpringConfig);
    const ringY = useSpring(mouseY, ringSpringConfig);

    // 4. Progress & Rotation (Logic converted to MotionValues for performance)
    const progress = useMotionValue(0); // 0 to 100
    const rotate = useMotionValue(0);

    const isHolding = useRef(false);
    const progressRef = useRef(0);
    const lastTimeRef = useRef<number>(0);
    const rafId = useRef<number | null>(null);

    const DECAY_DURATION = 750;
    const DURATION = 1500;

    // Derived Transforms for SVG Dashes
    // dashLength: 0 -> 0.5 (half circle)
    const dashLength = useTransform(progress, [0, 100], [0, 0.5]);
    const gapLength = useTransform(dashLength, (l) => 0.5 - l);
    // Construct dashArray string like "0.1 0.4 0.1 0.4"
    const dashArray = useTransform(
        [dashLength, gapLength],
        ([d, g]) => `${d} ${g} ${d} ${g}`
    );

    // Main Animation Loop for "Hold" mechanic
    const updateLoop = () => {
        // Safety checks
        const state = useCursorStore.getState();
        if (state.cursorText !== "HOLD" && (isHolding.current || progressRef.current > 0)) {
            // Force reset if context lost
            isHolding.current = false;
            progressRef.current = 0;
            progress.set(0);
            // We don't reset rotate abruptly to keep it smooth or we can if desired
            // rotate.set(0); 
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
                rafId.current = null;
            }
            return;
        }

        const now = Date.now();
        const dt = now - lastTimeRef.current;
        lastTimeRef.current = now;

        // Update Progress
        if (isHolding.current) {
            progressRef.current += dt / DURATION;
        } else {
            progressRef.current -= dt / DECAY_DURATION;
        }

        // Clamp
        progressRef.current = Math.max(0, Math.min(1, progressRef.current));
        progress.set(progressRef.current * 100);

        // Update Rotation (Accelerate with progress)
        if (progressRef.current > 0) {
            // Speed factor increases with progress
            const speed = 2 + Math.pow(progressRef.current * 10, 2.5) * 0.1;
            rotate.set(rotate.get() + speed);
        }

        // Continue Loop?
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

    // --- Effects ---

    // Reset on route change
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
        progress.set(0);
        rotate.set(0);
    }, [pathname, setIsHovered, setCursorText, setCursorVariant, progress, rotate]);

    // Force reset if cursorText changes away from HOLD
    useEffect(() => {
        if (cursorText !== "HOLD" && (isHolding.current || progressRef.current > 0)) {
            isHolding.current = false;
            progressRef.current = 0;
            progress.set(0);
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
                rafId.current = null;
            }
        }
    }, [cursorText, progress]);

    // Mouse Event Listeners
    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleMouseDown = () => {
            if (useCursorStore.getState().cursorText !== "HOLD") return;
            isHolding.current = true;
            // Ensure smooth start if loop dormant
            if (!rafId.current) {
                lastTimeRef.current = Date.now();
            }
            startLoop();
        };

        const handleMouseUp = () => {
            isHolding.current = false;
            // Loop continues to run for decay
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // --- Render Helpers ---

    const isClickVariant = cursorVariant === 'click';

    // Sizes
    // Dot: Always small, disappearing on complex hover? 
    // Let's keep Dot always visible as the precise pointer, unless obscured by opaque Ring.
    const dotSize = 12;
    const dotOffset = dotSize / 2;

    // Ring: Expands significantly on hover
    const baseRingSize = 48; // Default "resting" ring
    const hoverRingSize = 100;
    const clickRingSize = 80;

    const ringSize = isHovered
        ? (isClickVariant ? clickRingSize : hoverRingSize)
        : baseRingSize;

    const ringOffset = ringSize / 2;

    return (
        <div className="hidden md:block pointer-events-none fixed inset-0 z-[9999] overflow-hidden">

            {/* 1. THE DOT (Responsive, Snappy inputs) */}
            <motion.div
                className="absolute top-0 left-0 bg-white rounded-full pointer-events-none mix-blend-difference"
                style={{
                    x: dotX,
                    y: dotY,
                    // Center the dot relative to its coordinate
                    translateX: "-50%",
                    translateY: "-50%"
                }}
                animate={{
                    width: dotSize,
                    height: dotSize,
                    opacity: isHovered ? 0 : 1 // Hide dot when ring expands to avoid visual clutter? Or keep it?
                    // User asked for "responsive dot in the middle". 
                    // Let's hide it on hover since the ring becomes the cursor.
                }}
                transition={{ duration: 0.2 }}
            />

            {/* 2. THE RING (Delayed, Cinematic inputs) */}
            <motion.div
                className={clsx(
                    "absolute top-0 left-0 flex items-center justify-center rounded-full mix-blend-difference",
                    // Visual styling logic:
                    // Default: Border only
                    // Hover: Solid background? Or kept as border?
                    // Current design: "isClickVariant ? bg-white : bg-transparent border border-white"
                    isHovered
                        ? isClickVariant
                            ? "bg-white"
                            : "bg-transparent border border-white"
                        : "bg-transparent border border-white opacity-50" // Dimmer when idle?
                )}
                style={{
                    x: ringX,
                    y: ringY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    width: ringSize,
                    height: ringSize,
                    opacity: 1
                }}
                transition={{
                    type: "spring",
                    // We don't use the spring config here for layout changes (width/height), 
                    // just standard ease. The layout changes are driven by state.
                    // The POSITION changes are driven by the useSpring values above.
                    duration: 0.4,
                    ease: "circOut"
                }}
            >
                {/* 2a. Text inside Ring */}
                <AnimatePresence mode="wait">
                    {isHovered && (
                        <motion.span
                            key={cursorText}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className={clsx(
                                "text-[10px] uppercase font-bold tracking-wider text-center",
                                isClickVariant ? "text-black" : "text-white"
                            )}
                        >
                            {cursorText || 'VIEW'}
                        </motion.span>
                    )}
                </AnimatePresence>

                {/* 2b. HOLD Animation Layers (Attached to Ring) */}
                {/* These are extra rings that appear when holding. They should scale with the ring or be independent? 
                    Previously they were fixed size (120, 180). 
                    Let's center them inside the ring container but they might be larger than the ring itself.
                    Since we are inside the Ring div, position is relative to it.
                    We want them to use the Ring's physics.
                */}

                {/* Layer 1: Inner Dashed Circle */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ rotate }} // Rotate the CONTAINER of the svg
                >
                    {/* 
                       We need these to be larger than the ring itself usually.
                       But if they are children, 'inset-0' constrains them to the ring size.
                       We want them to overflow.
                     */}
                    <div className="absolute w-[120px] h-[120px] flex items-center justify-center">
                        <motion.svg
                            className="w-full h-full"
                            style={{
                                opacity: useTransform(progress, (p) => p > 0 ? 1 : 0)
                            }}
                        >
                            <motion.circle
                                cx="50%"
                                cy="50%"
                                r="40%"
                                stroke="white"
                                strokeWidth="4"
                                fill="transparent"
                                pathLength={1}
                                strokeDasharray={dashArray}
                                strokeLinecap="round"
                                style={{ rotate: 90 }} // Initial offset to start at top
                            />
                        </motion.svg>
                    </div>

                    {/* Layer 2: Outer Dashed Circle */}
                    <div className="absolute w-[180px] h-[180px] flex items-center justify-center">
                        <motion.svg
                            className="w-full h-full"
                            style={{
                                opacity: useTransform(progress, (p) => p > 0 ? 1 : 0)
                            }}
                        >
                            <motion.circle
                                cx="50%"
                                cy="50%"
                                r="45%"
                                stroke="white"
                                strokeWidth="3"
                                fill="transparent"
                                pathLength={1}
                                strokeDasharray={dashArray}
                                strokeLinecap="round"
                            />
                        </motion.svg>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
}