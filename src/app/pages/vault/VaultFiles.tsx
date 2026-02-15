import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Search, MoreVertical, Plus, FileCode, Table as TableIcon, Check, FileText } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface FileItem {
  id: string;
  type: "document" | "table";
  title: string;
  size: number;
  modifiedAt: Date;
}

const mockFiles: FileItem[] = [
  {
    id: "1",
    type: "document",
    title: "Documentation API",
    size: 1024 * 15,
    modifiedAt: new Date(2025, 1, 13),
  },
  {
    id: "2",
    type: "table",
    title: "Budget mensuel",
    size: 1024 * 8,
    modifiedAt: new Date(2025, 1, 14),
  },
  {
    id: "3",
    type: "table",
    title: "Inventaire",
    size: 1024 * 12,
    modifiedAt: new Date(2025, 1, 12),
  },
];

const filters = [
  { label: "Tout", value: "all" },
  { label: "Documents", value: "document" },
  { label: "Tableaux", value: "table" },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 10) / 10 + " " + sizes[i];
}

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
  return date.toLocaleDateString("fr-FR");
}

export function VaultFiles() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [files] = useState<FileItem[]>(mockFiles);
  const [activeFilter, setActiveFilter] = useState<"all" | "document" | "table">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  // Mode sélection si on vient du chat
  const selectMode = searchParams.get("selectMode") === "true";
  const chatId = searchParams.get("chatId");

  const handleFileClick = (file: FileItem) => {
    if (selectMode) {
      // Mode sélection : marquer le fichier comme sélectionné
      setSelectedFile(file);
    } else {
      // Mode normal : ouvrir le fichier
      if (file.type === "document") navigate(`/vault/document/${file.id}`);
      else navigate(`/vault/table/${file.id}`);
    }
  };

  const handleSendFile = () => {
    if (selectedFile && chatId) {
      // Stocker le fichier sélectionné dans le localStorage pour le récupérer dans le chat
      localStorage.setItem("selectedVaultFile", JSON.stringify(selectedFile));
      // Retourner au chat
      navigate(`/chat/${chatId}`);
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesFilter = activeFilter === "all" || file.type === activeFilter;
    const matchesSearch =
      searchQuery === "" ||
      file.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-black to-transparent backdrop-blur-sm">
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/vault")}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Mes fichiers</h1>
              <p className="text-sm text-gray-400">
                {filteredFiles.length} fichier{filteredFiles.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              className="text-gray-400 hover:text-white"
            >
              <Search className="w-5 h-5" />
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-400 hover:text-white"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-20"
                  >
                    <button className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-700 transition-colors">
                      Trier
                    </button>
                    <button className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-700 transition-colors">
                      Importer
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-4"
              >
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-4 space-y-4">
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <motion.button
                key={filter.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter.value as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === filter.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>

          {/* Files List */}
          {filteredFiles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                <FileCode className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchQuery ? "Aucun résultat" : "Aucun fichier"}
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                {searchQuery
                  ? "Essaye un autre terme de recherche"
                  : "Crée ton premier document ou tableau"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowCreateMenu(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file, index) => {
                const Icon = file.type === "document" ? FileCode : TableIcon;
                const isSelected = selectMode && selectedFile?.id === file.id;
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleFileClick(file)}
                    className={`bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 hover:bg-gray-700/30 transition-colors cursor-pointer group relative ${
                      isSelected ? "border-2 border-purple-500 ring-2 ring-purple-500/50" : "border border-gray-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${
                        isSelected ? "bg-purple-600/20" : "bg-gray-700/50 group-hover:bg-purple-600/20"
                      }`}>
                        <Icon className={`w-5 h-5 transition-colors ${
                          isSelected ? "text-purple-400" : "text-gray-400 group-hover:text-purple-400"
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white mb-1 truncate">{file.title}</h3>
                        <p className="text-xs text-gray-400">
                          Modifié {formatRelativeTime(file.modifiedAt)} · {formatBytes(file.size)}
                        </p>
                      </div>

                      {isSelected ? (
                        <div className="p-2 rounded-full bg-purple-600 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* FAB Create Button */}
        {!selectMode && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCreateMenu(true)}
            className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-lg flex items-center justify-center text-white z-20"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        )}

        {/* Send Button in Select Mode */}
        {selectMode && selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-0 right-0 flex justify-center z-20"
          >
            <Button
              onClick={handleSendFile}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-6 rounded-full shadow-2xl flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span className="font-semibold">Envoyer le fichier</span>
            </Button>
          </motion.div>
        )}

        {/* Create Menu */}
        <AnimatePresence>
          {showCreateMenu && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCreateMenu(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black border-t border-gray-700 rounded-t-3xl z-50 max-w-2xl mx-auto"
              >
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
                </div>
                <div className="p-6 space-y-3 pb-8">
                  <button
                    onClick={() => {
                      setShowCreateMenu(false);
                      navigate("/vault/document/new");
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    <div className="p-3 rounded-lg bg-gray-900/50">
                      <FileCode className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white">Nouveau document</div>
                      <div className="text-sm text-gray-400">Markdown / structuré</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateMenu(false);
                      navigate("/vault/table/setup");
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    <div className="p-3 rounded-lg bg-gray-900/50">
                      <TableIcon className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white">Nouveau tableau</div>
                      <div className="text-sm text-gray-400">Grille type Excel</div>
                    </div>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {showMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
}