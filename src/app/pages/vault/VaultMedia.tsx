import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Search, MoreVertical, Image as ImageIcon, Video, Music, File, Check } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

interface MediaItem {
  id: string;
  type: "image" | "video" | "audio" | "file";
  title: string;
  url: string;
  thumbnail?: string;
  size: number;
  date: Date;
  fromConversation?: string;
}

const mockMedia: MediaItem[] = [
  {
    id: "1",
    type: "image",
    title: "Vacation photo.jpg",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    size: 1024 * 1024 * 3.2,
    date: new Date(2025, 1, 1),
    fromConversation: "Famille",
  },
  {
    id: "2",
    type: "image",
    title: "Screenshot.png",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba",
    size: 1024 * 1024 * 1.5,
    date: new Date(2025, 1, 10),
    fromConversation: "Travail",
  },
  {
    id: "3",
    type: "video",
    title: "Birthday video.mp4",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
    size: 1024 * 1024 * 25,
    date: new Date(2025, 0, 20),
    fromConversation: "Famille",
  },
  {
    id: "4",
    type: "image",
    title: "Document scan.jpg",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
    size: 1024 * 1024 * 2.1,
    date: new Date(2025, 1, 5),
  },
];

const filters = [
  { label: "Tout", value: "all" },
  { label: "Photos", value: "image" },
  { label: "Vidéos", value: "video" },
  { label: "Audio", value: "audio" },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 10) / 10 + " " + sizes[i];
}

export function VaultMedia() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [media] = useState<MediaItem[]>(mockMedia);
  const [activeFilter, setActiveFilter] = useState<"all" | "image" | "video" | "audio">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);

  // Mode sélection si on vient du chat
  const selectMode = searchParams.get("selectMode") === "true";
  const chatId = searchParams.get("chatId");

  const handleMediaClick = (item: MediaItem) => {
    if (selectMode) {
      // Mode sélection : marquer l'image comme sélectionnée
      setSelectedImage(item);
    } else {
      // Mode normal : ouvrir le détail
      navigate(`/vault/media/${item.id}`);
    }
  };

  const handleSendImage = () => {
    if (selectedImage && chatId) {
      // Stocker l'image sélectionnée dans le localStorage pour la récupérer dans le chat
      localStorage.setItem("selectedVaultImage", JSON.stringify(selectedImage));
      // Retourner au chat
      navigate(`/chat/${chatId}`);
    }
  };

  const filteredMedia = media.filter((item) => {
    const matchesFilter = activeFilter === "all" || item.type === activeFilter;
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "image":
        return ImageIcon;
      case "video":
        return Video;
      case "audio":
        return Music;
      default:
        return File;
    }
  };

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
              <h1 className="text-xl font-bold text-white">Média</h1>
              <p className="text-sm text-gray-400">
                {filteredMedia.length} élément{filteredMedia.length !== 1 ? "s" : ""}
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
                    <button
                      onClick={() => {
                        setViewMode(viewMode === "grid" ? "list" : "grid");
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-700 transition-colors"
                    >
                      Vue {viewMode === "grid" ? "liste" : "grille"}
                    </button>
                    <button className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-700 transition-colors">
                      Trier par date
                    </button>
                    <button className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-700 transition-colors">
                      Trier par taille
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
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>

          {/* Media Grid/List */}
          {filteredMedia.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchQuery ? "Aucun résultat" : "Aucun média"}
              </h3>
              <p className="text-sm text-gray-400">
                {searchQuery
                  ? "Essaye un autre terme de recherche"
                  : "Les médias téléchargés apparaîtront ici"}
              </p>
            </motion.div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-2">
              {filteredMedia.map((item, index) => {
                const Icon = getIcon(item.type);
                const isSelected = selectMode && selectedImage?.id === item.id;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleMediaClick(item)}
                    className={`relative aspect-square rounded-xl overflow-hidden bg-gray-800 cursor-pointer group ${
                      isSelected ? "border-2 border-purple-500 ring-2 ring-purple-500/50" : "border border-gray-700"
                    }`}
                  >
                    {item.type === "image" || item.type === "video" ? (
                      <>
                        <img
                          src={item.url}
                          alt={item.title}
                          className={`w-full h-full object-cover transition-all duration-300 ${
                            isSelected ? "scale-95" : "group-hover:scale-110"
                          }`}
                        />
                        {item.type === "video" && !isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <Video className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <Icon className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    
                    {/* Checkmark pour sélection */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Overlay with info */}
                    {!isSelected && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-white font-medium truncate">{item.title}</p>
                        <p className="text-xs text-gray-400">{formatBytes(item.size)}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMedia.map((item, index) => {
                const Icon = getIcon(item.type);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleMediaClick(item)}
                    className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-3 hover:bg-gray-700/30 transition-colors cursor-pointer group flex items-center gap-3"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                      {item.type === "image" || item.type === "video" ? (
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white mb-1 truncate">{item.title}</h3>
                      <p className="text-xs text-gray-400">
                        {formatBytes(item.size)}
                        {item.fromConversation && ` · ${item.fromConversation}`}
                      </p>
                    </div>

                    <MoreVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-4 mt-6 p-4 bg-purple-600/10 border border-purple-600/30 rounded-lg"
        >
          <p className="text-xs text-purple-400 leading-relaxed">
            💡 <strong>Info:</strong> Seuls les médias explicitement téléchargés sont conservés ici. 
            Les aperçus temporaires sont stockés dans le cache.
          </p>
        </motion.div>

        {/* Send Button in Select Mode */}
        {selectMode && selectedImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-0 right-0 flex justify-center z-20"
          >
            <Button
              onClick={handleSendImage}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-6 rounded-full shadow-2xl flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span className="font-semibold">Envoyer l'image</span>
            </Button>
          </motion.div>
        )}
      </div>

      {showMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
}