import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useLock } from "../context/LockContext";

export function Logout() {
  const { lock } = useLock();
  const navigate = useNavigate();

  useEffect(() => {
    // Réinitialiser l'état de déverrouillage dans localStorage
    localStorage.removeItem('app_unlocked');
    localStorage.removeItem('unlock_timestamp');
    
    // Verrouiller l'application via le contexte
    lock();
    
    // Rediriger immédiatement vers le lockscreen
    // Utiliser setTimeout pour s'assurer que le state est mis à jour
    setTimeout(() => {
      navigate('/lock', { replace: true });
    }, 0);
  }, [lock, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
      <div className="text-white text-lg">Déconnexion en cours...</div>
    </div>
  );
}