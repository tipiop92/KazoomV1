import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, FileText, Files, Image, Settings, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { PinModal } from "../components/PinModal";
import { useVaultAuth } from "../context/VaultAuthContext";

const sections = [
  {
    id: "files",
    title: "Mes fichiers",
    description: "Documents et tableaux",
    icon: Files,
    color: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
    route: "/vault/files",
  },
  {
    id: "notes",
    title: "Notes",
    description: "Prises de notes rapides",
    icon: FileText,
    color: "from-yellow-500/20 to-yellow-600/20",
    borderColor: "border-yellow-500/30",
    iconColor: "text-yellow-400",
    route: "/vault/notes",
  },
  {
    id: "media",
    title: "Média",
    description: "Photos et vidéos",
    icon: Image,
    color: "from-purple-500/20 to-purple-600/20",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
    route: "/vault/media",
  },
  {
    id: "users",
    title: "Fichiers Contact",
    description: "Fichiers liés aux contacts",
    icon: Users,
    color: "from-green-500/20 to-green-600/20",
    borderColor: "border-green-500/30",
    iconColor: "text-green-400",
    route: "/vault/contacts",
  },
  {
    id: "settings",
    title: "Réglages",
    description: "Paramètres du coffre",
    icon: Settings,
    color: "from-gray-500/20 to-gray-600/20",
    borderColor: "border-gray-500/30",
    iconColor: "text-gray-400",
    route: "/vault/settings",
  },
];

export function Vault() {
  const navigate = useNavigate();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(true);
  const { unlockVault } = useVaultAuth();

  const handlePinSuccess = () => {
    setShowPinModal(false);
    setIsUnlocked(true);
    unlockVault(); // On marque la vault comme déverrouillée dans le contexte
  };

  if (!isUnlocked) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-indigo-600/20 rounded-full flex items-center justify-center border-2 border-indigo-600/40">
              <Files className="w-12 h-12 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Coffre-fort</h1>
            <p className="text-gray-400">Entre ton code PIN pour déverrouiller</p>
          </div>
        </div>
        <PinModal
          isOpen={showPinModal}
          onClose={() => navigate("/")}
          onSuccess={handlePinSuccess}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-black to-transparent backdrop-blur-sm pb-4">
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Coffre-fort</h1>
              <p className="text-sm text-gray-400">Stockage sécurisé</p>
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="px-4 space-y-3">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(section.route)}
                className={`w-full flex items-center gap-4 p-5 bg-gradient-to-r ${section.color} border ${section.borderColor} rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform`}
              >
                <div className="p-4 rounded-xl bg-gray-900/50">
                  <Icon className={`w-7 h-7 ${section.iconColor}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-lg font-semibold text-white">{section.title}</div>
                  <div className="text-sm text-gray-400">{section.description}</div>
                </div>
                <div className="text-gray-500">›</div>
              </motion.button>
            );
          })}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mx-4 mt-6 p-4 bg-indigo-600/10 border border-indigo-600/30 rounded-lg"
        >
          <p className="text-xs text-indigo-400 leading-relaxed">
            🔒 <strong>Chiffrement local</strong> - Toutes tes données dans le coffre-fort 
            sont chiffrées localement et protégées par ton code de verrouillage.
          </p>
        </motion.div>
      </div>
    </div>
  );
}