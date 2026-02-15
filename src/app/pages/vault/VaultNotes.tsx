import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Search, Plus, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface Note {
  id: string;
  title: string;
  content: string;
  modifiedAt: Date;
}

const mockNotes: Note[] = [
  {
    id: "1",
    title: "Liste de courses",
    content: "Lait, Pain, Fromage, Tomates, Salade, Poulet",
    modifiedAt: new Date(2025, 1, 14, 10, 30),
  },
  {
    id: "2",
    title: "Idées projet",
    content: "- Ajouter mode sombre\n- Intégration API\n- Tests unitaires\n- Documentation",
    modifiedAt: new Date(2025, 1, 13, 15, 20),
  },
  {
    id: "3",
    title: "Réunion du 12 février",
    content: "Points à aborder:\n1. Budget Q1\n2. Nouveaux objectifs\n3. Planning équipe",
    modifiedAt: new Date(2025, 1, 12, 9, 0),
  },
];

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `il y a ${diffMins} min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

function getPreviewText(content: string): string {
  // Remove markdown and get first line
  const cleaned = content.replace(/[#*`\-]/g, "").trim();
  const firstLine = cleaned.split("\n")[0];
  return firstLine.length > 80 ? firstLine.substring(0, 80) + "..." : firstLine;
}

export function VaultNotes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filteredNotes = notes.filter(
    (note) =>
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group notes by date
  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const date = note.modifiedAt.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  const handleDelete = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Supprimer cette note ?")) {
      setNotes(notes.filter((n) => n.id !== noteId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header - Style iPhone Notes */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-black to-transparent backdrop-blur-xl">
          <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/vault")}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white">Notes</h1>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                placeholder="Rechercher"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 rounded-xl"
              />
            </div>

            {/* Count */}
            <p className="text-sm text-gray-400 mt-3 text-center">
              {filteredNotes.length} note{filteredNotes.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Notes List */}
        <div className="px-4 pb-6">
          {filteredNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Plus className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchQuery ? "Aucune note trouvée" : "Aucune note"}
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                {searchQuery
                  ? "Essaye un autre terme de recherche"
                  : "Commence à noter tes idées"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => navigate("/vault/note/new")}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle note
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedNotes).map(([date, dateNotes]) => (
                <div key={date}>
                  {/* Date Header */}
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
                    {date}
                  </h2>

                  {/* Notes Cards */}
                  <div className="space-y-2">
                    {dateNotes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => navigate(`/vault/note/${note.id}`)}
                        className="group relative bg-gradient-to-br from-yellow-500/10 to-orange-500/5 backdrop-blur-lg border border-yellow-600/20 rounded-2xl p-4 hover:border-yellow-500/40 transition-all cursor-pointer"
                      >
                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDelete(note.id, e)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600/20"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-white mb-2 pr-10">
                          {note.title || "Sans titre"}
                        </h3>

                        {/* Preview */}
                        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                          {getPreviewText(note.content)}
                        </p>

                        {/* Time */}
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(note.modifiedAt)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAB Create Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/vault/note/new")}
          className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full shadow-lg flex items-center justify-center text-white z-20"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
}
