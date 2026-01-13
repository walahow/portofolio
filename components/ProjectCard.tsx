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
    slug: string;
    category: string;
    year: string;
    image?: string;
}

export default function ProjectCard({ id, title, slug, category, year, image }: ProjectCardProps) {
    const cardRef = useRef<HTMLAnchorElement>(null);
    const { setCursorText, setIsHovered, setCursorVariant } = useCursorStore();
    const { startTransition } = useTransitionStore();
    const router = useRouter();

    return (
        <Link
            href={`/project/${slug}`}
            ref={cardRef}
            className="project-card block w-full mb-32 origin-center will-change-transform cursor-none opacity-80" // Added project-card class and default opacity
            onClick={(e) => {
                e.preventDefault();
                startTransition();
                // Wait for shutter to close (approx 800ms) before navigating
                setTimeout(() => {
                    router.push(`/project/${slug}`);
                }, 800);
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
                className="relative w-full aspect-[16/9] bg-neutral-900 overflow-hidden mb-6 group border border-neutral-800"
            >
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
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
                    <span className="opacity-50">{id}</span>
                    <span>{title}</span>
                </div>
                <div className="flex gap-8 text-right">
                    <span>{category}</span>
                    <span className="opacity-50">{year}</span>
                </div>
            </div>
        </Link>
    )
}
