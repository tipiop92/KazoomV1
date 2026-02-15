import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  MessageSquare,
  MoreVertical,
  Shield,
  QrCode,
  Share2,
  UserMinus,
  Ban,
  Calendar,
  FileText,
  Copy,
  Check,
  AlertTriangle,
  Table,
  StickyNote,
  Plus,
  Trash2,
  Bell,
  X
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { PinModal } from "../components/PinModal";
import { BadgeStatus, SecurityStatus } from "../components/contacts/BadgeStatus";
import { WheelPicker } from "../components/WheelPicker";

const mockContacts = {
  "1": {
    id: "1",
    name: "Marie Dubois",
    username: "@mariedubois",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    online: true,
    status: "VERIFIED" as SecurityStatus,
    safetyNumber: "8451 2210 9A3C 7BF4 E892 1034 5DA2 C819 F603 2A71",
    keyCode: "ED3GHD",
    dateAdded: "14 janvier 2026",
    notes: "Collègue de travail - Équipe marketing",
  },
  "4": {
    id: "4",
    name: "Lucas Bernard",
    username: "@lucasb",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    online: false,
    status: "KEY_CHANGED" as SecurityStatus,
    safetyNumber: "1245 8890 2B4D 9CE1 F723 4567 8ABC DEF0 1234 5678",
    keyCode: "AB7KJ2",
    dateAdded: "3 février 2026",
    notes: "",
    lastSeen: "Hier",
  },
};

export function ContactDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showMenu, setShowMenu] = useState(false);
  const [copiedSafety, setCopiedSafety] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [notes, setNotes] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [contactNotes, setContactNotes] = useState<Array<{ id: string; title: string; date: string }>>([]);
  const [contactTables, setContactTables] = useState<Array<{ id: string; title: string; date: string }>>([]);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState<'tables' | 'notes'>('tables');
  const [contactAlerts, setContactAlerts] = useState<Array<{ id: string; title: string; date: string; time: string; note: string }>>([]);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlertTitle, setNewAlertTitle] = useState('');
  const [newAlertNote, setNewAlertNote] = useState('');
  const [newAlertDate, setNewAlertDate] = useState('');
  const [newAlertTime, setNewAlertTime] = useState('');
  
  // États pour les roues de sélection
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  
  // États pour la suppression sécurisée
  const [pendingDeleteType, setPendingDeleteType] = useState<'table' | 'note' | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const contact = mockContacts[id as keyof typeof mockContacts] || mockContacts["1"];

  // Load contact documents from localStorage
  useEffect(() => {
    const loadDocuments = () => {
      try {
        const storedNotes = localStorage.getItem(`contact-${id}-notes`);
        const storedTables = localStorage.getItem(`contact-${id}-tables`);
        
        // Charger les alertes globales et filtrer par contactId
        const globalAlerts = localStorage.getItem("global-alerts");
        
        if (storedNotes) {
          setContactNotes(JSON.parse(storedNotes));
        }
        if (storedTables) {
          setContactTables(JSON.parse(storedTables));
        }
        if (globalAlerts) {
          const allAlerts = JSON.parse(globalAlerts);
          // Filtrer pour ce contact
          const contactAlerts = allAlerts.filter((alert: any) => alert.contactId === id);
          setContactAlerts(contactAlerts);
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
    
    window.addEventListener('contact-documents-updated', handleUpdate);
    window.addEventListener('alerts-updated', handleUpdate);
    
    return () => {
      window.removeEventListener('contact-documents-updated', handleUpdate);
      window.removeEventListener('alerts-updated', handleUpdate);
    };
  }, [id]);

  const handleCreateNote = () => {
    console.log('[ContactDetail] handleCreateNote appelé');
    const noteId = `contact-${id}-note-${Date.now()}`;
    console.log('[ContactDetail] noteId créé:', noteId);
    handleDocumentClick(`/vault/note/${noteId}`);
  };

  const handleCreateTable = () => {
    console.log('[ContactDetail] handleCreateTable appelé');
    const tableId = `contact-${id}-table-${Date.now()}`;
    console.log('[ContactDetail] tableId créé:', tableId);
    handleDocumentClick(`/vault/table/${tableId}`);
  };

  const handleDeleteTable = (tableId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Supprimer ce tableur ?")) {
      setPendingDeleteType('table');
      setPendingDeleteId(tableId);
      setShowPinModal(true);
    }
  };

  const handleDeleteNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Supprimer cette note ?")) {
      setPendingDeleteType('note');
      setPendingDeleteId(noteId);
      setShowPinModal(true);
    }
  };

  const handleDocumentClick = (route: string) => {
    setPendingRoute(route);
    setShowPinModal(true);
  };

  const handlePinSuccess = () => {
    setShowPinModal(false);
    
    // Si c'est une suppression
    if (pendingDeleteType && pendingDeleteId) {
      if (pendingDeleteType === 'table') {
        const updatedTables = contactTables.filter(t => t.id !== pendingDeleteId);
        setContactTables(updatedTables);
        localStorage.setItem(`contact-${id}-tables`, JSON.stringify(updatedTables));
        localStorage.removeItem(`table-${pendingDeleteId}`);
        window.dispatchEvent(new Event('contact-documents-updated'));
      } else if (pendingDeleteType === 'note') {
        const updatedNotes = contactNotes.filter(n => n.id !== pendingDeleteId);
        setContactNotes(updatedNotes);
        localStorage.setItem(`contact-${id}-notes`, JSON.stringify(updatedNotes));
        localStorage.removeItem(`note-${pendingDeleteId}`);
        window.dispatchEvent(new Event('contact-documents-updated'));
      }
      
      // Réinitialiser les états de suppression
      setPendingDeleteType(null);
      setPendingDeleteId(null);
    }
    
    // Si c'est une navigation
    if (pendingRoute) {
      navigate(pendingRoute);
      setPendingRoute(null);
    }
  };

  const handleCopySafetyNumber = () => {
    navigator.clipboard.writeText(contact.safetyNumber);
    setCopiedSafety(true);
    setTimeout(() => setCopiedSafety(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(contact.keyCode);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleBlock = () => {
    if (confirm(`Bloquer ${contact.name} ? Tu ne recevras plus de messages de cette personne.`)) {
      alert("Contact bloqué");
      navigate("/contacts");
    }
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (confirm(`Supprimer ${contact.name} de tes contacts ?`)) {
      alert("Contact supprimé");
      navigate("/contacts");
    }
    setShowMenu(false);
  };

  const handleAddAlert = () => {
    if (!newAlertTitle) {
      alert("Veuillez saisir un titre");
      return;
    }

    // Formater la date et l'heure depuis les roues
    const formattedDate = `${String(selectedDay).padStart(2, '0')}/${String(selectedMonth).padStart(2, '0')}/${selectedYear}`;
    const formattedTime = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;

    const newAlert = {
      id: `alert-${Date.now()}`,
      contactId: id || "0",
      contactName: contact.name,
      contactAvatar: contact.avatar,
      type: "reminder" as const,
      title: newAlertTitle,
      message: newAlertNote,
      date: formattedDate,
      time: formattedTime,
      read: false,
    };

    // Ajouter à la liste globale d'alertes
    const globalAlerts = localStorage.getItem("global-alerts");
    const allAlerts = globalAlerts ? JSON.parse(globalAlerts) : [];
    const updatedAlerts = [newAlert, ...allAlerts];
    localStorage.setItem("global-alerts", JSON.stringify(updatedAlerts));
    window.dispatchEvent(new Event('alerts-updated'));
    
    // Réinitialiser le formulaire
    setNewAlertTitle('');
    setNewAlertNote('');
    setSelectedDay(1);
    setSelectedMonth(1);
    setSelectedYear(2026);
    setSelectedHour(12);
    setSelectedMinute(0);
    setShowAddAlert(false);
  };

  const handleDeleteAlert = (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Supprimer cette alerte ?")) {
      const updatedAlerts = contactAlerts.filter(a => a.id !== alertId);
      setContactAlerts(updatedAlerts);
      localStorage.setItem(`contact-${id}-alerts`, JSON.stringify(updatedAlerts));
      
      // Supprimer de la liste globale d'alertes
      const globalAlerts = localStorage.getItem("global-alerts");
      const allAlerts = globalAlerts ? JSON.parse(globalAlerts) : [];
      const filteredAlerts = allAlerts.filter((alert: any) => alert.id !== alertId);
      localStorage.setItem("global-alerts", JSON.stringify(filteredAlerts));
      window.dispatchEvent(new Event('alerts-updated'));
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return '💰';
      case 'meeting':
        return '🤝';
      case 'reminder':
        return '⏰';
      case 'birthday':
        return '🎂';
      default:
        return '🔔';
    }
  };

  const getAlertTypeName = (type: string) => {
    switch (type) {
      case 'payment':
        return 'Paiement';
      case 'meeting':
        return 'Rendez-vous';
      case 'reminder':
        return 'Rappel';
      case 'birthday':
        return 'Anniversaire';
      default:
        return 'Autre';
    }
  };

  // Générer les options pour les roues
  const dayOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1)
  }));

  const monthOptions = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];

  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: 2024 + i,
    label: String(2024 + i)
  }));

  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0')
  }));

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0')
  }));

  const alertTypeOptions = [
    { value: 'payment', label: '💰 Paiement' },
    { value: 'meeting', label: '🤝 Rendez-vous' },
    { value: 'reminder', label: '⏰ Rappel' },
    { value: 'birthday', label: '🎂 Anniversaire' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-lg border-b border-gray-800">
          <div className="flex items-center gap-3 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/contacts")}
              className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">{contact.name}</h1>
            </div>
            <Link to={`/chat/${contact.id}`}>
              <Button
                size="icon"
                className="bg-indigo-600 hover:bg-indigo-700 h-10 w-10"
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(true)}
              className="text-gray-400 hover:text-white"
            >
              <MoreVertical className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {contact.status === "KEY_CHANGED" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-600/10 border border-orange-600/40 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-400 mb-1">
                  Clé modifiée — vérification requise
                </h3>
                <p className="text-sm text-orange-400/80 mb-3">
                  La clé de sécurité de ce contact a changé. Vérifie son identité avant de continuer.
                </p>
                <Link to={`/contacts/${contact.id}/verify`}>
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Shield className="w-4 h-4 mr-2" />
                    Vérifier maintenant
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6"
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-4">
                <Avatar className="w-32 h-32 border-4 border-gray-700">
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-4xl">
                    {contact.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                {contact.online && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{contact.name}</h2>
              <p className="text-gray-400 mb-3">{contact.username}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors group"
                >
                  <code className="text-xs text-indigo-300 font-mono">{contact.keyCode}</code>
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                  )}
                </button>
              </div>

              <BadgeStatus status={contact.status} />
            </div>

            {contact.status !== "VERIFIED" && (
              <Link to={`/contacts/${contact.id}/verify`} className="w-full">
                <Button className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 h-12">
                  <Shield className="w-5 h-5" />
                  <span>Vérifier</span>
                </Button>
              </Link>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Documents Vault
              </h3>
              <button
                onClick={() => activeDocTab === 'tables' ? handleCreateTable() : handleCreateNote()}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 border border-purple-600/40 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Nouveau</span>
              </button>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveDocTab('tables')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${
                    activeDocTab === 'tables'
                      ? 'bg-green-600/20 text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span className="font-medium">Tableurs</span>
                  {contactTables.length > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeDocTab === 'tables' ? 'bg-green-600/30' : 'bg-gray-700'
                    }`}>
                      {contactTables.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveDocTab('notes')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors ${
                    activeDocTab === 'notes'
                      ? 'bg-yellow-600/20 text-yellow-400 border-b-2 border-yellow-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                  }`}
                >
                  <StickyNote className="w-4 h-4" />
                  <span className="font-medium">Notes</span>
                  {contactNotes.length > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeDocTab === 'notes' ? 'bg-yellow-600/30' : 'bg-gray-700'
                    }`}>
                      {contactNotes.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Tables List */}
              {activeDocTab === 'tables' && (
                <div className="p-4">
                  {contactTables.length > 0 ? (
                    <div className="space-y-2">
                      {contactTables.map((table) => (
                        <div
                          key={table.id}
                          onClick={() => handleDocumentClick(`/vault/table/${table.id}`)}
                          className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 cursor-pointer group transition-colors"
                        >
                          <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center border border-green-600/40 flex-shrink-0">
                            <Table className="w-5 h-5 text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white truncate">{table.title}</div>
                            <div className="text-xs text-gray-400">{table.date}</div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteTable(table.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-600/20 rounded-lg transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="w-16 h-16 bg-green-600/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Table className="w-8 h-8 text-green-400" />
                      </div>
                      <p className="text-gray-400 text-sm">
                        Aucun tableur pour ce contact
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Clique sur "Nouveau" pour créer un tableur
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes List */}
              {activeDocTab === 'notes' && (
                <div className="p-4">
                  {contactNotes.length > 0 ? (
                    <div className="space-y-2">
                      {contactNotes.map((note) => (
                        <div
                          key={note.id}
                          onClick={() => handleDocumentClick(`/vault/note/${note.id}`)}
                          className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 cursor-pointer group transition-colors"
                        >
                          <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center border border-yellow-600/40 flex-shrink-0">
                            <StickyNote className="w-5 h-5 text-yellow-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white truncate">{note.title}</div>
                            <div className="text-xs text-gray-400">{note.date}</div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteNote(note.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-600/20 rounded-lg transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="w-16 h-16 bg-yellow-600/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <StickyNote className="w-8 h-8 text-yellow-400" />
                      </div>
                      <p className="text-gray-400 text-sm">
                        Aucune note pour ce contact
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Clique sur "Nouveau" pour créer une note
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" />
                Alertes
              </h3>
              <button
                onClick={() => setShowAddAlert(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 border border-blue-600/40 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Nouvelle</span>
              </button>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-4">
              {contactAlerts.length > 0 ? (
                <div className="space-y-2">
                  {contactAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{alert.title}</div>
                        <div className="text-xs text-gray-400">
                          {alert.date} à {alert.time}
                        </div>
                        {alert.note && (
                          <div className="text-sm text-gray-300 mt-1">{alert.note}</div>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDeleteAlert(alert.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-600/20 rounded-lg transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 bg-purple-600/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-gray-400 text-sm">
                    Aucune alerte pour ce contact
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Clique sur "Nouvelle" pour ajouter une alerte
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-indigo-400 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              Sécurité
            </h3>

            <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl divide-y divide-gray-700">
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">Empreinte de clé</h4>
                    <p className="text-xs text-gray-400 mb-3">
                      Vérifie que cette empreinte correspond avec {contact.name.split(" ")[0]}
                    </p>
                  </div>
                  <button
                    onClick={handleCopySafetyNumber}
                    className="text-gray-400 hover:text-white p-2"
                  >
                    {copiedSafety ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
                  <code className="text-indigo-300 font-mono text-xs leading-relaxed break-all">
                    {contact.safetyNumber}
                  </code>
                </div>
                <Link to={`/contacts/${contact.id}/qr`}>
                  <Button className="w-full bg-indigo-600/20 border border-indigo-600/40 text-indigo-400 hover:bg-indigo-600/30">
                    <QrCode className="w-4 h-4 mr-2" />
                    Afficher QR
                  </Button>
                </Link>
              </div>

              <div className="p-4">
                <div className="bg-gray-900/30 rounded-lg p-3">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    💡 <strong className="text-white">Comment vérifier :</strong> Scanne le QR code de {contact.name.split(" ")[0]} ou compare l'empreinte vocalement. Si la clé change, KAZOOM t'alerte automatiquement.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-red-400 mb-3">Danger zone</h3>

            <div className="space-y-2">
              <Button
                onClick={handleBlock}
                className="w-full bg-orange-600/10 border border-orange-600/30 text-orange-400 hover:bg-orange-600/20 justify-start h-auto py-3"
              >
                <Ban className="w-5 h-5 mr-3" />
                <div className="text-left flex-1">
                  <div className="font-semibold">Bloquer ce contact</div>
                  <div className="text-xs text-orange-400/70">Ne plus recevoir de messages</div>
                </div>
              </Button>

              <Button
                onClick={handleDelete}
                className="w-full bg-red-600/10 border border-red-600/30 text-red-400 hover:bg-red-600/20 justify-start h-auto py-3"
              >
                <UserMinus className="w-5 h-5 mr-3" />
                <div className="text-left flex-1">
                  <div className="font-semibold">Supprimer le contact</div>
                  <div className="text-xs text-red-400/70">Retirer de ta liste de contacts</div>
                </div>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

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
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black border-t border-gray-700 rounded-t-3xl z-50 safe-area-bottom"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
              </div>
              <div className="p-4 pb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Créer un document</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowCreateMenu(false);
                      handleCreateTable();
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl active:bg-gray-700/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center border border-green-600/40">
                      <Table className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-white">Tableur</div>
                      <div className="text-sm text-gray-400">Calculs et formules</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowCreateMenu(false);
                      handleCreateNote();
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl active:bg-gray-700/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center border border-yellow-600/40">
                      <StickyNote className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-white">Note</div>
                      <div className="text-sm text-gray-400">Éditeur de documents</div>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                  onClick={() => {
                    handleCopyId();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl active:bg-gray-700/50 transition-colors"
                >
                  <Copy className="w-6 h-6 text-blue-400" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-white">Copier identifiant</div>
                    <div className="text-sm text-gray-400">{contact.keyCode}</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: contact.name,
                        text: `Connecte-toi avec ${contact.name} sur Kazoom : ${contact.keyCode}`,
                      });
                    }
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl active:bg-gray-700/50 transition-colors"
                >
                  <Share2 className="w-6 h-6 text-green-400" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-white">Partager contact</div>
                    <div className="text-sm text-gray-400">Envoyer l'identifiant</div>
                  </div>
                </button>

                <div className="pt-2 border-t border-gray-800">
                  <button
                    onClick={handleBlock}
                    className="w-full flex items-center gap-4 p-4 bg-orange-600/10 border border-orange-600/30 rounded-xl active:bg-orange-600/20 transition-colors"
                  >
                    <Ban className="w-6 h-6 text-orange-400" />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-orange-400">Bloquer</div>
                      <div className="text-sm text-orange-400/70">Ne plus recevoir de messages</div>
                    </div>
                  </button>

                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-4 p-4 bg-red-600/10 border border-red-600/30 rounded-xl active:bg-red-600/20 transition-colors mt-2"
                  >
                    <UserMinus className="w-6 h-6 text-red-400" />
                    <div className="text-left flex-1">
                      <div className="font-semibold text-red-400">Supprimer</div>
                      <div className="text-sm text-red-400/70">Retirer de la liste</div>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinSuccess}
        skipIfUnlocked={false}
        alwaysAsk={true}
        title="Accès aux documents"
      />

      <AnimatePresence>
        {showAddAlert && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddAlert(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-950 via-black to-black border-t border-gray-800/50 rounded-t-3xl z-50 safe-area-bottom"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-700 rounded-full" />
              </div>
              
              <div className="p-4 pb-6 space-y-4">
                {/* Header simple */}
                <div className="text-center pb-2">
                  <h3 className="text-lg font-semibold text-white">Nouvelle alerte</h3>
                </div>
                
                {/* Titre */}
                <div>
                  <input
                    type="text"
                    value={newAlertTitle}
                    onChange={(e) => setNewAlertTitle(e.target.value)}
                    placeholder="Titre de l'alerte"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
                  />
                </div>

                {/* Note */}
                <div>
                  <textarea
                    value={newAlertNote}
                    onChange={(e) => setNewAlertNote(e.target.value)}
                    placeholder="Note supplémentaire"
                    rows={2}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 resize-none"
                  />
                </div>

                {/* Pickers dans des conteneurs simples */}
                <div className="space-y-3">
                  {/* Date */}
                  <div>
                    <div className="text-xs text-gray-400 mb-2 px-1">Date</div>
                    <div className="flex gap-2 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-2">
                      <div className="flex-1">
                        <WheelPicker
                          options={dayOptions}
                          value={selectedDay}
                          onChange={(value) => setSelectedDay(value as number)}
                          height={160}
                          itemHeight={36}
                        />
                      </div>
                      <div className="flex-[2]">
                        <WheelPicker
                          options={monthOptions}
                          value={selectedMonth}
                          onChange={(value) => setSelectedMonth(value as number)}
                          height={160}
                          itemHeight={36}
                        />
                      </div>
                      <div className="flex-1">
                        <WheelPicker
                          options={yearOptions}
                          value={selectedYear}
                          onChange={(value) => setSelectedYear(value as number)}
                          height={160}
                          itemHeight={36}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Heure */}
                  <div>
                    <div className="text-xs text-gray-400 mb-2 px-1">Heure</div>
                    <div className="flex gap-2 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-2">
                      <div className="flex-1">
                        <WheelPicker
                          options={hourOptions}
                          value={selectedHour}
                          onChange={(value) => setSelectedHour(value as number)}
                          height={160}
                          itemHeight={36}
                        />
                      </div>
                      <div className="flex items-center justify-center px-2">
                        <span className="text-xl text-gray-500">:</span>
                      </div>
                      <div className="flex-1">
                        <WheelPicker
                          options={minuteOptions}
                          value={selectedMinute}
                          onChange={(value) => setSelectedMinute(value as number)}
                          height={160}
                          itemHeight={36}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Boutons simples */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddAlert(false)}
                    className="flex-1 bg-gray-800/60 border border-gray-700 text-white rounded-lg py-3 font-medium hover:border-gray-600 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddAlert}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg py-3 font-medium hover:from-indigo-500 hover:to-purple-500 transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}