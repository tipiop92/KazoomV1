import { Shield, ShieldAlert, ShieldX } from "lucide-react";

export type SecurityStatus = "VERIFIED" | "UNVERIFIED" | "KEY_CHANGED";

interface BadgeStatusProps {
  status: SecurityStatus;
  compact?: boolean;
}

export function BadgeStatus({ status, compact = false }: BadgeStatusProps) {
  const config = {
    VERIFIED: {
      icon: Shield,
      label: "Vérifié",
      bgClass: "bg-green-600/20 border-green-600/40",
      textClass: "text-green-400",
      iconClass: "text-green-400",
    },
    UNVERIFIED: {
      icon: ShieldAlert,
      label: "Non vérifié",
      bgClass: "bg-gray-600/20 border-gray-600/40",
      textClass: "text-gray-400",
      iconClass: "text-gray-400",
    },
    KEY_CHANGED: {
      icon: ShieldX,
      label: "Clé modifiée",
      bgClass: "bg-orange-600/20 border-orange-600/40",
      textClass: "text-orange-400",
      iconClass: "text-orange-400",
    },
  };

  const { icon: Icon, label, bgClass, textClass, iconClass } = config[status];

  if (compact) {
    return (
      <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full border ${bgClass}`}>
        <Icon className={`w-3.5 h-3.5 ${iconClass}`} />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${bgClass}`}>
      <Icon className={`w-3.5 h-3.5 ${iconClass}`} />
      <span className={`text-xs font-medium ${textClass}`}>{label}</span>
    </div>
  );
}
