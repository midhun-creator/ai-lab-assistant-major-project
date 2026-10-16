import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface SidebarToggleIconProps {
  isOpen: boolean;
  className?: string;
  size?: number;
}

/**
 * Custom Squircle Sidebar Toggle Icon matching the Editorial Laboratory palette.
 * Uses direct SVG path coordinate interpolation so the chevron stays centered inside
 * the right chamber while smoothly morphing and sliding left (<) or right (>).
 */
export function SidebarToggleIcon({
  isOpen,
  className,
  size = 20,
}: SidebarToggleIconProps) {
  const dividerX = isOpen ? 9.0 : 7.8;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 block", className)}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="sidebar-squircle-clip">
          <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
        </clipPath>
      </defs>

      {/* Tinted Left Sidebar Chamber (clipped cleanly to the squircle's left curve) */}
      <g clipPath="url(#sidebar-squircle-clip)">
        <motion.rect
          x="2.5"
          y="2.5"
          height="19"
          initial={false}
          animate={{
            width: dividerX - 2.5,
            opacity: isOpen ? 0.18 : 0.1,
          }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          fill="currentColor"
        />
      </g>

      {/* Outer Squircle Frame */}
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5.5"
        stroke="currentColor"
        strokeWidth="1.85"
      />

      {/* Animated Vertical Sidebar Divider Line */}
      <motion.line
        y1="2.5"
        y2="21.5"
        initial={false}
        animate={{ x1: dividerX, x2: dividerX }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinecap="round"
      />

      {/* Direct SVG Coordinate Morphing Chevron — stays locked inside the right chamber */}
      <motion.path
        initial={false}
        animate={{
          d: isOpen
            ? "M 16.25 9.25 L 13.45 12 L 16.25 14.75"
            : "M 13.75 9.25 L 16.55 12 L 13.75 14.75",
        }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        stroke="currentColor"
        strokeWidth="1.95"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
