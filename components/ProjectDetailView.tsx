'use client';

import { Project } from '@/data/projects';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

interface ProjectDetailViewProps {
    project: Project;
}

export default function ProjectDetailView({ project }: ProjectDetailViewProps) {
    const containerRef = useRef(null);
    const { scrollY } = useScroll();

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

    return (
        <main className="min-h-screen bg-[#050505] w-full relative">

            {/* --- LEFT COLUMN (FIXED SIDEBAR) --- */}
            <aside className="fixed top-0 left-0 w-[15%] h-screen z-0 border-r border-white/5 flex flex-col">

                {/* ROLES - Moved to Top */}
                <div>
                    <ul className="[writing-mode:vertical-rl] text-5xl font-bold tracking-widest whitespace-nowrap mix-blend-difference opacity-50">
                        {project.roles.map((role, i) => (
                            <li key={i}>{role}</li>
                        ))}
                    </ul>
                </div>

                {/* Right Edge: VERTICAL MARQUEE */}
                <div className="absolute top-0 right-0 h-full w-32 border-l border-white/5 overflow-hidden flex justify-center py-4 mix-blend-difference pointer-events-none z-10">
                    <div className="flex flex-col animate-scroll-vertical will-change-transform">
                        {/* Block 1 */}
                        <div className="py-8 [writing-mode:vertical-rl] whitespace-nowrap text-8xl font-black text-neutral-800 tracking-widest uppercase">
                            {`${project.jargon} ${project.jargon} ${project.jargon}`}
                        </div>
                        {/* Block 2 (Duplicate for loop) */}
                        <div className="py-8 [writing-mode:vertical-rl] whitespace-nowrap text-8xl font-black text-neutral-800 tracking-widest uppercase">
                            {`${project.jargon} ${project.jargon} ${project.jargon}`}
                        </div>
                    </div>
                </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-32">
                        {project.gallery.map((img, i) => (
                            <div key={i} className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                                <Image
                                    src={img}
                                    alt={`Gallery ${i}`}
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        ))}
                    </div>

                </div>

            </div>


        </main>
    );
}
