'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLenis } from './SmoothScroll';
import gsap from 'gsap';
import { useCursorStore } from '@/store/useCursorStore';

interface ProjectCardProps {
    id: string;
    title: string;
    category: string;
    year: string;
    image?: string;
}

export default function ProjectCard({ id, title, category, year, image }: ProjectCardProps) {
    const { lenis } = useLenis();
    const cardRef = useRef<HTMLAnchorElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const { setCursorText, setIsHovered, setCursorVariant } = useCursorStore();

    useEffect(() => {
        if (!lenis || !cardRef.current) return;

        const setSkew = gsap.quickSetter(cardRef.current, "skewY", "deg");
        const setScale = gsap.quickSetter(cardRef.current, "scaleY");

        const onScroll = (e: any) => {
            const velocity = e.velocity;

            const skewAmount = velocity * 0.25;
            const stretchAmount = 1 + Math.min(Math.abs(velocity) * 0.002, 0.1);


            setSkew(skewAmount);
            setScale(stretchAmount);
        };

        lenis.on('scroll', onScroll);

        return () => {
            lenis.off('scroll', onScroll);
        };
    }, [lenis]);

    const slug = title.toLowerCase().replace(/ /g, "-");

    return (
        <Link
            href={`/project/${slug}`}
            ref={cardRef}
            className="block w-full mb-32 origin-center will-change-transform cursor-none"
            onMouseEnter={() => {
                setIsHovered(true);
                setCursorText("ENTER");
                setCursorVariant("click");
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                setCursorText("")
                setCursorVariant("default");
            }}
        >
            <div
                ref={imageContainerRef}
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