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
        const assetsToLoad: string[] = [];

        // 1. Collect all asset URLs
        PROJECTS.forEach((project) => {
            if (project.thumbnail) assetsToLoad.push(project.thumbnail);

            // Handle project.video
            if (project.video) {
                if (typeof project.video === 'string') {
                    assetsToLoad.push(project.video);
                } else {
                    assetsToLoad.push(project.video.src);
                }
            }

            // Handle project.gallery
            if (project.gallery && project.gallery.length > 0) {
                project.gallery.forEach(item => {
                    if (typeof item === 'string') {
                        assetsToLoad.push(item);
                    } else {
                        assetsToLoad.push(item.src);
                    }
                });
            }
        });

        // Add static assets
        assetsToLoad.push('/img/HeroGate.avif');

        // Deduplicate
        const uniqueAssets = Array.from(new Set(assetsToLoad));

        if (uniqueAssets.length === 0) {
            onComplete();
            return;
        }

        let loadedCount = 0;
        const total = uniqueAssets.length;

        const incrementProgress = () => {
            loadedCount++;
            const pct = Math.floor((loadedCount / total) * 100);
            setProgress(pct);

            if (loadedCount === total) {
                setTimeout(() => {
                    onComplete();
                }, 500);
            }
        };

        // 2. Load Function
        const loadAsset = (src: string) => {
            const isVideo = src.endsWith('.mp4') || src.endsWith('.webm');

            if (isVideo) {
                // Preload video by fetching the blob
                // This ensures it's in the browser disk cache
                fetch(src)
                    .then(() => incrementProgress())
                    .catch(() => incrementProgress()); // Proceed even on error
            } else {
                // Preload image
                const img = new Image();
                img.src = src;
                img.onload = incrementProgress;
                img.onerror = incrementProgress;
            }
        };

        // 3. Trigger Load
        uniqueAssets.forEach(src => loadAsset(src));

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
