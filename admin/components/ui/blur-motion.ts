"use client";

import { createContext, useContext } from "react";

/** Seção no viewport — BlurBox/BlurText entram e saem com ela. */
export const SlideActiveContext = createContext(false);

export function useSlideActive() {
  return useContext(SlideActiveContext);
}

/**
 * Oculto: blur 20, opacity 0, y + translateZ.
 * Ativo: blur 0, opacity 1, z 0.
 * (y em px — translateZ via z do motion)
 */
export const blurHidden = {
  filter: "blur(20px)",
  opacity: 0,
  y: 28,
} as const;

export const blurVisible = {
  filter: "blur(0px)",
  opacity: 1,
  y: 0,
} as const;

export const BLUR_EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const BLUR_EASE_IN = [0.4, 0, 1, 1] as const;

/** Delay entre itens (um depois do outro). */
export const BLUR_STAGGER = 0.16;

/** Boxes do corpo começam depois do header (kicker/título/sub). */
export const BLUR_BODY_START = 3;
