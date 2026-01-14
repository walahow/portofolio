'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PROJECTS } from '@/data/projects';

interface PreloaderProps {
    onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const imageList: string[] = [];

        // Collect all image URLs from PROJECTS
        PROJECTS.forEach((project) => {
            if (project.thumbnail) imageList.push(project.thumbnail);
            if (project.gallery && project.gallery.length > 0) {
                imageList.push(...project.gallery);
            }
        });

        // Add HeroGate image as well for safety
        imageList.push('/img/HeroGate.avif');

        // Deduplicate
        const uniqueImages = Array.from(new Set(imageList));
        let loadedCount = 0;

        const incrementProgress = () => {
            loadedCount++;
            const pct = Math.floor((loadedCount / uniqueImages.length) * 100);
            setProgress(pct);

            if (loadedCount === uniqueImages.length) {
                // All loaded
                setTimeout(() => {
                    onComplete();
                }, 500); // Small buffer at 100%
            }
        };

        if (uniqueImages.length === 0) {
            onComplete();
            return;
        }

        uniqueImages.forEach((src) => {
            const img = new Image();
            img.src = src;
            img.onload = incrementProgress;
            img.onerror = incrementProgress; // Count errors as loaded to prevent stuck
        });

    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] text-white"
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
            <div className="font-mono text-6xl md:text-8xl font-bold tracking-tighter">
                {progress}%
            </div>
            <div className="mt-4 font-mono text-xs text-gray-500 tracking-widest uppercase">
                System Booting...
            </div>

            {/* Simple Loading Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full">
                <motion.div
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                />
            </div>
        </motion.div>
    );
}
