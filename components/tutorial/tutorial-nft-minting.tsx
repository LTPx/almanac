"use client";

import { useState, useCallback } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Zap,
  Award,
  Calendar,
  Sparkles,
  ChevronLeft
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface TutorialNFTMintingProps {
  onClose: () => void;
  onBack?: () => void;
}

const MOCK_UNITS = [
  { id: "1", name: "Educación Básica", courseName: "Matemáticas" },
  { id: "2", name: "Historia Universal", courseName: "Historia" },
  { id: "3", name: "Ciencias Naturales", courseName: "Biología" }
];

const MOCK_COLLECTIONS = [
  { id: "col-1", name: "Logros Académicos 2024" },
  { id: "col-2", name: "Certificados de Excelencia" },
  { id: "col-3", name: "Colección de Habilidades" }
];

const MOCK_NFTS = [
  {
    name: "Medalla de Oro",
    imageUrl:
      "https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?w=400&h=400&fit=crop"
  },
  {
    name: "Estrella Dorada",
    imageUrl:
      "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=400&fit=crop"
  },
  {
    name: "Trofeo Diamante",
    imageUrl:
      "https://images.unsplash.com/photo-1609166214994-502d326bafee?w=400&h=400&fit=crop"
  }
];

const MOCK_MINTED_NFT = {
  id: "nft-tutorial-1",
  tokenId: "12345",
  contractAddress: "0x1234567890abcdef",
  transactionHash: "0xabcdef1234567890",
  mintedAt: new Date().toISOString(),
  metadata: {
    name: "Certificado de Educación Básica",
    description:
      "Logro obtenido por completar exitosamente la unidad de Educación Básica",
    image:
      "https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?w=600&h=600&fit=crop",
    attributes: [
      { trait_type: "Nivel", value: "Básico" },
      { trait_type: "Año", value: "2024" }
    ]
  }
};

const FloatingParticles = () => {
  const particles = Array.from({ length: 15 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background:
              i % 3 === 0 ? "#32C781" : i % 3 === 1 ? "#1983DD" : "#1A73E8",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{
            duration: 2 + Math.random() * 1,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

const EnergyRings = () => (
  <>
    <motion.div
      className="absolute inset-0 rounded-lg border-2 border-[#32C781]"
      initial={{ scale: 1, opacity: 0 }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.6, 0.3]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <motion.div
      className="absolute inset-0 rounded-lg border-2 border-[#1983DD]"
      initial={{ scale: 1, opacity: 0 }}
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.2, 0.5, 0.2]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5
      }}
    />
  </>
);

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="flex items-center justify-center mb-8">
    {[1, 2, 3].map((num, i) => (
      <div key={num} className="flex items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= num
              ? "bg-[#32C781] text-white"
              : "bg-gray-300 text-gray-600"
          }`}
        >
          {num}
        </div>
        {i < 2 && (
          <div
            className={`w-16 h-0.5 mx-2 ${
              currentStep > num ? "bg-[#32C781]" : "bg-gray-300"
            }`}
          />
        )}
      </div>
    ))}
  </div>
);

export default function TutorialNFTMinting({
  onClose,
  onBack
}: TutorialNFTMintingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [description, setDescription] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showInitialAnimation, setShowInitialAnimation] = useState(false);

  const selectedUnit = MOCK_UNITS.find((u) => u.id === selectedUnitId);

  const handleBack = () => {
    if (currentStep === 0 && onBack) {
      onBack();
    } else if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      if (currentStep === 3) {
        setIsFlipped(false);
        setShowInitialAnimation(false);
      }
    }
  };

  const handleContinueToStep2 = () => {
    if (selectedUnitId && selectedCollectionId) {
      setCurrentStep(2);
    }
  };

  const handleMint = useCallback(async () => {
    setIsMinting(true);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    setIsMinting(false);
    setCurrentStep(3);
    setShowInitialAnimation(true);

    setTimeout(() => {
      setShowInitialAnimation(false);
    }, 2000);
  }, []);

  const handleReveal = () => {
    if (isFlipped) return;
    setIsFlipped(true);
  };

  return (
    <div className="w-full max-w-[650px] min-h-screen bg-[#0a0a0a] relative overflow-y-auto scrollbar-hide">
      <div className="sticky top-0 z-[10000] backdrop-blur-sm border-b border-gray-800 ">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">
            Tutorial: Minteo de NFT
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 py-8 max-w-2xl mx-auto pb-24">
        {currentStep < 3 && <StepIndicator currentStep={currentStep + 1} />}

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {currentStep === 0 && "Introducción al Minteo NFT"}
            {currentStep === 1 && "Selecciona tu Token y Colección"}
            {currentStep === 2 && "Confirma y Mintea"}
            {currentStep === 3 && "¡NFT Creado!"}
          </h2>
        </div>

        <div className="">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {MOCK_NFTS.map((nft, index) => (
                    <div className="flex-shrink-0 w-40" key={index}>
                      <div className="rounded-xl overflow-hidden border-2 border-gray-600">
                        <div className="aspect-square bg-gradient-to-br from-pink-300 via-blue-200 to-green-200 flex items-center justify-center">
                          <img
                            src={nft.imageUrl}
                            alt={nft.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <p className="text-blue-400 font-semibold mt-2 text-sm">
                        {nft.name}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-gray-300 space-y-4">
                  <p>
                    🎓 Las medallas NFT preservan tus logros educativos de forma
                    permanente en la blockchain.
                  </p>
                  <p>
                    ✨ Son fáciles de compartir, verificar e intercambiar. Cada
                    NFT es único y representa tu esfuerzo.
                  </p>
                  <p className="text-sm text-gray-400">
                    En este tutorial aprenderás cómo crear tu primera medalla
                    NFT paso a paso.
                  </p>
                </div>

                <button
                  onClick={() => setCurrentStep(1)}
                  className="w-full bg-[#1983DD] hover:bg-[#1A73E8] text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                >
                  Comenzar Tutorial
                  <ArrowRight size={20} />
                </button>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                  <p className="text-blue-300 text-sm">
                    💡 <strong>Consejo:</strong> Selecciona el token que ganaste
                    al completar una unidad y la colección donde quieres
                    guardarlo.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Token de Logro
                  </label>
                  <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full p-4 border border-gray-600 rounded-lg text-white bg-[#1a1a1a] focus:border-[#1983DD] focus:outline-none transition-colors"
                  >
                    <option value="">Selecciona un token...</option>
                    {MOCK_UNITS.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} - {unit.courseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Colección NFT
                  </label>
                  <select
                    value={selectedCollectionId}
                    onChange={(e) => setSelectedCollectionId(e.target.value)}
                    className="w-full p-4 border border-gray-600 rounded-lg text-white bg-[#1a1a1a] focus:border-[#1983DD] focus:outline-none transition-colors"
                  >
                    <option value="">Selecciona una colección...</option>
                    {MOCK_COLLECTIONS.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Dedico este logro a..."
                    className="w-full p-4 border border-gray-600 rounded-lg text-white bg-[#1a1a1a] resize-none focus:border-[#1983DD] focus:outline-none transition-colors"
                    rows={4}
                    maxLength={250}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {description.length}/250
                  </p>
                </div>

                <button
                  onClick={handleContinueToStep2}
                  disabled={!selectedUnitId || !selectedCollectionId}
                  className="w-full bg-[#1983DD] hover:bg-[#1A73E8] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  Continuar
                  <ArrowRight size={20} />
                </button>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-purple-300 text-sm mb-2">
                    📋 <strong>Resumen:</strong>
                  </p>
                  <ul className="text-gray-300 text-sm space-y-1 ml-4">
                    <li>
                      • Token: <strong>{selectedUnit?.name}</strong>
                    </li>
                    <li>• Curso: {selectedUnit?.courseName}</li>
                    <li>
                      • Colección:{" "}
                      {
                        MOCK_COLLECTIONS.find(
                          (c) => c.id === selectedCollectionId
                        )?.name
                      }
                    </li>
                  </ul>
                </div>

                {description && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Dedicatoria:</p>
                    <p className="text-gray-200 italic">"{description}"</p>
                  </div>
                )}

                {!isMinting && (
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-300 text-sm">
                      ⚡ <strong>Importante:</strong> Una vez minteado, tu NFT
                      será permanente en la blockchain. Asegúrate de que toda la
                      información sea correcta.
                    </p>
                  </div>
                )}

                {isMinting ? (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="w-16 h-16 border-4 border-[#1983DD] border-t-transparent rounded-full"
                    />
                    <p className="text-white font-semibold">
                      Minteando tu NFT...
                    </p>
                    <p className="text-gray-400 text-sm">
                      Esto puede tomar unos segundos
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex items-center justify-center gap-2 flex-1 bg-gray-600 hover:bg-gray-700 text-white py-4 px-6 rounded-lg transition-colors"
                    >
                      <ArrowLeft size={20} /> Atrás
                    </button>
                    <button
                      onClick={handleMint}
                      className="flex-1 bg-[#1983DD] hover:bg-[#1666B0] text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      Mintear NFT <Zap size={20} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 flex flex-col items-center relative"
              >
                <FloatingParticles />

                <AnimatePresence>
                  {showInitialAnimation && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]/80 backdrop-blur-sm"
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 20
                        }}
                        className="relative flex flex-col items-center"
                      >
                        <motion.div
                          className="w-32 h-32 rounded-full bg-gradient-to-br from-[#32C781] to-[#1983DD] flex items-center justify-center"
                          animate={{
                            boxShadow: [
                              "0 0 20px rgba(50, 199, 129, 0.5)",
                              "0 0 60px rgba(50, 199, 129, 0.8)",
                              "0 0 20px rgba(50, 199, 129, 0.5)"
                            ]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity
                          }}
                        >
                          <Sparkles className="w-16 h-16 text-white" />
                        </motion.div>
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="text-center mt-4 text-white font-semibold text-lg"
                        >
                          ¡NFT Creado Exitosamente!
                        </motion.p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{
                    opacity: showInitialAnimation ? 0 : 1,
                    y: showInitialAnimation ? 50 : 0
                  }}
                  transition={{ delay: 2, duration: 0.5 }}
                  className="relative w-full max-w-sm"
                  style={{ perspective: "1000px", minHeight: "500px" }}
                >
                  <motion.div
                    className="relative w-full cursor-pointer"
                    onClick={handleReveal}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    style={{
                      transformStyle: "preserve-3d",
                      minHeight: "500px"
                    }}
                  >
                    <motion.div
                      className="relative overflow-hidden rounded-lg"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        minHeight: "500px"
                      }}
                      animate={
                        !isFlipped
                          ? {
                              boxShadow: [
                                "0 0 20px rgba(50, 199, 129, 0.3)",
                                "0 0 40px rgba(50, 199, 129, 0.6)",
                                "0 0 20px rgba(50, 199, 129, 0.3)"
                              ]
                            }
                          : {}
                      }
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="relative h-[500px] bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border-4 border-slate-600">
                        {!isFlipped && <EnergyRings />}
                        <div className="text-slate-400 flex flex-col items-center z-10">
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Award className="w-16 h-16" />
                          </motion.div>
                          <motion.p
                            className="mt-4 font-bold text-lg"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            Toca para revelar...
                          </motion.p>
                        </div>

                        {!isFlipped && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-b from-transparent via-[#32C781]/20 to-transparent h-full"
                            animate={{ y: ["-100%", "100%"] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          />
                        )}
                      </div>
                    </motion.div>

                    <motion.div
                      className="absolute top-0 left-0 w-full overflow-hidden rounded-lg"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        minHeight: "500px"
                      }}
                    >
                      <div className="relative h-80 flex items-center justify-center overflow-hidden shadow-2xl shadow-[#32C781]/30">
                        <motion.img
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={isFlipped ? { scale: 1, opacity: 1 } : {}}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          src={MOCK_MINTED_NFT.metadata.image}
                          alt={MOCK_MINTED_NFT.metadata.name}
                          className="w-full h-full object-cover"
                        />

                        {isFlipped && (
                          <>
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                              initial={{ x: "-100%" }}
                              animate={{ x: "200%" }}
                              transition={{
                                duration: 1.5,
                                ease: "easeInOut",
                                delay: 0.3
                              }}
                            />
                          </>
                        )}
                      </div>

                      <motion.div
                        className="p-4 bg-[#1a1a1a]"
                        initial={{ y: 20, opacity: 0 }}
                        animate={isFlipped ? { y: 0, opacity: 1 } : {}}
                        transition={{ delay: 0.5, duration: 0.4 }}
                      >
                        <div className="grid grid-cols-4">
                          <div className="col-span-3 space-y-2">
                            <h3 className="text-lg font-bold text-white">
                              {MOCK_MINTED_NFT.metadata.name}
                            </h3>
                            <p className="text-gray-300 text-sm">
                              {MOCK_MINTED_NFT.metadata.description}
                            </p>
                            <div className="flex items-center text-sm text-gray-400">
                              <Calendar className="h-4 w-4 mr-2" />
                              {new Date(
                                MOCK_MINTED_NFT.mintedAt
                              ).toLocaleDateString("es-ES")}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>

                <AnimatePresence>
                  {isFlipped && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: 0.8, duration: 0.4 }}
                      className="w-full max-w-sm space-y-4 z-[10001] relative"
                    >
                      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                        <p className="text-green-300 text-sm">
                          🎉 <strong>¡Felicitaciones!</strong> Has completado el
                          tutorial de minteo de NFT. Ahora sabes cómo convertir
                          tus logros en certificados digitales permanentes.
                        </p>
                      </div>

                      <button
                        className="w-full bg-[#1983DD] hover:bg-[#1A73E8] text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        onClick={onClose}
                      >
                        Finalizar Tutorial
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
