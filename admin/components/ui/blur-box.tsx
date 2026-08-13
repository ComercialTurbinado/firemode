"use client";

import {
  BLUR_EASE_IN,
  BLUR_EASE_OUT,
  BLUR_STAGGER,
  blurHidden,
  blurVisible,
  useSlideActive,
} from "@/components/ui/blur-motion";
import GlareHover from "@/components/ui/glare-hover";
import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

type BlurBoxProps = {
  children: ReactNode;
  className?: string;
  index?: number;
  delay?: number;
  direction?: "top" | "bottom";
  glare?: boolean;
};

export default function BlurBox({
  children,
  className,
  index = 0,
  delay = 0,
  direction = "bottom",
  glare = true,
}: BlurBoxProps) {
  const reduce = useReducedMotion();
  const active = useSlideActive();
  const fromY = direction === "top" ? -24 : 28;

  // Glare no próprio Card (asChild), sem wrapper que estica a tela
  const content = glare ? (
    <GlareHover asChild transitionDuration={3200}>
      {children}
    </GlareHover>
  ) : (
    children
  );

  if (reduce) {
    return <div className={className}>{content}</div>;
  }

  const enterDelay = delay / 1000 + index * BLUR_STAGGER;
  const exitDelay = index * (BLUR_STAGGER * 0.5);

  return (
    <motion.div
      className={className}
      initial={false}
      animate={
        active
          ? { ...blurVisible, y: 0 }
          : { ...blurHidden, y: fromY }
      }
      transition={
        active
          ? { duration: 0.65, ease: BLUR_EASE_OUT, delay: enterDelay }
          : { duration: 0.35, ease: BLUR_EASE_IN, delay: exitDelay }
      }
    >
      {content}
    </motion.div>
  );
}
