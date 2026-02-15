import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Lock, 
  Eye, 
  EyeOff,
  Shield,
  HardDrive,
  Trash2,
  ChevronRight,
  MoreVertical,
  HelpCircle,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  Download,
  LockKeyhole
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { useVaultAuth } from "../../context/VaultAuthContext";

interface StorageInfo {
  vault: number;
  cache: number;
  incomplete: number;
}

const mockStorageInfo: StorageInfo = {
  vault: 1024 * 1024 * 250,
  cache: 1024 * 1024 * 120,
  incomplete: 1024 * 1024 * 15,
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 10) / 10 + " " + sizes[i];
}

export function VaultSettings() {
  const navigate = useNavigate();
  const { lockVault } = useVaultAuth();
  
  const [storageInfo, setStorageInfo] = useState<StorageInfo>(mockStorageInfo);
  
  const [vaultPinEnabled, setVaultPinEnabled] = useState(false);
  const [lockOnExit, setLockOnExit] = useState(true);
  const [lockOnBackground, setLockOnBackground] = useState(true);
  const [lockOnScreenOff, setLockOnScreenOff] = useState(false);
  const [lockTimeout, setLockTimeout] = useState<"immediate" | "30s" | "1min" | "5min" | "15min">("1min");
  
  const [blockScreenshots, setBlockScreenshots] = useState(true);
  const [hideInRecents, setHideInRecents] = useState(true);
  const [hideThumbnails, setHideThumbnails] = useState(false);
  
  const [autoPurgeCache, setAutoPurgeCache] = useState<"off" | "7d" | "30d" | "90d">("30d");
  const [cacheLimit, setCacheLimit] = useState<100 | 500 | 1000 | -1>(500);
  const [downloadKeeps, setDownloadKeeps] = useState(true);
  
  const [showMenu, setShowMenu] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinChange, setShowPinChange] = useState(false);
  const [showLockTimeoutPicker, setShowLockTimeoutPicker] = useState(false);
  const [showCachePurgePicker, setShowCachePurgePicker] = useState(false);
  
  const [pinStep, setPinStep] = useState<"create" | "confirm">("create");
  const [changePinStep, setChangePinStep] = useState<"old" | "new" | "confirm">("old");
  const [pinInput, setPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [oldPinInput, setOldPinInput] = useState("");
  const [showPin, setShowPin] = useState(false);

  const handleVaultPinToggle = () => {
    if (!vaultPinEnabled) {
      setShowPinSetup(true);
      setPinStep("create");
      setPinInput("");
      setConfirmPinInput("");
    } else {
      if (confirm("Désactiver le PIN du Coffre-fort ?")) {
        setVaultPinEnabled(false);
      }
    }
  };

  const handlePinSetupSubmit = () => {
    if (pinStep === "create") {
      if (pinInput.length < 4) {
        alert("Le PIN doit contenir au moins 4 chiffres");
        return;
      }
      setConfirmPinInput("");
      setPinStep("confirm");
    } else {
      if (pinInput !== confirmPinInput) {
        alert("Les PINs ne correspondent pas");
        setConfirmPinInput("");
        return;
      }
      setVaultPinEnabled(true);
      setShowPinSetup(false);
      setPinInput("");
      setConfirmPinInput("");
      setPinStep("create");
    }
  };

  const handleChangePinSubmit = () => {
    if (changePinStep === "old") {
      if (oldPinInput.length < 4) {
        alert("PIN incorrect");
        return;
      }
      setPinInput("");
      setChangePinStep("new");
    } else if (changePinStep === "new") {
      if (pinInput.length < 4) {
        alert("Le nouveau PIN doit contenir au moins 4 chiffres");
        return;
      }
      setConfirmPinInput("");
      setChangePinStep("confirm");
    } else {
      if (pinInput !== confirmPinInput) {
        alert("Les PINs ne correspondent pas");
        setConfirmPinInput("");
        return;
      }
      setShowPinChange(false);
      setOldPinInput("");
      setPinInput("");
      setConfirmPinInput("");
      setChangePinStep("old");
      alert("PIN modifié avec succès !");
    }
  };

  const handleCleanCache = () => {
    if (confirm("Vider le cache maintenant ? Les aperçus temporaires seront supprimés.")) {
      setStorageInfo(prev => ({ ...prev, cache: 0 }));
    }
  };

  const handleCleanIncomplete = () => {
    if (confirm("Nettoyer les téléchargements incomplets ?")) {
      setStorageInfo(prev => ({ ...prev, incomplete: 0 }));
    }
  };

  const lockTimeoutOptions = [
    { value: "immediate", label: "Immédiat" },
    { value: "30s", label: "30 secondes" },
    { value: "1min", label: "1 minute" },
    { value: "5min", label: "5 minutes" },
    { value: "15min", label: "15 minutes" },
  ] as const;

  const cachePurgeOptions = [
    { value: "off", label: "Désactivé" },
    { value: "7d", label: "7 jours" },
    { value: "30d", label: "30 jours" },
    { value: "90d", label: "90 jours" },
  ] as const;

  const cacheLimitOptions = [
    { value: 100, label: "100 MB" },
    { value: 500, label: "500 MB" },
    { value: 1000, label: "1 GB" },
    { value: -1, label: "Illimité" },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-10 bg-gradient-to-b from-black to-transparent backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/vault")}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Réglages du Coffre-fort</h1>
              <p className="text-sm text-gray-400">Sécurité et confidentialité</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(true)}
              className="text-gray-400 hover:text-white"
            >
              <MoreVertical className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              Verrouillage du Coffre-fort
            </h2>

            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl divide-y divide-gray-700">
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-white">PIN du Coffre-fort</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Exige un code pour ouvrir le Coffre-fort, même si l'app est déverrouillée.
                  </p>
                </div>
                <button
                  onClick={handleVaultPinToggle}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-3 ${
                    vaultPinEnabled ? "bg-indigo-600" : "bg-gray-600"
                  }`}
                >
                  <motion.div
                    animate={{ x: vaultPinEnabled ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>

              {vaultPinEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setShowPinChange(true);
                      setChangePinStep("old");
                      setOldPinInput("");
                      setPinInput("");
                      setConfirmPinInput("");
                    }}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 active:bg-gray-700/50 transition-colors"
                  >
                    <h3 className="font-medium text-white">Changer le PIN</h3>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </motion.div>
              )}

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">Durée avant verrouillage</h3>
                  <button
                    onClick={() => setShowLockTimeoutPicker(true)}
                    className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {lockTimeoutOptions.find(o => o.value === lockTimeout)?.label}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Se verrouille après inactivité dans le Coffre-fort.
                </p>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-white">Verrouiller à la fermeture</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Se verrouille dès que tu quittes le Coffre-fort.
                  </p>
                </div>
                <button
                  onClick={() => setLockOnExit(!lockOnExit)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-3 ${
                    lockOnExit ? "bg-indigo-600" : "bg-gray-600"
                  }`}
                >
                  <motion.div
                    animate={{ x: lockOnExit ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-white">Verrouiller en arrière-plan</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Quand l'app passe en arrière-plan.
                  </p>
                </div>
                <button
                  onClick={() => setLockOnBackground(!lockOnBackground)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-3 ${
                    lockOnBackground ? "bg-indigo-600" : "bg-gray-600"
                  }`}
                >
                  <motion.div
                    animate={{ x: lockOnBackground ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-white">Verrouiller à l'extinction de l'écran</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Quand l'écran s'éteint.
                  </p>
                </div>
                <button
                  onClick={() => setLockOnScreenOff(!lockOnScreenOff)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-3 ${
                    lockOnScreenOff ? "bg-indigo-600" : "bg-gray-600"
                  }`}
                >
                  <motion.div
                    animate={{ x: lockOnScreenOff ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Confidentialité
            </h2>

            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl divide-y divide-gray-700">
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-white">Bloquer captures d'écran</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Empêche les screenshots et l'aperçu dans l'écran des apps récentes.
                  </p>
                </div>
                <button
                  onClick={() => setBlockScreenshots(!blockScreenshots)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-3 ${
                    blockScreenshots ? "bg-purple-600" : "bg-gray-600"
                  }`}
                >
                  <motion.div
                    animate={{ x: blockScreenshots ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-white">Masquer dans aperçu apps récentes</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Affiche un écran vide dans le sélecteur d'apps.
                  </p>
                </div>
                <button
                  onClick={() => setHideInRecents(!hideInRecents)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-3 ${
                    hideInRecents ? "bg-purple-600" : "bg-gray-600"
                  }`}
                >
                  <motion.div
                    animate={{ x: hideInRecents ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-white">Masquer miniatures des médias</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Affiche des icônes à la place des thumbnails dans le Coffre.
                  </p>
                </div>
                <button
                  onClick={() => setHideThumbnails(!hideThumbnails)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-3 ${
                    hideThumbnails ? "bg-purple-600" : "bg-gray-600"
                  }`}
                >
                  <motion.div
                    animate={{ x: hideThumbnails ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-green-400" />
              Stockage & Cache
            </h2>

            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-lg border border-green-500/30 rounded-xl p-4 mb-3">
              <h3 className="text-sm font-semibold text-white mb-3">Utilisation du stockage</h3>
              
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-gray-800/30 rounded-lg p-2">
                  <div className="text-gray-400 text-xs">Coffre-fort</div>
                  <div className="text-white font-medium text-sm">{formatBytes(storageInfo.vault)}</div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-2">
                  <div className="text-gray-400 text-xs">Cache</div>
                  <div className="text-white font-medium text-sm">{formatBytes(storageInfo.cache)}</div>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-2">
                  <div className="text-gray-400 text-xs">Incomplets</div>
                  <div className="text-white font-medium text-sm">{formatBytes(storageInfo.incomplete)}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCleanCache}
                  variant="ghost"
                  size="sm"
                  className="flex-1 bg-gray-800/50 hover:bg-gray-700/50 text-white text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Vider le cache
                </Button>
                <Button
                  onClick={handleCleanIncomplete}
                  variant="ghost"
                  size="sm"
                  className="flex-1 bg-gray-800/50 hover:bg-gray-700/50 text-white text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Nettoyer incomplets
                </Button>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl divide-y divide-gray-700">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">Purge automatique du cache</h3>
                  <button
                    onClick={() => setShowCachePurgePicker(true)}
                    className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
                  >
                    {cachePurgeOptions.find(o => o.value === autoPurgeCache)?.label}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Supprime automatiquement les fichiers cache après une période.
                </p>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white">Limiter le cache média</h3>
                  <span className="text-sm text-green-400">
                    {cacheLimit === -1 ? "Illimité" : formatBytes(cacheLimit * 1024 * 1024)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {cacheLimitOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setCacheLimit(option.value as any)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                        cacheLimit === option.value
                          ? "bg-green-600 text-white"
                          : "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  Limite maximale pour les aperçus et miniatures en cache.
                </p>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-white">Télécharger = conserver</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Un média téléchargé est stocké dans le Coffre-fort.
                  </p>
                </div>
                <button
                  onClick={() => setDownloadKeeps(!downloadKeeps)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-3 ${
                    downloadKeeps ? "bg-green-600" : "bg-gray-600"
                  }`}
                >
                  <motion.div
                    animate={{ x: downloadKeeps ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-gray-800/30 border border-gray-700 rounded-lg"
          >
            <p className="text-xs text-gray-400 leading-relaxed">
              🔐 <strong className="text-white">Sécurité maximale:</strong> Toutes les données du Coffre-fort sont chiffrées localement sur ton appareil. Kazoom n'a jamais accès à tes fichiers.
            </p>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showPinSetup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPinSetup(false);
                setPinInput("");
                setConfirmPinInput("");
                setPinStep("create");
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold text-white mb-2">
                  {pinStep === "create" ? "Créer un PIN" : "Confirmer le PIN"}
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  {pinStep === "create" 
                    ? "Entre un code PIN pour protéger le Coffre-fort"
                    : "Entre à nouveau ton PIN pour confirmer"
                  }
                </p>

                <div className="mb-6">
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      value={pinStep === "create" ? pinInput : confirmPinInput}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (pinStep === "create") {
                          setPinInput(value);
                        } else {
                          setConfirmPinInput(value);
                        }
                      }}
                      placeholder="Entrer le PIN"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-indigo-500"
                      maxLength={6}
                      autoFocus
                    />
                    <button
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowPinSetup(false);
                      setPinInput("");
                      setConfirmPinInput("");
                      setPinStep("create");
                    }}
                    variant="ghost"
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handlePinSetupSubmit}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {pinStep === "create" ? "Suivant" : "Confirmer"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPinChange && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPinChange(false);
                setOldPinInput("");
                setPinInput("");
                setConfirmPinInput("");
                setChangePinStep("old");
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold text-white mb-2">
                  {changePinStep === "old" ? "Ancien PIN" : changePinStep === "new" ? "Nouveau PIN" : "Confirmer le nouveau PIN"}
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  {changePinStep === "old" 
                    ? "Entre ton PIN actuel"
                    : changePinStep === "new"
                    ? "Entre ton nouveau PIN"
                    : "Confirme ton nouveau PIN"
                  }
                </p>

                <div className="mb-6">
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      value={changePinStep === "old" ? oldPinInput : changePinStep === "new" ? pinInput : confirmPinInput}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (changePinStep === "old") {
                          setOldPinInput(value);
                        } else if (changePinStep === "new") {
                          setPinInput(value);
                        } else {
                          setConfirmPinInput(value);
                        }
                      }}
                      placeholder="Entrer le PIN"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-indigo-500"
                      maxLength={6}
                      autoFocus
                    />
                    <button
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowPinChange(false);
                      setOldPinInput("");
                      setPinInput("");
                      setConfirmPinInput("");
                      setChangePinStep("old");
                    }}
                    variant="ghost"
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleChangePinSubmit}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {changePinStep === "confirm" ? "Confirmer" : "Suivant"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLockTimeoutPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLockTimeoutPicker(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black border-t border-gray-700 rounded-t-3xl z-50 safe-area-bottom"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>
              <div className="p-4 pb-6">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">Durée avant verrouillage</h3>
                <div className="space-y-2">
                  {lockTimeoutOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setLockTimeout(option.value);
                        setShowLockTimeoutPicker(false);
                      }}
                      className={`w-full p-4 rounded-xl transition-colors ${
                        lockTimeout === option.value
                          ? "bg-indigo-600/20 border border-indigo-600/40"
                          : "bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50"
                      }`}
                    >
                      <div className="font-semibold text-white">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCachePurgePicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCachePurgePicker(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black border-t border-gray-700 rounded-t-3xl z-50 safe-area-bottom"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>
              <div className="p-4 pb-6">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">Purge automatique du cache</h3>
                <div className="space-y-2">
                  {cachePurgeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setAutoPurgeCache(option.value);
                        setShowCachePurgePicker(false);
                      }}
                      className={`w-full p-4 rounded-xl transition-colors ${
                        autoPurgeCache === option.value
                          ? "bg-green-600/20 border border-green-600/40"
                          : "bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50"
                      }`}
                    >
                      <div className="font-semibold text-white">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black border-t border-gray-700 rounded-t-3xl z-50 safe-area-bottom"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>
              <div className="p-4 space-y-2 pb-6">
                <button
                  onClick={() => {
                    lockVault();
                    setShowMenu(false);
                    navigate("/vault");
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-indigo-600/10 border border-indigo-600/30 rounded-xl active:bg-indigo-600/20 transition-colors"
                >
                  <LockKeyhole className="w-6 h-6 text-indigo-400" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-indigo-400">Verrouiller maintenant</div>
                    <div className="text-sm text-indigo-400/70">Retourner à l'écran de déverrouillage</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    alert("Aide - Documentation à venir");
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl active:bg-gray-700/50 transition-colors"
                >
                  <HelpCircle className="w-6 h-6 text-blue-400" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-white">Aide</div>
                    <div className="text-sm text-gray-400">Documentation et support</div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    if (confirm("Réinitialiser tous les paramètres aux valeurs par défaut ?")) {
                      setVaultPinEnabled(false);
                      setLockOnExit(true);
                      setLockOnBackground(true);
                      setLockOnScreenOff(false);
                      setLockTimeout("1min");
                      setBlockScreenshots(true);
                      setHideInRecents(true);
                      setHideThumbnails(false);
                      setAutoPurgeCache("30d");
                      setCacheLimit(500);
                      setDownloadKeeps(true);
                      setShowMenu(false);
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-orange-600/10 border border-orange-600/30 rounded-xl active:bg-orange-600/20 transition-colors"
                >
                  <RefreshCw className="w-6 h-6 text-orange-400" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-orange-400">Réinitialiser paramètres</div>
                    <div className="text-sm text-orange-400/70">Retour aux valeurs par défaut</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}