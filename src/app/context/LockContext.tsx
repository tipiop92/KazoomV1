import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const LOCK_STORAGE_KEY = 'kazoom-app-locked';
const LAST_UNLOCKED_KEY = 'kazoom-lock-lastUnlockedAt';

interface LockSettings {
  // Section A: Verrouillage de l'app
  lockEnabled: boolean; // Activer/désactiver le verrouillage
  hasPinCode: boolean; // Si un code PIN est configuré
  lockOnEveryOpen: boolean; // Verrouiller quand app fermée
  autoLockTimeout: number; // en minutes (0 = immédiat, -1 = désactivé)
  lockOnBackground: boolean; // Verrouiller quand passe en arrière-plan
  lockOnScreenLock: boolean; // Verrouiller quand écran se verrouille
  hideInRecents: boolean; // Masquer contenu dans apps récentes
  
  // Section B: Anti-usurpation
  strictMode: boolean; // Mode strict (bloque si UNVERIFIED ou KEY_CHANGED)
  freezeOnKeyChange: boolean; // Freeze on key change
  alertOnKeyChange: boolean; // Alerte changement de clé (ON par défaut)
  requireVerificationFirst: boolean; // Exiger vérification avant premier message
  
  // Section C: Effacement / anti-bruteforce
  maxAttempts: number; // nombre de tentatives avant effacement (5, 10, ou 15)
  progressiveDelay: boolean; // Délai progressif après échecs
  warnBeforeWipe: boolean; // Avertissement à 1 essai du wipe
}

interface LockContextType {
  isLocked: boolean;
  lastUnlockedAt: string | undefined;
  lockSettings: LockSettings;
  unlock: () => void;
  lock: () => void;
  updateLockSettings: (settings: Partial<LockSettings>) => void;
}

const LockContext = createContext<LockContextType | undefined>(undefined);

function nowIso(): string {
  return new Date().toISOString();
}

export function LockProvider({ children }: { children: ReactNode }) {
  // Au refresh on revient toujours verrouillé (V1).
  const [isLocked, setIsLocked] = useState(true);
  const [lastUnlockedAt, setLastUnlockedAt] = useState<string | undefined>(() => {
    try {
      const s = typeof localStorage !== 'undefined' ? localStorage.getItem(LAST_UNLOCKED_KEY) : null;
      return s || undefined;
    } catch {
      return undefined;
    }
  });
  const [lockSettings, setLockSettings] = useState<LockSettings>({
    // Section A
    lockEnabled: true,
    hasPinCode: true,
    lockOnEveryOpen: true,
    autoLockTimeout: 1,
    lockOnBackground: false,
    lockOnScreenLock: false,
    hideInRecents: false,
    
    // Section B
    strictMode: false,
    freezeOnKeyChange: false,
    alertOnKeyChange: true,
    requireVerificationFirst: false,
    
    // Section C
    maxAttempts: 5,
    progressiveDelay: true,
    warnBeforeWipe: true,
  });
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kazoom-lock-settings');
    if (saved) {
      setLockSettings(JSON.parse(saved));
    }
  }, []);

  // Sauvegarder les paramètres
  const updateLockSettings = (newSettings: Partial<LockSettings>) => {
    const updated = { ...lockSettings, ...newSettings };
    
    // Si mode strict activé, activer automatiquement freezeOnKeyChange
    if (newSettings.strictMode === true) {
      updated.freezeOnKeyChange = true;
    }
    
    setLockSettings(updated);
    localStorage.setItem('kazoom-lock-settings', JSON.stringify(updated));
  };

  // Gérer le verrouillage automatique
  useEffect(() => {
    if (!lockSettings.lockEnabled || lockSettings.autoLockTimeout === -1 || isLocked) return;
    
    // Si autoLockTimeout est 0 (immédiat), verrouiller immédiatement après navigation
    if (lockSettings.autoLockTimeout === 0) {
      // Ne rien faire ici, c'est géré par l'événement de changement de page
      return;
    }

    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = (now - lastActivity) / 1000 / 60; // en minutes

      if (inactiveTime >= lockSettings.autoLockTimeout) {
        setIsLocked(true);
      }
    };

    const interval = setInterval(checkInactivity, 10000);
    return () => clearInterval(interval);
  }, [lockSettings.lockEnabled, lockSettings.autoLockTimeout, lastActivity, isLocked]);

  // Détecter l'activité utilisateur
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());

    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('touchstart', updateActivity);

    return () => {
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
    };
  }, []);

  const unlock = () => {
    try {
      setIsLocked(false);
      const at = nowIso();
      setLastUnlockedAt(at);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCK_STORAGE_KEY, 'false');
        localStorage.setItem(LAST_UNLOCKED_KEY, at);
      }
    } catch {
      // ignore
    }
  };

  const lock = () => {
    try {
      if (lockSettings.lockEnabled) {
        setIsLocked(true);
        setLastUnlockedAt(undefined);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(LOCK_STORAGE_KEY, 'true');
          localStorage.removeItem(LAST_UNLOCKED_KEY);
        }
      }
    } catch {
      // ignore
    }
  };

  return (
    <LockContext.Provider
      value={{
        isLocked,
        lastUnlockedAt,
        lockSettings,
        unlock,
        lock,
        updateLockSettings,
      }}
    >
      {children}
    </LockContext.Provider>
  );
}

export function useLock() {
  const context = useContext(LockContext);
  if (!context) {
    throw new Error('useLock must be used within LockProvider');
  }
  return context;
}