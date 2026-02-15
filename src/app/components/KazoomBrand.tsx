import bannerImage from "@/assets/kazoom_banner.png";
import iconImage from "@/assets/kazoom_icone.png";

const bannerClasses = {
  hero: "mx-auto w-full max-w-[760px] h-auto max-h-[120px] object-contain",
  header: "mx-auto w-full max-w-[520px] h-auto max-h-[64px] object-contain",
  inline: "mx-auto w-full max-w-[220px] h-auto max-h-[32px] object-contain",
} as const;

const iconClasses = {
  hero: "mx-auto w-[128px] h-[128px] object-contain",
  header: "mx-auto w-[64px] h-[64px] object-contain",
  inline: "mx-auto w-[28px] h-[28px] object-contain",
} as const;

type Variant = keyof typeof bannerClasses;

interface BrandProps {
  variant?: Variant;
  className?: string;
  alt?: string;
}

export function KazoomBanner({
  variant = "header",
  className,
  alt = "Kazoom",
}: BrandProps) {
  const base = bannerClasses[variant];
  const classes = className ? `${base} ${className}`.trim() : base;
  return <img src={bannerImage} alt={alt} className={classes} />;
}

export function KazoomIcon({
  variant = "header",
  className,
  alt = "Kazoom",
}: BrandProps) {
  const base = iconClasses[variant];
  const classes = className ? `${base} ${className}`.trim() : base;
  return <img src={iconImage} alt={alt} className={classes} />;
}
