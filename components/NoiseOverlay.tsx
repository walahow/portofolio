'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

export default function NoiseOverlay() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div
            className="fixed inset-0 z-[60] pointer-events-none overflow-hidden select-none"
            aria-hidden="true"
        >
            <div
                className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-[0.05] animate-noise pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />
        </div>
    );
}
