import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Search, Check, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

interface Contact {
  id: string;
  name: string;
  username: string;
  avatar: string;
  online: boolean;
}

const contacts: Contact[] = [
  {
    id: "1",
    name: "Marie Dubois",
    username: "@mariedubois",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    online: true,
  },
  {
    id: "2",
    name: "Thomas Martin",
    username: "@thomas_m",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    online: false,
  },
  {
    id: "3",
    name: "Sophie Laurent",
    username: "@sophielaurent",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    online: true,
  },
  {
    id: "4",
    name: "Lucas Bernard",
    username: "@lucasb",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    online: false,
  },
  {
    id: "5",
    name: "Emma Petit",
    username: "@emma_p",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    online: true,
  },
];

export function NewChat() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleContact = (id: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedContacts(newSelected);
  };

  const handleCreateChat = () => {
    if (selectedContacts.size === 0) {
      alert("Sélectionne au moins un contact");
      return;
    }

    if (selectedContacts.size === 1) {
      const contactId = Array.from(selectedContacts)[0];
      navigate(`/chat/${contactId}`);
    } else {
      alert(`Groupe créé avec ${selectedContacts.size} membres !`);
      navigate("/conversations");
    }
  };

  const selectedContactsList = contacts.filter((c) => selectedContacts.has(c.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pb-32">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-lg border-b border-gray-800">
          <div className="flex items-center gap-3 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/conversations")}
              className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Nouvelle conversation</h1>
              <p className="text-xs text-gray-400">
                {selectedContacts.size > 0
                  ? `${selectedContacts.size} sélectionné${selectedContacts.size > 1 ? "s" : ""}`
                  : "Sélectionne un ou plusieurs contacts"
                }
              </p>
            </div>
          </div>

          <div className="px-4 pb-4">
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

          {selectedContactsList.length > 0 && (
            <div className="px-4 pb-4 overflow-x-auto">
              <div className="flex gap-3">
                {selectedContactsList.map((contact) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center gap-1 min-w-[60px]"
                  >
                    <div className="relative">
                      <Avatar className="w-14 h-14 border-2 border-indigo-600">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold">
                          {contact.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        onClick={() => handleToggleContact(contact.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-gray-900"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    <span className="text-xs text-white truncate w-full text-center">
                      {contact.name.split(" ")[0]}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-400 text-center">Aucun contact trouvé</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm"
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl divide-y divide-gray-700">
              {filteredContacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleToggleContact(contact.id)}
                  className="p-4 cursor-pointer hover:bg-gray-700/30 active:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedContacts.has(contact.id)
                          ? "bg-indigo-600 border-indigo-600"
                          : "border-gray-600"
                      }`}
                    >
                      {selectedContacts.has(contact.id) && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>

                    <div className="relative">
                      <Avatar className="w-14 h-14">
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
                      <h3 className="font-semibold text-white truncate">{contact.name}</h3>
                      <p className="text-sm text-gray-400 truncate">
                        {contact.online ? (
                          <span className="text-green-400">● En ligne</span>
                        ) : (
                          contact.username
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {selectedContacts.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto"
          >
            <Button
              onClick={handleCreateChat}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 text-lg shadow-2xl"
            >
              <Users className="w-5 h-5 mr-2" />
              {selectedContacts.size === 1
                ? "Créer"
                : `Créer un groupe (${selectedContacts.size})`
              }
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}