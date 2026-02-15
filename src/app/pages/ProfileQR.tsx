import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Copy, Share2, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import QRCode from "react-qr-code";

export function ProfileQR() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const kazoomKey = "ED34G6";
  const username = "lynor";
  const qrValue = `KAZOOM:${kazoomKey}:${username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(kazoomKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Ma clé KAZOOM",
          text: `Ajoute-moi sur KAZOOM avec ma clé : ${kazoomKey}`,
        });
      } catch (err) {
        console.log("Partage annulé");
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-black to-transparent backdrop-blur-xl">
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              className="rounded-full text-gray-400 hover:text-white h-12 w-12 active:scale-95 transition-all touch-manipulation"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold text-white">Mon QR KAZOOM</h1>
          </div>
        </div>

        {/* QR Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-full max-w-sm"
          >
            {/* QR Code */}
            <div className="bg-white p-8 rounded-3xl shadow-2xl mb-6">
              <QRCode
                value={qrValue}
                size={256}
                level="H"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>

            {/* Info */}
            <div className="text-center space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-2">Ton username</div>
                <div className="text-2xl font-bold text-white mb-1">@{username}</div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Ta clé KAZOOM</div>
                <div className="text-3xl font-bold font-mono text-purple-400 tracking-wider">
                  {kazoomKey}
                </div>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed pt-4">
                Fais scanner ce QR pour ajouter ton contact, ou partage ta clé KAZOOM.
              </p>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1 border-gray-600 hover:bg-gray-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-400" />
                      <span className="text-green-400">Copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copier
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleShare}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}