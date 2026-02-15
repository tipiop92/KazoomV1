import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  QrCode, 
  Check,
  Loader2,
  AlertCircle,
  UserPlus
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Link } from "react-router";

type Mode = "code" | "qr";
type ValidationState = "idle" | "validating" | "valid" | "invalid" | "not_found";

interface FoundUser {
  name: string;
  username: string;
  avatar: string;
  keyCode: string;
}

const mockUsers: Record<string, FoundUser> = {
  "EA23YD": {
    name: "Claire Moreau",
    username: "@claire_m",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
    keyCode: "EA23YD",
  },
  "ABC123": {
    name: "Antoine Blanc",
    username: "@antoine_b",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    keyCode: "ABC123",
  },
};

export function AddContact() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("code");
  const [keyCode, setKeyCode] = useState("");
  const [validationState, setValidationState] = useState<ValidationState>("idle");
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);

  useEffect(() => {
    if (keyCode.length === 0) {
      setValidationState("idle");
      setFoundUser(null);
      return;
    }

    if (keyCode.length < 6 || keyCode.length > 10 || !/^[A-Z0-9]+$/.test(keyCode)) {
      setValidationState("invalid");
      setFoundUser(null);
      return;
    }

    setValidationState("validating");
    const timer = setTimeout(() => {
      if (mockUsers[keyCode]) {
        setValidationState("valid");
        setFoundUser(mockUsers[keyCode]);
      } else {
        setValidationState("not_found");
        setFoundUser(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [keyCode]);

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setKeyCode(text.toUpperCase().trim());
  };

  const handleSendRequest = () => {
    if (!foundUser) return;
    alert(`Demande envoyée à ${foundUser.username} !`);
    navigate("/contacts");
  };

  const getBorderClass = () => {
    switch (validationState) {
      case "idle":
        return "border-gray-700";
      case "validating":
        return "border-yellow-500";
      case "valid":
        return "border-green-500";
      case "invalid":
      case "not_found":
        return "border-red-500";
      default:
        return "border-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-lg border-b border-gray-800">
          <div className="flex items-center gap-3 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/contacts")}
              className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Ajouter un contact</h1>
            </div>
          </div>

          <div className="px-4 pb-4 flex gap-2">
            <button
              onClick={() => setMode("code")}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
                mode === "code"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:text-white"
              }`}
            >
              Code clé
            </button>
            <button
              onClick={() => setMode("qr")}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors ${
                mode === "qr"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800/50 text-gray-400 hover:text-white"
              }`}
            >
              Scanner QR
            </button>
          </div>
        </div>

        <div className="p-4">
          {mode === "code" ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Code clé
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="EA23YD"
                      value={keyCode}
                      onChange={(e) => setKeyCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                      className={`bg-gray-900/50 text-white font-mono text-lg uppercase tracking-wider pr-24 transition-colors ${getBorderClass()}`}
                      maxLength={10}
                    />
                    <button
                      onClick={handlePaste}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md transition-colors"
                    >
                      Coller
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {validationState === "validating" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 mt-2 text-yellow-400 text-sm"
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Recherche…</span>
                      </motion.div>
                    )}

                    {validationState === "invalid" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 mt-2 text-red-400 text-sm"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Format incorrect (6-10 caractères alphanumériques)</span>
                      </motion.div>
                    )}

                    {validationState === "not_found" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 mt-2 text-red-400 text-sm"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Clé invalide - Aucun utilisateur pour cette clé</span>
                      </motion.div>
                    )}

                    {validationState === "valid" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 mt-2 text-green-400 text-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>Utilisateur trouvé</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {foundUser && validationState === "valid" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border-2 border-green-500/40 rounded-xl p-4"
                    >
                      <h3 className="text-sm font-semibold text-green-400 mb-3">Résultat de recherche</h3>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="w-16 h-16 border-2 border-green-500/40">
                          <AvatarImage src={foundUser.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold text-lg">
                            {foundUser.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-lg">{foundUser.name}</h4>
                          <p className="text-gray-400 text-sm">{foundUser.username}</p>
                          <p className="text-xs text-gray-500 font-mono mt-1">ID: {foundUser.keyCode}</p>
                        </div>

                        <div className="bg-orange-600/20 border border-orange-600/40 px-3 py-1 rounded-full">
                          <span className="text-xs text-orange-400 font-medium">Non lié</span>
                        </div>
                      </div>

                      <Button
                        onClick={handleSendRequest}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Envoyer demande de liaison
                      </Button>

                      <p className="text-xs text-gray-400 text-center mt-3">
                        Le contact devra accepter avant de pouvoir discuter.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {!foundUser && (
                <div className="bg-gray-900/30 border border-gray-700 rounded-xl p-4">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    💡 Entre le code clé de ton contact ou{" "}
                    <button
                      onClick={() => setMode("qr")}
                      className="text-indigo-400 hover:text-indigo-300 underline"
                    >
                      scanne son QR code
                    </button>
                    {" "}pour l'ajouter.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-6 text-center">
                <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Scanner un QR KAZOOM</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Demande à ton contact de te montrer son QR code
                </p>
                <Link to="/contacts/scan">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    <QrCode className="w-4 h-4 mr-2" />
                    Ouvrir le scanner
                  </Button>
                </Link>
              </div>

              <div className="bg-gray-900/30 border border-gray-700 rounded-xl p-4">
                <p className="text-sm text-gray-400 leading-relaxed">
                  💡 Tu peux aussi{" "}
                  <button
                    onClick={() => setMode("code")}
                    className="text-indigo-400 hover:text-indigo-300 underline"
                  >
                    entrer un code clé
                  </button>
                  {" "}manuellement.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}