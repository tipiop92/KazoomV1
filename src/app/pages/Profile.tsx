import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Settings,
  Camera,
  QrCode,
  Share2,
  Copy,
  ChevronRight,
  Lock,
  Key,
  Shield,
  UserCog,
  Database,
  Eye,
  FileText,
  LogOut,
  Trash2,
  HelpCircle,
  Check,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { KeyRow } from "../components/profile/KeyRow";
import { ListItemChevron } from "../components/profile/ListItemChevron";
import { ToggleRow } from "../components/profile/ToggleRow";
import { SubscriptionCard } from "../components/profile/SubscriptionCard";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { KazoomBanner } from "../components/KazoomBanner";

export function Profile() {
  const navigate = useNavigate();
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [username, setUsername] = useState("lynor");
  const [newUsername, setNewUsername] = useState(username);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [blockScreenshots, setBlockScreenshots] = useState(false);
  const [hidePreview, setHidePreview] = useState(true);
  const [strictMode, setStrictMode] = useState(false);

  const user = {
    username: username,
    kazoomKey: "ED34G6",
    safetyNumber: "8451 2210 9A3C 77D1 4B82 C903 1FA7 6E5D",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
  };

  const subscription = {
    plan: "pro" as const,
    daysLeft: 23,
    expiryDate: "12 mars 2026",
  };

  const isUsernameValid = (name: string) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(name);
  };

  const handleSaveUsername = () => {
    if (isUsernameValid(newUsername)) {
      setUsername(newUsername);
      setShowUsernameModal(false);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation === "SUPPRIMER") {
      // Logique de suppression
      alert("Compte supprimé (UI only)");
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-30">
          <div className="p-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-semibold text-white flex-1">Profil</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation"
            >
              <Settings className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* A) HEADER PROFIL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6"
          >
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <Avatar className="w-28 h-28 border-4 border-purple-600">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-purple-600 text-white text-3xl">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2.5 shadow-lg transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Username */}
              <div className="text-2xl font-bold text-white mb-1">@{user.username}</div>
              <div className="text-sm text-gray-400 mb-4">En ligne</div>

              {/* Modifier username */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewUsername(username);
                  setShowUsernameModal(true);
                }}
                className="border-gray-600 hover:bg-gray-700"
              >
                <UserCog className="w-4 h-4 mr-2" />
                Modifier le username
              </Button>
            </div>
          </motion.div>

          {/* B) IDENTITÉ KAZOOM */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-white mb-4">Identité</h2>

            <div className="space-y-1 divide-y divide-gray-700/50">
              <KeyRow label="Clé KAZOOM" value={user.kazoomKey} />

              {/* QR KAZOOM */}
              <div className="flex items-center justify-between py-3 gap-4">
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">QR KAZOOM</div>
                  <div className="text-white text-sm">Code pour ajout contact</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/profile/qr")}
                    className="text-gray-400 hover:text-white"
                  >
                    <QrCode className="w-4 h-4 mr-1" />
                    Afficher
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Partager
                  </Button>
                </div>
              </div>

              {/* Safety Number */}
              <div className="flex items-center justify-between py-3 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-1">Empreinte (Safety Number)</div>
                  <div className="text-white text-xs font-mono truncate">{user.safetyNumber}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(user.safetyNumber);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/profile/safety-number")}
                    className="text-gray-400 hover:text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              Vérifie ton identité en scannant un QR. Si ta clé change, tes contacts seront alertés.
            </p>
          </motion.div>

          {/* C) ABONNEMENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-bold text-white mb-3 px-1">Abonnement</h2>
            <SubscriptionCard
              plan={subscription.plan}
              daysLeft={subscription.daysLeft}
              expiryDate={subscription.expiryDate}
              onManage={() => alert("Gestion abonnement (UI)")}
              onHistory={() => alert("Historique (UI)")}
            />
          </motion.div>

          {/* D) SÉCURITÉ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-2"
          >
            <h2 className="text-lg font-bold text-white mb-2 px-4 pt-4">Sécurité</h2>

            <div className="divide-y divide-gray-700/30">
              <ListItemChevron
                icon={Lock}
                label="Verrouillage de l'app"
                onClick={() => navigate("/settings/security")}
              />
              <ListItemChevron
                icon={Key}
                label="PIN du Coffre-fort"
                onClick={() => navigate("/vault/settings")}
              />
              <div className="px-2">
                <ToggleRow
                  icon={Shield}
                  label="Mode strict (freeze si clé change)"
                  checked={strictMode}
                  onCheckedChange={setStrictMode}
                />
              </div>
              <ListItemChevron
                icon={UserCog}
                label="Sessions / appareils"
                badge="Bientôt"
                badgeColor="gray"
                disabled
              />
              <ListItemChevron
                icon={Database}
                label="Exporter clés / sauvegarde"
                badge="Bientôt"
                badgeColor="gray"
                disabled
              />
            </div>

            <p className="text-xs text-gray-500 mt-4 px-4 pb-4 leading-relaxed">
              Ton contenu est chiffré de bout en bout. Le serveur ne peut pas lire tes messages.
            </p>
          </motion.div>

          {/* E) CONFIDENTIALITÉ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-2"
          >
            <h2 className="text-lg font-bold text-white mb-2 px-4 pt-4">Confidentialité</h2>

            <div className="divide-y divide-gray-700/30">
              <div className="px-2">
                <ToggleRow
                  icon={Eye}
                  label="Bloquer captures d'écran"
                  checked={blockScreenshots}
                  onCheckedChange={setBlockScreenshots}
                />
              </div>
              <div className="px-2">
                <ToggleRow
                  icon={Eye}
                  label="Masquer contenu dans l'aperçu"
                  description="Apps récentes"
                  checked={hidePreview}
                  onCheckedChange={setHidePreview}
                />
              </div>
              <ListItemChevron
                icon={Database}
                label="Gestion des données"
                value="Cache & stockage"
                onClick={() => navigate("/settings/storage")}
              />
              <ListItemChevron
                icon={FileText}
                label="Logs & diagnostic"
                badge="Désactivé"
                badgeColor="gray"
                disabled
              />
            </div>
          </motion.div>

          {/* F) COMPTE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-2"
          >
            <h2 className="text-lg font-bold text-white mb-2 px-4 pt-4">Compte</h2>

            <div className="divide-y divide-gray-700/30">
              <ListItemChevron
                icon={Lock}
                label="Changer mot de passe / PIN"
                onClick={() => alert("Changer mot de passe (UI)")}
              />
              <ListItemChevron
                icon={LogOut}
                label="Déconnexion"
                onClick={() => navigate("/logout")}
              />
              <ListItemChevron
                icon={Trash2}
                label="Supprimer mon compte"
                danger
                onClick={() => setShowDeleteModal(true)}
              />
            </div>
          </motion.div>

          {/* G) AIDE & INFOS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-2"
          >
            <h2 className="text-lg font-bold text-white mb-2 px-4 pt-4">Aide & Infos</h2>

            <div className="divide-y divide-gray-700/30">
              <ListItemChevron
                icon={HelpCircle}
                label="Centre d'aide"
                onClick={() => alert("Centre d'aide (UI)")}
              />
              <ListItemChevron
                icon={HelpCircle}
                label="Contacter le support"
                onClick={() => alert("Support (UI)")}
              />
              <ListItemChevron
                icon={FileText}
                label="Conditions d'utilisation"
                onClick={() => alert("CGU (UI)")}
              />
              <ListItemChevron
                icon={FileText}
                label="Politique de confidentialité"
                onClick={() => alert("Privacy (UI)")}
              />
              <div className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="text-sm text-white">Version</div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">1.0.0 (100)</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText("1.0.0 (100)");
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copier
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Logo KAZOOM */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center py-8"
          >
            <KazoomBanner variant="inline" className="opacity-60" to="/" />
          </motion.div>
        </div>
      </div>

      {/* MODAL: Modifier username */}
      <Dialog open={showUsernameModal} onOpenChange={setShowUsernameModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Modifier le username</DialogTitle>
            <DialogDescription className="text-gray-400">
              3–20 caractères, lettres/chiffres/underscore uniquement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="username"
                  className={`pl-8 bg-gray-800 border ${
                    isUsernameValid(newUsername)
                      ? "border-green-500 focus:ring-green-500"
                      : "border-red-500 focus:ring-red-500"
                  }`}
                  maxLength={20}
                />
              </div>
              {!isUsernameValid(newUsername) && newUsername.length > 0 && (
                <p className="text-xs text-red-400 mt-2">Username invalide</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowUsernameModal(false)}
              className="text-gray-400"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveUsername}
              disabled={!isUsernameValid(newUsername)}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              <Check className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: Supprimer compte */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">Supprimer mon compte</DialogTitle>
            <DialogDescription className="text-gray-400">
              Cette action est irréversible. Toutes tes données seront définitivement supprimées.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              Pour confirmer, tape <span className="font-bold text-white">SUPPRIMER</span> ci-dessous :
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="SUPPRIMER"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmation("");
              }}
              className="text-gray-400"
            >
              Annuler
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== "SUPPRIMER"}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}