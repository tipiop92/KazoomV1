import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  Search,
  UserPlus,
  MessageSquare,
  ArrowLeft,
  Star,
  Check,
  X,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Link, useNavigate } from "react-router";
import { SecurityStatus } from "../components/contacts/BadgeStatus";
import { useAppStore } from "../state/AppStore";

/** Forme UI pour l’affichage (dérivée du Contact domaine). */
interface ContactRow {
  id: string;
  name: string;
  username: string;
  avatar: string;
  online: boolean;
  status: SecurityStatus;
  isFavorite?: boolean;
}

interface ContactRequest {
  id: string;
  name: string;
  username: string;
  avatar: string;
  type: "received" | "sent";
  date: string;
}

const contactRequests: ContactRequest[] = [
  { id: "r1", name: "Claire Moreau", username: "@claire_m", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop", type: "received", date: "Il y a 2h" },
  { id: "r2", name: "Antoine Blanc", username: "@antoine_b", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", type: "received", date: "Hier" },
  { id: "s1", name: "Isabelle Petit", username: "@isabelle_p", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", type: "sent", date: "Il y a 1 jour" },
];

export function Contacts() {
  const navigate = useNavigate();
  const { state } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [requestTab, setRequestTab] = useState<"received" | "sent">("received");

  const contacts: ContactRow[] = useMemo(
    () =>
      state.contacts.map((c) => ({
        id: c.id,
        name: c.displayName,
        username: c.handle ?? "",
        avatar: c.avatarUrl ?? "",
        online: false,
        status: "VERIFIED" as SecurityStatus,
        isFavorite: false,
      })),
    [state.contacts]
  );

  const receivedRequests = contactRequests.filter((r) => r.type === "received");
  const sentRequests = contactRequests.filter((r) => r.type === "sent");

  const favorites = contacts.filter((c) => c.isFavorite).slice(0, 5);

  const filteredContacts = useMemo(
    () =>
      contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.username.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [contacts, searchQuery]
  );

  const groupedContacts = useMemo(
    () =>
      filteredContacts.reduce((acc, contact) => {
        const firstLetter = contact.name[0]?.toUpperCase() || "?";
        if (!acc[firstLetter]) acc[firstLetter] = [];
        acc[firstLetter].push(contact);
        return acc;
      }, {} as Record<string, ContactRow[]>),
    [filteredContacts]
  );

  const sortedLetters = Object.keys(groupedContacts).sort();

  const onlineCount = contacts.filter((c) => c.online).length;

  const handleAcceptRequest = (id: string) => {
    alert("Demande acceptée !");
  };

  const handleRefuseRequest = (id: string) => {
    if (confirm("Refuser cette demande de liaison ?")) {
      alert("Demande refusée");
    }
  };

  const handleCancelRequest = (id: string) => {
    if (confirm("Annuler cette demande ?")) {
      alert("Demande annulée");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-lg border-b border-gray-800">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">Contacts</h1>
                <p className="text-xs text-gray-400">
                  {contacts.length} contact{contacts.length > 1 ? "s" : ""} · {onlineCount} en ligne
                </p>
              </div>
              <Link to="/contacts/add">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation"
                >
                  <UserPlus className="w-6 h-6" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Rechercher un contact"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 h-12"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {!searchQuery && contactRequests.length > 0 && (
          <div className="p-4 border-b border-gray-800/50">
            <h2 className="text-lg font-semibold text-white mb-3">Demandes</h2>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setRequestTab("received")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  requestTab === "received"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800/50 text-gray-400 hover:text-white"
                }`}
              >
                Reçues ({receivedRequests.length})
              </button>
              <button
                onClick={() => setRequestTab("sent")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  requestTab === "sent"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800/50 text-gray-400 hover:text-white"
                }`}
              >
                Envoyées ({sentRequests.length})
              </button>
            </div>

            <div className="space-y-2">
              {requestTab === "received" ? (
                receivedRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={request.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold">
                          {request.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{request.username}</h3>
                        <p className="text-sm text-gray-400">Souhaite te lier sur KAZOOM</p>
                        <p className="text-xs text-gray-500">{request.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accepter
                      </Button>
                      <Button
                        onClick={() => handleRefuseRequest(request.id)}
                        variant="ghost"
                        className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-white"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Refuser
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                sentRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={request.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold">
                          {request.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{request.username}</h3>
                        <p className="text-sm text-gray-400">En attente d'acceptation</p>
                        <p className="text-xs text-gray-500">{request.date}</p>
                      </div>
                      <Button
                        onClick={() => handleCancelRequest(request.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-600/10"
                      >
                        Annuler
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {!searchQuery && favorites.length > 0 && (
          <div className="p-4 border-b border-gray-800/50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Favoris</h2>
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {favorites.map((contact) => (
                <Link key={contact.id} to={`/contacts/${contact.id}`}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-2 min-w-[70px]"
                  >
                    <div className="relative">
                      <Avatar className="w-16 h-16 border-2 border-indigo-600/50">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold">
                          {contact.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      {contact.online && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
                      )}
                      <div className="absolute -top-1 -right-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    <span className="text-xs text-white font-medium truncate w-full text-center">
                      {contact.name.split(" ")[0]}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {filteredContacts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-400 text-center mb-2">Aucun contact</p>
            <Link to="/contacts/add">
              <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700">
                Ajouter via QR ou code
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="pb-4">
            {sortedLetters.map((letter) => (
              <div key={letter} className="mb-2">
                <div className="sticky top-[162px] z-[5] bg-gray-900/80 backdrop-blur-sm px-4 py-2 border-b border-gray-800/50">
                  <h2 className="text-sm font-bold text-indigo-400">{letter}</h2>
                </div>
                <div className="divide-y divide-gray-800/50">
                  {groupedContacts[letter].map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="bg-gradient-to-r from-transparent via-gray-800/10 to-transparent hover:via-gray-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 p-4">
                        <Link to={`/contacts/${contact.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative">
                            <Avatar className="w-14 h-14 border-2 border-gray-800">
                              <AvatarImage src={contact.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold">
                                {contact.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            {contact.online && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate text-base">
                              {contact.name}
                            </h3>
                            <p className="text-sm text-gray-400 truncate">
                              {contact.username}
                            </p>
                          </div>
                        </Link>

                        <Link to={`/chat/${contact.id}`}>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-600/20 h-10 w-10"
                          >
                            <MessageSquare className="w-5 h-5" />
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}