import { cn } from "../../lib/utils";

/**
 * Architectural Computational Node Insignia (replaces cartoon robot mascot)
 */
export const AIRobot = ({ size = 40, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("shrink-0", className)}
    aria-hidden="true"
  >
    {/* Outer precision frame */}
    <rect
      x="3"
      y="3"
      width="42"
      height="42"
      rx="8"
      className="fill-primary-900 stroke-primary-700"
      strokeWidth="1.25"
    />
    {/* Subtle technical grid crosshairs */}
    <line x1="24" y1="7" x2="24" y2="41" className="stroke-primary-700/40" strokeWidth="0.75" strokeDasharray="2 2" />
    <line x1="7" y1="24" x2="41" y2="24" className="stroke-primary-700/40" strokeWidth="0.75" strokeDasharray="2 2" />
    {/* Isometric computational hexagon */}
    <polygon
      points="24,11 35,17.5 35,30.5 24,37 13,30.5 13,17.5"
      className="fill-primary-800/50 stroke-primary-400"
      strokeWidth="1.5"
    />
    {/* Internal circuit vectors */}
    <path
      d="M13 17.5L24 24L35 17.5M24 24V37"
      className="stroke-primary-300/80"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Core node */}
    <circle cx="24" cy="24" r="3" className="fill-white" />
    <circle cx="24" cy="11" r="1.75" className="fill-primary-300" />
    <circle cx="35" cy="17.5" r="1.75" className="fill-primary-300" />
    <circle cx="13" cy="17.5" r="1.75" className="fill-primary-300" />
  </svg>
);
