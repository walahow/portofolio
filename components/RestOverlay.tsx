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
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050505]/95 backdrop-blur-md text-[#Eaeaea] font-mono select-none"
                >
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                        <h1 className="text-4xl md:text-6xl font-bold text-red-500 tracking-widest text-center">
                            [ SYSTEM OVERHEATED ]
                        </h1>
                        <p className="text-sm md:text-base opacity-70 tracking-[0.2em] text-center">
                            THERMAL LIMIT REACHED. COOLING DOWN...
                        </p>
                    </div>

                    <div className="mt-12 h-16 flex items-center justify-center">
                        {canReboot ? (
                            <button
                                onClick={handleReboot}
                                className="px-8 py-3 border border-[#Eaeaea]/20 hover:bg-[#Eaeaea] hover:text-[#050505] transition-all duration-300 text-sm tracking-widest uppercase cursor-pointer pointer-events-auto"
                            >
                                [ CONTINUE ]
                            </button>
                        ) : (
                            <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
