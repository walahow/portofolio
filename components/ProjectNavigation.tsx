'use client';

import Link from 'next/link';
import { useCursorStore } from '@/store/useCursorStore';

export default function ProjectNavigation() {
    const { setIsHovered, setCursorText, setCursorVariant } = useCursorStore();

    return (
        <nav className="fixed top-8 left-8 z-40 mix-blend-difference">
            <Link
                href="/"
                className="text-white font-mono text-sm uppercase tracking-widest hover:opacity-50 transition-opacity"
                onMouseEnter={() => {
                    setIsHovered(true);
                    setCursorText("BACK");
                    setCursorVariant('click');
                }}
                onMouseLeave={() => {
                    setIsHovered(false);
                    setCursorText("");
                    setCursorVariant('default');
                }}
            >
                ← Back
            </Link>
        </nav>
    );
}
