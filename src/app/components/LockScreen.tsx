import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Shield, AlertTriangle, ChevronRight, Trash2 } from 'lucide-react';
import { useLock } from '../context/LockContext';
import { useNavigate } from 'react-router';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { KazoomBanner } from "./KazoomBanner";

const CORRECT_PASSWORD = "secure123";

export function LockScreen() {
  const { unlock, lockSettings } = useLock();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(() => {
    // Charger les tentatives depuis localStorage
    const saved = localStorage.getItem('lock_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isLocked, setIsLocked] = useState(() => {
    // Charger l'état de verrouillage depuis localStorage
    const saved = localStorage.getItem('lock_wiped');
    return saved === 'true';
  });
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [wipeMode, setWipeMode] = useState(false);
  const [swipeCount, setSwipeCount] = useState(0);
  const [dragX, setDragX] = useState(0);

  const MAX_ATTEMPTS = lockSettings.maxAttempts; // Utiliser les paramètres du contexte
  const remainingAttempts = MAX_ATTEMPTS - attempts;

  // Sauvegarder les tentatives dans localStorage
  useEffect(() => {
    localStorage.setItem('lock_attempts', attempts.toString());
  }, [attempts]);

  // Sauvegarder l'état de verrouillage dans localStorage
  useEffect(() => {
    localStorage.setItem('lock_wiped', isLocked.toString());
  }, [isLocked]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== FORMULAIRE SOUMIS ===');
    console.log('Mot de passe saisi:', password);
    console.log('Mot de passe attendu:', CORRECT_PASSWORD);
    console.log('Comparaison:', password === CORRECT_PASSWORD);
    console.log('isLocked:', isLocked);
    console.log('Tentatives actuelles:', attempts);
    
    if (isLocked) {
      console.log('⛔ Appareil verrouillé, tentative bloquée');
      return;
    }

    if (password.trim() === CORRECT_PASSWORD) {
      console.log('✅ Mot de passe correct !');
      // Succès - Déverrouiller l'application
      setError('');
      setPassword('');
      setAttempts(0);
      localStorage.removeItem('lock_attempts');
      localStorage.removeItem('lock_wiped');
      console.log('Appel de unlock()...');
      unlock(); // Déverrouille et permet l'accès à l'app
      navigate('/'); // Redirige vers la page d'accueil
    } else {
      console.log('❌ Mot de passe incorrect');
      // Échec
      const newAttempts = attempts + 1;
      console.log('Nouvelles tentatives:', newAttempts, '/', MAX_ATTEMPTS);
      setAttempts(newAttempts);
      setPassword('');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      if (newAttempts >= MAX_ATTEMPTS) {
        // Wipe de l'appareil
        console.log('🔥 WIPE - Trop de tentatives');
        setIsLocked(true);
        setError('APPAREIL VERROUILLÉ - Toutes les données ont été effacées');
        // Effacer toutes les données de l'app
        localStorage.clear();
        localStorage.setItem('lock_wiped', 'true');
      } else {
        setError(`Mot de passe incorrect. ${MAX_ATTEMPTS - newAttempts} tentative(s) restante(s)`);
      }
    }
  };

  const handleWipeManual = () => {
    console.log('🔥 WIPE MANUEL - Effacement des données');
    setIsLocked(true);
    // Effacer toutes les données de l'app
    localStorage.clear();
    localStorage.setItem('lock_wiped', 'true');
  };

  const handleSwipeComplete = () => {
    if (swipeCount === 0) {
      setSwipeCount(1);
      setDragX(0);
    } else if (swipeCount === 1) {
      // 2ème swipe complété - Lancer le wipe
      handleWipeManual();
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-dvh overflow-y-auto py-3 px-4 bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-500 mb-3">APPAREIL VERROUILLÉ</h1>
          <p className="text-gray-400 text-sm mb-6">
            Trop de tentatives incorrectes.<br />
            Toutes les données ont été effacées.
          </p>
          
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => {
              // Effacer complètement le localStorage
              localStorage.clear();
              // Recharger complètement l'application
              window.location.reload();
            }}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            Redémarrer l'application
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-svh overflow-y-auto pt-[calc(env(safe-area-inset-top)+28px)] pb-[calc(env(safe-area-inset-bottom)+16px)] px-4 bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[420px]"
      >
        {/* Logo Banner — ~5mm du haut (pt-5), espace minimal avant sous-titre (gap-1) */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-2 flex flex-col items-center gap-1"
        >
          <div className="-translate-y-5 flex flex-col items-center gap-1">
            <div className="pointer-events-none select-none" style={{ WebkitTapHighlightColor: 'transparent' }}>
              <KazoomBanner variant="hero" className="max-h-[140px] max-w-[720px]" />
            </div>
            <div className="flex items-center justify-center gap-2 text-indigo-400">
              <Shield className="w-5 h-5" />
              <p className="text-sm font-semibold">Messagerie Sécurisée</p>
            </div>
          </div>
        </motion.div>

        {/* Lock Screen Card — padding et espacements réduits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-4 shadow-2xl"
        >
          <div className="flex items-center justify-center mb-2">
            <div className="bg-indigo-600/20 p-3 rounded-full">
              <Lock className="w-6 h-6 text-indigo-400" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white text-center mb-1">
            Déverrouillage
          </h2>
          <p className="text-gray-400 text-sm text-center mb-2">
            Entrez votre mot de passe pour accéder
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              animate={isShaking ? {
                x: [0, -10, 10, -10, 10, 0],
              } : {}}
              transition={{ duration: 0.4 }}
            >
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 h-12 text-center text-lg"
                autoFocus
                disabled={isLocked}
              />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-center"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              disabled={isLocked || !password}
            >
              Déverrouiller
            </Button>
          </form>

          {/* Tentatives restantes */}
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">Tentatives restantes</span>
              <div className="flex gap-1">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className={`w-2 h-2 rounded-full ${
                      i < remainingAttempts
                        ? 'bg-indigo-500'
                        : 'bg-red-500'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-1 text-center">
              {remainingAttempts === MAX_ATTEMPTS 
                ? `${MAX_ATTEMPTS} tentatives avant l'effacement des données`
                : remainingAttempts > 0
                ? `${remainingAttempts} tentative${remainingAttempts > 1 ? 's' : ''} avant l'effacement`
                : 'Effacement des données en cours...'}
            </p>

            {/* Plateau Wipe — bouton pleine largeur, slider/confirmation dans le même plateau */}
            <div className="mt-5 rounded-xl border border-red-600/30 bg-red-950/10 p-3">
              <AnimatePresence mode="wait">
                {!wipeMode ? (
                  <motion.div
                    key="wipe-row"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <motion.button
                      type="button"
                      onClick={() => {
                        setWipeMode(true);
                        setSwipeCount(0);
                        setDragX(0);
                      }}
                      className="flex items-center justify-center gap-2 w-full h-12 bg-red-600/20 border border-red-600/50 hover:bg-red-600/30 text-red-300 text-sm rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                      Wipe
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="wipe-swipe"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="space-y-2"
                  >
                    <p className="text-red-400 text-xs font-semibold text-center">
                      {swipeCount === 0 ? 'Glissez pour confirmer (1/2)' : 'Glissez à nouveau (2/2)'}
                    </p>
                    <div className="relative bg-gray-800/50 border border-red-600/50 rounded-full h-10 overflow-hidden">
                      <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0}
                        dragMomentum={false}
                        onDrag={(_, info) => {
                          const maxDrag = 250;
                          const newX = Math.max(0, Math.min(info.offset.x, maxDrag));
                          setDragX(newX);
                        }}
                        onDragEnd={(_, info) => {
                          const threshold = 200;
                          if (info.offset.x > threshold) {
                            handleSwipeComplete();
                          } else {
                            setDragX(0);
                          }
                        }}
                        animate={{ x: dragX }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="absolute left-0 top-0 h-10 w-10 bg-gradient-to-r from-red-600 to-red-700 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center shadow-lg"
                        style={{ touchAction: 'none' }}
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </motion.div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-red-400 text-xs font-medium">Glissez pour effacer</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setWipeMode(false);
                        setSwipeCount(0);
                        setDragX(0);
                      }}
                      className="w-full text-gray-400 text-xs hover:text-white transition-colors"
                    >
                      Annuler
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}