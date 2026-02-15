import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useVaultAuth } from "../context/VaultAuthContext";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  skipIfUnlocked?: boolean;
  alwaysAsk?: boolean; // Force la demande du PIN même si déjà déverrouillé
}

export function PinModal({ isOpen, onClose, onSuccess, title = "Déverrouiller Coffre-fort", skipIfUnlocked = false, alwaysAsk = false }: PinModalProps) {
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const { isVaultUnlocked, unlockVault } = useVaultAuth();

  console.log('[PinModal] Rendu:', { isOpen, skipIfUnlocked, alwaysAsk, isVaultUnlocked });

  useEffect(() => {
    console.log('[PinModal] useEffect déclenché:', { isOpen, skipIfUnlocked, alwaysAsk, isVaultUnlocked });
    if (isOpen) {
      // Si skipIfUnlocked est true et que la vault est déverrouillée, on passe directement
      // SAUF si alwaysAsk est true (force la demande du PIN)
      if (skipIfUnlocked && isVaultUnlocked && !alwaysAsk) {
        console.log('[PinModal] Court-circuit: vault déjà déverrouillée, appel de onSuccess()');
        onSuccess();
        return;
      }
      console.log('[PinModal] Modal affiché, reset du PIN');
      setPin("");
      setPinError(false);
    }
  }, [isOpen, skipIfUnlocked, isVaultUnlocked, onSuccess, alwaysAsk]);

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setPinError(false);

      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin === "1234") {
            unlockVault(); // On déverrouille la vault
            onSuccess();
          } else {
            setPinError(true);
            setPin("");
          }
        }, 100);
      }
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
    setPinError(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex justify-center gap-3 mb-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full transition-all ${
                        pin.length > i
                          ? pinError
                            ? "bg-red-500"
                            : "bg-indigo-500"
                          : "bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                {pinError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 text-center mt-2"
                  >
                    PIN incorrect
                  </motion.p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handlePinInput(String(digit))}
                    className="h-16 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-white text-2xl font-semibold transition-colors active:scale-95"
                  >
                    {digit}
                  </button>
                ))}
                <div />
                <button
                  onClick={() => handlePinInput("0")}
                  className="h-16 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-white text-2xl font-semibold transition-colors active:scale-95"
                >
                  0
                </button>
                <button
                  onClick={handlePinDelete}
                  className="h-16 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-white text-xl font-semibold transition-colors active:scale-95"
                >
                  ←
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Code de test : 1234
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}