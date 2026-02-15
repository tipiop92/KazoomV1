import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Send, MoreVertical, Timer, Check, Plus, Paperclip, Camera, Image } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { PinModal } from "../components/PinModal";
import { useAppStore } from "../state/AppStore";
import type { Message } from "../domain/types";

type AutoDeleteTimer = "disabled" | "5min" | "10min" | "15min" | "1h" | "2h" | "24h";

const autoDeleteOptions = [
  { value: "disabled" as AutoDeleteTimer, label: "Désactivé", ms: 0 },
  { value: "5min" as AutoDeleteTimer, label: "5 minutes", ms: 5 * 60 * 1000 },
  { value: "10min" as AutoDeleteTimer, label: "10 minutes", ms: 10 * 60 * 1000 },
  { value: "15min" as AutoDeleteTimer, label: "15 minutes", ms: 15 * 60 * 1000 },
  { value: "1h" as AutoDeleteTimer, label: "1 heure", ms: 60 * 60 * 1000 },
  { value: "2h" as AutoDeleteTimer, label: "2 heures", ms: 2 * 60 * 60 * 1000 },
  { value: "24h" as AutoDeleteTimer, label: "24 heures", ms: 24 * 60 * 60 * 1000 },
];

// Composant pour afficher le temps restant (createdAt en ms)
function TimeRemaining({ createdAtMs, deleteAfterMs }: { createdAtMs: number; deleteAfterMs: number }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateTimer = () => {
      const elapsed = Date.now() - createdAtMs;
      const remaining = deleteAfterMs - elapsed;

      if (remaining <= 0) {
        setTimeLeft("Suppression imminente");
        return;
      }

      const seconds = Math.floor(remaining / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes % 60}min`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}min ${seconds % 60}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [createdAtMs, deleteAfterMs]);

  return (
    <span className="flex items-center gap-1">
      <Timer className="w-3 h-3" />
      {timeLeft}
    </span>
  );
}

export function ChatView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useAppStore();
  const [newMessage, setNewMessage] = useState("");
  const [autoDeleteTimer, setAutoDeleteTimer] = useState<AutoDeleteTimer>("disabled");
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [vaultAction, setVaultAction] = useState<"image" | "document" | null>(null);
  const [showVaultPinModal, setShowVaultPinModal] = useState(false);

  const conversationId = id ?? state.selectedConversationId ?? null;
  const conversation = useMemo(
    () => (conversationId ? state.conversations.find((c) => c.id === conversationId) ?? null : null),
    [conversationId, state.conversations]
  );

  const messages = useMemo(() => {
    const list = conversationId ? state.messagesByConversationId[conversationId] ?? [] : [];
    return [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [conversationId, state.messagesByConversationId]);

  const contactInfo = useMemo(() => {
    if (!conversation) return { name: "", avatar: undefined, online: false };
    const firstParticipantId = conversation.participants[0]?.id;
    const contact = firstParticipantId ? state.contacts.find((c) => c.id === firstParticipantId) : null;
    return {
      name: conversation.title || contact?.displayName || "Contact",
      avatar: contact?.avatarUrl,
      online: false,
    };
  }, [conversation, state.contacts]);

  useEffect(() => {
    if (conversationId && !state.messagesByConversationId[conversationId]) {
      actions.selectConversation(conversationId);
    }
  }, [conversationId, state.messagesByConversationId, actions]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const body = newMessage.trim();
    if (!body || !conversationId) return;
    setNewMessage("");
    actions.sendMessage(conversationId, body);
  };

  const handleAttachmentClick = (type: "file" | "camera" | "vault-image") => {
    setShowAttachMenu(false);
    
    if (type === "vault-image") {
      // Demander le PIN avant d'accéder à la vault
      setVaultAction("image");
      setShowVaultPinModal(true);
    } else if (type === "file") {
      // Demander le PIN pour accéder aux fichiers/documents/notes
      setVaultAction("document");
      setShowVaultPinModal(true);
    } else if (type === "camera") {
      // Ouvrir la caméra (simulé)
      alert("Ouverture de la caméra...");
    }
  };

  const handleVaultPinSuccess = () => {
    // Rediriger vers la vault avec l'action appropriée et les paramètres de sélection
    if (vaultAction === "image" && id) {
      navigate(`/vault/media?selectMode=true&chatId=${id}`);
    } else if (vaultAction === "document" && id) {
      // Rediriger vers une page de sélection qui regroupe fichiers et notes
      navigate(`/vault/files?selectMode=true&chatId=${id}`);
    }
  };

  const deleteAfterMs = autoDeleteOptions.find(opt => opt.value === autoDeleteTimer)?.ms || 0;
  const noConversation = !conversationId || (!conversation && !state.loading);
  const meId = state.meId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-30">
        <div className="p-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>

          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={contactInfo.avatar} />
              <AvatarFallback className="bg-indigo-600 text-white">
                {contactInfo.name ? contactInfo.name.split(" ").map((n) => n[0]).join("") : "?"}
              </AvatarFallback>
            </Avatar>
            {contactInfo.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white truncate">
              {noConversation ? "Chat" : contactInfo.name}
            </h2>
            <p className="text-xs text-green-500">{noConversation ? "" : "En ligne"}</p>
            {!noConversation && autoDeleteTimer !== "disabled" && (
              <p className="text-xs text-orange-400 flex items-center gap-1 mt-0.5">
                <Timer className="w-3 h-3" />
                Suppression: {autoDeleteOptions.find(opt => opt.value === autoDeleteTimer)?.label}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Timer auto-suppression */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTimerMenu(!showTimerMenu)}
                className={`rounded-full h-12 w-12 active:scale-95 transition-all touch-manipulation ${autoDeleteTimer !== "disabled" ? "text-orange-400 hover:text-orange-300" : "text-gray-400 hover:text-white"}`}
              >
                <Timer className="w-5 h-5" />
              </Button>

              {/* Menu déroulant */}
              <AnimatePresence>
                {showTimerMenu && (
                  <>
                    {/* Overlay invisible pour fermer le menu */}
                    <div
                      className="fixed inset-0 z-[100]"
                      onClick={() => setShowTimerMenu(false)}
                    />
                    {/* Menu */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-[110] overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-gray-700">
                        <p className="text-xs font-semibold text-gray-400 uppercase">
                          Suppression automatique
                        </p>
                      </div>
                      <div className="p-1">
                        {autoDeleteOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setAutoDeleteTimer(option.value);
                              setShowTimerMenu(false);
                            }}
                            className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                              autoDeleteTimer === option.value
                                ? "bg-orange-600/20 text-orange-300"
                                : "text-gray-200 hover:bg-gray-700"
                            }`}
                          >
                            {option.value === autoDeleteTimer ? (
                              <Check className="w-4 h-4 mr-2 text-orange-400" />
                            ) : (
                              <div className="w-4 h-4 mr-2" />
                            )}
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Menu options */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {noConversation ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <p className="text-gray-400 text-center">Aucune conversation sélectionnée</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => {
              const sender = message.authorId === meId ? "me" : "them";
              const timestamp = new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${
                    sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl overflow-hidden ${
                      sender === "me"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    {message.body && (
                      <p className="text-sm px-4 py-2">{message.body}</p>
                    )}
                    <div className={`flex items-center justify-between gap-3 ${message.body ? "mt-1" : ""} px-4 pb-2`}>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-xs ${
                            sender === "me"
                              ? "text-indigo-200"
                              : "text-gray-400"
                          }`}
                        >
                          {timestamp}
                        </p>
                        {sender === "me" && message.status && (
                          <span
                            className={`text-xs flex items-center ${
                              message.status === "read"
                                ? "text-blue-400"
                                : "text-indigo-200"
                            }`}
                          >
                            {message.status === "sent" && (
                              <Check className="w-3 h-3" />
                            )}
                            {message.status === "delivered" && (
                              <div className="flex -space-x-1">
                                <Check className="w-3 h-3" />
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                            {message.status === "read" && (
                              <span className="font-medium">Lu</span>
                            )}
                          </span>
                        )}
                      </div>
                      {autoDeleteTimer !== "disabled" && (
                        <p
                          className={`text-xs ${
                            sender === "me"
                              ? "text-orange-200"
                              : "text-orange-400"
                          }`}
                        >
                          <TimeRemaining
                            createdAtMs={new Date(message.createdAt).getTime()}
                            deleteAfterMs={deleteAfterMs}
                          />
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <div className="bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 p-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              disabled={noConversation}
              className="rounded-full text-gray-400 hover:text-white shrink-0 h-12 w-12 active:scale-95 transition-all touch-manipulation"
            >
              <Plus className="w-5 h-5" />
            </Button>

            {/* Menu des pièces jointes */}
            <AnimatePresence>
              {showAttachMenu && (
                <>
                  {/* Overlay invisible pour fermer le menu */}
                  <div
                    className="fixed inset-0 z-[100]"
                    onClick={() => setShowAttachMenu(false)}
                  />
                  {/* Menu */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 bottom-full mb-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-[110] overflow-hidden"
                  >
                    <div className="p-1">
                      <button
                        onClick={() => handleAttachmentClick("file")}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <Paperclip className="w-5 h-5 text-blue-400" />
                        <div className="text-left">
                          <p className="font-medium">Pièce jointe</p>
                          <p className="text-xs text-gray-400">Envoyer un fichier</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleAttachmentClick("camera")}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <Camera className="w-5 h-5 text-green-400" />
                        <div className="text-left">
                          <p className="font-medium">Caméra</p>
                          <p className="text-xs text-gray-400">Prendre une photo</p>
                        </div>
                      </button>

                      <div className="my-1 border-t border-gray-700" />

                      <button
                        onClick={() => handleAttachmentClick("vault-image")}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-200 hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <Image className="w-5 h-5 text-purple-400" />
                        <div className="text-left">
                          <p className="font-medium">Image du coffre-fort</p>
                          <p className="text-xs text-gray-400">Accès sécurisé</p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <Input
            placeholder={noConversation ? "Sélectionnez une conversation" : "Écrivez un message..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={noConversation}
            className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
            disabled={noConversation || !newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>

      {/* Dialog PIN pour accès Vault */}
      <PinModal
        isOpen={showVaultPinModal}
        onClose={() => setShowVaultPinModal(false)}
        onSuccess={handleVaultPinSuccess}
        title="Accès au coffre-fort"
        alwaysAsk={true}
      />
    </div>
  );
}