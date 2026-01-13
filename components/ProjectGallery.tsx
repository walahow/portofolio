'use client';

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectCard from "./ProjectCard";
import { PROJECTS } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectGallery() {
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            // DESKTOP: Full Experience (Filter + Scrub)
            mm.add("(min-width: 768px)", () => {
                const cards = gsap.utils.toArray<HTMLElement>(".project-card");
                cards.forEach((card) => {
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: card,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true,
                        }
                    })
                        .fromTo(card,
                            {
                                scale: 0.85,
                                filter: "grayscale(1) brightness(0.8)",
                                opacity: 0.7
                            },
                            {
                                scale: 1,
                                filter: "grayscale(0) brightness(1)",
                                opacity: 1,
                                duration: 1,
                                ease: "power2.out"
                            }
                        )
                        .to(card,
                            {
                                scale: 0.85,
                                filter: "grayscale(1) brightness(0.8)",
                                opacity: 0.7,
                                duration: 1,
                                ease: "power2.in"
                            }
                        );
                });
            });

            // MOBILE: Performance Mode (No Filter, No Scrub, Play Once)
            mm.add("(max-width: 767px)", () => {
                const cards = gsap.utils.toArray<HTMLElement>(".project-card");
                cards.forEach((card) => {
                    // Simple Fade In
                    gsap.fromTo(card,
                        {
                            opacity: 0,
                            scale: 0.9,
                        },
                        {
                            opacity: 1,
                            scale: 1,
                            duration: 0.8,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: card,
                                start: "top 85%", // Trigger when top of card is at 85% of viewport
                                toggleActions: "play none none reverse" // Play on enter, reverse on leave
                            }
                        }
                    );
                });
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen py-24 px-4 sm:px-8 max-w-7xl mx-auto">
            {/* Mobile Header (Horizontal) */}
            <header className="mb-24 flex justify-between items-end border-b border-foreground/10 pb-8 md:hidden">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter mb-2">SELECTED<br /> WORKS</h1>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm opacity-50">INDEX / [01-04]</p>
                </div>
            </header>

            {/* Desktop Vertical Sidebar (Fixed Spine) */}
            <aside className="hidden md:flex fixed top-0 left-0 h-screen w-26 bg-[#050505] z-50 flex-col justify-between items-start border-r border-white/5">

                <h1 className="[writing-mode:vertical-rl] text-8xl font-bold tracking-widest whitespace-nowrap mix-blend-difference">
                    KEY PROJECTS
                </h1>

            </aside>

            <div className="space-y-48">
                {PROJECTS.map((project) => (
                    <ProjectCard
                        key={project.id}
                        id={project.id}
                        title={project.title}
                        slug={project.slug}
                        category={project.category}
                        year={project.year}
                        image={project.thumbnail}
                    />
                ))}
            </div>
        </div>
    );
}