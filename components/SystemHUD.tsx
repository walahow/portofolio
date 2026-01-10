'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTimerStore } from '@/store/useTimerStore';
import clsx from 'clsx';

export default function SystemHUD() {
    const pathname = usePathname();
    const router = useRouter();
    const { uptime, tick, isSystemActive, setOverheated } = useTimerStore();

    // Thermal Limit (Seconds)
    const MAX_UPTIME = 180;

    // Formatting MM:SS
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    useEffect(() => {
        if (pathname === '/rest') return;

        // ONLY tick if we are on the ProjectGallery (Home Page) AND System is Active (Gate Passed)
        // User Requirement: "this shing only applied on ProjectGallery page... user switch page... current time will stop"
        // Also assuming ProjectGallery is on '/'
        const shouldTick = pathname === '/' && isSystemActive;

        if (!shouldTick) return;

        // Thermal Check
        if (uptime >= MAX_UPTIME) {
            setOverheated(true);
            return;
        }

        const interval = setInterval(() => {
            tick();
        }, 1000);

        return () => clearInterval(interval);
    }, [pathname, isSystemActive, uptime, tick, router, setOverheated]);

    // Strictly appear ONLY on Home ('/') and when System is Active
    if (pathname !== '/' || !isSystemActive) return null;

    return (
        <div className="fixed top-8 right-8 z-[100] font-mono pointer-events-none mix-blend-difference text-white">
            <div className={clsx(
                "text-xs tracking-widest transition-colors duration-300",
                uptime > MAX_UPTIME - 10 ? "text-red-500 animate-pulse" : "" // Warn when near limit
            )}>
                UPTIME: {formatTime(uptime)}
            </div>
        </div>
    );
}
