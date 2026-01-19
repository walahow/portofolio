'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTransitionStore } from '@/store/useTransitionStore';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ShutterOverlay() {
    const { isTransitioning, endTransition, shouldReveal, direction } = useTransitionStore();
    const pathname = usePathname();
    const [prevPath, setPrevPath] = useState(pathname);

    // Animation Variants
    // Hidden (Default): y: "100%" (Below screen)
    // Covering (Transitioning): y: "0%" (On screen)
    // Exiting (Revealing): y: "-100%" (Above screen)

    // We use a local state to control the "phase" because the store just says "isTransitioning".
    // Actually, we can just react to state changes.

    // Logic:
    // 1. Store becomes true -> Animate from 100% to 0%.
    // 2. Pathname changes -> Animate from 0% to -100%.

    // Let's use a simple motion div that we animate controls for.
    // Or simpler: specific states.

    const [shutterState, setShutterState] = useState<'HIDDEN_BOTTOM' | 'COVERING' | 'HIDDEN_TOP'>('HIDDEN_BOTTOM');

    // Flag to force instant positioning (snap)
    const [isSnapping, setIsSnapping] = useState(false);

    useEffect(() => {
        if (isTransitioning) {
            if (direction === 'down') {
                // WIPE DOWN: Start from Top -> Cover Center
                // We are likely resting at HIDDEN_BOTTOM. Snap to HIDDEN_TOP first.
                setIsSnapping(true);
                setShutterState('HIDDEN_TOP');

                // Allow render frame to snap, then animate to COVERING
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setIsSnapping(false);
                        setShutterState('COVERING');
                    });
                });
            } else {
                // WIPE UP (Default): Start from Bottom -> Cover Center
                // We are resting at HIDDEN_BOTTOM. Just animate.
                setShutterState('COVERING');
            }
        }
    }, [isTransitioning, direction]);

    useEffect(() => {
        if (pathname !== prevPath) {
            setPrevPath(pathname);
            // If we were covering, now trigger reveal
            if (isTransitioning) {
                // The navigation happened. Now we lift/drop the shutter.
                setTimeout(() => {
                    if (direction === 'down') {
                        // WIPE DOWN Reveal: Center -> Bottom
                        setShutterState('HIDDEN_BOTTOM');
                    } else {
                        // WIPE UP Reveal: Center -> Top
                        setShutterState('HIDDEN_TOP');
                    }
                }, 100);
            }
        }
        // Also react to manual triggers
        if (shouldReveal && isTransitioning) {
            setTimeout(() => {
                if (direction === 'down') {
                    setShutterState('HIDDEN_BOTTOM');
                } else {
                    setShutterState('HIDDEN_TOP');
                }
            }, 100);
        }
    }, [pathname, prevPath, isTransitioning, shouldReveal, direction]);

    // Cleanup: When animation to HIDDEN_TOP completes, reset to HIDDEN_BOTTOM and updates store
    const handleAnimationComplete = () => {
        if (shutterState === 'HIDDEN_TOP') {
            endTransition();
            setShutterState('HIDDEN_BOTTOM');
        }
    };

    const variants = {
        HIDDEN_BOTTOM: { y: "105%", transition: { duration: isSnapping ? 0 : 0.8, ease: [0.76, 0, 0.24, 1] as const } },
        COVERING: { y: "0%", transition: { duration: isSnapping ? 0 : 0.8, ease: [0.76, 0, 0.24, 1] as const } },
        HIDDEN_TOP: { y: "-105%", transition: { duration: isSnapping ? 0 : 0.8, ease: [0.76, 0, 0.24, 1] as const } }
    };

    return (
        <motion.div
            initial="HIDDEN_BOTTOM"
            animate={shutterState}
            variants={variants}
            onAnimationComplete={() => {
                // Only trigger cleanup logic if we finished the reveal 
                // If we ended at HIDDEN_TOP (Wipe Up), we need to reset to bottom eventually?
                // actually, for the next transition (which might be Down), we snap to Top anyway.
                // But for next transition (Up), we need to be at Bottom.

                // Case 1: Finished WIPE UP (at HIDDEN_TOP)
                if (shutterState === 'HIDDEN_TOP' && direction === 'up') {
                    endTransition();
                    // Snap back to bottom for readiness
                    setIsSnapping(true);
                    setShutterState('HIDDEN_BOTTOM');
                    // Reset snap flag next tick
                    requestAnimationFrame(() => setIsSnapping(false));
                }

                // Case 2: Finished WIPE DOWN (at HIDDEN_BOTTOM)
                if (shutterState === 'HIDDEN_BOTTOM' && direction === 'down') {
                    endTransition();
                    // Already at bottom, no snap needed.
                }
            }}
            className="fixed inset-0 z-[100] bg-[#080808] pointer-events-none" // High Z-Index, slightly lighter black for visibility
        />
    );
}
