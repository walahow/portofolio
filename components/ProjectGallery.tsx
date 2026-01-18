'use client';

import { useRef, useLayoutEffect, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectCard from "./ProjectCard";
import { PROJECTS } from "@/data/projects";
import { usePerformanceStore } from "@/store/usePerformanceStore";
import DynamicProjectHeader from "./DynamicProjectHeader";
import SocialSidebar from "./SocialSidebar";
import { useState } from "react";
import { useLenis } from "./SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectGallery() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { enableAnimations } = usePerformanceStore();
    const [activeProject, setActiveProject] = useState(PROJECTS[0]);
    const { lenis } = useLenis();

    // Initial Scroll to Middle (50%)
    useEffect(() => {
        if (!lenis) return;

        const cards = document.querySelectorAll(".project-card");
        if (cards.length > 0) {
            // User requested to start in the middle to allow scrolling up/down without teleporting immediately.
            // 50% index is the safest bet for the "middle" of the duplicated list.
            const targetIndex = Math.floor(cards.length * 0.5);
            const targetCard = cards[targetIndex] as HTMLElement;

            if (targetCard) {
                // TIMEOUT REQUIRED: Global ScrollReset.tsx (Parent) runs its effect AFTER this (Child),
                // resetting scroll to 0. We wait a reasonable amount to override it.
                // Increased to 100ms to be safer.
                setTimeout(() => {
                    // Force Lenis to acknowledge the new content height immediately
                    lenis.resize();
                    ScrollTrigger.refresh();

                    lenis.scrollTo(targetCard, {
                        immediate: true,
                        offset: -window.innerHeight * 0.25 // Center the card roughly (1/4 down screen)
                    });
                }, 100);
            }
        }
    }, [lenis]);

    useLayoutEffect(() => {
        if (!enableAnimations) {
            // If animations disabled, ensure everything is visible immediately
            gsap.set(".project-card", { opacity: 1, scale: 1, filter: "none" });
            return;
        }

        const ctx = gsap.context(() => {
            const mm = gsap.matchMedia();

            // DESKTOP: Full Scrub Experience (Original)
            mm.add("(min-width: 768px)", () => {
                const cards = gsap.utils.toArray<HTMLElement>(".project-card");
                cards.forEach((card) => {
                    // ACTIVE PROJECT DETECTION
                    ScrollTrigger.create({
                        trigger: card,
                        start: "top 70%",
                        end: "bottom 30%",
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
                                ease: "power2.out"
                            }
                        )
                        .to(card, {
                            scale: 1,
                            filter: "grayscale(0) brightness(1)",
                            opacity: 1,
                            duration: 2.0,
                            ease: "none"
                        })
                        .to(card,
                            {
                                scale: 0.95,
                                filter: "grayscale(1) brightness(0.8)",
                                opacity: 0.7,
                                duration: 0.75,
                                ease: "power2.in"
                            }
                        );
                });
            });

            // MOBILE: STRICT FOCUS (Center = Color, Else = Grayscale)
            // Using standard ScrollTrigger with toggleActions for snappy response
            mm.add("(max-width: 767px)", () => {
                const cards = gsap.utils.toArray<HTMLElement>(".project-card");
                cards.forEach((card) => {
                    // Update Header
                    ScrollTrigger.create({
                        trigger: card,
                        start: "top 50%",
                        end: "bottom 50%",
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

                    // Strict Visibility/Color Animation
                    gsap.fromTo(card,
                        {
                            filter: "grayscale(1) brightness(0.6)", // Darker/Grayer by default
                            scale: 0.95,
                            opacity: 0.6
                        },
                        {
                            filter: "grayscale(0) brightness(1)",
                            scale: 1,
                            opacity: 1,
                            duration: 1.0,
                            ease: "power2.inOut",
                            scrollTrigger: {
                                trigger: card,
                                start: "top 60%", // Activate when near center
                                end: "bottom 40%", // Deactivate when leaving center
                                toggleActions: "play reverse play reverse", // Play on enter, reverse on leave
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
            <div className="fixed right-0 md:right-6 top-1/2 -translate-y-1/2 z-50 pointer-events-none mix-blend-difference">
                <p className="text-[10px] md:text-xs font-mono m-1 font-bold text-gray-400 opacity-50 tracking-widest whitespace-nowrap [writing-mode:vertical-rl] rotate-180 leading-none">
                    Atta Zulfahrizan Portofolio - type shi
                </p>
            </div>

            <div className="space-y-[12rem]">
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