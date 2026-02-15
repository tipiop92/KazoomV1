import { ChevronRight, LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface ListItemChevronProps {
  icon?: LucideIcon;
  label: string;
  value?: string;
  badge?: string;
  badgeColor?: "blue" | "orange" | "gray";
  danger?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function ListItemChevron({
  icon: Icon,
  label,
  value,
  badge,
  badgeColor = "gray",
  danger = false,
  onClick,
  disabled = false,
}: ListItemChevronProps) {
  const badgeColors = {
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    gray: "bg-gray-700/50 text-gray-400 border-gray-600/30",
  };

  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-gray-700/30 active:bg-gray-700/50 cursor-pointer"
      }`}
    >
      {Icon && (
        <div
          className={`p-2 rounded-lg ${
            danger
              ? "bg-red-500/10"
              : "bg-gray-700/50"
          }`}
        >
          <Icon
            className={`w-5 h-5 ${
              danger ? "text-red-400" : "text-gray-400"
            }`}
          />
        </div>
      )}
      <div className="flex-1 text-left min-w-0">
        <div
          className={`text-sm ${
            danger ? "text-red-400" : "text-white"
          }`}
        >
          {label}
        </div>
        {value && <div className="text-xs text-gray-400 mt-0.5">{value}</div>}
      </div>
      {badge && (
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium border ${badgeColors[badgeColor]}`}
        >
          {badge}
        </div>
      )}
      {!disabled && (
        <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
      )}
    </motion.button>
  );
}
