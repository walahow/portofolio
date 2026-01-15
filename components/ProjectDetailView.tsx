'use client';

import { Project } from '@/data/projects';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLenis } from '@/components/SmoothScroll'; // Import useLenis
import { useTransitionStore } from '@/store/useTransitionStore'; // Import Transition Store
import PersonaRevealSidebar from './PersonaRevealSidebar';

interface ProjectDetailViewProps {
    project: Project;
    nextProject: Project;
}

export default function ProjectDetailView({ project, nextProject }: ProjectDetailViewProps) {
    const containerRef = useRef(null);
    const { scrollY } = useScroll();
    const router = useRouter();

    // Global Smooth Scroll Control
    const { lenis } = useLenis();
    const { startTransition } = useTransitionStore();

    // Curtain Animation
    // ... (rest of animations) ...

    // Curtain Animation
    // Map scroll 0 -> 200px (increased sensitivity) to animation values
    // Width: 117.65% -> 100% (Starts by covering the 15% sidebar relative to current 85% container)
    // MarginLeft: -17.65% -> 0% (Starts shifted left to cover sidebar)
    // Height: 100vh -> 70vh (Shrinks vertically too)
    // MarginTop: 0vh -> 15vh (Pushes top down to create centered shrink effect)
    const width = useTransform(scrollY, [0, 200], ['117.65%', '100%']);
    const marginLeft = useTransform(scrollY, [0, 200], ['-17.65%', '0%']);
    const height = useTransform(scrollY, [0, 200], ['100vh', '140vh']);
    const marginTop = useTransform(scrollY, [0, 200], ['0vh', '-20vh']);
    const y = useTransform(scrollY, [0, 200], [0, 200]);

    // Description Animation - Start AFTER image settles (200px)
    const descOpacity = useTransform(scrollY, [200, 500], [0, 1]);
    const descY = useTransform(scrollY, [200, 500], [100, -100]);

    // --- DEEP SCROLL LOGIC ---
    const footerRef = useRef(null);
    const [canNavigate, setCanNavigate] = useState(false); // Safety Warmup
    const [isNavigating, setIsNavigating] = useState(false); // Transition Lock
    const isNavigatingRef = useRef(false); // Ref for cleanup access

    const { scrollYProgress } = useScroll({
        target: footerRef,
        offset: ["start end", "end end"]
    });

    // Warmup Timer & Scroll Reset
    useEffect(() => {
        // 1. KILL MOMENTUM: Stop the scroll engine immediately
        // This prevents any "fling" velocity from the previous page from carrying over
        if (lenis) lenis.stop();

        // 2. IMMEDIATE RESET
        window.scrollTo(0, 0);
        if (lenis) {
            lenis.scrollTo(0, { immediate: true, force: true });
        }

        // 3. RESUME AFTER SETTLING
        // We wait a tiny bit to ensure the browser has painted the "top" state
        const resumeTimer = setTimeout(() => {
            // Double check position before unlocking
            window.scrollTo(0, 0);
            if (lenis) {
                lenis.scrollTo(0, { immediate: true, force: true });
                lenis.start();
            }
        }, 100);

        // 4. Enable Navigation after delay
        const navTimer = setTimeout(() => setCanNavigate(true), 1500); // Increased safety to 1.5s

        return () => {
            clearTimeout(resumeTimer);
            clearTimeout(navTimer);

            // Cleanup CSS Lock
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';

            // IMPORTANT: Only restart Lenis if we are NOT navigating away.
            // If we ARE navigating, we want to keep it stopped so the new page loads static.
            if (lenis && !isNavigatingRef.current) {
                lenis.start();
            }
        };
    }, [lenis]); // Re-run if lenis becomes available

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        // Trigger ONLY if:
        // 1. Scrolled to bottom (>= 0.99)
        // 2. Warmup is complete (canNavigate)
        // 3. Not already transitioning (!isNavigating)
        if (latest >= 0.99 && canNavigate && !isNavigating) {
            setIsNavigating(true); // Lock it
            isNavigatingRef.current = true; // Signal cleanup to stay quiet

            // KILL MOMENTUM IMMEDIATELY
            // Brake the scroll engine so no velocity carries over
            if (lenis) lenis.stop();

            // CSS LOCK: Prevent native scroll entirely
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';

            startTransition();     // Trigger Shutter

            // Wait for shutter to close (800ms) before changing page
            setTimeout(() => {
                router.push(`/project/${nextProject.slug}`);
            }, 800);
        }
    });

    return (
        <main className="min-h-screen bg-[#050505] w-full relative">

            {/* --- LEFT COLUMN (FIXED SIDEBAR) --- */}
            <aside className="fixed top-0 left-0 w-[15%] h-screen z-0 border-r border-white/5 flex flex-col items-center justify-center">
                <PersonaRevealSidebar arcana={project.arcana} />
            </aside>


            {/* --- RIGHT COLUMN (SCROLLABLE CONTENT) --- */}
            <div ref={containerRef} className="relative ml-[15%] w-[85%] z-10 bg-[#050505]">

                {/* 1. HERO CURTAIN (Merged Container) */}
                <motion.div
                    style={{
                        width,
                        marginLeft,
                        height,
                        marginTop,
                        y
                    }}
                    className="relative w-full overflow-visible mb-24 z-40 flex flex-col bg-[#050505] py-[35vh]"
                >
                    {/* Title Overlay - Overlapping border */}
                    <div className="absolute top-[24vh] right-8 z-50 mix-blend-difference pointer-events-none">
                        <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-white">
                            {project.title}
                        </h1>
                        <div className="flex gap-4 mt-4 font-mono text-sm text-neutral-400">
                            <span>[{project.id}]</span>
                            <span>{project.year}</span>
                        </div>
                    </div>

                    {/* Image Wrapper Container */}
                    <div className="flex-1 w-full">
                        <div className="relative w-full h-full">
                            <Image
                                src={project.thumbnail}
                                alt={project.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                </motion.div>

                {/* 2. MAIN CONTENT STACK - Overlapping Card Container */}
                <div className="relative px-4 md:px-12 w-full z-50 pointer-events-none -mt-20 md:-mt-40">
                    <motion.div
                        style={{ opacity: descOpacity, y: descY }}
                        className="mx-auto max-w-4xl bg-[#0A0A0A] text-neutral-300 p-8 md:p-24 shadow-2xl pointer-events-auto border border-white/10 backdrop-blur-sm"
                    >
                        <h2 className="text-3xl md:text-5xl font-light mb-12 tracking-tight text-white">
                            Project Overview
                        </h2>
                        <div className="text-lg md:text-xl leading-relaxed font-light text-neutral-400">
                            {project.description}
                        </div>

                        {/* Additional Metadata Block */}
                        <div className="mt-16 pt-16 border-t border-white/10 grid grid-cols-2 gap-8 font-mono text-sm uppercase tracking-widest text-neutral-500">
                            <div>
                                <span className="block text-white mb-2">Role</span>
                                {project.roles.join(', ')}
                            </div>
                            <div>
                                <span className="block text-white mb-2">Year</span>
                                {project.year}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Remainder of content (Video/Gallery) needs to be pushed down or wrapped */}
                <div className="px-12 pb-48 max-w-5xl mx-auto pt-24">

                    {/* Video (if valid, else placeholder logic) */}
                    <div className="w-full aspect-video bg-neutral-900 mb-24 overflow-hidden relative group">
                        {project.video ? (
                            <video
                                src={project.video}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-700 font-mono">
                                [ VIDEO PLACEHOLDER ]
                            </div>
                        )}
                    </div>

                    <br />
                    <br />

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-48">
                        {project.gallery.map((img, i) => {
                            // First 2 images are smaller and centered
                            const isSmall = i === 0 || i === 1;
                            return (
                                <div
                                    key={i}
                                    className={`relative bg-neutral-900 overflow-hidden ${isSmall ? 'w-full md:w-2/3 mx-auto aspect-[4/3]' : 'w-full aspect-[4/3]'}`}
                                >
                                    <Image
                                        src={img}
                                        alt={`Gallery ${i}`}
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                            );
                        })}
                    </div>

                </div>

                {/* --- DEEP SCROLL FOOTER --- */}
                <div ref={footerRef} className="relative w-full h-[80vh] flex flex-col items-center justify-center mt-32 border-t border-white/10">

                    {/* Sticky/Fixed Center Content */}
                    <div className="sticky top-0 h-full flex flex-col items-center justify-center space-y-4">
                        <span className="text-white/50 text-sm tracking-widest">NEXT PROJECT</span>
                        <h2 className="text-5xl md:text-7xl font-bold text-white text-center">
                            {nextProject.title}
                        </h2>

                        {/* THE PROGRESS BAR (Visual Feedback of "Effort") */}
                        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mt-8">
                            <motion.div
                                className="h-full bg-white"
                                style={{
                                    scaleX: scrollYProgress,
                                    transformOrigin: "left"
                                }}
                            />
                        </div>
                        <p className="text-xs text-white/30 mt-2">KEEP SCROLLING TO ENTER</p>
                    </div>

                </div>

            </div>


        </main>
    );
}
