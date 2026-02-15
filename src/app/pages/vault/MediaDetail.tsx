import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Share2, Download, Trash2, MessageCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "../../components/ui/button";

export function MediaDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showMenu, setShowMenu] = useState(false);

  // Mock data - in real app, fetch based on id
  const media = {
    id: "4",
    title: "Vacation photo.jpg",
    type: "image",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    size: 1024 * 1024 * 3.2, // 3.2 MB
    date: new Date(2025, 1, 1),
    fromConversation: "Famille",
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 10) / 10 + " " + sizes[i];
  };

  const handleShare = () => {
    // TODO: Implement share
    alert("Partage - À venir");
  };

  const handleExport = () => {
    // TODO: Implement export
    alert("Export - À venir");
  };

  const handleDelete = () => {
    if (confirm("Supprimer ce média du téléphone ? Il ne sera plus accessible hors ligne.")) {
      navigate("/vault");
    }
  };

  const handleViewInConversation = () => {
    // TODO: Navigate to message in conversation
    navigate("/conversation/1");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
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
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{media.title}</h1>
            <p className="text-xs text-gray-400">
              {media.type === "image" ? "Image" : "Média"}
            </p>
          </div>
        </div>
      </div>

      {/* Media Preview */}
      <div className="px-4 pb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative aspect-video w-full bg-gray-900 rounded-xl overflow-hidden border border-gray-700"
        >
          {media.type === "image" && (
            <img
              src={media.url}
              alt={media.title}
              className="w-full h-full object-cover"
            />
          )}
          {/* Video/Audio preview would go here */}
        </motion.div>
      </div>

      {/* Info Card */}
      <div className="px-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Type</span>
            <span className="text-sm text-white font-medium">
              {media.type === "image" ? "Image JPEG" : media.type}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Taille</span>
            <span className="text-sm text-white font-medium">{formatBytes(media.size)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Date</span>
            <span className="text-sm text-white font-medium">
              {media.date.toLocaleDateString("fr-FR")}
            </span>
          </div>

          {media.fromConversation && (
            <div className="pt-2 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Source</span>
                <span className="text-sm text-indigo-400 font-medium">
                  {media.fromConversation}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-6 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={() => window.open(media.url, "_blank")}
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12"
          >
            <ImageIcon className="w-5 h-5 mr-2" />
            Ouvrir
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 gap-3"
        >
          <Button
            onClick={handleShare}
            variant="ghost"
            className="bg-gray-800/50 hover:bg-gray-700/50 text-white h-12"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Partager
          </Button>
          
          <Button
            onClick={handleExport}
            variant="ghost"
            className="bg-gray-800/50 hover:bg-gray-700/50 text-white h-12"
          >
            <Download className="w-5 h-5 mr-2" />
            Exporter
          </Button>
        </motion.div>

        {media.fromConversation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={handleViewInConversation}
              variant="ghost"
              className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-white h-12"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Voir dans la conversation
            </Button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Button
            onClick={handleDelete}
            variant="ghost"
            className="w-full bg-red-600/10 hover:bg-red-600/20 border border-red-600/50 text-red-400 h-12"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Supprimer du téléphone
          </Button>
        </motion.div>
      </div>

      {/* Info Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-4 pb-6"
      >
        <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
          <p className="text-xs text-blue-400 leading-relaxed">
            💡 <strong>Info:</strong> Ce média a été téléchargé et est conservé dans ton coffre-fort. 
            Il reste accessible même si la conversation est supprimée. La suppression du téléphone 
            libère de l'espace mais tu pourras le télécharger à nouveau depuis la conversation.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
