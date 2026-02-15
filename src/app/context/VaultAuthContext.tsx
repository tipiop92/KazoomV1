import { createContext, useContext, useState, useCallback, ReactNode } from "react";

function nowIso(): string {
  return new Date().toISOString();
}

interface VaultAuthContextType {
  isVaultUnlocked: boolean;
  lastUnlockedAt: string | undefined;
  unlockVault: () => void;
  lockVault: () => void;
}

const VaultAuthContext = createContext<VaultAuthContextType | undefined>(undefined);

export function VaultAuthProvider({ children }: { children: ReactNode }) {
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [lastUnlockedAt, setLastUnlockedAt] = useState<string | undefined>(undefined);

  const unlockVault = useCallback(() => {
    setIsVaultUnlocked(true);
    setLastUnlockedAt(nowIso());
  }, []);

  const lockVault = useCallback(() => {
    setIsVaultUnlocked(false);
    setLastUnlockedAt(undefined);
  }, []);

  return (
    <VaultAuthContext.Provider value={{ isVaultUnlocked, lastUnlockedAt, unlockVault, lockVault }}>
      {children}
    </VaultAuthContext.Provider>
  );
}

export function useVaultAuth() {
  const context = useContext(VaultAuthContext);
  if (!context) {
    throw new Error("useVaultAuth must be used within VaultAuthProvider");
  }
  return context;
}
