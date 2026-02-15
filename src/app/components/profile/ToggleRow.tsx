import { LucideIcon } from "lucide-react";
import { Switch } from "../ui/switch";

interface ToggleRowProps {
  icon?: LucideIcon;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: ToggleRowProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl">
      {Icon && (
        <div className="p-2 rounded-lg bg-gray-700/50">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white">{label}</div>
        {description && (
          <div className="text-xs text-gray-400 mt-0.5">{description}</div>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}
