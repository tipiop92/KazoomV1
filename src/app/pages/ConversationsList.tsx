import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Menu, User, Users, Settings, LogOut, Mail, Bell, Clock, Trash2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Skeleton } from "../components/ui/skeleton";
import { useState, useEffect, useMemo } from "react";
import { VaultIcon } from "../components/icons/VaultIcon";
import { KazoomBanner } from "../components/KazoomBanner";
import { usePrivacy } from "../context/PrivacyContext";
import { useAppStore } from "../state/AppStore";
import { formatIsoForList } from "../domain/time";
import type { Conversation } from "../domain/types";

export function ConversationsList() {
  const navigate = useNavigate();
  const { state, actions } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [keyCodeCopied, setKeyCodeCopied] = useState(false);
  const [upcomingAlertsCount, setUpcomingAlertsCount] = useState(0);
  const [swipedConversationId, setSwipedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { privacySettings } = usePrivacy();
  const userKeyCode = "ED3GHD";

  const contactsById = useMemo(() => {
    const map: Record<string, { displayName: string; avatarUrl?: string }> = {};
    for (const c of state.contacts) {
      map[c.id] = { displayName: c.displayName, avatarUrl: c.avatarUrl };
    }
    return map;
  }, [state.contacts]);

  const filteredConversations = useMemo(() => {
    const list = state.conversations;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((conv) => {
      if (conv.title.toLowerCase().includes(q)) return true;
      const participantNames = conv.participants
        .map((p) => contactsById[p.id]?.displayName ?? "")
        .filter(Boolean);
      return participantNames.some((name) => name.toLowerCase().includes(q));
    });
  }, [state.conversations, searchQuery, contactsById]);

  const totalUnreadMessages = state.conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  const handleSelectConversation = (conv: Conversation) => {
    actions.selectConversation(conv.id);
    navigate(`/chat/${conv.id}`);
  };

  // Fonction pour calculer le temps restant avant suppression
  const getTimeRemaining = (lastMessageTime: Date | string | number) => {
    if (privacySettings.autoDeleteMessages === 0) {
      return null; // Pas de suppression automatique
    }

    // Convertir en objet Date si ce n'est pas déjà le cas
    const messageDate = lastMessageTime instanceof Date 
      ? lastMessageTime 
      : new Date(lastMessageTime);

    const now = new Date();
    const hoursElapsed = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    const hoursRemaining = privacySettings.autoDeleteMessages - hoursElapsed;

    if (hoursRemaining <= 0) {
      return { text: "Suppression imminente", color: "text-red-400", urgent: true };
    }

    if (hoursRemaining < 1) {
      const minutesRemaining = Math.floor(hoursRemaining * 60);
      return { text: `${minutesRemaining} min`, color: "text-red-400", urgent: true };
    } else if (hoursRemaining < 24) {
      const hours = Math.floor(hoursRemaining);
      return { text: `${hours}h`, color: hoursRemaining < 3 ? "text-orange-400" : "text-yellow-400", urgent: hoursRemaining < 3 };
    } else {
      const days = Math.floor(hoursRemaining / 24);
      return { text: `${days}j`, color: "text-green-400", urgent: false };
    }
  };

  // Calculer les alertes des 24 prochaines heures
  useEffect(() => {
    const calculateUpcomingAlerts = () => {
      try {
        const storedAlerts = localStorage.getItem("global-alerts");
        if (!storedAlerts) {
          setUpcomingAlertsCount(0);
          return;
        }

        const alerts = JSON.parse(storedAlerts);
        const now = new Date();
        const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Compter les alertes dans les 24 prochaines heures
        const count = alerts.filter((alert: any) => {
          // Parse la date de l'alerte (format: DD/MM/YYYY)
          const [day, month, year] = alert.date.split('/').map(Number);
          const [hour, minute] = alert.time.split(':').map(Number);
          
          const alertDate = new Date(year, month - 1, day, hour, minute);
          
          // Vérifier si l'alerte est dans les 24 prochaines heures
          return alertDate >= now && alertDate <= next24Hours;
        }).length;

        setUpcomingAlertsCount(count);
      } catch (error) {
        console.error("Error calculating upcoming alerts:", error);
        setUpcomingAlertsCount(0);
      }
    };

    calculateUpcomingAlerts();

    // Écouter les changements d'alertes
    const handleAlertsUpdate = () => {
      calculateUpcomingAlerts();
    };

    window.addEventListener("alerts-updated", handleAlertsUpdate);

    return () => {
      window.removeEventListener("alerts-updated", handleAlertsUpdate);
    };
  }, []);

  const handleCopyKeyCode = () => {
    navigator.clipboard.writeText(userKeyCode);
    setKeyCodeCopied(true);
    setTimeout(() => setKeyCodeCopied(false), 2000);
  };

  const menuItems = [
    { icon: User, label: "Profil", to: "/profile", type: "normal", description: "Gérer mon compte", badge: null },
    { icon: Users, label: "Contacts", to: "/contacts", type: "normal", description: `${state.contacts.length} contacts`, badge: null },
    { icon: VaultIcon, label: "Coffre-fort", to: "/vault", type: "normal", description: "Données chiffrées", badge: "3" },
    { icon: Bell, label: "Alertes", to: "/alerts", type: "normal", description: "Notifications", badge: upcomingAlertsCount > 0 ? upcomingAlertsCount.toString() : null },
    { icon: Settings, label: "Réglages", to: "/settings", type: "normal", description: "Sécurité & confidentialité", badge: null },
  ];

  const logoutItem = { icon: LogOut, label: "Déconnexion", to: "/logout", type: "danger" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      <div className="max-w-2xl mx-auto">
        {/* Header - Android Optimized */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(true)}
                className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-transform touch-manipulation"
              >
                <Menu className="w-7 h-7" />
              </Button>
              <h1 className="text-2xl font-bold text-white">Messages</h1>
              <Link to="/chat/new">
                <Button
                  size="icon"
                  className="rounded-full bg-transparent hover:bg-gray-700 text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation border-none"
                >
                  <Plus className="w-8 h-8" />
                </Button>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 text-base"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Menu - Android Optimized with Swipe */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 touch-manipulation"
              />

              {/* Sidebar - Full Height Android Style */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                drag="x"
                dragConstraints={{ left: -320, right: 0 }}
                dragElastic={{ left: 0.1, right: 0.3 }}
                dragMomentum={false}
                onDragEnd={(e, { offset, velocity }) => {
                  if (offset.x < -80 || velocity.x < -400) {
                    setIsMenuOpen(false);
                  }
                }}
                className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-gradient-to-br from-gray-900 via-gray-900 to-black backdrop-blur-xl border-r border-gray-800 shadow-2xl z-50 flex flex-col touch-manipulation"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {/* Swipe Indicator - Android Style */}
                <div className="absolute top-1/2 -right-6 -translate-y-1/2 w-6 h-16 flex items-center justify-center opacity-30">
                  <div className="w-1 h-12 bg-white/40 rounded-full" />
                </div>

                {/* Kazoom Banner */}
                <div className="p-6 border-b border-gray-800">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-center"
                  >
                    <KazoomBanner variant="header" to="/" />
                  </motion.div>
                </div>

                {/* Sidebar Header - User Info */}
                <div className="p-6 border-b border-gray-800 bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="w-20 h-20 border-4 border-indigo-600/50 ring-2 ring-indigo-500/20">
                        <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop" />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xl font-bold">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      {/* Status Indicator */}
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900"></div>
                    </div>
                    <div className="flex-1 flex items-start gap-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-xl mb-1">John Doe</h3>
                        <p className="text-sm text-gray-400">En ligne</p>
                      </div>
                      <div className="flex flex-col gap-2 mr-2">
                        {totalUnreadMessages > 0 && (
                          <span className="bg-indigo-600/30 text-indigo-300 text-sm font-semibold rounded-full px-3 py-1 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            {totalUnreadMessages}
                          </span>
                        )}
                        {upcomingAlertsCount > 0 && (
                          <span className="bg-yellow-600/30 text-yellow-300 text-sm font-semibold rounded-full px-3 py-1 flex items-center gap-1.5">
                            <Bell className="w-3.5 h-3.5" />
                            {upcomingAlertsCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items - Touch Optimized */}
                <div className="flex-1 p-4 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <nav className="space-y-2">
                    {menuItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.to}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08 }}
                        >
                          <Link
                            to={item.to}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-4 p-4 active:bg-gray-800/70 rounded-2xl transition-colors group touch-manipulation hover:bg-gray-800/50"
                          >
                            <div className="bg-indigo-600/20 p-3 rounded-xl group-active:bg-indigo-600/40 transition-colors">
                              <Icon className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-medium text-base">{item.label}</span>
                                {item.badge && (
                                  <span className="bg-indigo-600 text-white text-xs font-bold rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>
                </div>

                {/* Logout Item */}
                <div className="border-t border-gray-800">
                  <div className="pt-[0.5px] pb-[0.5px]">
                    <Link
                      to={logoutItem.to}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 p-5 active:bg-gray-800/70 hover:bg-gray-800/50 transition-colors group touch-manipulation w-full"
                    >
                      <span className="text-red-500 font-bold text-lg">{logoutItem.label}</span>
                    </Link>
                  </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-6 border-t border-gray-800 safe-area-bottom">
                  <div className="text-center text-xs text-gray-500">
                    <p className="font-semibold">Kazoom Messenger</p>
                    <p className="mt-1">Version 1.0.0</p>
                    <p className="mt-2 text-gray-600 text-xs">
                      Glisse vers la gauche pour fermer
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Conversations List - Touch Optimized with Swipe to Delete */}
        <div className="divide-y divide-gray-800">
          {state.loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 flex items-center gap-4">
                  <Skeleton className="w-16 h-16 rounded-full shrink-0 bg-gray-800" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-32 bg-gray-800" />
                    <Skeleton className="h-3 w-full max-w-[200px] bg-gray-800" />
                  </div>
                </div>
              ))}
            </>
          ) : (
            filteredConversations.map((conversation, index) => {
              const firstParticipantId = conversation.participants[0]?.id;
              const contact = firstParticipantId ? contactsById[firstParticipantId] : null;
              const avatarUrl = contact?.avatarUrl;
              const lastMessageBody = (() => {
                const msgs = state.messagesByConversationId[conversation.id];
                if (msgs?.length) {
                  const last = msgs[msgs.length - 1];
                  return last.body || "...";
                }
                return "...";
              })();

              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative overflow-hidden"
                >
                  {swipedConversationId === conversation.id && (
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-red-600 flex items-center justify-center">
                      <Trash2 className="w-6 h-6 text-white" />
                    </div>
                  )}

                  <motion.div
                    drag="x"
                    dragConstraints={{ left: -96, right: 0 }}
                    dragElastic={{ left: 0.1, right: 0.3 }}
                    dragMomentum={false}
                    onDragEnd={(_, { offset, velocity }) => {
                      if (offset.x < -60 || velocity.x < -400) {
                        setSwipedConversationId(conversation.id);
                      } else {
                        setSwipedConversationId(null);
                      }
                    }}
                    animate={{ x: swipedConversationId === conversation.id ? -96 : 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-gradient-to-br from-black via-gray-950 to-black"
                  >
                    <Link
                      to={`/chat/${conversation.id}`}
                      onClick={() => handleSelectConversation(conversation)}
                      className="block active:bg-gray-800/50 transition-colors touch-manipulation"
                    >
                      <div className="p-5 flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={avatarUrl} />
                            <AvatarFallback className="bg-indigo-600 text-white">
                              {conversation.title.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between mb-1">
                            <h3 className="font-semibold text-white truncate text-base">
                              {conversation.title}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-400 truncate">
                            {lastMessageBody}
                          </p>
                        </div>

                        {conversation.unreadCount > 0 && (
                          <div className="shrink-0 ml-2">
                            <span className="bg-indigo-600/30 text-indigo-300 text-sm font-semibold rounded-full px-3 py-1 flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5" />
                              {conversation.unreadCount}
                            </span>
                          </div>
                        )}

                        {privacySettings.autoDeleteMessages > 0 && (() => {
                          const timeRemaining = getTimeRemaining(conversation.lastMessageAt);
                          return timeRemaining ? (
                            <div className="flex items-center gap-1 ml-2 shrink-0">
                              <Clock className={`w-3.5 h-3.5 ${timeRemaining.color}`} />
                              <span className={`text-xs font-semibold ${timeRemaining.color}`}>
                                {timeRemaining.text}
                              </span>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </Link>
                  </motion.div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}