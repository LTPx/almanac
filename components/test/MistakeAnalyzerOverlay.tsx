"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanEye, AlertCircle, BrainCircuit } from "lucide-react";

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
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-md"
    >
      <div className="w-full max-w-[650px] h-[100dvh] bg-gradient-to-b from-background via-background to-card/50 flex flex-col p-8">
        <AnimatePresence mode="wait">
          {scanState === "scanning" ? (
            <motion.div
              key="scanning-phase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center flex-1 space-y-8"
            >
              {/* Ícono de escaneo minimalista */}
              <div className="relative">
                {/* Anillo sutil */}
                <motion.div
                  animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeOut"
                  }}
                  className="absolute inset-0 rounded-full border-2 border-primary -inset-6"
                />

                {/* Contenedor del ícono */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  className="relative z-10 bg-card p-6 rounded-full border-2 border-primary/50 shadow-lg"
                >
                  <ScanEye size={56} className="text-primary" />
                </motion.div>

                {/* Línea de escaneo */}
                <motion.div
                  animate={{
                    y: ["-100%", "100%"],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8,
                    ease: "easeInOut"
                  }}
                  className="absolute left-0 right-0 h-[2px] bg-primary/80 blur-[1px]"
                  style={{ top: "50%" }}
                />
              </div>

              {/* Texto simple */}
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  Analizando Resultados
                </h2>
                <p className="text-sm text-muted-foreground">
                  Evaluando tu progreso...
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="found-phase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex-1 flex flex-col justify-between py-8"
            >
              {/* Contenido principal */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-8 w-full max-w-md">
                  {/* Ícono de resultado simple */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: 0.1
                    }}
                    className="relative mx-auto w-32 h-32 flex items-center justify-center"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.02, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="z-10 bg-card p-5 rounded-full border-2 border-destructive/50 shadow-lg"
                    >
                      <BrainCircuit size={56} className="text-destructive" />
                    </motion.div>
                  </motion.div>

                  {/* Títulos limpios */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                  >
                    <h2 className="text-3xl font-bold text-primary">
                      ¡Bien Hecho!
                    </h2>
                    <p className="text-base text-foreground/80">
                      Reforcemos algunos conceptos para
                      <br />
                      dominar completamente esta lección
                    </p>
                  </motion.div>

                  {/* Card de errores minimalista */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative bg-destructive/5 border border-destructive/30 rounded-xl p-5 backdrop-blur-sm overflow-hidden"
                  >
                    {/* Efecto de brillo sutil */}
                    <motion.div
                      animate={{
                        x: ["-100%", "100%"],
                        opacity: [0, 0.5, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-destructive/20 to-transparent"
                    />

                    <div className="relative flex items-center justify-center gap-3">
                      <AlertCircle
                        size={22}
                        className="text-destructive flex-shrink-0"
                      />
                      <div className="text-center">
                        <p className="text-destructive font-semibold text-base">
                          {errorCount}{" "}
                          {errorCount === 1
                            ? "Concepto necesita"
                            : "Conceptos necesitan"}{" "}
                          refuerzo
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Botón minimalista */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full max-w-md mx-auto"
              >
                <motion.button
                  onClick={onComplete}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3.5 bg-primary hover:brightness-110 text-white font-semibold rounded-lg transition-all duration-200 shadow-md shadow-primary/30"
                >
                  Revisar Errores
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
