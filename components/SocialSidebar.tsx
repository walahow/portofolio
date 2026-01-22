'use client';

import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// --- DATA STRUCTURE (Persona Lore) ---
const socialData = [
    {
        id: "gh",
        short: "GH",
        platform: "GITHUB",
        arcana: "IX. HERMIT",
        url: "https://github.com/walahow",
        themeColor: "#22c55e" // Matrix Green
    },
    {
        id: "li",
        short: "LI",
        platform: "LINKEDIN",
        arcana: "IV. EMPEROR",
        url: "https://www.linkedin.com/in/attazul/",
        themeColor: "#3b82f6" // Professional Blue
    },
    {
        id: "ig",
        short: "IG",
        platform: "INSTAGRAM",
        arcana: "XVII. STAR",
        url: "https://www.instagram.com/walawalaho_?igsh=emFlOWd1ZWxndWl3make ",
        themeColor: "#e11d48" // Aesthetic Red/Pink
    }
];

export default function SocialSidebar() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.5 }}
            className="fixed left-0 top-4 md:left-6 md:top-16 z-50 flex flex-col items-center gap-2 select-none origin-top-left scale-[0.6] md:scale-100 p-2 md:p-0"
        >
            {/* DECORATIVE LINE TOP */}
            <span className="[writing-mode:vertical-rl] text-[14px] font-[var(--font-playfair)] tracking-[0.2em] text-white/80 hover:text-white transition-colors duration-300 cursor-default">
                [ SOCIAL \\
            </span>
            <div className="w-[1px] h-12 bg-white/15" />


            {/* ACCORDION CONTAINER */}
            <LayoutGroup>
                <motion.div
                    className="flex flex-col gap-2 pointer-events-auto"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.5 }}
                >
                    {socialData.map((item) => (
                        <SocialItem
                            key={item.id}
                            item={item}
                            isHovered={hoveredId === item.id}
                            setHovered={setHoveredId}
                            isAnyHovered={hoveredId !== null}
                        />
                    ))}
                </motion.div>
            </LayoutGroup>

            {/* DECORATIVE LINE BOTTOM */}
            <div className="w-[1px] h-12 bg-white/15" />
            <span className="[writing-mode:vertical-rl] text-[14px] font-[var(--font-playfair)] tracking-[0.2em] text-white/80 hover:text-white transition-colors duration-300 cursor-default">
                // LINKS ]
            </span>
        </motion.div>
    );
}

function SocialItem({ item, isHovered, setHovered, isAnyHovered }: {
    item: typeof socialData[0],
    isHovered: boolean,
    setHovered: (id: string | null) => void,
    isAnyHovered: boolean
}) {
    return (
        <motion.a
            layout
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
                const isMobile = window.innerWidth < 768; // Mobile Breakpoint
                if (isMobile && !isHovered) {
                    e.preventDefault();
                    setHovered(item.id);
                }
            }}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            className="relative flex flex-col items-center justify-end overflow-hidden border border-white/20 bg-[hsl(0,0%,10%)] backdrop-blur-sm cursor-pointer transition-colors duration-300"
            style={{
                borderColor: isHovered ? item.themeColor : 'rgba(255,255,255,0.2)',
                boxShadow: isHovered ? `0 0 15px -5px ${item.themeColor}` : 'none'
            }}
            initial={{ height: 48, width: 48 }}
            animate={{
                height: isHovered ? 140 : 48, // Expand vertically
                width: 48, // Keep width fixed
                opacity: isAnyHovered && !isHovered ? 0.5 : 1 // Dim others
            }}
            transition={{ type: "spring", stiffness: 300, damping: 40 }}
        >
            {/* --- HOVER CONTENT (EXPANDED) --- */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                        className="absolute top-4 left-0 w-full flex flex-col items-center gap-1 p-1"
                    >
                        {/* ARCANA LABEL */}
                        <span
                            className="text-[0.5rem] font-bold tracking-widest text-center leading-tight"
                            style={{ color: item.themeColor }}
                        >
                            {item.arcana.split(' ').map((line, i) => (
                                <span key={i} className="block">{line}</span>
                            ))}
                        </span>

                        {/* DECORATIVE DOT */}
                        <div className="w-1 h-1 rounded-full mt-1" style={{ backgroundColor: item.themeColor }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- DEFAULT CONTENT (ICON/TEXT) --- */}
            {/* Use layout to push this down as height increases, or keep it bottom anchored */}
            <motion.div
                layout="position"
                className="w-full h-12 flex items-center justify-center shrink-0"
            >
                <motion.span
                    className="font-[var(--font-playfair)] text-xs font-bold tracking-wider"
                    animate={{
                        color: isHovered ? item.themeColor : '#ffffff',
                        scale: isHovered ? 1.2 : 1
                    }}
                >
                    {item.short}
                </motion.span>
            </motion.div>

            {/* VERTICAL WRITING MODE TEXT (For expanded state, maybe?) 
                Actually, simpler to standard flex items since it's only 140px tall. 
                Focus on clean minimal info.
            */}
        </motion.a>
    );
}
