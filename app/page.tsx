'use client';


import HeroGate from "@/components/HeroGate";
import ProjectGallery from "@/components/ProjectGallery";
import Preloader from "@/components/Preloader";
// import DebugStats from "@/components/DebugStats"; // [REMOVED]
import { AnimatePresence, motion } from "framer-motion";
import { useTimerStore } from "@/store/useTimerStore";
import { useState } from "react";

import { useIntroStore } from "@/store/useIntroStore";

export default function Home() {
  const { isEntered, setEntered, hasLoaded, setHasLoaded } = useIntroStore();
  const { setSystemActive } = useTimerStore();
  const [isLoading, setIsLoading] = useState(!hasLoaded);

  const handleEnter = () => {
    setEntered(true);
    setSystemActive(true);
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
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <ProjectGallery />
        </motion.div>
      )}
    </main>
  );
}
