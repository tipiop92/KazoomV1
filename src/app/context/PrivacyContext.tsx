import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PrivacySettings {
  linkPreviews: boolean; // Prévisualisation liens (OFF par défaut)
  readReceipts: boolean; // Accusés de lecture (OFF par défaut)
  typingIndicator: boolean; // Indicateur "en train d'écrire" (OFF par défaut)
  lastSeen: boolean; // Dernière activité / en ligne (OFF par défaut)
  keyboardProtection: boolean; // Protection clavier
  autoDeleteMessages: number; // 0 = Off, 1-8 = heures, 24 = 1j, 168 = 7j, 720 = 30j, 2160 = 90j
}

interface PrivacyContextType {
  privacySettings: PrivacySettings;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    linkPreviews: false,
    readReceipts: false,
    typingIndicator: false,
    lastSeen: false,
    keyboardProtection: false,
    autoDeleteMessages: 24, // 1 jour par défaut (obligatoire)
  });

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kazoom-privacy-settings');
    if (saved) {
      setPrivacySettings(JSON.parse(saved));
    }
  }, []);

  // Sauvegarder les paramètres
  const updatePrivacySettings = (newSettings: Partial<PrivacySettings>) => {
    const updated = { ...privacySettings, ...newSettings };
    setPrivacySettings(updated);
    localStorage.setItem('kazoom-privacy-settings', JSON.stringify(updated));
  };

  return (
    <PrivacyContext.Provider
      value={{
        privacySettings,
        updatePrivacySettings,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within PrivacyProvider');
  }
  return context;
}