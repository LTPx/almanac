"use client";

import { useEffect, useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FailedQuestion {
  id: number;
  title: string;
  type: string;
  unitName: string;
}

interface ErrorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  curriculumId: string;
}

export function ErrorsModal({
  isOpen,
  onClose,
  userId,
  curriculumId
}: ErrorsModalProps) {
  const [questions, setQuestions] = useState<FailedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchErrors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/app/errors?userId=${userId}&curriculumId=${curriculumId}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Error al obtener errores");
        }

        setQuestions(data.questions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchErrors();
  }, [isOpen, userId, curriculumId]);

  if (!isOpen) return null;

  const questionsByUnit = questions.reduce<Record<string, FailedQuestion[]>>(
    (acc, q) => {
      if (!acc[q.unitName]) acc[q.unitName] = [];
      acc[q.unitName].push(q);
      return acc;
    },
    {}
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-[#2a2a2a] rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden border border-[#3a3a3a] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Tus Errores</h2>
                {!isLoading && !error && (
                  <p className="text-sm text-gray-400">
                    {questions.length}{" "}
                    {questions.length === 1 ? "pregunta" : "preguntas"}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-6">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-gray-400">{error}</p>
              </div>
            )}

            {!isLoading && !error && questions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No tienes errores registrados</p>
              </div>
            )}

            {!isLoading && !error && Object.keys(questionsByUnit).length > 0 && (
              <div className="space-y-5">
                {Object.entries(questionsByUnit).map(
                  ([unitName, unitQuestions]) => (
                    <div key={unitName}>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {unitName}
                      </h3>
                      <div className="space-y-2">
                        {unitQuestions.map((q) => (
                          <div
                            key={q.id}
                            className="bg-[#1f1f1f] rounded-lg p-3 border border-[#3a3a3a]"
                          >
                            <p className="text-sm text-white">{q.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
