"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanEye, X, BrainCircuit, ArrowRight } from "lucide-react";

interface MistakeAnalyzerOverlayProps {
  errorCount: number;
  onComplete: () => void;
}

export const MistakeAnalyzerOverlay = ({
  errorCount,
  onComplete
}: MistakeAnalyzerOverlayProps) => {
  const [scanState, setScanState] = useState<"scanning" | "found">("scanning");

  useEffect(() => {
    setTimeout(() => setScanState("found"), 2000);
    setTimeout(onComplete, 4000);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-50 bg-slate-900/95 flex items-center justify-center backdrop-blur-md"
    >
      <div className="w-full max-w-md p-6 flex flex-col items-center relative">
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
            className={`absolute inset-0 rounded-full border-2 ${
              scanState === "scanning" ? "border-cyan-500" : "border-red-500"
            }`}
          />
          <motion.div
            animate={
              scanState === "scanning"
                ? { rotate: [0, 360] }
                : { scale: [1, 1.1, 1] }
            }
            transition={
              scanState === "scanning"
                ? { repeat: Infinity, duration: 8, ease: "linear" }
                : { duration: 0.5 }
            }
            className={`z-10 bg-slate-800 p-4 rounded-full border-4 ${
              scanState === "scanning"
                ? "border-cyan-400 text-cyan-400"
                : "border-red-400 text-red-400"
            }`}
          >
            {scanState === "scanning" ? (
              <ScanEye size={48} />
            ) : (
              <BrainCircuit size={48} />
            )}
          </motion.div>

          {scanState === "scanning" && (
            <motion.div
              animate={{ top: ["0%", "100%"], opacity: [0, 1, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              }}
              className="absolute w-full h-1 bg-cyan-400 blur-sm z-20 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
            />
          )}
        </div>

        <AnimatePresence mode="wait">
          {scanState === "scanning" ? (
            <motion.div
              key="text-scan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h2 className="text-xl font-bold text-white tracking-wider">
                Diagnóstico en Curso
              </h2>
              <p className="text-cyan-300 font-mono mt-2">
                Analizando patrones de respuesta...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="text-found"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Análisis Completo
              </h2>
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
                <p className="text-red-300 font-medium flex items-center justify-center gap-2">
                  <X size={18} /> {errorCount}{" "}
                  {errorCount === 1
                    ? "Concepto Necesita"
                    : "Conceptos Necesitan"}{" "}
                  Refuerzo
                </p>
              </div>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 mx-auto text-cyan-400 font-bold uppercase tracking-widest text-sm justify-center"
              >
                Abriendo Dossier de Revisión{" "}
                <ArrowRight size={16} className="animate-pulse" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
