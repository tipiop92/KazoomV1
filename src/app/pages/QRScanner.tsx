import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Flashlight, 
  FlashlightOff, 
  Keyboard, 
  Check, 
  AlertCircle,
  Camera,
  UserPlus
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

type ScanState = "scanning" | "success" | "error" | "permission_denied" | "manual_entry" | "user_found";

interface FoundUser {
  name: string;
  username: string;
  avatar: string;
  keyCode: string;
}

const mockFoundUser: FoundUser = {
  name: "Claire Moreau",
  username: "@claire_m",
  avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
  keyCode: "EA23YD",
};

export function QRScanner() {
  const navigate = useNavigate();
  const [flashOn, setFlashOn] = useState(false);
  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [manualCode, setManualCode] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);

  const handleSimulateScan = () => {
    setScanState("user_found");
    setFoundUser(mockFoundUser);
  };

  const handleSendRequest = () => {
    if (!foundUser) return;
    setScanState("success");
    setTimeout(() => {
      navigate("/contacts");
    }, 2000);
  };

  const handleManualVerify = () => {
    if (manualCode.length >= 10) {
      setScanState("success");
      setTimeout(() => {
        navigate("/contacts");
      }, 2000);
    } else {
      alert("Code invalide");
    }
  };

  const handleRequestPermission = () => {
    setScanState("scanning");
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {scanState === "scanning" && (
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-black/80 flex items-center justify-center">
            <div className="text-center px-6">
              <div className="relative w-64 h-64 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-3xl" />
                
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
                  animate={{
                    y: [0, 256, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-indigo-500 rounded-tl-3xl" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-indigo-500 rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-indigo-500 rounded-bl-3xl" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-3xl" />
              </div>

              <h2 className="text-xl font-bold text-white mb-2">
                Scanne le QR du contact
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Aligne le QR code dans le cadre pour vérifier l'identité
              </p>

              <Button
                onClick={handleSimulateScan}
                className="mb-3 bg-indigo-600 hover:bg-indigo-700"
              >
                Simuler scan (démo)
              </Button>
            </div>
          </div>

          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFlashOn(!flashOn)}
              className="text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm"
            >
              {flashOn ? (
                <FlashlightOff className="w-6 h-6" />
              ) : (
                <Flashlight className="w-6 h-6" />
              )}
            </Button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
            <Button
              onClick={() => setShowManualEntry(true)}
              className="w-full bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm text-white border border-gray-600"
            >
              <Keyboard className="w-5 h-5 mr-2" />
              Entrer un code
            </Button>
          </div>
        </div>
      )}

      {scanState === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-green-600/20 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="text-center px-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-16 h-16 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Vérification réussie !</h2>
            <p className="text-gray-300">L'identité du contact est confirmée</p>
          </div>
        </motion.div>
      )}

      {scanState === "error" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-red-600/20 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="text-center px-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertCircle className="w-16 h-16 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Échec de la vérification</h2>
            <p className="text-gray-300 mb-6">Le code QR ne correspond pas</p>
            <Button
              onClick={() => setScanState("scanning")}
              className="bg-white text-black hover:bg-gray-200"
            >
              Réessayer
            </Button>
          </div>
        </motion.div>
      )}

      {scanState === "permission_denied" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center"
        >
          <div className="text-center px-6 max-w-md">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Permission caméra requise</h2>
            <p className="text-gray-400 mb-6">
              Kazoom a besoin d'accéder à ta caméra pour scanner les QR codes de sécurité.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleRequestPermission}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Autoriser l'accès
              </Button>
              <Button
                onClick={() => setShowManualEntry(true)}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
              >
                Entrer un code manuellement
              </Button>
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
              >
                Annuler
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {scanState === "user_found" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="text-center px-6">
            <Avatar className="w-32 h-32 mx-auto mb-6">
              <AvatarImage src={foundUser?.avatar} />
              <AvatarFallback className="bg-gray-800 text-gray-400">
                {foundUser?.name[0]}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-white mb-2">{foundUser?.name}</h2>
            <p className="text-gray-300 mb-6">{foundUser?.username}</p>
            <div className="space-y-3">
              <Button
                onClick={handleSendRequest}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Envoyer une demande
              </Button>
              <Button
                onClick={() => setScanState("scanning")}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
              >
                Réessayer
              </Button>
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
              >
                Annuler
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showManualEntry && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowManualEntry(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-white mb-2">Entrer le code</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Entre l'empreinte de sécurité manuellement
                </p>

                <textarea
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="8451 2210 9A3C 7BF4 E892..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-indigo-500 resize-none mb-4"
                  rows={4}
                  autoFocus
                />

                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowManualEntry(false)}
                    variant="ghost"
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleManualVerify}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Vérifier
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}