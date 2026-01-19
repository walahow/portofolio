"use client"

import { useEffect, createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";
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
    const pathname = usePathname();
    const isHome = pathname === '/';
    const [lenis, setLenis] = useState<Lenis | null>(null);

    useEffect(() => {
        // Initialize Lenis on all devices
        const lenisInstance = new Lenis({
            lerp: 0.08, // Smoother damping for "soft stop" effect
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
            infinite: isHome, // Enable infinite loop ONLY on home page
            syncTouch: true, // Force sync touch for better control
            // @ts-ignore - 'overscroll' might not be in the types but usually respected or handled by infinite
            overscroll: !isHome, // Disable overscroll damping on home (since it's infinite)
            touchMultiplier: isHome ? 0.8 : 1, // Reduced sensitivity (was 1.5 : 2)
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
    }, [isHome]);

    return (
        <LenisContext.Provider value={{ lenis }}>
            {children}
        </LenisContext.Provider>
    )
}