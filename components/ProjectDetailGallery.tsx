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
        mass: 0.2,      // Heavier -> Smoother/Slower reaction
        stiffness: 90,  // Softer spring
        damping: 25,    // More friction -> Less jitter
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
    const VIDEO_W = isDesktop ? 50 : 75;
    const IMG_W = isDesktop ? 45 : 70;
    const GAP = isDesktop ? 10 : 5; // 10vw Desktop, 5vw mobile

    const START_X = 12.5; // vw

    // Calculate Total Width dynamically to determine END_X
    // Assets: 1 Video + N Images
    // Width = VIDEO_W + (N * IMG_W) + (TotalGaps * GAP)
    const totalAssets = 1 + project.gallery.length;
    const totalWidth = VIDEO_W + (project.gallery.length * IMG_W) + ((totalAssets - 1) * GAP);

    // We want to scroll until the last item is roughly centered or visible.
    // Let's aim to have the last item centered.
    // Last Item Center offset = TotalWidth - (LastWidth / 2)
    // But x transform moves the whole strip.
    // When X = END_X, the strip is shifted left by END_X.

    // Simplified END_X calculation:
    // We want the last item to be fully viewed.
    // END_X = - (TotalWidth - 100vw + Padding)
    // Let's stick to the previous feeling: END_X ~ - (TotalWidth - ViewportHalf)
    const END_X = -(totalWidth - 50); // Approximation

    const TRACK_LENGTH = Math.abs(END_X - START_X);

    // Horizontal Scroll Logic
    const x = useTransform(smoothProgress, [0, 1], [`${START_X}vw`, `${END_X}vw`]);

    // Combine Video and Gallery into one array for unified mapping
    const assets = [
        { type: 'video', src: project.video, id: 'video-main' },
        ...project.gallery.map((img, i) => ({ type: 'image', src: img, id: `img-${i}` }))
    ];

    return (
        <section ref={targetRef} className="relative h-[400vh] bg-[#050505]">
            <div className="sticky top-0 flex h-[100dvh] items-center overflow-hidden">


                <motion.div
                    style={{ x, gap: `${GAP}vw` }}
                    className="flex"
                >
                    {assets.map((asset, index) => {
                        // CALCULATE FOCUS POINT
                        let offset = 0;
                        for (let i = 0; i < index; i++) {
                            const w = (i === 0) ? VIDEO_W : IMG_W;
                            offset += w + GAP;
                        }

                        const myWidth = (index === 0) ? VIDEO_W : IMG_W;
                        const centerP = (offset + (myWidth / 2) - 30) / TRACK_LENGTH;

                        return (
                            <GalleryItem
                                key={asset.id}
                                asset={asset}
                                index={index}
                                centerP={centerP}
                                scrollYProgress={smoothProgress}
                                width={myWidth}
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
    width
}: {
    asset: any,
    index: number,
    centerP: number,
    scrollYProgress: MotionValue,
    width: number
}) {
    // FOCUS LOGIC
    // Create a plateau around the calculated center point.
    // 0 = Full Color, 1 = Grayscale
    // Range: [Start Gray, Start Color, End Color, End Gray]
    // Width: +/- 0.05 around center (10% of scroll duration)

    // Clamp centerP to handle edge cases (though math should be robust)
    const p = centerP;

    const grayscale = useTransform(
        scrollYProgress,
        [p - 0.15, p - 0.05, p + 0.05, p + 0.15],
        [1, 0, 0, 1]
    );

    const opacity = useTransform(
        scrollYProgress,
        [p - 0.2, p - 0.05, p + 0.05, p + 0.2],
        [0.3, 1, 1, 0.3]
    );

    return (
        <motion.div
            style={{
                filter: useTransform(grayscale, (v) => `grayscale(${v})`),
                opacity,
                width: `${width}vw`
            }}
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
