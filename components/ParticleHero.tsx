"use client";

import { useCallback } from "react";
import Particles from "@tsparticles/react";
import type { Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export function ParticleHero() {
  const init = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="hero-particles"
      init={init}
      options={{
        background: { color: { value: "transparent" } },
        particles: {
          number: { value: 55, density: { enable: true, area: 900 } },
          color: { value: ["#00F5D4", "#FFB627", "#7DD3FC"] },
          shape: { type: "circle" },
          opacity: { value: { min: 0.08, max: 0.22 } },
          size: { value: { min: 2, max: 5 } },
          links: {
            enable: true,
            distance: 140,
            color: "#00F5D4",
            opacity: 0.12,
            width: 1
          },
          move: {
            enable: true,
            speed: 0.7,
            direction: "none",
            random: true,
            outModes: { default: "bounce" }
          }
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" }
          },
          modes: {
            grab: {
              distance: 160,
              links: { opacity: 0.35 }
            }
          }
        },
        detectRetina: true
      }}
      className="absolute inset-0"
    />
  );
}
