import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Copy, Check, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";

const mockContacts = {
  "1": {
    name: "Marie Dubois",
    safetyNumber: "8451 2210 9A3C 7BF4 E892 1034 5DA2 C819 F603 2A71",
  },
  "4": {
    name: "Lucas Bernard",
    safetyNumber: "1245 8890 2B4D 9CE1 F723 4567 8ABC DEF0 1234 5678",
  },
};

export function ContactQR() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  const contact = mockContacts[id as keyof typeof mockContacts] || mockContacts["1"];

  const handleCopy = () => {
    navigator.clipboard.writeText(contact.safetyNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Empreinte de sécurité - ${contact.name}`,
        text: contact.safetyNumber,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-lg border-b border-gray-800">
          <div className="flex items-center gap-3 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">QR de sécurité</h1>
              <p className="text-xs text-gray-400">{contact.name}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-3xl shadow-2xl"
          >
            <div className="aspect-square bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-4 bg-white rounded-xl grid grid-cols-8 grid-rows-8 gap-1 p-2">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${
                      Math.random() > 0.5 ? "bg-black" : "bg-white"
                    }`}
                  />
                ))}
              </div>

              <div className="absolute top-6 left-6 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg" />
              <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg" />
              <div className="absolute bottom-6 left-6 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg" />
            </div>
          </motion.div>

          <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-white mb-1">Empreinte de sécurité</h3>
                <p className="text-xs text-gray-400">
                  Compare cette empreinte avec {contact.name.split(" ")[0]}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="text-gray-400 hover:text-white p-2 flex-shrink-0"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <code className="text-indigo-300 font-mono text-xs leading-relaxed break-all">
                {contact.safetyNumber}
              </code>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-2">Comment vérifier ?</h4>
            <ol className="space-y-2 text-sm text-gray-400">
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">1.</span>
                <span>Demande à {contact.name.split(" ")[0]} de scanner ce QR code avec Kazoom</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">2.</span>
                <span>Ou compare l'empreinte vocalement ou par message sécurisé</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">3.</span>
                <span>Si les empreintes correspondent, vous êtes vérifiés ✓</span>
              </li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              variant="ghost"
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Copié !" : "Copier"}
            </Button>
            <Button
              onClick={handleShare}
              variant="ghost"
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}