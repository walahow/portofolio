'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, MotionValue, useSpring, useInView } from 'framer-motion';
import Image from 'next/image';
import { Project } from '@/data/projects';

interface ProjectDetailGalleryProps {
    project: Project;
}

interface GalleryAsset {
    type: 'video' | 'image';
    src: string;
    id: string;
    isVertical: boolean;
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
    // Desktop: Video 65vw, Img 55vw
    const VIDEO_W = isDesktop ? 60 : 100; // 100% on mobile
    const IMG_W = isDesktop ? 50 : 100;   // 100% on mobile
    const VERTICAL_W = isDesktop ? 30 : 100; // Narrower for vertical items on desktop
    const GAP = isDesktop ? 15 : 0; // Gap logic handled by flex-gap on mobile

    // Combine Video and Gallery into one array for unified mapping and width calculation
    const assets: GalleryAsset[] = [];

    if (project.video) {
        const videoSrc = typeof project.video === 'string' ? project.video : project.video.src;
        const videoIsVertical = typeof project.video === 'object' && project.video.isVertical;

        assets.push({
            type: 'video',
            src: videoSrc,
            id: 'video-main',
            isVertical: !!videoIsVertical
        });
    }

    assets.push(...project.gallery.map((item, i) => {
        const src = typeof item === 'string' ? item : item.src;
        const isVertical = typeof item === 'object' && item.isVertical;
        return {
            type: 'image' as const,
            src,
            id: `img-${i}`,
            isVertical: !!isVertical
        };
    }));

    if (assets.length === 0) return null;

    // START_X calculation logic:
    // We want the FIRST item to be CENTERED at scroll progress 0.
    // Center of Viewport = 50vw.
    // Center of First Item = FirstItemWidth / 2.
    // So: START_X (Left edge of first item) = 50 - (FirstItemWidth / 2).

    const firstAsset = assets[0];
    const firstAssetWidth = firstAsset.isVertical ? VERTICAL_W : (firstAsset.type === 'video' ? VIDEO_W : IMG_W);

    // If first item is 65vw -> 50 - 32.5 = 17.5
    // If first item is 30vw -> 50 - 15 = 35
    const START_X = 50 - (firstAssetWidth / 2);

    // Calculate Total Width dynamically to determine END_X
    const totalAssets = assets.length;

    // Sum unique widths
    const totalContentWidth = assets.reduce((acc, asset) => {
        const w = asset.isVertical ? VERTICAL_W : (asset.type === 'video' ? VIDEO_W : IMG_W);
        return acc + w;
    }, 0);

    const totalWidth = totalContentWidth + ((totalAssets - 1) * GAP);

    // We want to scroll until the last item is CENTERED.
    // Position of Last Item Center (relative to start of strip) = totalWidth - (LastItemWidth / 2)
    const lastAsset = assets[assets.length - 1];
    const lastAssetWidth = lastAsset.isVertical ? VERTICAL_W : (lastAsset.type === 'video' ? VIDEO_W : IMG_W);

    // END_X calculation:
    // We want the TRANSLATION (x) to move the strip such that the Last Item is at 50vw.
    // Currently, at x=0 (START_X), the strip starts at START_X.
    // The Last Item Center is at: START_X + (totalWidth - LastItemWidth/2).
    // We want this point to move to 50vw.
    // So we need to translate by `delta` where:
    // (START_X + totalWidth - LastItemWidth/2) + delta = 50
    // delta (Total Translation) = 50 - (START_X + totalWidth - LastItemWidth/2)

    // Framer Motion maps [0, 1] to [StartVal, EndVal].
    // StartVal = START_X (minus sidebar offset)
    // EndVal = START_X + delta (minus sidebar offset)

    // Let's simplify END_X to mean "The visual left position of the strip when finished".
    // Visual Left Position = 50 - (Distance from Strip Start to Last Item Center)
    const distanceToLastItemCenter = totalWidth - (lastAssetWidth / 2);
    const END_X = 50 - distanceToLastItemCenter;

    const TRACK_LENGTH = Math.abs(END_X - START_X);

    // Horizontal Scroll Logic
    // We subtract 8rem (half of the 16rem sidebar) to center visually in the remaining space
    const x = useTransform(smoothProgress, [0, 1], [`calc(${START_X}vw - 8rem)`, `calc(${END_X}vw - 8rem)`]);

    return (
        <section
            ref={targetRef}
            className={`relative transition-all duration-500 ${isDesktop ? 'h-[400vh]' : 'h-auto py-20 pb-40'}`}
            style={{ backgroundColor: 'var(--project-gallery-bg)' }}
        >
            <div className={`${isDesktop ? 'sticky top-0 flex h-[100dvh] items-center overflow-hidden' : 'w-full'}`}>
                <motion.div
                    style={isDesktop ? { x, gap: `${GAP}vw` } : {}}
                    className={`${isDesktop ? 'flex' : 'flex flex-col gap-32 px-4 w-full'}`}
                >
                    {assets.map((asset, index) => {
                        // CALCULATE FOCUS POINT
                        // We need to sum widths of all PREVIOUS items
                        let offset = 0;
                        for (let i = 0; i < index; i++) {
                            const prevAsset = assets[i];
                            const w = prevAsset.isVertical ? VERTICAL_W : (prevAsset.type === 'video' ? VIDEO_W : IMG_W);
                            offset += w + GAP;
                        }

                        const myWidth = asset.isVertical ? VERTICAL_W : (asset.type === 'video' ? VIDEO_W : IMG_W);
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
    asset: GalleryAsset,
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
        [p - 0.25, p - 0.05, p + 0.05, p + 0.25],
        [1, 0, 0, 1]
    );
    const desktopOpacity = useTransform(
        scrollYProgress,
        [p - 0.35, p - 0.1, p + 0.1, p + 0.35],
        [0.3, 1, 1, 0.3]
    );

    // MOBILE VERTICAL FOCUS LOGIC
    const itemRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: mobileScrollYProgress } = useScroll({
        target: itemRef,
        offset: ["start end", "end start"]
    });

    // Mobile Animations: Simplified for Performance
    // Removed expensive grayscale filter animation on mobile
    const mobileScale = useTransform(
        mobileScrollYProgress,
        [0.1, 0.4, 0.6, 0.9],
        [0.9, 1.02, 1.02, 0.9] // Reduced scale slightly
    );

    const mobileOpacity = useTransform(
        mobileScrollYProgress,
        [0, 0.15, 0.85, 1],
        [0.6, 1, 1, 0.6]
    );

    // Conditional Styles
    const desktopStyles = {
        filter: useTransform(desktopGrayscale, (v) => `grayscale(${v})`),
        opacity: desktopOpacity,
        width: `${width}vw`
    };

    // Mobile: No filter, just opacity and scale
    const mobileStyles = {
        scale: mobileScale,
        opacity: mobileOpacity,
        width: '100%'
    };

    // Aspect Ratio Logic
    const aspectRatioClass = asset.isVertical
        ? (asset.type === 'video' ? 'aspect-[9/16]' : 'aspect-[3/4]')
        : (asset.type === 'video' ? 'aspect-video' : 'aspect-[4/3]');

    // Smart Video Logic
    const videoRef = useRef<HTMLVideoElement>(null);
    // Use useInView to detect if the video is actually on screen
    const isInView = useInView(itemRef, { margin: "0px 0px -20% 0px" }); // Play when largely visible

    useEffect(() => {
        if (!videoRef.current) return;

        if (isInView) {
            videoRef.current.play().catch(() => { }); // Auto-play when in view
        } else {
            videoRef.current.pause(); // Pause when out of view
        }
    }, [isInView]);

    return (
        <motion.div
            ref={itemRef}
            style={isDesktop ? desktopStyles : mobileStyles}
            className={`relative flex-shrink-0 bg-neutral-900 overflow-hidden ${aspectRatioClass}`}
        >
            {asset.type === 'video' ? (
                asset.src ? (
                    <video
                        ref={videoRef}
                        src={asset.src}
                        loop
                        muted
                        playsInline
                        preload="none" // Optimization: Don't load until needed
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
                    sizes="(max-width: 768px) 100vw, 50vw"
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
