"use client"

import { useEffect, createContext, useContext, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface LenisContextType {
    lenis: Lenis | null;
}

const LenisContext = createContext<LenisContextType>({
    lenis: null,
});
export const useLenis = () => useContext(LenisContext);

export default function SmoothScroll({
    children,
}: {
    children: React.ReactNode;
}) {
    const [lenis, setLenis] = useState<Lenis | null>(null);
    useEffect(() => {
        // Initialize Lenis on all devices
        // const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        // if (isTouch) {
        //     setLenis(null);
        //     return;
        // }

        const lenisInstance = new Lenis({
            lerp: 0.1, // Smoother damping for "soft stop" effect
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
            infinite: false,
            syncTouch: true, // Force sync touch for better control
            // smoothTouch: true, // DEPRECATED in V1, but let's check docs mentally.
            // Actually, usually CSS is enough.
            // Let's trying setting touchMultiplier to 1 to reduce fling overshoot?
        });

        // Synchronize Lenis with GSAP's ticker
        function update(time: number) {
            lenisInstance.raf(time * 1000)
        }

        gsap.ticker.add(update)

        setLenis(lenisInstance);

        return () => {
            gsap.ticker.remove(update)
            lenisInstance.destroy();
            setLenis(null);
        };
    }, []);

    return (
        <LenisContext.Provider value={{ lenis }}>
            {children}
        </LenisContext.Provider>
    )
}