import { Link } from "react-router";
import bannerSrc from "@/assets/kazoom_banner.png";

const variantClasses = {
  hero: "mx-auto w-full max-w-[760px] h-auto max-h-[120px] object-contain",
  heroLarge: "mx-auto w-full object-contain",
  header: "mx-auto w-full max-w-[520px] h-auto max-h-[64px] object-contain",
  inline: "mx-auto w-full max-w-[220px] h-auto max-h-[32px] object-contain",
} as const;

type Variant = keyof typeof variantClasses;

const heroLargeStyle = { maxWidth: "800px", maxHeight: "300px", width: "100%", height: "auto" } as const;

interface KazoomBannerProps {
  variant?: Variant;
  className?: string;
  alt?: string;
  to?: string;
  onClick?: () => void;
}

const imgClasses = "cursor-pointer pointer-events-auto select-none";

export function KazoomBanner({
  variant = "header",
  className,
  alt = "Kazoom",
  to,
  onClick,
}: KazoomBannerProps) {
  const base = variantClasses[variant];
  const classes = className ? `${base} ${className}`.trim() : base;
  const isHeroLarge = variant === "heroLarge";
  const img = (
    <img
      src={bannerSrc}
      alt={alt}
      className={`${classes} ${(to != null || onClick != null) ? imgClasses : ""}`}
      style={isHeroLarge ? heroLargeStyle : undefined}
    />
  );

  if (to != null) {
    return (
      <Link
        to={to}
        className="block cursor-pointer pointer-events-auto select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 rounded"
        aria-label={alt}
      >
        {img}
      </Link>
    );
  }
  if (onClick != null) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block border-0 bg-transparent p-0 cursor-pointer pointer-events-auto select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 rounded"
        aria-label={alt}
      >
        {img}
      </button>
    );
  }
  return img;
}
