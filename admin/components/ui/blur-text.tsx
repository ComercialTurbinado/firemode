"use client";

import {
  BLUR_EASE_IN,
  BLUR_EASE_OUT,
  blurHidden,
  blurVisible,
  useSlideActive,
} from "@/components/ui/blur-motion";
import { motion, useReducedMotion } from "framer-motion";
import { type CSSProperties } from "react";

export type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  as?: "p" | "span" | "h2" | "h3" | "div";
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  index?: number;
  stepDuration?: number;
};

export default function BlurText({
  text = "",
  delay = 55,
  className = "",
  style,
  as: Tag = "p",
  animateBy = "words",
  direction = "top",
  index = 0,
  stepDuration = 0.4,
}: BlurTextProps) {
  const reduce = useReducedMotion();
  const active = useSlideActive();
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const fromY = direction === "top" ? -18 : 18;
  const baseDelay = index * 0.1;

  if (reduce) {
    return (
      <Tag className={className} style={style}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      style={{ display: "flex", flexWrap: "wrap", ...style }}
    >
      {elements.map((segment, i) => {
        const enterDelay = baseDelay + (i * delay) / 1000;
        const exitDelay = ((elements.length - 1 - i) * delay) / 1000 / 2;

        return (
          <motion.span
            className="inline-block"
            key={`${segment}-${i}`}
            initial={false}
            animate={
              active
                ? { ...blurVisible, y: 0 }
                : { ...blurHidden, y: fromY }
            }
            transition={
              active
                ? { duration: stepDuration, ease: BLUR_EASE_OUT, delay: enterDelay }
                : { duration: 0.3, ease: BLUR_EASE_IN, delay: exitDelay }
            }
          >
            {segment === " " ? "\u00A0" : segment}
            {animateBy === "words" && i < elements.length - 1 && "\u00A0"}
          </motion.span>
        );
      })}
    </Tag>
  );
}
