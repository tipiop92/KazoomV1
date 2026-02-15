import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { BadgeStatus, SecurityStatus } from "./BadgeStatus";

interface ContactRowProps {
  name: string;
  username: string;
  avatar: string;
  online?: boolean;
  lastSeen?: string;
  status?: SecurityStatus;
  onClick?: () => void;
  rightElement?: React.ReactNode;
}

export function ContactRow({
  name,
  username,
  avatar,
  online = false,
  lastSeen,
  status,
  onClick,
  rightElement,
}: ContactRowProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-4 hover:bg-gray-800/30 active:bg-gray-800/50 transition-colors cursor-pointer"
    >
      <div className="relative">
        <Avatar className="w-14 h-14 border-2 border-gray-800">
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold">
            {name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        {online && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white truncate text-base">{name}</h3>
          {status && <BadgeStatus status={status} compact />}
        </div>
        <p className="text-sm text-gray-400 truncate">
          {online ? (
            <span className="text-green-400">● En ligne</span>
          ) : (
            lastSeen || username
          )}
        </p>
      </div>

      {rightElement}
    </div>
  );
}
