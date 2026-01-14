'use client';

import { useEffect, useState, useRef } from 'react';
import { usePerformanceStore } from '@/store/usePerformanceStore';

export default function DebugStats() {
    const { enableBlur, enableNoise, enableAnimations, toggleBlur, toggleNoise, toggleAnimations } = usePerformanceStore();
    const [fps, setFps] = useState(0);
    const framesRef = useRef(0);
    const lastTimeRef = useRef(performance.now());
    const [isVisible, setIsVisible] = useState(true);

    // Apply classes/attributes to body for global CSS control
    useEffect(() => {
        document.body.setAttribute('data-perf-blur', enableBlur ? 'on' : 'off');
        document.body.setAttribute('data-perf-noise', enableNoise ? 'on' : 'off');
        document.body.setAttribute('data-perf-anims', enableAnimations ? 'on' : 'off');
    }, [enableBlur, enableNoise, enableAnimations]);

    useEffect(() => {
        let rafId: number;

        const loop = (time: number) => {
            framesRef.current++;
            if (time - lastTimeRef.current >= 1000) {
                setFps(framesRef.current);
                framesRef.current = 0;
                lastTimeRef.current = time;
            }
            rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(rafId);
    }, []);

    if (!isVisible) return (
        <button
            onClick={() => setIsVisible(true)}
            className="fixed bottom-4 left-4 z-[9999] bg-red-600 text-white text-xs px-2 py-1 uppercase font-mono"
        >
            Show Debug
        </button>
    );

    const getFpsColor = (fps: number) => {
        if (fps >= 55) return 'text-green-500';
        if (fps >= 30) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="fixed bottom-4 left-4 z-[9999] bg-black/90 border border-white/20 p-4 font-mono text-xs text-white w-64">
            <div className="flex justify-between items-center mb-4">
                <span className="opacity-50 tracking-widest">DIAGNOSTICS</span>
                <button onClick={() => setIsVisible(false)} className="text-red-500">[X]</button>
            </div>

            <div className={`text-4xl font-bold mb-4 ${getFpsColor(fps)}`}>
                {fps} <span className="text-sm font-normal text-gray-500">FPS</span>
            </div>

            <div className="space-y-2">
                <ToggleRow label="Blur Effects" active={enableBlur} onClick={toggleBlur} />
                <ToggleRow label="Noise Overlay" active={enableNoise} onClick={toggleNoise} />
                <ToggleRow label="Heavy Anims" active={enableAnimations} onClick={toggleAnimations} />
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 text-[10px] text-gray-500">
                Turn off effects to identify lag source.
            </div>
        </div>
    );
}

function ToggleRow({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <div className="flex justify-between items-center">
            <span>{label}</span>
            <button
                onClick={onClick}
                className={`px-2 py-0.5 border ${active
                    ? 'bg-green-900/50 border-green-500 text-green-500'
                    : 'bg-red-900/50 border-red-500 text-red-500'
                    }`}
            >
                {active ? 'ON' : 'OFF'}
            </button>
        </div>
    );
}
