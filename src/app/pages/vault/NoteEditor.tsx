import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Check, MoreVertical, Save } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { PinModal } from "../../components/PinModal";

export function NoteEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === "new";
  const isContactNote = id?.startsWith("contact-");
  const contactId = isContactNote ? id.split("-")[1] : null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'save' | 'back' | null>(null);

  // Load note from localStorage
  useEffect(() => {
    if (id && !isNew) {
      try {
        const storedNote = localStorage.getItem(`note-${id}`);
        if (storedNote) {
          const note = JSON.parse(storedNote);
          setTitle(note.title || "");
          setContent(note.content || "");
        } else if (isContactNote && contactId) {
          // Si c'est une nouvelle note de contact, créer l'entrée immédiatement
          const noteEntry = {
            id,
            title: "Sans titre",
            date: new Date().toLocaleDateString("fr-FR")
          };
          
          const storedNotes = localStorage.getItem(`contact-${contactId}-notes`);
          const notes = storedNotes ? JSON.parse(storedNotes) : [];
          
          // Ajouter seulement si elle n'existe pas déjà
          const existingIndex = notes.findIndex((n: any) => n.id === id);
          if (existingIndex < 0) {
            notes.push(noteEntry);
            localStorage.setItem(`contact-${contactId}-notes`, JSON.stringify(notes));
            
            // Sauvegarder aussi la note vide
            localStorage.setItem(`note-${id}`, JSON.stringify({
              id,
              title: "Sans titre",
              content: "",
              date: new Date().toLocaleDateString("fr-FR")
            }));
            
            // Notifier les autres composants
            window.dispatchEvent(new Event('contact-documents-updated'));
          }
        }
      } catch (error) {
        console.error("Error loading note:", error);
      }
    }
  }, [id, isNew, isContactNote, contactId]);

  // Auto-save simulation
  useEffect(() => {
    if (!title && !content) {
      setIsSaved(true);
      return;
    }
    
    setIsSaved(false);
    const timer = setTimeout(() => {
      // Save to localStorage
      if (id) {
        const note = {
          id,
          title: title || "Sans titre",
          content,
          date: new Date().toLocaleDateString("fr-FR")
        };
        localStorage.setItem(`note-${id}`, JSON.stringify(note));
        
        // If it's a contact note, update the contact's note list
        if (isContactNote && contactId) {
          try {
            const storedNotes = localStorage.getItem(`contact-${contactId}-notes`);
            const notes = storedNotes ? JSON.parse(storedNotes) : [];
            const existingIndex = notes.findIndex((n: any) => n.id === id);
            
            const noteEntry = {
              id,
              title: title || "Sans titre",
              date: new Date().toLocaleDateString("fr-FR")
            };
            
            if (existingIndex >= 0) {
              notes[existingIndex] = noteEntry;
            } else {
              notes.push(noteEntry);
            }
            
            localStorage.setItem(`contact-${contactId}-notes`, JSON.stringify(notes));
            
            // Notifier les autres composants
            window.dispatchEvent(new Event('contact-documents-updated'));
          } catch (error) {
            console.error("Error updating contact notes:", error);
          }
        }
      }
      setIsSaved(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content, id, isContactNote, contactId]);

  const getBackRoute = () => {
    if (isContactNote && contactId) {
      return `/contacts/${contactId}`;
    }
    return "/vault/notes";
  };

  const handleSave = () => {
    // Pour les notes de contact, demander le PIN avant d'enregistrer
    if (isContactNote) {
      setPendingAction('save');
      setShowPinModal(true);
    } else {
      performSave();
    }
  };

  const performSave = () => {
    setIsSaved(true);
    navigate(getBackRoute());
  };

  const handlePinSuccess = () => {
    setShowPinModal(false);
    if (pendingAction === 'save') {
      performSave();
    } else if (pendingAction === 'back') {
      navigate(getBackRoute());
    }
    setPendingAction(null);
  };

  const handleBack = () => {
    if (!isSaved) {
      if (confirm("Tu as des modifications non enregistrées. Quitter quand même ?")) {
        // Pour les notes de contact, demander le PIN avant de quitter
        if (isContactNote) {
          setPendingAction('back');
          setShowPinModal(true);
        } else {
          navigate(getBackRoute());
        }
      }
    } else {
      // Pour les notes de contact, demander le PIN avant de quitter
      if (isContactNote) {
        setPendingAction('back');
        setShowPinModal(true);
      } else {
        navigate(getBackRoute());
      }
    }
  };

  const handleDelete = () => {
    if (confirm("Supprimer cette note définitivement ?")) {
      if (id) {
        localStorage.removeItem(`note-${id}`);
        
        // If it's a contact note, remove from contact's note list
        if (isContactNote && contactId) {
          try {
            const storedNotes = localStorage.getItem(`contact-${contactId}-notes`);
            if (storedNotes) {
              const notes = JSON.parse(storedNotes);
              const updatedNotes = notes.filter((n: any) => n.id !== id);
              localStorage.setItem(`contact-${contactId}-notes`, JSON.stringify(updatedNotes));
            }
          } catch (error) {
            console.error("Error removing note from contact:", error);
          }
        }
      }
      navigate(getBackRoute());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-black to-transparent backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">
              {isNew ? "Nouvelle note" : "Modifier la note"}
            </h1>
            <p className="text-xs text-gray-400">
              {isSaved ? (
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Enregistré
                </span>
              ) : (
                "Enregistrement..."
              )}
            </p>
          </div>
          <Button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
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

            {showMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-20"
                >
                  <button className="w-full px-4 py-3 text-left text-sm text-white hover:bg-gray-700 transition-colors">
                    Exporter
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-gray-700 transition-colors"
                  >
                    Supprimer
                  </button>
                </motion.div>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {/* Title */}
        <Input
          placeholder="Titre (optionnel)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 px-0"
        />

        {/* Content */}
        <div className="min-h-[70vh]">
          <textarea
            placeholder="Commence à écrire..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full min-h-[70vh] bg-transparent border-none focus:outline-none text-white placeholder:text-gray-600 resize-none text-base leading-relaxed"
            autoFocus
          />
        </div>

        {/* Info */}
        {(title || content) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-500 pt-4 border-t border-gray-800"
          >
            {content.length} caractères
          </motion.div>
        )}
      </div>

      {/* Pin Modal */}
      <PinModal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPendingAction(null);
        }}
        onSuccess={handlePinSuccess}
        alwaysAsk={true}
        title="Confirmer l'enregistrement"
      />
    </div>
  );
}