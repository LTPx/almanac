import { useState } from "react";
import { X, AlertCircle, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReportErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: number;
  questionText: string;
  onSubmit: (report: {
    questionId: number;
    reason: string;
    description: string;
  }) => Promise<void>;
}

export function ReportErrorModal({
  isOpen,
  onClose,
  questionId,
  questionText,
  onSubmit
}: ReportErrorModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    "La pregunta está mal redactada",
    "La respuesta correcta es incorrecta",
    "Hay un error ortográfico",
    "Otro"
  ];

  const handleSubmit = async () => {
    if (!reason) return;

    setIsSubmitting(true);

    try {
      await onSubmit({
        questionId,
        reason,
        description
      });

      setSubmitted(true);

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Error al reportar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setDescription("");
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4"
        // onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-[#2a2a2a] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden border border-[#3a3a3a] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {submitted ? (
            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-[#32c781]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-[#32c781]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                ¡Reporte enviado!
              </h3>
              <p className="text-gray-400">Gracias por ayudarnos a mejorar</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Reportar Error
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div className="bg-[#1f1f1f] rounded-lg p-4 border border-[#3a3a3a]">
                  <p className="text-sm text-gray-400 mb-1">Pregunta:</p>
                  <p className="text-white font-medium">{questionText}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    ¿Cuál es el problema? *
                  </label>
                  <div className="space-y-2">
                    {reasons.map((r) => (
                      <label
                        key={r}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          reason === r
                            ? "border-[#32c781] bg-[#32c781]/10"
                            : "border-[#3a3a3a] hover:border-[#32c781]/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r}
                          checked={reason === r}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-4 h-4 accent-[#32c781]"
                        />
                        <span className="text-gray-300">{r}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Detalles adicionales (opcional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Cuéntanos más sobre el problema..."
                    className="w-full px-4 py-3 border-2 border-[#3a3a3a] rounded-lg focus:border-[#32c781] focus:ring-2 focus:ring-[#32c781]/20 outline-none resize-none bg-[#1f1f1f] text-white placeholder:text-gray-500"
                    rows={4}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-[#3a3a3a] flex-shrink-0 bg-[#2a2a2a]">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border-2 border-[#3a3a3a] text-gray-300 font-semibold rounded-lg hover:bg-[#3a3a3a] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!reason || isSubmitting}
                    className="flex-1 px-4 py-3 bg-[#32c781] hover:bg-[#28a36a] disabled:bg-[#3a3a3a] disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Reporte
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
