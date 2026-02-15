import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Grid, DollarSign, Package, TrendingUp } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

const templates = [
  {
    id: "budget",
    icon: DollarSign,
    title: "Budget",
    description: "Suivi des revenus et dépenses",
    color: "from-green-500/20 to-green-600/20",
    borderColor: "border-green-500/30",
    iconColor: "text-green-400",
    columns: ["Catégorie", "Budget", "Dépensé", "Restant"],
    rows: 12,
  },
  {
    id: "inventory",
    icon: Package,
    title: "Inventaire",
    description: "Gestion de stock",
    color: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-400",
    columns: ["Article", "Quantité", "Prix unitaire", "Total"],
    rows: 20,
  },
  {
    id: "tracking",
    icon: TrendingUp,
    title: "Suivi",
    description: "Objectifs et progression",
    color: "from-purple-500/20 to-purple-600/20",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400",
    columns: ["Objectif", "Cible", "Actuel", "Progression"],
    rows: 15,
  },
];

export function TableSetup() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleCreate = () => {
    if (!title) {
      alert("Veuillez entrer un titre pour le tableau");
      return;
    }

    // TODO: Create table with template or blank
    navigate("/vault/table/new");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-black to-transparent backdrop-blur-sm border-b border-gray-800">
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
            <h1 className="text-xl font-bold text-white">Nouveau tableau</h1>
            <p className="text-sm text-gray-400">Configure ton tableau</p>
          </div>
        </div>
      </div>

      {/* Setup Form */}
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-gray-300">Titre du tableau</label>
          <Input
            placeholder="Mon tableau..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-gray-800/50 border-gray-700 text-white text-lg"
            autoFocus
          />
        </motion.div>

        {/* Blank Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-gray-300">Type de tableau</label>
          
          <button
            onClick={() => setSelectedTemplate(null)}
            className={`w-full flex items-center gap-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-800/30 border rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all ${
              selectedTemplate === null
                ? "border-indigo-500 ring-2 ring-indigo-500/20"
                : "border-gray-700"
            }`}
          >
            <div className="p-3 rounded-lg bg-gray-900/50">
              <Grid className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-white">Tableau vide</div>
              <div className="text-sm text-gray-400">10 colonnes × 50 lignes</div>
            </div>
          </button>
        </motion.div>

        {/* Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-gray-300">Ou choisis un modèle</label>
          
          <div className="space-y-3">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`w-full flex items-center gap-4 p-4 bg-gradient-to-r ${template.color} border ${
                    selectedTemplate === template.id
                      ? `${template.borderColor} ring-2 ring-offset-2 ring-offset-black`
                      : template.borderColor
                  } rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all`}
                >
                  <div className="p-3 rounded-lg bg-gray-900/50">
                    <Icon className={`w-6 h-6 ${template.iconColor}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">{template.title}</div>
                    <div className="text-sm text-gray-400">{template.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {template.columns.length} colonnes · {template.rows} lignes
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Create Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <Button
            onClick={handleCreate}
            disabled={!title}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed h-12 text-base"
          >
            Créer le tableau
          </Button>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-gray-500 text-center"
        >
          Tu pourras ajouter des colonnes et lignes plus tard
        </motion.div>
      </div>
    </div>
  );
}