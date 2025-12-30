"use client";

import { motion } from "framer-motion";

interface ChristmasTreeProps {
  size?: number;
  className?: string;
}

export function ChristmasTree({ size = 40, className = "" }: ChristmasTreeProps) {
  return (
    <motion.div
      className={className}
      animate={{
        rotate: [0, -5, 5, -5, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: [0.4, 0, 0.2, 1], // cubic-bezier for smoother animation
      }}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Tree trunk */}
        <rect x="45" y="100" width="10" height="20" fill="#8B4513" />
        
        {/* Tree layers (triangles) */}
        {/* Bottom layer */}
        <path
          d="M50 95 L20 75 L80 75 Z"
          fill="#228B22"
          stroke="#1a6b1a"
          strokeWidth="1"
        />
        {/* Middle layer */}
        <path
          d="M50 75 L25 55 L75 55 Z"
          fill="#32CD32"
          stroke="#228B22"
          strokeWidth="1"
        />
        {/* Top layer */}
        <path
          d="M50 55 L30 40 L70 40 Z"
          fill="#90EE90"
          stroke="#32CD32"
          strokeWidth="1"
        />
        {/* Small top triangle */}
        <path
          d="M50 40 L38 28 L62 28 Z"
          fill="#ADFF2F"
          stroke="#90EE90"
          strokeWidth="1"
        />
        
        {/* Star on top */}
        <path
          d="M50 20 L52 28 L60 28 L54 32 L56 40 L50 36 L44 40 L46 32 L40 28 L48 28 Z"
          fill="#FFD700"
          stroke="#FFA500"
          strokeWidth="0.5"
        />
        
        {/* Ornaments (decorative circles) */}
        <circle cx="35" cy="65" r="3" fill="#DC2626" />
        <circle cx="65" cy="65" r="3" fill="#3B82F6" />
        <circle cx="42" cy="55" r="2.5" fill="#F59E0B" />
        <circle cx="58" cy="55" r="2.5" fill="#DC2626" />
        <circle cx="50" cy="48" r="2" fill="#F59E0B" />
      </svg>
    </motion.div>
  );
}

