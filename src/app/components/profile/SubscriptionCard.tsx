import { Crown, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

interface SubscriptionCardProps {
  plan: "free" | "standard" | "pro" | "trial";
  daysLeft?: number;
  expiryDate?: string;
  onManage?: () => void;
  onHistory?: () => void;
  onSubscribe?: () => void;
}

export function SubscriptionCard({
  plan,
  daysLeft,
  expiryDate,
  onManage,
  onHistory,
  onSubscribe,
}: SubscriptionCardProps) {
  const planNames = {
    free: "Gratuit",
    standard: "Standard",
    pro: "Pro",
    trial: "Essai",
  };

  const planColors = {
    free: "text-gray-400",
    standard: "text-blue-400",
    pro: "text-purple-400",
    trial: "text-orange-400",
  };

  const isFree = plan === "free";
  const expiringSoon = daysLeft !== undefined && daysLeft < 7;
  const progressPercentage = daysLeft !== undefined ? (daysLeft / 30) * 100 : 0;

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Crown className={`w-6 h-6 ${planColors[plan]}`} />
          <div>
            <div className="text-lg font-bold text-white">{planNames[plan]}</div>
            {!isFree && daysLeft !== undefined && (
              <div className="text-2xl font-bold text-white mt-1">
                {daysLeft} jour{daysLeft !== 1 ? "s" : ""} restant{daysLeft !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
        {expiringSoon && (
          <div className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium border border-orange-500/30">
            Expire bientôt
          </div>
        )}
      </div>

      {!isFree && expiryDate && (
        <>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Expire le {expiryDate}</span>
          </div>

          {daysLeft !== undefined && (
            <Progress value={progressPercentage} className="h-2" />
          )}
        </>
      )}

      <div className="flex gap-2 pt-2">
        {isFree ? (
          <Button
            onClick={onSubscribe}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            S'abonner
          </Button>
        ) : (
          <>
            <Button
              onClick={onManage}
              variant="outline"
              className="flex-1 border-gray-600 hover:bg-gray-700"
            >
              Gérer l'abonnement
            </Button>
            <Button
              onClick={onHistory}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              Historique
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
