"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function FactRotator({ facts }: { facts: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!facts.length) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % facts.length), 4500);
    return () => window.clearInterval(timer);
  }, [facts.length]);

  if (!facts.length) {
    return null;
  }

  return (
    <div className="glass-panel rounded-[2rem] p-6">
      <p className="text-xs uppercase tracking-[0.32em] text-cyan">Did You Know</p>
      <div className="mt-4 min-h-20">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg leading-8 text-slate-100"
          >
            {facts[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

