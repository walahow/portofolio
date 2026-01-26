'use client';

import { Project } from '@/data/projects';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLenis } from '@/components/SmoothScroll'; // Import useLenis
import { useTransitionStore } from '@/store/useTransitionStore'; // Import Transition Store
import { useTimerStore } from '@/store/useTimerStore';
import { useIntroStore } from '@/store/useIntroStore';
import PersonaRevealSidebar, { PersonaParallaxText } from './PersonaRevealSidebar';
import ProjectDetailGallery from './ProjectDetailGallery';
import { useCursorStore } from '@/store/useCursorStore';

interface ProjectDetailViewProps {
    project: Project;
    nextProject: Project;
}

export default function ProjectDetailView({ project, nextProject }: ProjectDetailViewProps) {
    const containerRef = useRef(null);
    const { scrollY } = useScroll();
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);

    // Apply Theme - REMOVED GLOBAL EFFECT
    // We now apply theme directly to the <main> element below to prevent mobile chrome flickering
    // useEffect(() => {
    //     if (project.theme) {
    //         document.documentElement.setAttribute('data-theme', project.theme);
    //     } else {
    //         document.documentElement.removeAttribute('data-theme');
    // Apply Theme to Cursor Store (for Custom Cursor color)
    useEffect(() => {
        // Set the cursor theme to match project
        // Note: Project theme ('light'/'dark') implies the CONTENT theme.
        // CustomCursor will interpret this to pick a contrasting color.
        useCursorStore.getState().setTheme(project.theme || 'dark');

        return () => {
            useCursorStore.getState().setTheme(null);
        };
    }, [project.theme]);

    // Initial Screen Check for Responsive Animation
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Global Smooth Scroll Control
    const { lenis } = useLenis();
    const { startTransition } = useTransitionStore();

    // Ensure system is active (Fix for missing HUD on direct load)
    useEffect(() => {
        // We need to dynamically import stores or just assume they are available
        // But better to just use them directly if imported
        useTimerStore.getState().setSystemActive(true);
        useIntroStore.getState().setEntered(true);
    }, []);

    // Curtain Animation
    // ... (rest of animations) ...

    // Curtain Animation
    // Map scroll 0 -> 200px (increased sensitivity) to animation values

    // DESKTOP: 15% Sidebar
    // Width: 117.65% -> 100% (Starts by covering the 15% sidebar relative to current 85% container)
    // MarginLeft: -17.65% -> 0% (Starts shifted left to cover sidebar)

    // MOBILE: 20% Sidebar
    // Width: 125% -> 100% (Starts by covering the 20% sidebar relative to current 80% container)
    // MarginLeft: -25% -> 0% (Starts shifted left)

    const widthDesktop = useTransform(scrollY, [0, 200], ['calc(100% + 16rem)', 'calc(100% + 0rem)']);
    const marginLeftDesktop = useTransform(scrollY, [0, 200], ['-16rem', '0rem']);

    const widthMobile = useTransform(scrollY, [0, 200], ['calc(100% + 6rem)', 'calc(100% + 0rem)']);
    const marginLeftMobile = useTransform(scrollY, [0, 200], ['-6rem', '0rem']);

    const width = isMobile ? widthMobile : widthDesktop;
    const marginLeft = isMobile ? marginLeftMobile : marginLeftDesktop;

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

            startTransition('up', nextProject.theme, nextProject.cardImage, project.theme);     // Trigger Shutter with Image and Source Theme

            // Wait for shutter to close (1500ms) before changing page to ensure smooth transition
            setTimeout(() => {
                router.push(`/project/${nextProject.slug}`);
            }, 1500);
        }
    });

    return (
        <main
            className="min-h-screen bg-[var(--background)] w-full relative"
            data-theme={project.theme}
        >

            {/* --- 0. BACKGROUND LAYER (Parallax Text & Border) --- */}
            {/* z-0 so it sits BEHIND the z-10 content content */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Parallax Text Removed from here */}
            </div>

            {/* --- LEFT COLUMN (FIXED SIDEBAR) --- */}
            {/* z-50 to stay ON TOP of everything (Interactive Text) */}
            <aside
                className="fixed top-0 left-0 w-24 md:w-64 h-screen z-0 flex flex-col items-center justify-center transition-colors duration-500"
                style={{ backgroundColor: 'var(--sidebar-bg)' }}
            >
                {/* Move Parallax Text inside here so it sits ON TOP of the sidebar-bg but BEHIND the reveal text */}
                <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <PersonaParallaxText />
                </div>

                <div className="relative z-10">
                    {/* PersonaRevealSidebar moved to root to sit on top of curtain */}
                </div>
            </aside>


            {/* --- RIGHT COLUMN (SCROLLABLE CONTENT) --- */}
            <div ref={containerRef} className="relative ml-24 md:ml-64 w-[calc(100%-6rem)] md:w-[calc(100%-16rem)] z-10 bg-[var(--main-content-bg)] transition-colors duration-500">

                {/* 1. HERO CURTAIN (Merged Container) */}
                <motion.div
                    style={{
                        width,
                        marginLeft,
                        height,
                        marginTop,
                        y,
                        backgroundColor: 'var(--curtain-bg)'
                    }}
                    className="relative w-full overflow-visible mb-24 z-40 flex flex-col pt-[25vh] pb-0 md:py-[35vh] transition-colors duration-500"
                >
                    {/* Title Overlay - Overlapping border */}
                    <div className="absolute top-[24vh] right-8 z-50 mix-blend-difference pointer-events-none">
                        <h1
                            className="text-6xl md:text-9xl font-bold tracking-tighter text-white"
                            style={{ fontFamily: 'var(--font-playfair), serif' }}
                        >
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
                <div className="relative pl-4 pr-0 md:px-12 w-full z-50 pointer-events-none -mt-20 md:-mt-40">
                    <motion.div
                        style={{ opacity: descOpacity, y: descY }}
                        className="mx-auto max-w-4xl p-8 md:p-24 shadow-2xl pointer-events-auto backdrop-blur-sm flex flex-col items-start transition-colors duration-500"
                    >
                        {/* Applied styles via style prop to ensure variables take precedence over any tailwind conflicts */}
                        <div
                            className="absolute inset-0 z-[-1]"
                            style={{
                                backgroundColor: 'var(--card-background)',
                                border: '1px solid var(--card-border)'
                            }}
                        />
                        <div className="relative z-10 w-full">
                            <div className="mb-8 md:mb-24 text-left">
                                <h2
                                    className="text-xl md:text-5xl font-medium italic tracking-tight mb-4 font-playfair transition-colors duration-500"
                                    style={{ color: 'var(--overview-text)' }}
                                >
                                    {project.overviewHeading || project.title}
                                </h2>
                                {/* Decorative Separator Dot optional, but user liked the huge gap */}
                            </div>

                            <div
                                className="text-xs md:text-sm leading-loose text-left font-mono max-w-lg transition-colors duration-500"
                                style={{ color: 'var(--description-text)' }}
                            >
                                {project.description}
                            </div>

                            {/* Additional Metadata Block */}
                            <div className="mt-8 pt-8 md:mt-16 md:pt-16 w-full max-w-lg flex flex-col gap-8 font-mono text-xs uppercase tracking-widest text-neutral-500 text-left">
                                <div>
                                    <span className="block mb-2" style={{ color: 'var(--card-text)' }}>Role</span>
                                    <div style={{ color: 'var(--description-text)' }}>[ {project.roles.join(' + ')} ]</div>
                                </div>
                                <div>
                                    <span className="block mb-2" style={{ color: 'var(--card-text)' }}>Year</span>
                                    <div style={{ color: 'var(--description-text)' }}>[ {project.year} ]</div>
                                </div>
                            </div>
                        </div>{/* End relative z-10 */}
                    </motion.div>
                </div>

                {/* Remainder of content (Video/Gallery) -> Now Sticky Horizontal Gallery */}
                <div className="relative w-full z-10 mt-0 md:mt-0">
                    <ProjectDetailGallery project={project} />
                </div>

                {/* --- DEEP SCROLL FOOTER --- */}
                <div
                    ref={footerRef}
                    className="relative w-full h-[80vh] flex flex-col items-center justify-center mt-32 border-t transition-colors duration-500"
                    style={{ borderColor: 'var(--next-project-line)' }}
                >

                    {/* Sticky/Fixed Center Content */}
                    <div className="sticky top-0 h-full flex flex-col items-center justify-center space-y-4">
                        <span className="text-sm tracking-widest transition-colors duration-500" style={{ color: 'var(--next-project-label)' }}>NEXT PROJECT</span>
                        <h2 className="text-5xl md:text-7xl font-bold text-center transition-colors duration-500" style={{ color: 'var(--next-project-title)' }}>
                            {nextProject.title}
                        </h2>

                        {/* THE PROGRESS BAR (Visual Feedback of "Effort") */}
                        <div className="w-64 h-1 rounded-full overflow-hidden mt-8 transition-colors duration-500" style={{ backgroundColor: 'var(--progress-bar-track)' }}>
                            <motion.div
                                className="h-full"
                                style={{
                                    scaleX: scrollYProgress,
                                    transformOrigin: "left",
                                    backgroundColor: 'var(--progress-bar-fill)'
                                }}
                            />
                        </div>
                        <p className="text-xs mt-2 transition-colors duration-500" style={{ color: 'var(--next-project-hint)' }}>KEEP SCROLLING TO ENTER</p>
                    </div>

                </div>

            </div>




            {/* --- TOP LAYER (INTERACTIVE TEXT) --- */}
            {/* Placed here to ensure it is visually on top of everything, including the curtain (z-40 > z-10 wrapper) */}
            <div className="relative z-[60]">
                <PersonaRevealSidebar
                    arcana={
                        typeof project.arcana === 'string'
                            ? project.arcana
                            : (isMobile ? project.arcana.mobile : project.arcana.desktop)
                    }
                />
            </div>

        </main >
    );
}
