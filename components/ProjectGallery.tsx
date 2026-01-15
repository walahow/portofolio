'use client';

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectCard from "./ProjectCard";
import { PROJECTS } from "@/data/projects";
import { usePerformanceStore } from "@/store/usePerformanceStore";
import DynamicProjectHeader from "./DynamicProjectHeader";
import SocialSidebar from "./SocialSidebar";
import { useState } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectGallery() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { enableAnimations } = usePerformanceStore();
    const [activeProject, setActiveProject] = useState(PROJECTS[0]);

    useLayoutEffect(() => {
        if (!enableAnimations) {
            // If animations disabled, ensure everything is visible immediately
            gsap.set(".project-card", { opacity: 1, scale: 1, filter: "none" });
            return;
        }

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            // DESKTOP & MOBILE: Full Experience for ALL (Filter + Scrub)
            mm.add("(min-width: 0px)", () => {
                const cards = gsap.utils.toArray<HTMLElement>(".project-card");
                cards.forEach((card) => {
                    // ACTIVE PROJECT DETECTION
                    ScrollTrigger.create({
                        trigger: card,
                        start: "top 70%", // More generous active window
                        end: "bottom 30%", // More generous active window
                        onEnter: () => {
                            const projectId = card.getAttribute("data-id");
                            const found = PROJECTS.find(p => p.id === projectId);
                            if (found) setActiveProject(found);
                        },
                        onEnterBack: () => {
                            const projectId = card.getAttribute("data-id");
                            const found = PROJECTS.find(p => p.id === projectId);
                            if (found) setActiveProject(found);
                        }
                    });

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
                                scale: 0.95,
                                filter: "grayscale(1) brightness(0.8)",
                                opacity: 0.7
                            },
                            {
                                scale: 1,
                                filter: "grayscale(0) brightness(1)",
                                opacity: 1,
                                duration: 0.75,
                                ease: "power2.out" // Smooth entry
                            }
                        )
                        // HOLD PHASE: Stay centered and colored for a bit
                        .to(card, {
                            scale: 1,
                            filter: "grayscale(0) brightness(1)",
                            opacity: 1,
                            duration: 1.5, // MUCH longer hold (50% of total timeline)
                            ease: "none"
                        })
                        .to(card,
                            {
                                scale: 0.95,
                                filter: "grayscale(1) brightness(0.8)",
                                opacity: 0.7,
                                duration: 0.75,
                                ease: "power2.in" // Smooth exit
                            }
                        );
                });
            });

            // MOBILE: HIGH PERFORMANCE MODE (DISABLED - USING FULL EXPERIENCE)
            // 1. No Scrub
            // 2. Play Once (Don't reverse on leave)
            // mm.add("(max-width: 767px)", () => {
            mm.add("(max-width: -1px)", () => { // Disable this block effectively
                const cards = gsap.utils.toArray<HTMLElement>(".project-card");
                cards.forEach((card) => {
                    gsap.fromTo(card,
                        {
                            opacity: 0,
                            scale: 0.95, // Reduced scale delta for cheaper repaint
                        },
                        {
                            opacity: 1,
                            scale: 1,
                            duration: 0.6,
                            ease: "power1.out",
                            scrollTrigger: {
                                trigger: card,
                                start: "top 90%",
                                once: true, // IMPORTANT: Animation only runs once. No constant listening.
                            }
                        }
                    );
                });
            });

        }, containerRef);

        return () => ctx.revert();
    }, [enableAnimations]);

    return (
        <div ref={containerRef} className="min-h-screen pt-4 pb-24 px-4 sm:px-24 w-full mx-auto">
            {/* Top Spacer for Scroll Physics Damping */}
            <div className="h-32 w-full" />

            {/* Mobile Header (Horizontal) */}
            {/* Mobile Header (Horizontal) Removed */}

            {/* DYNAMIC HEADER */}
            <DynamicProjectHeader title={activeProject.title} role={activeProject.roles.slice(0, 2).join(" & ")} />

            {/* Desktop Vertical Sidebar (Fixed Spine) */}
            {/* Desktop Vertical Sidebar Removed per user request */}
            <SocialSidebar />

            {/* VERTICAL RIGHT LABEL */}
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:block pointer-events-none mix-blend-difference">
                <p className="text-xs font-mono py-6 pb-12 font-bold text-gray-400 opacity-50 tracking-widest whitespace-nowrap [writing-mode:vertical-rl] rotate-180">
                    Atta Zulfahrizan Portofolio - type shi
                </p>
            </div>

            <div className="space-y-[24rem]">
                {[...PROJECTS, ...PROJECTS, ...PROJECTS, ...PROJECTS, ...PROJECTS, ...PROJECTS].map((project, index) => (
                    <ProjectCard
                        key={`${project.id}-${index}`} // Unique key for duplicated items
                        id={project.id}
                        title={project.title}
                        stack={project.stack}
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