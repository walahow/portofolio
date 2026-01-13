'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useLenis } from './SmoothScroll';

export default function ScrollReset() {
    const pathname = usePathname();
    const { lenis } = useLenis();

    useEffect(() => {
        // SENIOR FIX: Disable native browser scroll restoration.
        // We handle scroll position manually to ensure "start at top" behavior.
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        // Immediate native reset
        window.scrollTo(0, 0);

        // Lenis reset if active
        if (lenis) {
            lenis.scrollTo(0, { immediate: true });
        }
    }, [pathname, lenis]);

    return null;
}
