'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTimerStore } from '@/store/useTimerStore';

export default function RestPage() {
    const router = useRouter();
    const { reset, setOverheated } = useTimerStore();
    const [canReboot, setCanReboot] = useState(false);

    useEffect(() => {
        // Lock system immediately
        setOverheated(true);

        // 5 second cooldown
        const timer = setTimeout(() => {
            setCanReboot(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, [setOverheated]);

    const handleReboot = () => {
        reset(); // Reset time and overheat status
        router.push('/');
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen w-full bg-[#050505] text-[#Eaeaea] font-mono select-none">
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
                        className="px-8 py-3 border border-[#Eaeaea]/20 hover:bg-[#Eaeaea] hover:text-[#050505] transition-all duration-300 text-sm tracking-widest uppercase"
                    >
                        [ REBOOT SYSTEM ]
                    </button>
                ) : (
                    <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                )}
            </div>
        </div>
    );
}
