import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Save, 
  MoreVertical, 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
  Palette,
  Download,
  Trash2,
  Undo,
  Redo,
  Check
} from "lucide-react";
import { Button } from "../../components/ui/button";

interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  align?: "left" | "center" | "right" | "justify";
}

export function DocumentEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === "new";
  const editorRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState(isNew ? "" : "Document important");
  const [isSaved, setIsSaved] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [currentFormat, setCurrentFormat] = useState<TextStyle>({});

  useEffect(() => {
    if (editorRef.current && isNew) {
      editorRef.current.innerHTML = '<p style="color: #e5e7eb;">Commence à écrire ton document...</p>';
    } else if (editorRef.current && !isNew) {
      editorRef.current.innerHTML = `
        <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 16px; color: white;">Réunion d'équipe - Notes</h1>
        <p style="color: #e5e7eb; margin-bottom: 12px;">Date: 14 février 2026</p>
        <h2 style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; color: white;">Points à l'ordre du jour</h2>
        <ul style="color: #e5e7eb; margin-left: 24px; margin-bottom: 16px;">
          <li style="margin-bottom: 8px;">Révision du budget Q1</li>
          <li style="margin-bottom: 8px;">Nouvelles embauches prévues</li>
          <li style="margin-bottom: 8px;">Mise à jour du projet Alpha</li>
        </ul>
        <h2 style="font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; color: white;">Actions à prendre</h2>
        <ol style="color: #e5e7eb; margin-left: 24px; margin-bottom: 16px;">
          <li style="margin-bottom: 8px;">Finaliser le rapport financier <strong style="color: #fbbf24;">d'ici vendredi</strong></li>
          <li style="margin-bottom: 8px;">Organiser les entretiens pour le poste de développeur</li>
          <li style="margin-bottom: 8px;">Préparer la démo client pour la semaine prochaine</li>
        </ol>
        <p style="color: #e5e7eb; margin-top: 24px;">Notes supplémentaires: <em>N'oubliez pas d'envoyer le compte-rendu à tous les participants.</em></p>
      `;
    }
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      updateCurrentFormat();
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const updateCurrentFormat = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const parentElement = selection.anchorNode?.parentElement;
    if (!parentElement) return;

    const computedStyle = window.getComputedStyle(parentElement);
    
    setCurrentFormat({
      bold: computedStyle.fontWeight === "bold" || parseInt(computedStyle.fontWeight) >= 700,
      italic: computedStyle.fontStyle === "italic",
      underline: computedStyle.textDecoration.includes("underline"),
      align: (parentElement.style.textAlign as any) || "left",
      fontSize: parseInt(computedStyle.fontSize),
      color: computedStyle.color,
      backgroundColor: computedStyle.backgroundColor
    });
  };

  const handleInput = () => {
    setIsSaved(false);
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateCurrentFormat();
    setIsSaved(false);
  };

  const toggleBold = () => execCommand("bold");
  const toggleItalic = () => execCommand("italic");
  const toggleUnderline = () => execCommand("underline");
  
  const setAlignment = (align: string) => {
    let command = "justifyLeft";
    if (align === "center") command = "justifyCenter";
    else if (align === "right") command = "justifyRight";
    else if (align === "justify") command = "justifyFull";
    execCommand(command);
  };

  const insertList = (ordered: boolean) => {
    execCommand(ordered ? "insertOrderedList" : "insertUnorderedList");
  };

  const setFontSize = (size: number) => {
    execCommand("fontSize", "7");
    const fontElements = editorRef.current?.querySelectorAll('font[size="7"]');
    fontElements?.forEach((element) => {
      const span = document.createElement("span");
      span.style.fontSize = `${size}px`;
      span.innerHTML = element.innerHTML;
      element.parentNode?.replaceChild(span, element);
    });
    setShowFontSize(false);
    setIsSaved(false);
  };

  const setTextColor = (color: string) => {
    execCommand("foreColor", color);
    setShowColorPicker(false);
  };

  const setBackgroundColor = (color: string) => {
    execCommand("backColor", color);
    setShowBgColorPicker(false);
  };

  const insertLink = () => {
    const url = prompt("Entrez l'URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      navigate("/vault/files");
    }, 300);
  };

  const handleBack = () => {
    if (!isSaved) {
      if (confirm("Tu as des modifications non enregistrées. Quitter quand même ?")) {
        navigate("/vault/files");
      }
    } else {
      navigate("/vault/files");
    }
  };

  const handleDelete = () => {
    if (confirm("Supprimer ce document définitivement ?")) {
      navigate("/vault/files");
    }
    setShowMenu(false);
  };

  const handleExport = () => {
    const content = editorRef.current?.innerHTML || "";
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      max-width: 800px; 
      margin: 40px auto; 
      padding: 20px;
      background: #1a1a1a;
      color: #e5e7eb;
    }
    h1, h2, h3 { color: white; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
</body>
</html>
    `;
    
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "document"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

  const colors = [
    { name: "Blanc", value: "#ffffff" },
    { name: "Gris", value: "#9ca3af" },
    { name: "Rouge", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Jaune", value: "#fbbf24" },
    { name: "Vert", value: "#22c55e" },
    { name: "Bleu", value: "#3b82f6" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Violet", value: "#a855f7" },
    { name: "Rose", value: "#ec4899" },
  ];

  const bgColors = [
    { name: "Aucun", value: "transparent" },
    { name: "Gris", value: "#374151" },
    { name: "Rouge", value: "#7f1d1d" },
    { name: "Orange", value: "#7c2d12" },
    { name: "Jaune", value: "#713f12" },
    { name: "Vert", value: "#14532d" },
    { name: "Bleu", value: "#1e3a8a" },
    { name: "Indigo", value: "#312e81" },
    { name: "Violet", value: "#581c87" },
    { name: "Rose", value: "#831843" },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      <div className="flex-shrink-0 bg-gradient-to-b from-gray-900 to-gray-900/95 border-b border-gray-800">
        <div className="flex items-center gap-2 px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-gray-400 hover:text-white h-10 w-10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setIsSaved(false);
            }}
            className="text-base font-semibold bg-transparent border-none focus:outline-none text-white flex-1"
            placeholder="Titre du document"
          />
          {isSaved ? (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <Check className="w-3 h-3" />
              <span>Enregistré</span>
            </div>
          ) : (
            <div className="text-xs text-gray-400">Non enregistré</div>
          )}
          <Button
            onClick={handleSave}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white h-10 w-10"
          >
            <Save className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMenu(true)}
            className="text-gray-400 hover:text-white h-10 w-10"
          >
            <MoreVertical className="w-6 h-6" />
          </Button>
        </div>

        <div className="px-3 pb-2 flex items-center gap-1 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
            <button
              onClick={() => execCommand("undo")}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Annuler"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => execCommand("redo")}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Rétablir"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 border-r border-gray-700 px-2">
            <div className="relative">
              <button
                onClick={() => setShowFontSize(!showFontSize)}
                className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors flex items-center gap-1"
              >
                <Type className="w-4 h-4" />
                <span className="text-xs">{currentFormat.fontSize || 16}px</span>
              </button>
              
              {showFontSize && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[120px]"
                  >
                    {fontSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {size}px
                      </button>
                    ))}
                  </motion.div>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowFontSize(false)}
                  />
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 border-r border-gray-700 px-2">
            <button
              onClick={toggleBold}
              className={`p-2 rounded transition-colors ${
                currentFormat.bold
                  ? "text-white bg-indigo-600"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
              title="Gras"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={toggleItalic}
              className={`p-2 rounded transition-colors ${
                currentFormat.italic
                  ? "text-white bg-indigo-600"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
              title="Italique"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={toggleUnderline}
              className={`p-2 rounded transition-colors ${
                currentFormat.underline
                  ? "text-white bg-indigo-600"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
              title="Souligné"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 border-r border-gray-700 px-2">
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                title="Couleur du texte"
              >
                <div className="relative">
                  <Type className="w-4 h-4" />
                  <div
                    className="absolute -bottom-0.5 left-0 right-0 h-1 rounded"
                    style={{ backgroundColor: currentFormat.color || "#ffffff" }}
                  />
                </div>
              </button>

              {showColorPicker && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 p-2 grid grid-cols-5 gap-2"
                  >
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setTextColor(color.value)}
                        className="w-8 h-8 rounded border-2 border-gray-600 hover:border-white transition-colors"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </motion.div>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowColorPicker(false)}
                  />
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                title="Couleur de fond"
              >
                <Palette className="w-4 h-4" />
              </button>

              {showBgColorPicker && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 p-2 grid grid-cols-5 gap-2"
                  >
                    {bgColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setBackgroundColor(color.value)}
                        className="w-8 h-8 rounded border-2 border-gray-600 hover:border-white transition-colors"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </motion.div>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowBgColorPicker(false)}
                  />
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 border-r border-gray-700 px-2">
            <button
              onClick={() => setAlignment("left")}
              className={`p-2 rounded transition-colors ${
                currentFormat.align === "left"
                  ? "text-white bg-indigo-600"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
              title="Aligner à gauche"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAlignment("center")}
              className={`p-2 rounded transition-colors ${
                currentFormat.align === "center"
                  ? "text-white bg-indigo-600"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
              title="Centrer"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAlignment("right")}
              className={`p-2 rounded transition-colors ${
                currentFormat.align === "right"
                  ? "text-white bg-indigo-600"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
              title="Aligner à droite"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAlignment("justify")}
              className={`p-2 rounded transition-colors ${
                currentFormat.align === "justify"
                  ? "text-white bg-indigo-600"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
              title="Justifier"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1 px-2">
            <button
              onClick={() => insertList(false)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Liste à puces"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertList(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Liste numérotée"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={insertLink}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Insérer un lien"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-950 p-6">
        <div className="max-w-4xl mx-auto bg-gray-900/50 rounded-lg shadow-2xl border border-gray-800 min-h-full p-8">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="outline-none min-h-[600px] text-gray-200 leading-relaxed"
            style={{ wordWrap: "break-word" }}
          />
        </div>
      </div>

      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black border-t border-gray-700 rounded-t-3xl z-50 safe-area-bottom"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>
              <div className="p-4 space-y-2 pb-6">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl active:bg-gray-700/50 transition-colors"
                >
                  <Download className="w-6 h-6 text-green-400" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-white">Exporter HTML</div>
                    <div className="text-sm text-gray-400">Télécharger le document</div>
                  </div>
                </button>
                
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-4 p-4 bg-red-600/10 border border-red-600/30 rounded-xl active:bg-red-600/20 transition-colors"
                >
                  <Trash2 className="w-6 h-6 text-red-400" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-red-400">Supprimer</div>
                    <div className="text-sm text-red-400/70">Action irréversible</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
