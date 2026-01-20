'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, MotionValue, useSpring } from 'framer-motion';
import Image from 'next/image';
import { Project } from '@/data/projects';

interface ProjectDetailGalleryProps {
    project: Project;
}

export default function ProjectDetailGallery({ project }: ProjectDetailGalleryProps) {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    // Dampening Logic to smooth the transition
    const smoothProgress = useSpring(scrollYProgress, {
        mass: 0.5,      // Heavier -> Smoother/Slower reaction (was 0.2)
        stiffness: 90,  // (Unchanged)
        damping: 50,    // More friction -> No jitter (was 25)
        restDelta: 0.001
    });

    // Responsive sizing state
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // PARAMETERS (Responsive)
    // Mobile: Video 75vw, Img 70vw
    // Desktop: Video 50vw, Img 45vw
    const VIDEO_W = isDesktop ? 65 : 100; // 100% on mobile
    const IMG_W = isDesktop ? 55 : 100;   // 100% on mobile
    const GAP = isDesktop ? 5 : 0; // Gap logic handled by flex-gap on mobile

    const START_X = 17.5; // vw (Center of 65vw item: 50 - 32.5 = 17.5)

    // Calculate Total Width dynamically to determine END_X
    // Assets: 1 Video + N Images
    // Width = VIDEO_W + (N * IMG_W) + (TotalGaps * GAP)
    const totalAssets = 1 + project.gallery.length;
    const totalWidth = VIDEO_W + (project.gallery.length * IMG_W) + ((totalAssets - 1) * GAP);

    // We want to scroll until the last item is CENTERED.
    // Position of Last Item Center = totalWidth - (IMG_W / 2)
    // We want this position to coincide with Viewport Center (50vw)
    // So: START_X + x_translation = 50 - (totalWidth - IMG_W/2)
    // Wait, simpler: The track ends when Last Item Center is at 50vw.
    // END_X = 50 - (totalWidth - IMG_W / 2);
    const END_X = 50 - totalWidth + (IMG_W / 2);

    const TRACK_LENGTH = Math.abs(END_X - START_X);

    // Horizontal Scroll Logic
    // We subtract 8rem (half of the 16rem sidebar) to center visually in the remaining space
    const x = useTransform(smoothProgress, [0, 1], [`calc(${START_X}vw - 8rem)`, `calc(${END_X}vw - 8rem)`]);

    // Combine Video and Gallery into one array for unified mapping
    const assets = [
        { type: 'video', src: project.video, id: 'video-main' },
        ...project.gallery.map((img, i) => ({ type: 'image', src: img, id: `img-${i}` }))
    ];

    return (
        <section
            ref={targetRef}
            className={`relative bg-[var(--background)] transition-all duration-500 ${isDesktop ? 'h-[400vh]' : 'h-auto py-20 pb-40'}`}
        >
            <div className={`${isDesktop ? 'sticky top-0 flex h-[100dvh] items-center overflow-hidden' : 'w-full'}`}>
                <motion.div
                    style={isDesktop ? { x, gap: `${GAP}vw` } : {}}
                    className={`${isDesktop ? 'flex' : 'flex flex-col gap-32 px-4 w-full'}`}
                >
                    {assets.map((asset, index) => {
                        // CALCULATE FOCUS POINT
                        let offset = 0;
                        for (let i = 0; i < index; i++) {
                            const w = (i === 0) ? VIDEO_W : IMG_W;
                            offset += w + GAP;
                        }

                        const myWidth = (index === 0) ? VIDEO_W : IMG_W;
                        const centerP = (offset + (myWidth / 2) - START_X) / TRACK_LENGTH;

                        return (
                            <GalleryItem
                                key={asset.id}
                                asset={asset}
                                index={index}
                                centerP={centerP}
                                scrollYProgress={smoothProgress}
                                width={myWidth}
                                isDesktop={isDesktop}
                            />
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}

// Sub-component to handle individual focus logic
function GalleryItem({
    asset,
    index,
    centerP,
    scrollYProgress,
    width,
    isDesktop
}: {
    asset: any,
    index: number,
    centerP: number,
    scrollYProgress: MotionValue,
    width: number,
    isDesktop: boolean
}) {
    // DESKTOP HORIZONTAL FOCUS LOGIC
    const p = centerP;
    const desktopGrayscale = useTransform(
        scrollYProgress,
        // Widened range: Transition starts 0.25 away (was 0.15)
        [p - 0.25, p - 0.05, p + 0.05, p + 0.25],
        [1, 0, 0, 1]
    );
    const desktopOpacity = useTransform(
        scrollYProgress,
        // Widened range: Transition starts 0.35 away (was 0.2)
        [p - 0.35, p - 0.1, p + 0.1, p + 0.35],
        [0.3, 1, 1, 0.3]
    );

    // MOBILE VERTICAL FOCUS LOGIC
    // We need a ref to track this specific item's position in the viewport
    const itemRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: mobileScrollYProgress } = useScroll({
        target: itemRef,
        offset: ["start end", "end start"]
    });

    // Mobile Animations:
    // 0 = entering from bottom, 0.5 = center, 1 = leaving top
    // Focus peak around 0.5
    const mobileGrayscale = useTransform(
        mobileScrollYProgress,
        [0.1, 0.4, 0.6, 0.9],
        [1, 0, 0, 1]
    );

    const mobileScale = useTransform(
        mobileScrollYProgress,
        [0.1, 0.4, 0.6, 0.9],
        [0.9, 1.05, 1.05, 0.9]
    );

    // We can also add a slight opacity fade at the very edges to smooth entry/exit
    const mobileOpacity = useTransform(
        mobileScrollYProgress,
        [0, 0.2, 0.8, 1],
        [0.8, 1, 1, 0.8]
    );


    // Conditional Styles
    const desktopStyles = {
        filter: useTransform(desktopGrayscale, (v) => `grayscale(${v})`),
        opacity: desktopOpacity,
        width: `${width}vw`
    };

    // Note: On mobile, we use the mobile-specific motion values
    const mobileStyles = {
        filter: useTransform(mobileGrayscale, (v) => `grayscale(${v})`),
        scale: mobileScale,
        opacity: mobileOpacity,
        width: '100%'
    };

    return (
        <motion.div
            ref={itemRef}
            style={isDesktop ? desktopStyles : mobileStyles}
            className={`relative flex-shrink-0 bg-neutral-900 overflow-hidden ${asset.type === 'video' ? 'aspect-video' : 'aspect-[4/3]'
                }`}
        >
            {asset.type === 'video' ? (
                asset.src ? (
                    <video
                        src={asset.src}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center border border-white/10 text-white/20 font-mono tracking-widest">
                        [ NO SIGNAL ]
                    </div>
                )
            ) : (
                <Image
                    src={asset.src}
                    alt="Gallery Asset"
                    fill
                    className="object-cover"
                />
            )}

            {/* Index Label */}
            <div className="absolute bottom-4 left-4 font-mono text-xs text-white/50">
                ASSET_{index + 1}
            </div>
        </motion.div>
    );
}
