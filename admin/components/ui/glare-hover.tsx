"use client";

import "./glare-hover.css";
import { cn } from "@/lib/utils";
import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

export type GlareHoverProps = {
  children?: ReactNode;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  className?: string;
  style?: CSSProperties;
  /**
   * Aplica o glare no filho (ex.: Card com data-slot=card),
   * sem criar um wrapper extra.
   */
  asChild?: boolean;
};

function toRgba(glareColor: string, glareOpacity: number) {
  const hex = glareColor.replace("#", "");
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }
  if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }
  return glareColor;
}

function glareVars(props: {
  glareColor: string;
  glareOpacity: number;
  glareAngle: number;
  glareSize: number;
  transitionDuration: number;
}): CSSProperties {
  return {
    "--gh-angle": `${props.glareAngle}deg`,
    "--gh-duration": `${props.transitionDuration}ms`,
    "--gh-size": `${props.glareSize}%`,
    "--gh-rgba": toRgba(props.glareColor, props.glareOpacity),
  } as CSSProperties;
}

export default function GlareHover({
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.28,
  glareAngle = -30,
  glareSize = 300,
  transitionDuration = 3200,
  playOnce = false,
  className = "",
  style = {},
  asChild = false,
}: GlareHoverProps) {
  const vars = glareVars({
    glareColor,
    glareOpacity,
    glareAngle,
    glareSize,
    transitionDuration,
  });
  const glareClass = cn(
    "glare-hover",
    playOnce && "glare-hover--play-once",
    className,
  );

  if (asChild && isValidElement(children)) {
    const child = Children.only(children) as ReactElement<{
      className?: string;
      style?: CSSProperties;
    }>;
    return cloneElement(child, {
      className: cn(child.props.className, glareClass),
      style: { ...vars, ...child.props.style, ...style },
    });
  }

  return (
    <div className={glareClass} style={{ ...vars, ...style }}>
      {children}
    </div>
  );
}
