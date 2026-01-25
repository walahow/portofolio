'use client';

import { motion } from 'framer-motion';
import { useTransitionStore } from '@/store/useTransitionStore';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ShutterOverlay() {
    const { isTransitioning, endTransition, shouldReveal, direction, targetTheme, targetImage, sourceTheme } = useTransitionStore();
    const pathname = usePathname();
    const [prevPath, setPrevPath] = useState(pathname);

    // Determines which direction the shutter moves
    // UP: Bottom -> Top
    // DOWN: Top -> Bottom
    const [shutterState, setShutterState] = useState<'HIDDEN_BOTTOM' | 'COVERING' | 'HIDDEN_TOP'>('HIDDEN_BOTTOM');
    const [isSnapping, setIsSnapping] = useState(false);
    const [hasNavigated, setHasNavigated] = useState(false); // NEW: Track if we've reached the new page

    // THEME COLORS
    // Source: Original page theme (Default/Dark: #0d0d0d / hsl(0 0% 5%), Light: hsl(0 0% 95%))
    // Accent: Card Background (fixed #050505)
    // Theme: Target page theme (Default/Dark: #0d0d0d / hsl(0 0% 5%), Light: hsl(0 0% 95%))
    const SOURCE_COLOR = (useTransitionStore.getState().sourceTheme === 'light') ? 'hsl(0 0% 95%)' : 'hsl(0 0% 5%)';
    const THEME_COLOR = targetTheme === 'light' ? 'hsl(0 0% 95%)' : 'hsl(0 0% 5%)';

    useEffect(() => {
        if (isTransitioning) {
            if (direction === 'down') {
                setIsSnapping(true);
                setShutterState('HIDDEN_TOP');
                setHasNavigated(false); // Reset

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setIsSnapping(false);
                        setShutterState('COVERING');
                    });
                });
            } else {
                setHasNavigated(false); // Reset
                setShutterState('COVERING');
            }
        }
    }, [isTransitioning, direction]);

    useEffect(() => {
        const triggerReveal = () => {
            // 2. REVEAL PHASE
            // Once Theme has covered the screen, we wait a bit, then pull everything up
            setTimeout(() => {
                if (direction === 'down') {
                    setShutterState('HIDDEN_BOTTOM');
                } else {
                    setShutterState('HIDDEN_TOP');
                }
            }, 100);
        };

        if (pathname !== prevPath) {
            setPrevPath(pathname);
            if (isTransitioning) {
                // 1. ARRIVAL PHASE
                // We have arrived at new page (in DOM).
                // Now allow the Theme Layer to wipe up (Covering the Tarot).
                setHasNavigated(true);

                // Wait for the Theme Wipe to complete (approx 1s) before triggering Reveal
                setTimeout(() => {
                    triggerReveal();
                }, 1000);
            }
        }

        if (shouldReveal && isTransitioning) {
            // Manual trigger fallback
            setHasNavigated(true);
            triggerReveal();
        }
    }, [pathname, prevPath, isTransitioning, shouldReveal, direction]);

    // Define cubic-bezier as a specific tuple to satisfy Framer Motion types
    const easeCurve: [number, number, number, number] = [0.8, 0, 0.2, 1];
    const baseTransition = { duration: isSnapping ? 0 : 0.9, ease: easeCurve };
    const slowTransition = { duration: isSnapping ? 0 : 1.2, ease: easeCurve }; // Slower for Tarot

    // SOURCE LAYER VARIANTS (First In)
    const sourceVariants = {
        HIDDEN_BOTTOM: { y: "105%", transition: { ...baseTransition, delay: shutterState === 'HIDDEN_BOTTOM' ? 0.6 : 0 } },
        COVERING: { y: "0%", transition: { ...baseTransition, delay: 0 } }, // Enter Immediate
        HIDDEN_TOP: { y: "-105%", transition: { ...baseTransition, delay: shutterState === 'HIDDEN_TOP' ? 0.6 : 0 } }
    };

    // TAROT LAYER VARIANTS (Second In - Slower)
    const accentVariants = {
        HIDDEN_BOTTOM: { y: "105%", transition: { ...slowTransition, delay: shutterState === 'HIDDEN_BOTTOM' ? 0.3 : 0.2 } },
        COVERING: { y: "0%", transition: { ...slowTransition, delay: 0.2 } }, // Enter Delay 0.2
        HIDDEN_TOP: { y: "-105%", transition: { ...slowTransition, delay: shutterState === 'HIDDEN_TOP' ? 0.3 : 0.2 } }
    };

    // THEME LAYER VARIANTS (Third In)
    // Controlled by hasNavigated to wait for page load


    return (
        <>
            {/* LAYER 0: SOURCE THEME (Bottom Layer, First In) */}
            <motion.div
                initial="HIDDEN_BOTTOM"
                animate={shutterState}
                variants={sourceVariants}
                className="fixed inset-0 z-[100] pointer-events-none"
                style={{ backgroundColor: SOURCE_COLOR }}
                onAnimationComplete={() => {
                    // This is the last layer to reveal, so end transition here
                    if (shutterState === 'HIDDEN_TOP' && direction === 'up') {
                        endTransition();
                        setIsSnapping(true);
                        setShutterState('HIDDEN_BOTTOM');
                        requestAnimationFrame(() => setIsSnapping(false));
                    }
                    if (shutterState === 'HIDDEN_BOTTOM' && direction === 'down') {
                        endTransition();
                    }
                }}
            />

            {/* LAYER 1: THEME (Middle Layer, Third In - BACKGROUND for Tarot) */}
            <motion.div
                initial="HIDDEN_BOTTOM"
                animate={shutterState}
                variants={{
                    HIDDEN_BOTTOM: { y: "105%", transition: { ...baseTransition, delay: shutterState === 'HIDDEN_BOTTOM' ? 0 : 0.4 } },
                    COVERING: {
                        y: hasNavigated ? "0%" : (direction === 'down' ? "-105%" : "105%"), // Wait at correct origin
                        transition: { ...baseTransition, delay: 0 }
                    },
                    HIDDEN_TOP: { y: "-105%", transition: { ...baseTransition, delay: shutterState === 'HIDDEN_TOP' ? 0 : 0.6 } }
                }}
                className="fixed inset-0 z-[101] pointer-events-none"
                style={{ backgroundColor: THEME_COLOR }}
            />

            {/* LAYER 2: TAROT (Top Layer, Second In - FOREGROUND) */}
            <motion.div
                initial="HIDDEN_BOTTOM"
                animate={shutterState}
                variants={accentVariants}
                className="fixed inset-0 z-[102] pointer-events-none flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: 'transparent' }} // Make transparent so we see Theme Layer behind
            >
                {/* TAROT CARDS CONTENT */}
                {targetImage && (
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* ECHO LEFT (Mobile & Desktop) */}
                        <div className="block absolute -left-[10%] md:left-[15%] opacity-30 scale-90 blur-[2px] transition-transform duration-1000">
                            <img
                                src={targetImage}
                                alt=""
                                className="h-[60vh] w-auto object-contain"
                                style={{ transform: 'rotate(-5deg)', filter: 'grayscale(100%) contrast(150%)' }}
                            />
                        </div>

                        {/* ECHO RIGHT (Mobile & Desktop) */}
                        <div className="block absolute -right-[10%] md:right-[15%] opacity-30 scale-90 blur-[2px] transition-transform duration-1000">
                            <img
                                src={targetImage}
                                alt=""
                                className="h-[60vh] w-auto object-contain"
                                style={{ transform: 'rotate(5deg)', filter: 'grayscale(100%) contrast(150%)' }}
                            />
                        </div>

                        {/* MAIN CARD (Center) */}
                        <div className="relative z-10 drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                            <img
                                src={targetImage}
                                alt="Arcana"
                                className="h-[50vh] md:h-[70vh] w-auto object-contain"
                                style={{ filter: 'grayscale(100%) contrast(150%)' }}
                            />
                        </div>
                    </div>
                )}
            </motion.div>
        </>
    );
}
