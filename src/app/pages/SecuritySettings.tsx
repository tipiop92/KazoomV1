import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Lock, Clock, Shield, AlertTriangle, Eye, EyeOff, Key, ShieldAlert, Smartphone, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { useLock } from "../context/LockContext";

const timeoutOptions = [
  { value: "0", label: "Immédiat" },
  { value: "0.5", label: "30 secondes" },
  { value: "1", label: "1 minute" },
  { value: "5", label: "5 minutes" },
  { value: "15", label: "15 minutes" },
  { value: "60", label: "1 heure" },
];

const attemptOptions = [
  { value: "5", label: "5 tentatives" },
  { value: "10", label: "10 tentatives" },
  { value: "15", label: "15 tentatives" },
];

export function SecuritySettings() {
  const navigate = useNavigate();
  const { lockSettings, updateLockSettings, lock } = useLock();

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
              <h1 className="text-xl font-bold text-white">Sécurité</h1>
              <p className="text-xs text-gray-400">Configuration avancée</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Toggle principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Verrouillage de l'app</h2>
                  <p className="text-white/80 text-sm">Protection par code PIN</p>
                </div>
              </div>
              <Switch
                checked={lockSettings.lockEnabled}
                onCheckedChange={(checked) => updateLockSettings({ lockEnabled: checked })}
                className="data-[state=checked]:bg-white"
              />
            </div>
          </motion.div>

          {/* Accordion avec sections A, B, C */}
          <Accordion type="multiple" defaultValue={["section-a", "section-b", "section-c"]} className="space-y-4">
            {/* Section A: Verrouillage de l'app */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <AccordionItem value="section-a" className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden">
                <AccordionTrigger className="px-6 text-white hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-600/20 p-2 rounded-lg">
                      <Lock className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Verrouillage de l'app</div>
                      <div className="text-xs text-gray-400 font-normal">Paramètres de verrouillage</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 space-y-4">
                  {/* Code/PIN */}
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-indigo-400" />
                      <div>
                        <Label className="text-white">Code PIN</Label>
                        <p className="text-xs text-gray-400">
                          {lockSettings.hasPinCode ? "Code configuré" : "Aucun code"}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                      disabled={!lockSettings.lockEnabled}
                    >
                      {lockSettings.hasPinCode ? "Modifier" : "Créer"}
                    </Button>
                  </div>

                  {/* Verrouillage automatique */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-400" />
                      <Label className="text-white">Verrouillage automatique</Label>
                    </div>
                    <Select
                      value={lockSettings.autoLockTimeout.toString()}
                      onValueChange={(value) =>
                        updateLockSettings({ autoLockTimeout: parseFloat(value) })
                      }
                      disabled={!lockSettings.lockEnabled}
                    >
                      <SelectTrigger className="w-full bg-gray-800/80 border-gray-700 text-white hover:bg-gray-800">
                        <SelectValue>
                          {timeoutOptions.find(
                            (option) => parseFloat(option.value) === lockSettings.autoLockTimeout
                          )?.label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {timeoutOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value}
                            className="text-gray-200 focus:bg-indigo-600 focus:text-white"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400 pl-7">Après cette période d'inactivité</p>
                  </div>

                  {/* Verrouiller quand app fermée */}
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-indigo-400" />
                      <div>
                        <Label className="text-white">Verrouiller quand app fermée</Label>
                        <p className="text-xs text-gray-400">À chaque ouverture</p>
                      </div>
                    </div>
                    <Switch
                      checked={lockSettings.lockOnEveryOpen}
                      onCheckedChange={(checked) =>
                        updateLockSettings({ lockOnEveryOpen: checked })
                      }
                      disabled={!lockSettings.lockEnabled}
                    />
                  </div>

                  {/* Verrouiller en arrière-plan */}
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <EyeOff className="w-5 h-5 text-indigo-400" />
                      <div>
                        <Label className="text-white">Verrouiller en arrière-plan</Label>
                        <p className="text-xs text-gray-400">Quand l'app passe en arrière-plan</p>
                      </div>
                    </div>
                    <Switch
                      checked={lockSettings.lockOnBackground}
                      onCheckedChange={(checked) =>
                        updateLockSettings({ lockOnBackground: checked })
                      }
                      disabled={!lockSettings.lockEnabled}
                    />
                  </div>

                  {/* Verrouiller avec écran */}
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-indigo-400" />
                      <div>
                        <Label className="text-white">Verrouiller avec l'écran</Label>
                        <p className="text-xs text-gray-400">Quand l'écran se verrouille</p>
                      </div>
                    </div>
                    <Switch
                      checked={lockSettings.lockOnScreenLock}
                      onCheckedChange={(checked) =>
                        updateLockSettings({ lockOnScreenLock: checked })
                      }
                      disabled={!lockSettings.lockEnabled}
                    />
                  </div>

                  {/* Masquer dans apps récentes */}
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-indigo-400" />
                      <div>
                        <Label className="text-white">Masquer contenu</Label>
                        <p className="text-xs text-gray-400">Dans les apps récentes</p>
                      </div>
                    </div>
                    <Switch
                      checked={lockSettings.hideInRecents}
                      onCheckedChange={(checked) =>
                        updateLockSettings({ hideInRecents: checked })
                      }
                      disabled={!lockSettings.lockEnabled}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>

            {/* Section B: Anti-usurpation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AccordionItem value="section-b" className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden">
                <AccordionTrigger className="px-6 text-white hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-600/20 p-2 rounded-lg">
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Anti-usurpation</div>
                      <div className="text-xs text-gray-400 font-normal">Protection contre l'interception</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 space-y-4">
                  {/* Mode strict */}
                  <div className="p-4 bg-amber-900/20 border border-amber-600/30 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 text-amber-400" />
                        <div>
                          <Label className="text-white font-bold">Mode strict</Label>
                          <p className="text-xs text-amber-200/80">Bloque UNVERIFIED ou KEY_CHANGED</p>
                        </div>
                      </div>
                      <Switch
                        checked={lockSettings.strictMode}
                        onCheckedChange={(checked) =>
                          updateLockSettings({ strictMode: checked })
                        }
                      />
                    </div>
                  </div>

                  {/* Freeze on key change */}
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                      <div>
                        <Label className="text-white">Freeze on key change</Label>
                        <p className="text-xs text-gray-400">
                          {lockSettings.strictMode ? "Activé automatiquement (mode strict)" : "Bloquer si changement de clé"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={lockSettings.freezeOnKeyChange}
                      onCheckedChange={(checked) =>
                        updateLockSettings({ freezeOnKeyChange: checked })
                      }
                      disabled={lockSettings.strictMode}
                    />
                  </div>

                  {/* Alerte changement de clé */}
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      <div>
                        <Label className="text-white">Alerte changement de clé</Label>
                        <p className="text-xs text-gray-400">Notifier en cas de changement</p>
                      </div>
                    </div>
                    <Switch
                      checked={lockSettings.alertOnKeyChange}
                      onCheckedChange={(checked) =>
                        updateLockSettings({ alertOnKeyChange: checked })
                      }
                    />
                  </div>

                  {/* Exiger vérification */}
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-amber-400" />
                      <div>
                        <Label className="text-white">Vérification obligatoire</Label>
                        <p className="text-xs text-gray-400">Avant le premier message</p>
                      </div>
                    </div>
                    <Switch
                      checked={lockSettings.requireVerificationFirst}
                      onCheckedChange={(checked) =>
                        updateLockSettings({ requireVerificationFirst: checked })
                      }
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>

            {/* Section C: Effacement / anti-bruteforce */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <AccordionItem value="section-c" className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden">
                <AccordionTrigger className="px-6 text-white hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-600/20 p-2 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Effacement / Anti-bruteforce</div>
                      <div className="text-xs text-gray-400 font-normal">Protection contre les tentatives</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 space-y-4">
                  {/* Nombre de tentatives */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-400" />
                      <Label className="text-white">Tentatives avant effacement</Label>
                    </div>
                    <Select
                      value={lockSettings.maxAttempts.toString()}
                      onValueChange={(value) =>
                        updateLockSettings({ maxAttempts: parseInt(value) })
                      }
                    >
                      <SelectTrigger className="w-full bg-gray-800/80 border-gray-700 text-white hover:bg-gray-800">
                        <SelectValue>
                          {attemptOptions.find(
                            (option) => option.value === lockSettings.maxAttempts.toString()
                          )?.label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {attemptOptions.map((option) => (
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
                  </div>

                  {/* Délai progressif */}
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-red-400" />
                      <div>
                        <Label className="text-white">Délai progressif</Label>
                        <p className="text-xs text-gray-400">5e → 30s, 6e → 1m, 7e → 5m...</p>
                      </div>
                    </div>
                    <Switch
                      checked={lockSettings.progressiveDelay}
                      onCheckedChange={(checked) =>
                        updateLockSettings({ progressiveDelay: checked })
                      }
                    />
                  </div>

                  {/* Avertissement */}
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <div>
                        <Label className="text-white">Avertissement final</Label>
                        <p className="text-xs text-gray-400">Alerte à 1 essai du wipe</p>
                      </div>
                    </div>
                    <Switch
                      checked={lockSettings.warnBeforeWipe}
                      onCheckedChange={(checked) =>
                        updateLockSettings({ warnBeforeWipe: checked })
                      }
                    />
                  </div>

                  {/* Info wipe */}
                  <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-red-300 font-medium mb-1">
                        Effacement des données
                      </p>
                      <p className="text-red-200/80 text-xs">
                        Après {lockSettings.maxAttempts} tentatives incorrectes, toutes les conversations et clés locales seront définitivement supprimées.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          </Accordion>

          {/* Test Lock Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Button
              onClick={lock}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
              disabled={!lockSettings.lockEnabled}
            >
              <Lock className="w-4 h-4 mr-2" />
              Tester le verrouillage maintenant
            </Button>
          </motion.div>

          {/* Demo info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-center text-xs text-gray-500"
          >
            <p>Mot de passe de démonstration : secure123</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}