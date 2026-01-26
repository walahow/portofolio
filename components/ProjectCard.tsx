'use client';
import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransitionStore } from '@/store/useTransitionStore';
import { useCursorStore } from '@/store/useCursorStore';

interface ProjectCardProps {
    id: string;
    title: string;
    stack: string;
    slug: string;
    category: string;
    year: string;
    image?: string;
    cardImage?: string; // NEW: Specific Tarot Card Image
    theme?: 'light' | 'dark';
}

import { memo } from 'react';

function ProjectCard({ id, title, stack, slug, category, year, image, cardImage, theme }: ProjectCardProps) {
    const cardRef = useRef<HTMLAnchorElement>(null);
    const { setCursorText, setIsHovered, setCursorVariant } = useCursorStore();
    const { startTransition } = useTransitionStore();
    const router = useRouter();

    return (
        <Link
            href={`/project/${slug}`}
            ref={cardRef}
            data-id={id}
            className="project-card group/card block w-full origin-center cursor-none opacity-80 group-[.is-focused]/card:hover:[filter:none!important]" // Added conditional hover for filter
            onClick={(e) => {
                e.preventDefault();
                // Transition: Up | Target Theme: project.theme | Image: cardImage (Passed Prop) | Source: dark (Gallery is always dark)
                startTransition('up', theme, cardImage, 'dark');

                // Wait for shutter to close (approx 1.4s) before navigating.
                // We wait 1500ms to ensure the animation is largely finished and the screen is covered
                // BEFORE the heavy React render/hydration of the next page kicks in.
                setTimeout(() => {
                    router.push(`/project/${slug}`);
                }, 1500);
            }}
            onMouseEnter={() => {
                setIsHovered(true);
                setCursorText("CLICK");
                setCursorVariant("click");
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                setCursorText("")
                setCursorVariant("default");
            }}
        >
            <div
                className="relative w-full aspect-[32/9] bg-neutral-900 overflow-hidden mb-6 group border border-neutral-800"
            >
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-all duration-700 group-[.is-focused]/card:group-hover:scale-105" // Conditional scale
                    />
                ) : (
                    <>
                        <div className="absolute inset-0 bg-neutral-800 animate-pulse group-hover:bg-neutral-700 transition-colors duration-500" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-neutral-600 font-mono text-lg">{title} IMAGE</span>
                        </div>
                    </>
                )}
            </div>

            <div className="flex justify-between items-start font-mono text-sm uppercase tracking-tight border-t border-white/20 pt-4">
                <div className="flex gap-8">
                    <span className="opacity-55">{stack}</span>
                </div>
                <div className="flex gap-8 text-right">
                    <span className="opacity-55">{category}</span>
                </div>
            </div>
        </Link>
    )
}

export default memo(ProjectCard);
