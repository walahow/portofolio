'use client';
import { useRef, useEffect, useState } from 'react';

export default function SmartVideo({ src }: { src?: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsPlaying(entry.isIntersecting);
            },
            { threshold: 0.5 }
        );
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-neutral-900 border border-neutral-800 overflow-hidden"
        >
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-30'}`}>
                <span className="text-white font-mono tracking-widest">
                    {isPlaying ? 'VIDEO PLAYING' : 'VIDEO HOLD'}
                </span>
            </div>

            <div className={`absolute bottom-4 right-4 w-3 h-3 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
        </div>
    )

}