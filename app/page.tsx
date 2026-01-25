'use client';


import HeroGate from "@/components/HeroGate";
import ProjectGallery from "@/components/ProjectGallery";
import Preloader from "@/components/Preloader";
// import DebugStats from "@/components/DebugStats"; // [REMOVED]
import { AnimatePresence, motion } from "framer-motion";
import { useTimerStore } from "@/store/useTimerStore";
import { useState } from "react";

import { useIntroStore } from "@/store/useIntroStore";
import { useTransitionStore } from "@/store/useTransitionStore";

export default function Home() {
  const { isEntered, setEntered, hasLoaded, setHasLoaded } = useIntroStore();
  const { setSystemActive } = useTimerStore();
  const { startTransition, triggerReveal } = useTransitionStore();
  const [isLoading, setIsLoading] = useState(!hasLoaded);

  const handleEnter = () => {
    // 1. Start Curtain
    // Use Generic Tarot for Entry
    startTransition('up', 'dark', '/img/arcana/tarot.webp', 'dark');

    // 2. Wait for cover (approx 800ms to match shutter animation)
    setTimeout(() => {
      setEntered(true);
      setSystemActive(true);

      // 3. Trigger Reveal
      // Small delay to ensure React has swapped components
      setTimeout(() => {
        triggerReveal();
      }, 50);

    }, 800);
  };

  const handlePreloaderComplete = () => {
    setIsLoading(false);
    setHasLoaded(true);
  };

  return (
    <main className="min-h-screen">
      {/* DebugStats Removed */}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <Preloader key="preloader" onComplete={handlePreloaderComplete} />
        ) : (
          !isEntered && (
            <HeroGate key="herogate" onEnter={handleEnter} />
          )
        )}
      </AnimatePresence>

      {isEntered && (
        <ProjectGallery />
      )}
    </main>
  );
}
