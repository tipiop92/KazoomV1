import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Bell, BellOff, Eye, EyeOff, Volume2, VolumeX, Vibrate, MessageSquare, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useNotification } from "../context/NotificationContext";

const contentTypeOptions = [
  { value: "none", label: "Aucun contenu" },
  { value: "contact", label: "Nom du contact" },
];

const alertSoundOptions = [
  { value: "default", label: "Par défaut" },
  { value: "gentle", label: "Douce" },
  { value: "urgent", label: "Urgente" },
  { value: "chime", label: "Carillon" },
  { value: "bell", label: "Cloche" },
];

export function NotificationSettings() {
  const navigate = useNavigate();
  const { notificationSettings, updateNotificationSettings } = useNotification();

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
              <h1 className="text-xl font-bold text-white">Notifications</h1>
              <p className="text-xs text-gray-400">Gérez vos alertes</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Header info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Paramètres d'alertes</h2>
                <p className="text-white/80 text-sm">Contrôlez ce qui s'affiche</p>
              </div>
            </div>
          </motion.div>

          {/* Activation globale */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Activation
            </h3>
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-gray-900/50">
                <div className="flex items-center gap-3">
                  {notificationSettings.enabled ? (
                    <Bell className="w-5 h-5 text-blue-400" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Label className="text-white">Notifications activées</Label>
                    <p className="text-xs text-gray-400">
                      {notificationSettings.enabled
                        ? "Vous recevez les notifications"
                        : "Mode silencieux total"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.enabled}
                  onCheckedChange={(checked) =>
                    updateNotificationSettings({ enabled: checked })
                  }
                />
              </div>
            </div>
          </motion.div>

          {/* Contenu et affichage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Contenu et affichage
            </h3>
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden space-y-px">
              {/* Contenu dans notifications */}
              <div className="p-4 bg-gray-900/50 space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <Label className="text-white">Contenu dans notifications</Label>
                </div>
                <Select
                  value={notificationSettings.contentType}
                  onValueChange={(value: "none" | "contact") =>
                    updateNotificationSettings({ contentType: value })
                  }
                  disabled={!notificationSettings.enabled}
                >
                  <SelectTrigger className="w-full bg-gray-800/80 border-gray-700 text-white hover:bg-gray-800 disabled:opacity-50">
                    <SelectValue>
                      {contentTypeOptions.find(
                        (option) => option.value === notificationSettings.contentType
                      )?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {contentTypeOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-gray-200 focus:bg-blue-600 focus:text-white"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 pl-7">
                  {notificationSettings.contentType === "none"
                    ? "Seul \"Nouveau message\" sera affiché"
                    : "Le nom du contact sera visible"}
                </p>
              </div>

              {/* Masquer sur écran verrouillé */}
              <div className="flex items-center justify-between p-4 bg-gray-900/50">
                <div className="flex items-center gap-3">
                  {notificationSettings.hideOnLockScreen ? (
                    <EyeOff className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-blue-400" />
                  )}
                  <div>
                    <Label className="text-white">Masquer sur écran verrouillé</Label>
                    <p className="text-xs text-gray-400">
                      {notificationSettings.hideOnLockScreen
                        ? "Notifications cachées si verrouillé"
                        : "Notifications visibles même verrouillé"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.hideOnLockScreen}
                  onCheckedChange={(checked) =>
                    updateNotificationSettings({ hideOnLockScreen: checked })
                  }
                  disabled={!notificationSettings.enabled}
                />
              </div>
            </div>
          </motion.div>

          {/* Alertes sonores et tactiles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Alertes sonores et tactiles
            </h3>
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden space-y-px">
              {/* Son */}
              <div className="flex items-center justify-between p-4 bg-gray-900/50">
                <div className="flex items-center gap-3">
                  {notificationSettings.sound ? (
                    <Volume2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Label className="text-white">Son</Label>
                    <p className="text-xs text-gray-400">
                      {notificationSettings.sound
                        ? "Sonnerie activée"
                        : "Mode silencieux"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.sound}
                  onCheckedChange={(checked) =>
                    updateNotificationSettings({ sound: checked })
                  }
                  disabled={!notificationSettings.enabled}
                />
              </div>

              {/* Vibration */}
              <div className="flex items-center justify-between p-4 bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <Vibrate className="w-5 h-5 text-green-400" />
                  <div>
                    <Label className="text-white">Vibration</Label>
                    <p className="text-xs text-gray-400">
                      {notificationSettings.vibration
                        ? "Vibreur activé"
                        : "Pas de vibration"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.vibration}
                  onCheckedChange={(checked) =>
                    updateNotificationSettings({ vibration: checked })
                  }
                  disabled={!notificationSettings.enabled}
                />
              </div>
            </div>
          </motion.div>

          {/* Notifications d'alertes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Notifications d'alertes
            </h3>
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden space-y-px">
              {/* Activation notifications d'alertes */}
              <div className="flex items-center justify-between p-4 bg-gray-900/50">
                <div className="flex items-center gap-3">
                  {notificationSettings.alertsEnabled ? (
                    <Clock className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Label className="text-white">Notifications d'alertes</Label>
                    <p className="text-xs text-gray-400">
                      {notificationSettings.alertsEnabled
                        ? "Recevoir les alertes programmées"
                        : "Alertes désactivées"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings.alertsEnabled}
                  onCheckedChange={(checked) =>
                    updateNotificationSettings({ alertsEnabled: checked })
                  }
                  disabled={!notificationSettings.enabled}
                />
              </div>

              {/* Sonnerie d'alerte */}
              <div className="p-4 bg-gray-900/50 space-y-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-yellow-400" />
                  <Label className="text-white">Sonnerie d'alerte</Label>
                </div>
                <Select
                  value={notificationSettings.alertSound}
                  onValueChange={(value: "default" | "gentle" | "urgent" | "chime" | "bell") =>
                    updateNotificationSettings({ alertSound: value })
                  }
                  disabled={!notificationSettings.enabled || !notificationSettings.alertsEnabled}
                >
                  <SelectTrigger className="w-full bg-gray-800/80 border-gray-700 text-white hover:bg-gray-800 disabled:opacity-50">
                    <SelectValue>
                      {alertSoundOptions.find(
                        (option) => option.value === notificationSettings.alertSound
                      )?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {alertSoundOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-gray-200 focus:bg-yellow-600 focus:text-white"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 pl-7">
                  Choisissez la sonnerie pour vos alertes programmées
                </p>
              </div>
            </div>
          </motion.div>

          {/* Info box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 flex gap-3"
          >
            <Bell className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-300 font-medium mb-1">
                Protection de la vie privée
              </p>
              <p className="text-blue-200/80 text-xs">
                Pour une discrétion maximale, choisissez "Aucun contenu" et activez "Masquer sur écran verrouillé".
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}