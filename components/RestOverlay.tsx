'use client';

import { useEffect, useState } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { useCursorStore } from '@/store/useCursorStore';
import { AnimatePresence, motion } from 'framer-motion';

export default function RestOverlay() {
    const { isOverheated, reset } = useTimerStore();
    const { setCursorText, setCursorVariant } = useCursorStore();
    const [canReboot, setCanReboot] = useState(false);

    useEffect(() => {
        if (isOverheated) {
            setCanReboot(false);
            const timer = setTimeout(() => {
                setCanReboot(true);
            }, 5000); // 5s cooldown
            return () => clearTimeout(timer);
        }
    }, [isOverheated]);

    const handleReboot = () => {
        reset(); // Resets uptime to 0 and isOverheated to false
    };

    // Variants (Vertical Shutter)
    const overlayVariants = {
        hidden: { y: "100%" },
        visible: {
            y: "0%",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const }
        },
        exit: {
            y: "100%",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const }
        }
    };

    return (
        <AnimatePresence>
            {isOverheated && (
                <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={overlayVariants}
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-md text-[#Eaeaea] font-mono select-none px-4"
                >
                    {/* 1. TEXT */}
                    <div className="flex flex-col items-center gap-2 mb-8 animate-pulse">
                        <h1 className="text-2xl md:text-3xl font-medium text-neutral-200 tracking-wider text-center">
                            Take a quick break.
                        </h1>
                    </div>

                    {/* 2. FOCAL GIF */}
                    <div className="relative w-full max-w-md aspect-[4/3] mb-12 rounded-lg overflow-hidden shadow-2xl shadow-white/5 grayscale hover:grayscale-0 transition-grayscale duration-700">
                        <img
                            src="/img/rest-mode.gif"
                            alt="Rest Mode"
                            className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
                        />
                    </div>

                    {/* 3. COOLDOWN / ACTION BUTTON */}
                    <div className="h-32 flex items-center justify-center">
                        {canReboot ? (
                            <div
                                onClick={handleReboot}
                                onMouseEnter={() => {
                                    setCursorText("CLICK");
                                    setCursorVariant('click');
                                }}
                                onMouseLeave={() => {
                                    setCursorText("");
                                    setCursorVariant('default');
                                }}
                                className="relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32 cursor-none group hover:scale-110 transition-transform duration-500"
                            >
                                {/* CENTER TEXT */}
                                <div className="absolute z-10 font-mono text-sm font-bold tracking-widest text-white">
                                    BACK
                                </div>

                                {/* OUTER RING */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute w-full h-full flex items-center justify-center"
                                >
                                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 overflow-visible text-white">
                                        <path id="restTextPath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                                        <text className="text-[14px] uppercase font-mono tracking-[2px]" fill="currentColor">
                                            <textPath href="#restTextPath" startOffset="0%">
                                                REBOOT || SYSTEM || REBOOT || SYSTEM
                                            </textPath>
                                        </text>
                                    </svg>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-5 h-5 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
                                <span className="text-xs text-neutral-500 tracking-widest">
                                    cooling down...
                                </span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
