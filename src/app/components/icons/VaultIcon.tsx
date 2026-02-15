interface VaultIconProps {
  className?: string;
}

export function VaultIcon({ className = "w-6 h-6" }: VaultIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer vault door */}
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      
      {/* Corner bolts */}
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="18" cy="6" r="1" fill="currentColor" />
      <circle cx="6" cy="18" r="1" fill="currentColor" />
      <circle cx="18" cy="18" r="1" fill="currentColor" />
      
      {/* Center combination dial */}
      <circle
        cx="12"
        cy="12"
        r="4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* Dial markings */}
      <line x1="12" y1="8" x2="12" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15.5" y1="10" x2="14.8" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15.5" y1="14" x2="14.8" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="16" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Center knob */}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      
      {/* Handle */}
      <path
        d="M 19 11 L 20.5 11 L 20.5 13 L 19 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
