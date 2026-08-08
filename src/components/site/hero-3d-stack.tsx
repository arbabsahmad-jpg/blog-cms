"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const CARDS = [
  { title: "The quiet return of long-form writing", tag: "Culture", rotate: -10, z: 0, x: -130, y: -30 },
  { title: "What building in public actually costs", tag: "Business", rotate: 3, z: 60, x: 10, y: -70 },
  { title: "Notes from a year of shipping daily", tag: "Technology", rotate: 9, z: 120, x: 140, y: 40 },
];

export default function Hero3DStack() {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 150,
    damping: 20,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective relative mx-auto h-[380px] w-full max-w-md sm:h-[440px]"
    >
      <div className="animate-blob absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/30 blur-3xl" />

      <motion.div style={{ rotateX, rotateY }} className="preserve-3d relative h-full w-full">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, x: "-50%", y: "-50%" }}
            animate={{
              opacity: 1,
              x: [`calc(-50% + ${card.x}px)`, `calc(-50% + ${card.x}px)`],
              y: [`calc(-50% + ${card.y}px)`, `calc(-50% + ${card.y - 16}px)`, `calc(-50% + ${card.y}px)`],
            }}
            transition={{
              opacity: { delay: i * 0.15, duration: 0.6 },
              y: { delay: i * 0.15, duration: 5 + i, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{
              rotate: card.rotate,
              translateZ: card.z,
            }}
            className="absolute left-1/2 top-1/2 w-60 rounded-2xl border border-white/10 bg-ink-900/90 p-5 shadow-glow backdrop-blur-sm"
          >
            <span className="inline-block rounded-full bg-accent/20 px-2.5 py-0.5 text-[11px] font-medium text-accent-400">
              {card.tag}
            </span>
            <p className="mt-3 font-display text-base leading-snug text-paper-50">{card.title}</p>
            <div className="mt-4 h-1.5 w-16 rounded-full bg-white/10" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}