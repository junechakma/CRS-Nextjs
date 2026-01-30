"use client";

import React from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  index: number;
  trend?: "up" | "down";
}

const gradientColors = [
  { border: "#3b82f6", bg: "from-blue-500 to-cyan-500" },
  { border: "#10b981", bg: "from-emerald-500 to-teal-500" },
  { border: "#8b5cf6", bg: "from-violet-500 to-purple-500" },
  { border: "#f59e0b", bg: "from-amber-500 to-orange-500" },
];

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  index,
  trend = "up",
}: StatCardProps) {
  const colors = gradientColors[index % gradientColors.length];

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-xl p-[1px]"
      style={{ borderRadius: "0.75rem" }}
    >
      {/* Animated border */}
      <div
        className="absolute inset-0"
        style={{ borderRadius: "calc(0.75rem * 0.96)" }}
      >
        <MovingBorder duration={3000} rx="30%" ry="30%">
          <div
            className="h-20 w-20 opacity-80"
            style={{
              background: `radial-gradient(${colors.border} 40%, transparent 60%)`,
            }}
          />
        </MovingBorder>
      </div>

      {/* Card content */}
      <div
        className="relative flex h-full w-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 backdrop-blur-xl"
        style={{ borderRadius: "calc(0.75rem * 0.96)" }}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </h3>
          </div>
          <div
            className={cn(
              "rounded-lg p-2.5 bg-gradient-to-br shadow-lg",
              colors.bg
            )}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <p
          className={cn(
            "text-sm font-medium flex items-center gap-1.5 mt-3",
            trend === "up" ? "text-emerald-600" : "text-red-500"
          )}
        >
          <span
            className={cn(
              "flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
              trend === "up"
                ? "bg-emerald-100 text-emerald-600"
                : "bg-red-100 text-red-500"
            )}
          >
            {trend === "up" ? "↑" : "↓"}
          </span>
          {change}
        </p>
      </div>
    </div>
  );
}

const MovingBorder = ({
  children,
  duration = 3000,
  rx,
  ry,
  ...otherProps
}: {
  children: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
  [key: string]: any;
}) => {
  const pathRef = useRef<SVGRectElement>(null);
  const progress = useMotionValue<number>(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(progress, (val) =>
    pathRef.current?.getPointAtLength(val).x
  );
  const y = useTransform(progress, (val) =>
    pathRef.current?.getPointAtLength(val).y
  );

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        {...otherProps}
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef}
        />
      </svg>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform,
        }}
      >
        {children}
      </motion.div>
    </>
  );
};
