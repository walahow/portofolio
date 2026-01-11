'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTimerStore } from '@/store/useTimerStore';
import clsx from 'clsx';
import { useLenis } from './SmoothScroll';
import { motion } from 'framer-motion';

export default function SystemHUD() {
    const pathname = usePathname();
    const router = useRouter();
    const { uptime, tick, isSystemActive, setOverheated } = useTimerStore();
    const { lenis } = useLenis();

    const [speed, setSpeed] = useState(0);
    const [rotation, setRotation] = useState(0);

    // Thermal Limit (Seconds)
    const MAX_UPTIME = 180;
    const MAX_SPEED = 15; // Arbitrary max speed for gauge scaling

    // Formatting MM:SS
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Lenis Scroll Listener
    useEffect(() => {
        if (!lenis) return;

        const onScroll = ({ velocity }: { velocity: number }) => {
            const absVelocity = Math.abs(velocity);
            setSpeed(absVelocity);
            setRotation((prev) => prev + velocity * 2); // Accumulate rotation
        };

        lenis.on('scroll', onScroll);

        return () => {
            lenis.off('scroll', onScroll);
        };
    }, [lenis]);

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

    // Calculate dynamic bar height percent
    const barHeightPercent = Math.min((speed / MAX_SPEED) * 100, 100);

    // Determine Bar Color based on speed
    const getBarColor = () => {
        if (barHeightPercent > 80) return "bg-red-500 box-shadow-red";
        if (barHeightPercent > 40) return "bg-yellow-500";
        return "bg-white";
    };

    return (
        <div className="fixed z-[100] font-mono pointer-events-none mix-blend-difference text-white">
            {/* Original Top Right HUD - Timer */}
            <div className="fixed top-8 right-8">
                <div className={clsx(
                    "text-xs tracking-widest transition-colors duration-300",
                    uptime > MAX_UPTIME - 10 ? "text-red-500 animate-pulse" : "" // Warn when near limit
                )}>
                    UPTIME: {formatTime(uptime)}
                </div>
            </div>

            {/* Bottom Right HUD - RPM Gauge */}
            <div className="fixed bottom-8 right-8 flex flex-col items-center gap-3">
                {/* 1. Vertical Velocity Bar */}
                <div className="h-24 w-1.5 bg-white/15 relative overflow-hidden flex items-end">
                    <motion.div
                        className={clsx("w-full transition-colors duration-100", getBarColor())}
                        animate={{ height: `${barHeightPercent}%` }}
                        transition={{ duration: 0.05, ease: "linear" }}
                    />
                </div>

                {/* 2. Rotating Gear Mechanism */}
                <motion.div
                    animate={{ rotate: rotation }}
                    transition={{ type: "spring", stiffness: 50, damping: 10, mass: 0.5 }}
                >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-80">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </motion.div>
            </div>
        </div>
    );
}
