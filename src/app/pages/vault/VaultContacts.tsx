import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Search, Users } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";

const allContacts = [
  {
    id: "1",
    name: "Marie Dubois",
    username: "@mariedubois",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  },
  {
    id: "4",
    name: "Lucas Bernard",
    username: "@lucasb",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
  },
];

export function VaultContacts() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [contactsWithFiles, setContactsWithFiles] = useState<Array<{
    id: string;
    name: string;
    username: string;
    avatar: string;
    filesCount: number;
  }>>([]);

  // Charger les contacts qui ont des fichiers liés
  useEffect(() => {
    const loadContactsWithFiles = () => {
      const contacts = allContacts.map(contact => {
        const storedNotes = localStorage.getItem(`contact-${contact.id}-notes`);
        const storedTables = localStorage.getItem(`contact-${contact.id}-tables`);
        
        const notesCount = storedNotes ? JSON.parse(storedNotes).length : 0;
        const tablesCount = storedTables ? JSON.parse(storedTables).length : 0;
        const filesCount = notesCount + tablesCount;
        
        return {
          ...contact,
          filesCount
        };
      }).filter(contact => contact.filesCount > 0); // Ne garder que ceux avec des fichiers
      
      setContactsWithFiles(contacts);
    };

    loadContactsWithFiles();
    
    // Écouter les changements dans localStorage et événements custom
    const handleStorageChange = () => {
      loadContactsWithFiles();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('contact-documents-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('contact-documents-updated', handleStorageChange);
    };
  }, []);

  const filteredContacts = contactsWithFiles.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-lg border-b border-gray-800">
          <div className="flex items-center gap-3 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/vault")}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Fichiers Contact</h1>
              <p className="text-xs text-gray-400">Fichiers liés aux contacts</p>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher un contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          {filteredContacts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucun contact avec fichiers liés
              </h3>
              <p className="text-gray-400 mb-6">
                Partage des fichiers avec tes contacts pour les voir ici
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact, index) => (
                <motion.button
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/vault/contacts/${contact.id}`)}
                  className="w-full flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 transition-colors"
                >
                  <Avatar className="w-14 h-14 border-2 border-gray-700">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold">
                      {contact.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-white">{contact.name}</h3>
                    <p className="text-sm text-gray-400">{contact.username}</p>
                    <p className="text-xs text-green-400 mt-1">
                      {contact.filesCount} fichier{contact.filesCount > 1 ? "s" : ""} lié{contact.filesCount > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-gray-500">›</div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}