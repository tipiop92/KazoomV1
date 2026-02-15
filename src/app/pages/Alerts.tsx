import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Plus, Bell, Trash2, CheckCircle, AlertTriangle, Info, Calendar, Clock, User, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { WheelPicker } from "../components/WheelPicker";
import { KazoomBanner } from "../components/KazoomBanner";

// Types d'alertes
type AlertType = "reminder" | "warning" | "info";

interface Contact {
  id: string;
  name: string;
  avatar: string;
}

interface Alert {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  type: AlertType;
  title: string;
  message: string;
  date: string;
  time: string;
  read: boolean;
}

// Liste des contacts disponibles
const availableContacts: Contact[] = [
  {
    id: "1",
    name: "Marie Dubois",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    name: "Thomas Martin",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    name: "Sophie Laurent",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    id: "4",
    name: "Lucas Bernard",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
  {
    id: "5",
    name: "Emma Petit",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
  },
];

const alertTypeConfig = {
  reminder: {
    icon: Bell,
    color: "text-blue-400",
    bgColor: "bg-blue-600/20",
    borderColor: "border-blue-600/50",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-400",
    bgColor: "bg-yellow-600/20",
    borderColor: "border-yellow-600/50",
  },
  info: {
    icon: Info,
    color: "text-indigo-400",
    bgColor: "bg-indigo-600/20",
    borderColor: "border-indigo-600/50",
  },
};

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newAlertTitle, setNewAlertTitle] = useState("");
  const [newAlertMessage, setNewAlertMessage] = useState("");
  const [newAlertContactName, setNewAlertContactName] = useState("");
  const [newAlertType, setNewAlertType] = useState<AlertType>("reminder");
  
  // États pour les roues de sélection
  const [selectedDay, setSelectedDay] = useState(14);
  const [selectedMonth, setSelectedMonth] = useState(2);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);

  // Charger les alertes depuis localStorage au montage
  useEffect(() => {
    const loadAlerts = () => {
      try {
        const storedAlerts = localStorage.getItem("global-alerts");
        if (storedAlerts) {
          setAlerts(JSON.parse(storedAlerts));
        } else {
          // Initialiser avec les données par défaut la première fois
          localStorage.setItem("global-alerts", JSON.stringify(alertsData));
          setAlerts(alertsData);
        }
      } catch (error) {
        console.error("Error loading alerts:", error);
        setAlerts([]);
      }
    };

    loadAlerts();

    // Écouter les changements d'alertes
    const handleAlertsUpdate = () => {
      loadAlerts();
    };

    window.addEventListener("alerts-updated", handleAlertsUpdate);

    return () => {
      window.removeEventListener("alerts-updated", handleAlertsUpdate);
    };
  }, []);

  const handleDeleteAlert = (id: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem("global-alerts", JSON.stringify(updatedAlerts));
    window.dispatchEvent(new Event("alerts-updated"));
  };

  const handleMarkAsRead = (id: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem("global-alerts", JSON.stringify(updatedAlerts));
    window.dispatchEvent(new Event("alerts-updated"));
  };

  const handleAddAlert = () => {
    if (!newAlertTitle) {
      alert("Veuillez saisir un titre");
      return;
    }

    // Formater la date et l'heure
    const formattedDate = `${String(selectedDay).padStart(2, '0')}/${String(selectedMonth).padStart(2, '0')}/${selectedYear}`;
    const formattedTime = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;

    // Utiliser le contact sélectionné ou "Moi" par défaut
    const contactInfo = selectedContact
      ? { id: selectedContact.id, name: selectedContact.name, avatar: selectedContact.avatar }
      : { id: "0", name: "Moi", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" };

    const newAlert: Alert = {
      id: String(Date.now()),
      contactId: contactInfo.id,
      contactName: contactInfo.name,
      contactAvatar: contactInfo.avatar,
      type: newAlertType,
      title: newAlertTitle,
      message: newAlertMessage,
      date: formattedDate,
      time: formattedTime,
      read: false,
    };

    const updatedAlerts = [newAlert, ...alerts];
    setAlerts(updatedAlerts);
    localStorage.setItem("global-alerts", JSON.stringify(updatedAlerts));
    window.dispatchEvent(new Event("alerts-updated"));
    
    setShowAddModal(false);
    setNewAlertTitle("");
    setNewAlertMessage("");
    setNewAlertContactName("");
    setNewAlertType("reminder");
    setSelectedContact(null);
    setSelectedDay(14);
    setSelectedMonth(2);
    setSelectedYear(2026);
    setSelectedHour(12);
    setSelectedMinute(0);
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

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      <div className="max-w-2xl mx-auto pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link to="/">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-transform touch-manipulation"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white">Alertes</h1>
                  <p className="text-sm text-gray-400">
                    {unreadCount} non {unreadCount > 1 ? "lues" : "lue"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                variant="ghost"
                size="icon"
                className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-transform touch-manipulation"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="p-4 space-y-3">
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Aucune alerte</p>
              <p className="text-gray-500 text-sm mt-2">
                Appuyez sur + pour créer une alerte
              </p>
            </motion.div>
          ) : (
            alerts.map((alert, index) => {
              const config = alertTypeConfig[alert.type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-gray-900/50 backdrop-blur-lg rounded-2xl border ${config.borderColor} overflow-hidden ${
                    !alert.read ? "ring-2 ring-indigo-500/30" : ""
                  }`}
                >
                  <div className="p-4">
                    {/* Contact Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={alert.contactAvatar} />
                        <AvatarFallback className="bg-indigo-600 text-white text-sm">
                          {alert.contactName.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">
                          {alert.contactName}
                        </p>
                      </div>
                      <div className={`${config.bgColor} p-2 rounded-lg`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                    </div>

                    {/* Alert Content */}
                    <div className="mb-3">
                      <h3 className="text-white font-bold text-base mb-1">
                        {alert.title}
                      </h3>
                      <p className="text-gray-400 text-sm">{alert.message}</p>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-4 mb-3 text-gray-400 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{alert.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{alert.time}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!alert.read && (
                        <Button
                          onClick={() => handleMarkAsRead(alert.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-indigo-600/20 border-indigo-600/50 text-indigo-300 hover:bg-indigo-600/30 active:scale-95 transition-transform touch-manipulation"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marquer comme lue
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteAlert(alert.id)}
                        variant="outline"
                        size="sm"
                        className="bg-red-600/20 border-red-600/50 text-red-300 hover:bg-red-600/30 active:scale-95 transition-transform touch-manipulation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Logo KAZOOM */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center py-8"
        >
          <KazoomBanner variant="inline" className="opacity-60" to="/" />
        </motion.div>

        {/* Add Alert Modal - Bottom Sheet Style */}
        <AnimatePresence>
          {showAddModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddModal(false)}
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
                      value={newAlertMessage}
                      onChange={(e) => setNewAlertMessage(e.target.value)}
                      placeholder="Note supplémentaire"
                      rows={2}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 resize-none"
                    />
                  </div>

                  {/* Sélecteur de contact (optionnel) */}
                  <div>
                    <div className="text-xs text-gray-400 mb-2 px-1">Contact (optionnel)</div>
                    <button
                      onClick={() => setShowContactPicker(true)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 flex items-center gap-3 hover:bg-gray-700/70 transition-colors"
                    >
                      {selectedContact ? (
                        <>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={selectedContact.avatar} />
                            <AvatarFallback className="bg-indigo-600 text-white text-xs">
                              {selectedContact.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 text-left text-white">{selectedContact.name}</span>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 bg-gray-600/50 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="flex-1 text-left text-gray-400">Sélectionner un contact</span>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </>
                      )}
                    </button>
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
                      onClick={() => setShowAddModal(false)}
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

        {/* Contact Picker Modal */}
        <AnimatePresence>
          {showContactPicker && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowContactPicker(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-950 via-black to-black border-t border-gray-800/50 rounded-t-3xl z-50 safe-area-bottom max-h-[70vh] overflow-y-auto"
              >
                <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-gradient-to-b from-gray-950 to-black/95 backdrop-blur-lg z-10">
                  <div className="w-10 h-1 bg-gray-700 rounded-full" />
                </div>
                
                <div className="p-4 pb-6">
                  <h3 className="text-lg font-semibold text-white mb-4 text-center">Sélectionner un contact</h3>
                  
                  {/* Option "Aucun contact" */}
                  <button
                    onClick={() => {
                      setSelectedContact(null);
                      setShowContactPicker(false);
                    }}
                    className="w-full flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl mb-2 hover:bg-gray-700/50 transition-colors border border-gray-700"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" />
                      <AvatarFallback className="bg-indigo-600 text-white">
                        M
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white">Moi</div>
                      <div className="text-sm text-gray-400">Alerte personnelle</div>
                    </div>
                    {!selectedContact && (
                      <CheckCircle className="w-5 h-5 text-indigo-400" />
                    )}
                  </button>

                  {/* Liste des contacts */}
                  <div className="space-y-2">
                    {availableContacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowContactPicker(false);
                        }}
                        className="w-full flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-colors border border-gray-700"
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={contact.avatar} />
                          <AvatarFallback className="bg-indigo-600 text-white">
                            {contact.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-white">{contact.name}</div>
                        </div>
                        {selectedContact?.id === contact.id && (
                          <CheckCircle className="w-5 h-5 text-indigo-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}