"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND_NAME, TAGLINE } from "@/lib/constants";

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink"
        >
          <div className="flex flex-col items-center gap-5">
            <div className="microscope-loader">
              <div className="loading-line" />
            </div>
            <div className="text-center">
              <h1 className="font-[var(--font-display)] text-3xl text-white">{BRAND_NAME}</h1>
              <p className="mt-2 text-xs uppercase tracking-[0.35em] text-cyan">{TAGLINE}</p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
