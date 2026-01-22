'use client';

import { motion } from 'framer-motion';
import { useTransitionStore } from '@/store/useTransitionStore';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ShutterOverlay() {
    const { isTransitioning, endTransition, shouldReveal, direction, targetTheme } = useTransitionStore();
    const pathname = usePathname();
    const [prevPath, setPrevPath] = useState(pathname);

    // Determines which direction the shutter moves
    // UP: Bottom -> Top
    // DOWN: Top -> Bottom
    const [shutterState, setShutterState] = useState<'HIDDEN_BOTTOM' | 'COVERING' | 'HIDDEN_TOP'>('HIDDEN_BOTTOM');
    const [isSnapping, setIsSnapping] = useState(false);

    // THEME COLORS
    // Accent: User specified logic (hsl(48,5%,55%))
    // Theme: Dependent on targetTheme (Default/Dark: #0d0d0d / hsl(0 0% 5%), Light: hsl(0 0% 95%))
    // Note: Global dark bg is approx hsl(0 0% 5%). Global light is hsl(0 0% 95%).
    // We will use hex/hsl explicitly to match globals.css.
    const ACCENT_COLOR = 'hsl(46,2%,35%)';
    const THEME_COLOR = targetTheme === 'light' ? 'hsl(0 0% 95%)' : 'hsl(0 0% 5%)';

    useEffect(() => {
        if (isTransitioning) {
            if (direction === 'down') {
                // WIPE DOWN: Top -> Bottom
                // Snap to Top first
                setIsSnapping(true);
                setShutterState('HIDDEN_TOP');

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setIsSnapping(false);
                        setShutterState('COVERING');
                    });
                });
            } else {
                // WIPE UP: Bottom -> Top (Default)
                setShutterState('COVERING');
            }
        }
    }, [isTransitioning, direction]);

    useEffect(() => {
        // Trigger Reveal on Path Change or Manual Trigger
        const triggerReveal = () => {
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
            if (isTransitioning) triggerReveal();
        }

        if (shouldReveal && isTransitioning) {
            triggerReveal();
        }
    }, [pathname, prevPath, isTransitioning, shouldReveal, direction]);

    const handleAnimationComplete = (layer: 'accent' | 'theme') => {
        // We only care about the Theme layer (Primary) finishing the full sequence?
        // Actually, we need to check if we are DONE Revealing.
    };

    // Stagger Delays
    // Enter: Accent (0s) -> Theme (0.1s)
    // Exit: Theme (0s) -> Accent (0.1s) [Reverse order, so Theme lifts first? No, we want Theme to stay longer?]
    // Wait.
    // ENTERING (Covering):
    // 1. Accent covers screen.
    // 2. Theme covers screen (on top of Accent).
    // Result: Screen is Theme colored.
    //
    // EXITING (Revealing):
    // 1. Theme slides away (revealing Accent?).
    // 2. Accent slides away (revealing Page).
    // Result: Smooth transition.

    // Define cubic-bezier as a specific tuple to satisfy Framer Motion types
    const easeCurve: [number, number, number, number] = [0.76, 0, 0.24, 1];
    const baseTransition = { duration: isSnapping ? 0 : 0.8, ease: easeCurve };

    // ACCENT LAYER VARIANTS
    const accentVariants = {
        HIDDEN_BOTTOM: { y: "105%", transition: { ...baseTransition, delay: shutterState === 'HIDDEN_BOTTOM' ? 0.3 : 0 } }, // Exit Delay (Last out)
        COVERING: { y: "0%", transition: { ...baseTransition, delay: 0 } }, // Enter Immediate
        HIDDEN_TOP: { y: "-105%", transition: { ...baseTransition, delay: shutterState === 'HIDDEN_TOP' ? 0.3 : 0 } } // Exit Delay (Last out)
    };

    // THEME LAYER VARIANTS
    const themeVariants = {
        HIDDEN_BOTTOM: { y: "105%", transition: { ...baseTransition, delay: shutterState === 'HIDDEN_BOTTOM' ? 0 : 0.3 } }, // Exit Immediate
        COVERING: { y: "0%", transition: { ...baseTransition, delay: 0.5 } }, // Enter Delay (0.3s later)
        HIDDEN_TOP: { y: "-105%", transition: { ...baseTransition, delay: shutterState === 'HIDDEN_TOP' ? 0 : 0.3 } } // Exit Immediate
    };

    return (
        <>
            {/* LAYER 1: ACCENT (Bottom Layer, Finishes Second on Reveal) */}
            <motion.div
                initial="HIDDEN_BOTTOM"
                animate={shutterState}
                variants={accentVariants}
                className="fixed inset-0 z-[100] pointer-events-none"
                style={{ backgroundColor: ACCENT_COLOR }}
                onAnimationComplete={() => {
                    // This layer (Accent) finishes LAST when Revealing (Exiting).
                    // So we attach the cleanup logic here.

                    // Case 1: Finished WIPE UP (at HIDDEN_TOP)
                    if (shutterState === 'HIDDEN_TOP' && direction === 'up') {
                        endTransition();
                        // Snap back to bottom for readiness
                        setIsSnapping(true);
                        setShutterState('HIDDEN_BOTTOM');
                        requestAnimationFrame(() => setIsSnapping(false));
                    }

                    // Case 2: Finished WIPE DOWN (at HIDDEN_BOTTOM)
                    if (shutterState === 'HIDDEN_BOTTOM' && direction === 'down') {
                        endTransition();
                    }
                }}
            />

            {/* LAYER 2: THEME (Top Layer, Finishes First on Reveal) */}
            <motion.div
                initial="HIDDEN_BOTTOM"
                animate={shutterState}
                variants={themeVariants}
                className="fixed inset-0 z-[101] pointer-events-none"
                style={{ backgroundColor: THEME_COLOR }}
            />
        </>
    );
}
