'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTimerStore } from '@/store/useTimerStore';
import { useCursorStore } from '@/store/useCursorStore';
import { useTransitionStore } from '@/store/useTransitionStore';
import { useLenis } from './SmoothScroll';
import { motion } from 'framer-motion';

export default function SystemHUD() {
    const pathname = usePathname();
    const router = useRouter();
    const { uptime, tick, isSystemActive, isOverheated, setOverheated } = useTimerStore();
    const { lenis } = useLenis();
    const { setCursorText, setIsHovered, setCursorVariant } = useCursorStore();
    const { startTransition } = useTransitionStore();

    const [rotation, setRotation] = useState(0);
    const lastTriggeredTime = useRef(0);

    // Thermal Limit (Seconds)
    const MAX_UPTIME = 60;

    // Formatting MM:SS
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // ... (rest of the file until the effect)

    // Lenis Scroll Listener for Kinetic Rotation
    useEffect(() => {
        if (!lenis) return;

        // Simpler approach requested by user:
        // User snippet: useLenis(({ velocity }) => { setRotation(...) })
        // If we strictly follow that, it only updates on scroll. 
        // To achieve "always rotates slowly even when not scrolling", we need a separate ticker.

        let animationFrameId: number;

        const updateLoop = () => {
            // Get current velocity from lenis instance if available
            const currentVelocity = lenis.velocity || 0;

            // Apply rotation: Reactivity to velocity (Bidirectional)
            // Removed constant + 0.2 to ensure no rotation when idle
            // Using signed velocity to allow rotation in both directions
            setRotation((prev) => prev + (currentVelocity * 0.5));

            animationFrameId = requestAnimationFrame(updateLoop);
        };

        updateLoop();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [lenis]);

    // Timer Tick Logic
    useEffect(() => {


        const shouldTick = pathname === '/' && isSystemActive && !isOverheated; // Pause if overheated
        if (!shouldTick) return;

        // Check for overheat at multiples of MAX_UPTIME
        if (uptime > 0 && uptime % MAX_UPTIME === 0 && uptime !== lastTriggeredTime.current) {
            console.log(`SystemHUD: Overheating triggered at ${uptime}s`);
            setOverheated(true);
            lastTriggeredTime.current = uptime;
        }

        const interval = setInterval(() => {
            tick();
        }, 1000);

        return () => clearInterval(interval);
    }, [pathname, isSystemActive, isOverheated, uptime, tick, router, setOverheated]);

    const isProjectPage = pathname.startsWith('/project/');

    if ((pathname !== '/' && !isProjectPage) || !isSystemActive) return null;


    const handleBack = () => {
        if (isProjectPage) {
            startTransition('down', 'dark', '/img/arcana/tarot.webp', 'dark');
            setTimeout(() => {
                router.push('/');
            }, 800);
        }
    };

    return (
        <div
            onClick={handleBack}
            onMouseEnter={() => {
                if (isProjectPage) {
                    setIsHovered(true);
                    setCursorText("CLICK");
                    setCursorVariant('click');
                }
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                setCursorText("");
                setCursorVariant('default');
            }}
            className={`fixed top-4 right-0 md:top-32 md:right-8 z-50 flex items-center justify-center w-20 h-20 md:w-32 md:h-32 mix-blend-difference text-white transition-transform duration-500 ${isProjectPage ? "cursor-none hover:scale-110" : "pointer-events-none"}`}
        >
            {/* 1. CENTER: UPTIME OR BACK */}
            <div className="absolute font-mono text-sm font-bold tracking-widest z-10 flex flex-col items-center justify-center">
                {isProjectPage ? (
                    <span>HOME</span>
                ) : (
                    <span className={(uptime % MAX_UPTIME) >= (MAX_UPTIME - 10) && !isOverheated ? "text-red-500 animate-pulse" : ""}>
                        {formatTime(uptime)}
                    </span>
                )}
            </div>

            {/* 2. OUTER: ROTATING RING */}
            <motion.div
                style={{ rotate: rotation }}
                className="absolute w-full h-full flex items-center justify-center"
            >
                {/* Use SVG for Circular Text */}
                <svg viewBox="0 0 100 100" className="w-full h-full opacity-50 overflow-visible">
                    <path id="textPath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                    <text className="text-[14px] text-[hsl(60,2.6%,91.2%)] uppercase font-mono tracking-[1px]" fill="currentColor">
                        <textPath href="#textPath" startOffset="0%">
                            {isProjectPage ? " SCROLL || SCROLL" : " SCROLL || SCROLL"}
                        </textPath>
                    </text>
                </svg>
            </motion.div>
        </div>
    );
}
