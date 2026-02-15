import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect } from "react";
import { useLock } from "../context/LockContext";
import { useVaultAuth } from "../context/VaultAuthContext";
import { useAppStore } from "../state/AppStore";

export function RootLayout() {
  const { isLocked } = useLock();
  const { isVaultUnlocked } = useVaultAuth();
  const { actions } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    actions.bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap une seule fois au montage
  }, []);

  useEffect(() => {
    if (isLocked && location.pathname !== "/lock" && location.pathname !== "/logout") {
      navigate("/lock", { replace: true });
      return;
    }
    if (!isLocked && location.pathname.startsWith("/vault") && location.pathname !== "/vault" && !isVaultUnlocked) {
      navigate("/vault", { replace: true });
    }
  }, [isLocked, isVaultUnlocked, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      <Outlet />
    </div>
  );
}