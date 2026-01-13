'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTransitionStore } from '@/store/useTransitionStore';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ShutterOverlay() {
    const { isTransitioning, endTransition } = useTransitionStore();
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

    useEffect(() => {
        if (isTransitioning) {
            // Start closing
            setShutterState('COVERING');
        }
    }, [isTransitioning]);

    useEffect(() => {
        if (pathname !== prevPath) {
            setPrevPath(pathname);
            // If we were covering, now trigger reveal
            if (isTransitioning) {
                // The navigation happened. Now we lift the shutter.
                // We need a small delay perhaps to ensure render? 
                // Next.js is fast, but let's give it a frame.
                setTimeout(() => {
                    setShutterState('HIDDEN_TOP');
                }, 100);
            }
        }
    }, [pathname, prevPath, isTransitioning]);

    // Cleanup: When animation to HIDDEN_TOP completes, reset to HIDDEN_BOTTOM and updates store
    const handleAnimationComplete = () => {
        if (shutterState === 'HIDDEN_TOP') {
            endTransition();
            setShutterState('HIDDEN_BOTTOM');
        }
    };

    const variants = {
        HIDDEN_BOTTOM: { y: "105%", transition: { duration: 0 } }, // Extra 5% to be safe
        COVERING: { y: "0%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const } }, // Smooth strong ease
        HIDDEN_TOP: { y: "-105%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const } }
    };

    return (
        <motion.div
            initial="HIDDEN_BOTTOM"
            animate={shutterState}
            variants={variants}
            onAnimationComplete={() => {
                // Only trigger cleanup logic if we finished the reveal 
                if (shutterState === 'HIDDEN_TOP') {
                    // We need to snap back to bottom safely without animating across screen
                    // The variant transition: { duration: 0 } handles the snap in the next render
                    handleAnimationComplete();
                }
            }}
            className="fixed inset-0 z-[100] bg-[#080808] pointer-events-none" // High Z-Index, slightly lighter black for visibility
        />
    );
}
