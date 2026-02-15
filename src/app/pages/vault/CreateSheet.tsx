import { motion, AnimatePresence } from "motion/react";
import { FileText, FileCode, Table, Upload, X } from "lucide-react";

interface CreateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNote: () => void;
  onCreateDocument: () => void;
  onCreateTable: () => void;
}

const createOptions = [
  {
    icon: FileText,
    title: "Nouvelle note",
    description: "Texte rapide",
    color: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
    action: "note" as const,
  },
  {
    icon: FileCode,
    title: "Nouveau document",
    description: "Markdown / structuré",
    color: "from-purple-500/20 to-purple-600/20",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
    action: "document" as const,
  },
  {
    icon: Table,
    title: "Nouveau tableau",
    description: "Grille type Excel",
    color: "from-green-500/20 to-green-600/20",
    borderColor: "border-green-500/30",
    iconColor: "text-green-400",
    action: "table" as const,
  },
  {
    icon: Upload,
    title: "Importer",
    description: "PDF, image, fichier",
    color: "from-orange-500/20 to-orange-600/20",
    borderColor: "border-orange-500/30",
    iconColor: "text-orange-400",
    action: "import" as const,
  },
];

export function CreateSheet({
  isOpen,
  onClose,
  onCreateNote,
  onCreateDocument,
  onCreateTable,
}: CreateSheetProps) {
  const handleAction = (action: string) => {
    switch (action) {
      case "note":
        onCreateNote();
        break;
      case "document":
        onCreateDocument();
        break;
      case "table":
        onCreateTable();
        break;
      case "import":
        // TODO: Implement import
        alert("Importation - À venir");
        break;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black border-t border-gray-700 rounded-t-3xl z-50 max-w-2xl mx-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Créer</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options */}
            <div className="p-6 space-y-3 pb-8">
              {createOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.action}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleAction(option.action)}
                    className={`w-full flex items-center gap-4 p-4 bg-gradient-to-r ${option.color} border ${option.borderColor} rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform`}
                  >
                    <div className="p-3 rounded-lg bg-gray-900/50">
                      <Icon className={`w-6 h-6 ${option.iconColor}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white">{option.title}</div>
                      <div className="text-sm text-gray-400">{option.description}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
