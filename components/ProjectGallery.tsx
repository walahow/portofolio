'use client';

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectCard from "./ProjectCard";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectGallery() {
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray<HTMLElement>(".project-card");

            cards.forEach((card) => {
                gsap.timeline({
                    scrollTrigger: {
                        trigger: card,
                        start: "top bottom", // When top of card hits bottom of viewport
                        end: "bottom top",   // When bottom of card hits top of viewport
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
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen py-24 px-4 sm:px-8 max-w-7xl mx-auto">
            <header className="mb-24 flex justify-between items-end border-b border-foreground/10 pb-8">
                <div>
                    <h1 className="ttext-4xl md:text-6xl font-bold tracking-tighter mb-2">SELECTED<br /> WORKS</h1>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm opacity-50">INDEX / [01-04]</p>
                </div>
            </header>

            <div className="space-y-48">
                {[
                    { id: '01', title: 'Ilkom-web', category: 'Dev / Design', year: '2025', image: '/img/ilkom-web.png' },
                    { id: '02', title: 'MyMeet', category: 'Mobile App', year: '2025', image: '/img/mymeet.jpg' },
                    { id: '03', title: 'Schedule Integrated Manager', category: 'Web Dev', year: '2025', image: '/img/sim.jpg' },
                    { id: '04', title: 'MyTask', category: 'Web Daily', year: '2025', image: '/img/mytask.jpg' },
                ].map((project) => (
                    <ProjectCard key={project.id} {...project} />
                ))}
            </div>
        </div>
    );
}