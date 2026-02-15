import { Link } from "react-router";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Lock,
  Bell,
  Palette,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Shield,
  ArrowLeft,
  HardDrive,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { KazoomBanner } from "../components/KazoomBanner";

const settingsGroups = [
  {
    title: "Sécurité",
    items: [
      {
        icon: Lock,
        label: "Verrouillage et Sécurité",
        description: "Gérer le verrouillage de l'app",
        to: "/settings/security",
        highlight: true,
      },
      {
        icon: Shield,
        label: "Confidentialité",
        description: "Contrôler vos données",
        to: "/settings/confidentiality",
      },
    ],
  },
  {
    title: "Préférences",
    items: [
      {
        icon: Bell,
        label: "Notifications",
        description: "Sons et alertes",
        to: "/settings/notifications",
      },
      {
        icon: HardDrive,
        label: "Données & Stockage",
        description: "Gérer médias et cache",
        to: "/settings/storage",
      },
      {
        icon: Palette,
        label: "Apparence",
        description: "Thème et affichage",
        to: "#",
      },
      {
        icon: Globe,
        label: "Langue",
        description: "Français",
        to: "#",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        icon: HelpCircle,
        label: "Aide",
        description: "FAQ et support",
        to: "#",
      },
      {
        icon: Info,
        label: "À propos",
        description: "Version 1.0.0",
        to: "#",
      },
    ],
  },
];

export function Settings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="relative p-6 text-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="absolute left-4 top-6 rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
          <p className="text-sm text-gray-400">Personnalisez votre expérience Kazoom</p>
        </div>

        {/* Settings Groups */}
        <div className="px-6 space-y-6">
          {settingsGroups.map((group, groupIndex) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {group.title}
              </h2>
              <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden divide-y divide-gray-700">
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={`flex items-center gap-4 p-4 hover:bg-gray-700/30 transition-colors ${
                        item.highlight ? "bg-indigo-600/10" : ""
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          item.highlight
                            ? "bg-indigo-600/20"
                            : "bg-gray-700/50"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            item.highlight ? "text-indigo-400" : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium ${
                            item.highlight ? "text-indigo-300" : "text-white"
                          }`}
                        >
                          {item.label}
                        </div>
                        <div className="text-sm text-gray-400">
                          {item.description}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Logout Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full bg-red-600/10 hover:bg-red-600/20 border border-red-600/50 text-red-400 rounded-xl p-4 flex items-center justify-center gap-3 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Se déconnecter</span>
          </motion.button>

          {/* Kazoom Banner Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 mb-6 text-center"
          >
            <KazoomBanner variant="header" className="mb-3 opacity-60" to="/" />
            <div className="text-xs text-gray-500">
              <p>Kazoom Messenger</p>
              <p className="mt-1">Version 1.0.0</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}