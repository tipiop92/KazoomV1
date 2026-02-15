import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Copy, Check, Shield } from "lucide-react";
import { Button } from "../components/ui/button";

export function SafetyNumber() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const safetyNumber = "8451 2210 9A3C 77D1 4B82 C903 1FA7 6E5D";
  const username = "lynor";

  const handleCopy = () => {
    navigator.clipboard.writeText(safetyNumber.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Formater le safety number en groupes de 4
  const formattedGroups = safetyNumber.split(" ");

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-black to-transparent backdrop-blur-xl">
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Empreinte de sécurité</h1>
              <p className="text-sm text-gray-400">Safety Number</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-full max-w-md space-y-8"
          >
            {/* Icon */}
            <div className="flex justify-center">
              <div className="p-6 rounded-full bg-purple-600/20 border-2 border-purple-500/50">
                <Shield className="w-16 h-16 text-purple-400" />
              </div>
            </div>

            {/* Username */}
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Ton identité</div>
              <div className="text-2xl font-bold text-white">@{username}</div>
            </div>

            {/* Safety Number */}
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-8">
              <div className="text-center space-y-4">
                <div className="text-sm text-gray-400 mb-4">Safety Number</div>
                
                {/* Groupes de chiffres */}
                <div className="grid grid-cols-2 gap-3">
                  {formattedGroups.map((group, index) => (
                    <div
                      key={index}
                      className="bg-gray-900/50 rounded-lg p-3 font-mono text-xl text-purple-300 tracking-widest border border-gray-700/50"
                    >
                      {group}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-sm text-blue-200 leading-relaxed">
                <strong className="text-blue-100">Vérification en personne :</strong> Compare ces chiffres
                avec ceux de ton contact pour garantir que votre communication est sécurisée et non interceptée.
              </p>
            </div>

            {/* Action */}
            <Button
              onClick={handleCopy}
              variant="outline"
              className="w-full border-gray-600 hover:bg-gray-700 py-6"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 mr-2 text-green-400" />
                  <span className="text-green-400">Copié dans le presse-papiers</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 mr-2" />
                  Copier le Safety Number
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Ce numéro est unique à ton compte KAZOOM. Si il change, tous tes contacts en seront alertés.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}