import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  MoreVertical, 
  FileText, 
  Table, 
  StickyNote,
  Lock
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

const mockContacts = {
  "1": {
    id: "1",
    name: "Marie Dubois",
    username: "@mariedubois",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  },
  "4": {
    id: "4",
    name: "Lucas Bernard",
    username: "@lucasb",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
  },
};

export function VaultContactFiles() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [contactNotes, setContactNotes] = useState<Array<{ id: string; title: string; date: string }>>([]);
  const [contactTables, setContactTables] = useState<Array<{ id: string; title: string; date: string }>>([]);

  const contact = mockContacts[id as keyof typeof mockContacts];

  // Load contact documents from localStorage
  useEffect(() => {
    if (!id) return;
    
    const loadDocuments = () => {
      try {
        const storedNotes = localStorage.getItem(`contact-${id}-notes`);
        const storedTables = localStorage.getItem(`contact-${id}-tables`);
        
        if (storedNotes) {
          setContactNotes(JSON.parse(storedNotes));
        }
        if (storedTables) {
          setContactTables(JSON.parse(storedTables));
        }
      } catch (error) {
        console.error("Error loading documents:", error);
      }
    };

    loadDocuments();
    
    // Écouter les changements pour rafraîchir la liste
    const handleUpdate = () => {
      loadDocuments();
    };
    
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('contact-documents-updated', handleUpdate);
    
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('contact-documents-updated', handleUpdate);
    };
  }, [id]);

  const handleFileClick = (fileId: string, type: "note" | "table") => {
    // Naviguer directement vers le fichier (pas besoin de PIN car on est déjà dans la vault)
    if (type === "note") {
      navigate(`/vault/note/${fileId}`);
    } else {
      navigate(`/vault/table/${fileId}`);
    }
  };

  if (!contact) {
    navigate("/vault/contacts");
    return null;
  }

  const allFiles = [
    ...contactTables.map(table => ({
      id: table.id,
      type: "table" as const,
      title: table.title,
      modified: table.date,
      icon: Table,
      color: "text-green-400",
      bgColor: "bg-green-600/20",
      borderColor: "border-green-600/40",
    })),
    ...contactNotes.map(note => ({
      id: note.id,
      type: "note" as const,
      title: note.title,
      modified: note.date,
      icon: StickyNote,
      color: "text-yellow-400",
      bgColor: "bg-yellow-600/20",
      borderColor: "border-yellow-600/40",
    }))
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-lg border-b border-gray-800">
          <div className="flex items-center gap-3 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/vault/contacts")}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <Avatar className="w-10 h-10 border-2 border-gray-700">
              <AvatarImage src={contact.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold">
                {contact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">{contact.name}</h1>
              <p className="text-xs text-gray-400">{contact.username}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
            >
              <MoreVertical className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          {allFiles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucun fichier lié
              </h3>
              <p className="text-gray-400">
                Partage des fichiers avec {contact.name.split(" ")[0]} pour les voir ici
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {allFiles.map((file, index) => {
                const Icon = file.icon;
                return (
                  <motion.button
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleFileClick(file.id, file.type)}
                    className={`w-full flex items-center gap-4 p-4 ${file.bgColor} border ${file.borderColor} rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-transform`}
                  >
                    <div className="w-12 h-12 bg-gray-900/50 rounded-xl flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${file.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        {file.title}
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                      </h3>
                      <p className="text-xs text-gray-400">Modifié {file.modified}</p>
                    </div>
                    <div className="text-gray-500">›</div>
                  </motion.button>
                );
              })}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-indigo-600/10 border border-indigo-600/30 rounded-lg"
          >
            <p className="text-xs text-indigo-400 leading-relaxed">
              🔒 <strong>Sécurité Coffre-fort</strong> - Ces fichiers sont protégés par ton code de verrouillage et chiffrés localement.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}