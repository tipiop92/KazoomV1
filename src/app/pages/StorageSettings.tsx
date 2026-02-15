import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Download, Image, Trash2, HardDrive, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";

type AutoDownloadMode = "never" | "wifi" | "wifi-cellular";
type MediaQuality = "standard" | "high";
type PurgeDelay = "30" | "90" | "180";

export function StorageSettings() {
  const navigate = useNavigate();
  const [autoDownload, setAutoDownload] = useState<AutoDownloadMode>("wifi");
  const [mediaQuality, setMediaQuality] = useState<MediaQuality>("standard");
  const [purgeDelay, setPurgeDelay] = useState<PurgeDelay>("90");
  const [showStorageDetail, setShowStorageDetail] = useState(false);

  const handleClearCache = () => {
    // Simulate cache clearing
    alert("Cache effacé avec succès !");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-black to-transparent backdrop-blur-sm pb-4">
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Données & Stockage</h1>
              <p className="text-sm text-gray-400">Gérer médias et cache</p>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-6">
          {/* Téléchargement automatique */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-4"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Download className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <Label className="text-white font-medium">Téléchargement auto médias</Label>
                <p className="text-sm text-gray-400 mt-1">
                  Quand télécharger automatiquement les photos et vidéos
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setAutoDownload("never")}
                className={`w-full p-3 rounded-lg border transition-all ${
                  autoDownload === "never"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300"
                    : "bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Jamais</span>
                  {autoDownload === "never" && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  )}
                </div>
                <p className="text-xs text-gray-400 text-left mt-1">
                  Télécharger manuellement uniquement
                </p>
              </button>

              <button
                onClick={() => setAutoDownload("wifi")}
                className={`w-full p-3 rounded-lg border transition-all ${
                  autoDownload === "wifi"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300"
                    : "bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Wi-Fi uniquement</span>
                  {autoDownload === "wifi" && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  )}
                </div>
                <p className="text-xs text-gray-400 text-left mt-1">
                  Recommandé pour économiser les données mobiles
                </p>
              </button>

              <button
                onClick={() => setAutoDownload("wifi-cellular")}
                className={`w-full p-3 rounded-lg border transition-all ${
                  autoDownload === "wifi-cellular"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300"
                    : "bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Wi-Fi + Cellulaire</span>
                  {autoDownload === "wifi-cellular" && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  )}
                </div>
                <p className="text-xs text-gray-400 text-left mt-1">
                  Téléchargement immédiat sur tous les réseaux
                </p>
              </button>
            </div>
          </motion.div>

          {/* Qualité des médias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-4"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Image className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <Label className="text-white font-medium">Qualité des médias</Label>
                <p className="text-sm text-gray-400 mt-1">
                  Qualité d'envoi et de réception des médias
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setMediaQuality("standard")}
                className={`w-full p-3 rounded-lg border transition-all ${
                  mediaQuality === "standard"
                    ? "bg-purple-600/20 border-purple-500 text-purple-300"
                    : "bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Standard</span>
                  {mediaQuality === "standard" && (
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  )}
                </div>
                <p className="text-xs text-gray-400 text-left mt-1">
                  Bonne qualité, moins d'espace et de bande passante
                </p>
              </button>

              <button
                onClick={() => setMediaQuality("high")}
                className={`w-full p-3 rounded-lg border transition-all ${
                  mediaQuality === "high"
                    ? "bg-purple-600/20 border-purple-500 text-purple-300"
                    : "bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Haute</span>
                  {mediaQuality === "high" && (
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  )}
                </div>
                <p className="text-xs text-gray-400 text-left mt-1">
                  Qualité maximale, consomme plus d'espace
                </p>
              </button>
            </div>
          </motion.div>

          {/* Gestion du stockage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <HardDrive className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1">
                  <Label className="text-white font-medium">Gestion du stockage</Label>
                  <p className="text-sm text-gray-400 mt-1">
                    Libérer de l'espace sur votre appareil
                  </p>
                </div>
              </div>

              {/* Nettoyage cache */}
              <button
                onClick={handleClearCache}
                className="w-full p-3 rounded-lg bg-gray-700/30 border border-gray-600 text-gray-300 hover:bg-gray-700/50 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <div className="text-left">
                    <div className="font-medium">Nettoyer le cache</div>
                    <div className="text-xs text-gray-400">Images et fichiers temporaires</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">142 MB</div>
              </button>

              {/* Taille stockage */}
              <button
                onClick={() => setShowStorageDetail(!showStorageDetail)}
                className="w-full p-3 mt-2 rounded-lg bg-gray-700/30 border border-gray-600 text-gray-300 hover:bg-gray-700/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-medium">Utilisation du stockage</div>
                    <div className="text-xs text-gray-400">Voir les détails</div>
                  </div>
                  <div className="text-sm text-gray-400">2.4 GB</div>
                </div>
              </button>

              {/* Détail stockage */}
              {showStorageDetail && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700 space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Photos</span>
                    <span className="text-white">1.2 GB</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Vidéos</span>
                    <span className="text-white">856 MB</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Documents</span>
                    <span className="text-white">224 MB</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Cache</span>
                    <span className="text-white">142 MB</span>
                  </div>
                  <div className="pt-2 border-t border-gray-700 flex items-center justify-between text-sm font-medium">
                    <span className="text-gray-300">Total</span>
                    <span className="text-white">2.4 GB</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Purge automatique */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-4"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-orange-600/20 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <Label className="text-white font-medium">Purge pièces jointes anciennes</Label>
                <p className="text-sm text-gray-400 mt-1">
                  Supprimer automatiquement les médias anciens
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setPurgeDelay("30")}
                className={`w-full p-3 rounded-lg border transition-all ${
                  purgeDelay === "30"
                    ? "bg-orange-600/20 border-orange-500 text-orange-300"
                    : "bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">30 jours</span>
                  {purgeDelay === "30" && (
                    <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  )}
                </div>
                <p className="text-xs text-gray-400 text-left mt-1">
                  Purge agressive pour économiser l'espace
                </p>
              </button>

              <button
                onClick={() => setPurgeDelay("90")}
                className={`w-full p-3 rounded-lg border transition-all ${
                  purgeDelay === "90"
                    ? "bg-orange-600/20 border-orange-500 text-orange-300"
                    : "bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">90 jours</span>
                  {purgeDelay === "90" && (
                    <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  )}
                </div>
                <p className="text-xs text-gray-400 text-left mt-1">
                  Équilibre entre espace et historique (recommandé)
                </p>
              </button>

              <button
                onClick={() => setPurgeDelay("180")}
                className={`w-full p-3 rounded-lg border transition-all ${
                  purgeDelay === "180"
                    ? "bg-orange-600/20 border-orange-500 text-orange-300"
                    : "bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">180 jours</span>
                  {purgeDelay === "180" && (
                    <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  )}
                </div>
                <p className="text-xs text-gray-400 text-left mt-1">
                  Conservation longue durée
                </p>
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-600/10 border border-yellow-600/30 rounded-lg">
              <p className="text-xs text-yellow-400">
                ⚠️ Les médias supprimés ne pourront pas être récupérés. Les messages texte ne sont pas affectés.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}