import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Eye, EyeOff, MessageSquare, Clock, Keyboard, Trash2, Link as LinkIcon, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { usePrivacy } from "../context/PrivacyContext";

const autoDeleteOptions = [
  { value: "1", label: "1 heure" },
  { value: "2", label: "2 heures" },
  { value: "4", label: "4 heures" },
  { value: "8", label: "8 heures" },
  { value: "24", label: "1 jour" },
  { value: "168", label: "7 jours" },
];

export function ConfidentialitySettings() {
  const navigate = useNavigate();
  const { privacySettings, updatePrivacySettings } = usePrivacy();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-10">
          <div className="p-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Confidentialité</h1>
              <p className="text-xs text-gray-400">Contrôlez vos données</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Header info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Privacy-first</h2>
                <p className="text-white/80 text-sm">Minimisez les fuites de métadonnées</p>
              </div>
            </div>
          </motion.div>

          {/* Métadonnées et partage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Métadonnées et partage
            </h3>
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden space-y-px">
              {/* Prévisualisation liens */}
              <div className="flex items-center justify-between p-4 bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-5 h-5 text-purple-400" />
                  <div>
                    <Label className="text-white">Prévisualisation des liens</Label>
                    <p className="text-xs text-gray-400">Peut révéler des métadonnées</p>
                  </div>
                </div>
                <Switch
                  checked={privacySettings.linkPreviews}
                  onCheckedChange={(checked) =>
                    updatePrivacySettings({ linkPreviews: checked })
                  }
                />
              </div>

              {/* Accusés de lecture */}
              <div className="flex items-center justify-between p-4 bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  <div>
                    <Label className="text-white">Accusés de lecture</Label>
                    <p className="text-xs text-gray-400">Notifier la lecture des messages</p>
                  </div>
                </div>
                <Switch
                  checked={privacySettings.readReceipts}
                  onCheckedChange={(checked) =>
                    updatePrivacySettings({ readReceipts: checked })
                  }
                />
              </div>

              {/* Indicateur "en train d'écrire" */}
              <div className="flex items-center justify-between p-4 bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  <div>
                    <Label className="text-white">Indicateur de frappe</Label>
                    <p className="text-xs text-gray-400">"En train d'écrire..."</p>
                  </div>
                </div>
                <Switch
                  checked={privacySettings.typingIndicator}
                  onCheckedChange={(checked) =>
                    updatePrivacySettings({ typingIndicator: checked })
                  }
                />
              </div>

              {/* Dernière activité */}
              <div className="flex items-center justify-between p-4 bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <div>
                    <Label className="text-white">Dernière activité</Label>
                    <p className="text-xs text-gray-400">Afficher "en ligne" et dernière connexion</p>
                  </div>
                </div>
                <Switch
                  checked={privacySettings.lastSeen}
                  onCheckedChange={(checked) =>
                    updatePrivacySettings({ lastSeen: checked })
                  }
                />
              </div>
            </div>
          </motion.div>

          {/* Protection locale */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Protection locale
            </h3>
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden">
              {/* Protection clavier */}
              <div className="flex items-center justify-between p-4 bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <Keyboard className="w-5 h-5 text-indigo-400" />
                  <div>
                    <Label className="text-white">Protection clavier</Label>
                    <p className="text-xs text-gray-400">Désactiver suggestions et apprentissage</p>
                  </div>
                </div>
                <Switch
                  checked={privacySettings.keyboardProtection}
                  onCheckedChange={(checked) =>
                    updatePrivacySettings({ keyboardProtection: checked })
                  }
                />
              </div>
            </div>
          </motion.div>

          {/* Rétention des données */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Rétention des données
            </h3>
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                <Label className="text-white">Auto-suppression des messages</Label>
              </div>
              <Select
                value={privacySettings.autoDeleteMessages.toString()}
                onValueChange={(value) =>
                  updatePrivacySettings({ autoDeleteMessages: parseInt(value) })
                }
              >
                <SelectTrigger className="w-full bg-gray-800/80 border-gray-700 text-white hover:bg-gray-800">
                  <SelectValue>
                    {autoDeleteOptions.find(
                      (option) => option.value === privacySettings.autoDeleteMessages.toString()
                    )?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {autoDeleteOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-gray-200 focus:bg-red-600 focus:text-white"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 pl-7">
                {privacySettings.autoDeleteMessages === 0
                  ? "Les messages ne seront pas supprimés automatiquement"
                  : privacySettings.autoDeleteMessages < 24
                  ? `Les messages seront supprimés après ${privacySettings.autoDeleteMessages} heure${privacySettings.autoDeleteMessages > 1 ? 's' : ''}`
                  : privacySettings.autoDeleteMessages === 24
                  ? "Les messages seront supprimés après 1 jour"
                  : `Les messages seront supprimés après ${Math.round(privacySettings.autoDeleteMessages / 24)} jours`}
              </p>
            </div>
          </motion.div>

          {/* Info box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4 flex gap-3"
          >
            <Eye className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-purple-300 font-medium mb-1">
                Recommandations privacy-first
              </p>
              <p className="text-purple-200/80 text-xs">
                Pour une protection maximale, gardez toutes les options désactivées (OFF). Activez uniquement les fonctionnalités dont vous avez réellement besoin.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}