'use client';

import { useEffect, useState } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { AnimatePresence, motion } from 'framer-motion';

export default function RestOverlay() {
    const { isOverheated, reset } = useTimerStore();
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

    return (
        <AnimatePresence>
            {isOverheated && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
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

                    {/* 3. COOLDOWN / ACTION */}
                    <div className="h-16 flex items-center justify-center">
                        {canReboot ? (
                            <button
                                onClick={handleReboot}
                                className="group relative px-6 py-2 bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-500 backdrop-blur-sm active:scale-95"
                            >
                                <span className="text-xs md:text-sm text-neutral-400 font-light tracking-[0.2em] group-hover:text-white group-hover:tracking-[0.25em] transition-all duration-500">
                                    RESUME
                                </span>
                            </button>
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
