'use client';

import { useState } from "react";
import HeroGate from "@/components/HeroGate";
import ProjectGallery from "@/components/ProjectGallery";
import { AnimatePresence, motion } from "framer-motion";
import { useTimerStore } from "@/store/useTimerStore";

export default function Home() {
  const [isEntered, setIsEntered] = useState(false);
  const { setSystemActive } = useTimerStore();

  const handleEnter = () => {
    setIsEntered(true);
    setSystemActive(true);
  };

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">
        {!isEntered && (
          <HeroGate onEnter={handleEnter} />
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
