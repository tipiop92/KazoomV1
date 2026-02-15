import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

interface KeyRowProps {
  label: string;
  value: string;
  monospace?: boolean;
  onCopy?: () => void;
}

export function KeyRow({ label, value, monospace = true, onCopy }: KeyRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    if (onCopy) onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between py-3 gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 mb-1">{label}</div>
        <div className={`text-white text-sm truncate ${monospace ? "font-mono" : ""}`}>
          {value}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="text-gray-400 hover:text-white flex-shrink-0"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-1 text-green-400" />
            <span className="text-green-400">Copié</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-1" />
            <span>Copier</span>
          </>
        )}
      </Button>
    </div>
  );
}
