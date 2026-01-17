'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
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

    // PARAMETERS
    const START_X = 12.5; // vw
    // Reduced scroll to prevent empty space (Content approx 150vw wide)
    // Adjusted to -175vw to leave a little bit of "black space" breathing room
    const END_X = -175; // vw 
    const TRACK_LENGTH = Math.abs(END_X - START_X); // Total distance structure moves

    // Horizontal Scroll Logic
    const x = useTransform(scrollYProgress, [0, 1], [`${START_X}vw`, `${END_X}vw`]);

    // Combine Video and Gallery into one array for unified mapping
    const assets = [
        { type: 'video', src: project.video, id: 'video-main' },
        ...project.gallery.map((img, i) => ({ type: 'image', src: img, id: `img-${i}` }))
    ];

    return (
        <section ref={targetRef} className="relative h-[400vh] bg-[#050505]">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">

                {/* Decorative Label */}
                <div className="absolute top-12 right-12 z-20 font-mono text-xs text-white/50 tracking-widest uppercase">
                    01 / VISUAL ASSETS
                </div>

                <motion.div
                    style={{ x }}
                    className="flex gap-20"
                >
                    {assets.map((asset, index) => {
                        // CALCULATE FOCUS POINT
                        // We need the scroll progress (0-1) where this item is CENTERED.
                        // Formula: p = (ItemsOffset + ItemWidth/2 - 30) / TRACK_LENGTH
                        // Constant "30" comes from: TargetCenter (42.5) - StartX (12.5)
                        // Asset Widths: Video=60, Img=45. Gap=4 (approx for gap-20)

                        let offset = 0;
                        for (let i = 0; i < index; i++) {
                            const w = (i === 0) ? 60 : 45;
                            offset += w + 4; // Width + Gap
                        }

                        const myWidth = (index === 0) ? 60 : 45;
                        const centerP = (offset + (myWidth / 2) - 30) / TRACK_LENGTH;

                        return (
                            <GalleryItem
                                key={asset.id}
                                asset={asset}
                                index={index}
                                centerP={centerP}
                                scrollYProgress={scrollYProgress}
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
    scrollYProgress
}: {
    asset: any,
    index: number,
    centerP: number,
    scrollYProgress: MotionValue
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
                opacity
            }}
            className={`relative flex-shrink-0 bg-neutral-900 overflow-hidden ${asset.type === 'video' ? 'w-[60vw] aspect-video' : 'w-[45vw] aspect-[4/3]'
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
