'use client';

import { useThemeStore } from '@/store/useThemeStore';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ThemeSwitcher() {
    const { theme, toggleTheme } = useThemeStore();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
        // Initialize theme from store on mount
        document.documentElement.setAttribute('data-theme', useThemeStore.getState().theme);
    }, []);

    if (!mounted) return null;

    return (
        <motion.button
            onClick={toggleTheme}
            className="fixed bottom-8 left-8 z-[9999] flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-black/20 backdrop-blur-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <span className="sr-only">Toggle Theme</span>
            {theme === 'dark' ? (
                // Sun Icon for Dark Mode (to switch to light)
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
            ) : (
                // Moon Icon for Light Mode (to switch to dark)
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            )}
        </motion.button>
    );
}
