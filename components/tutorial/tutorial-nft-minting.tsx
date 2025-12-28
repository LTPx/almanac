import React, { useState, useRef } from "react";
import { BookOpen, Sparkles, Award, Calendar, ChevronLeft } from "lucide-react";

interface TutorialNFTMintingProps {
  onClose: () => void;
  onBack?: () => void;
}

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
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background:
              i % 3 === 0 ? "#32C781" : i % 3 === 1 ? "#1983DD" : "#1A73E8",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float-${i} ${2 + Math.random()}s ease-in-out ${Math.random() * 2}s infinite`
          }}
        />
      ))}
      <style>{`
        ${particles
          .map(
            (_, i) => `
          @keyframes float-${i} {
            0%, 100% { transform: translateY(0) scale(0); opacity: 0; }
            50% { transform: translateY(-20px) scale(1.5); opacity: 1; }
          }
        `
          )
          .join("")}
      `}</style>
    </div>
  );
};

const EnergyRings = () => (
  <>
    <div
      className="absolute inset-0 rounded-lg border-2 border-[#32C781]"
      style={{
        animation: "pulse-ring-1 2s ease-in-out infinite"
      }}
    />
    <div
      className="absolute inset-0 rounded-lg border-2 border-[#1983DD]"
      style={{
        animation: "pulse-ring-2 2s ease-in-out 0.5s infinite"
      }}
    />
    <style>{`
      @keyframes pulse-ring-1 {
        0%, 100% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.1); opacity: 0.6; }
      }
      @keyframes pulse-ring-2 {
        0%, 100% { transform: scale(1); opacity: 0.2; }
        50% { transform: scale(1.15); opacity: 0.5; }
      }
    `}</style>
  </>
);

export default function TutorialNFTMinting({
  onClose,
  onBack
}: TutorialNFTMintingProps) {
  const [step, setStep] = useState("almanac");
  const [isFlipped, setIsFlipped] = useState(false);
  const [showInitialAnimation, setShowInitialAnimation] = useState(false);

  //
  const [showFloatingCard, setShowFloatingCard] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [cardPlaced, setCardPlaced] = useState(false);

  const floatingCardRef = useRef<HTMLDivElement>(null);
  const position4Ref = useRef<HTMLDivElement>(null);

  const earnedItem = { id: 4, name: "Verbs: Level 1", icon: "V1" };

  const almanacSlots = [
    { id: 1, filled: true },
    { id: 2, filled: true },
    { id: 3, filled: true },
    { id: 4, filled: false },
    { id: 5, filled: false },
    { id: 6, filled: false }
  ];

  const handleCollect = () => {
    if (isAnimating || !showFloatingCard) return;

    const emptyPosition = almanacSlots.find((pos) => !pos.filled);

    if (emptyPosition && floatingCardRef.current && position4Ref.current) {
      setIsAnimating(true);

      const floatingRect = floatingCardRef.current.getBoundingClientRect();
      const targetRect = position4Ref.current.getBoundingClientRect();

      const deltaX =
        targetRect.left -
        floatingRect.left +
        (targetRect.width - floatingRect.width) / 2;
      const deltaY =
        targetRect.top -
        floatingRect.top +
        (targetRect.height - floatingRect.height) / 2;

      setCardPosition({ x: 0, y: 0 });

      setTimeout(() => {
        setCardPosition({ x: deltaX, y: deltaY });
      }, 50);

      setTimeout(() => {
        setCardPlaced(true);
        setShowFloatingCard(false);
        setTimeout(() => {
          setIsAnimating(false);
          setStep("ready-to-mint");
        }, 100);
      }, 1200);
    }
  };

  const handleMint = async () => {
    setStep("minting");

    await new Promise((resolve) => setTimeout(resolve, 3000));

    setShowInitialAnimation(true);

    setTimeout(() => {
      setShowInitialAnimation(false);
      setStep("revealed");
    }, 2500);
  };

  const handleReveal = () => {
    if (isFlipped) return;
    setIsFlipped(true);
  };

  const handleBack = () => {
    if (step === "almanac" && onBack) {
      onBack();
    } else if (step === "ready-to-mint") {
      setStep("almanac");
      setShowFloatingCard(true);
      setIsAnimating(false);
      setCardPosition({ x: 0, y: 0 });
      setCardPlaced(false);
    } else if (step === "revealed" || step === "minting") {
      setStep("ready-to-mint");
      setIsFlipped(false);
      setShowInitialAnimation(false);
    }
  };

  return (
    <div className="w-full max-w-[650px] min-h-screen bg-[#0a0a0a] relative overflow-y-auto scrollbar-hide">
      <div className="sticky top-0 z-[10000] backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Minteo de NFT</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 py-8 max-w-2xl mx-auto pb-24">
        {(step === "almanac" || step === "ready-to-mint") && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#0a0a0a] text-white relative overflow-hidden rounded-xl p-6">
            <div className="absolute inset-0 bg-gradient-radial from-[#32c781]/20 via-[#0a0a0a] to-[#0a0a0a] z-0" />

            <div className="z-10 text-center mb-12 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
              <h2 className="text-gray-400 text-sm uppercase tracking-widest mb-2">
                Curriculum Completo
              </h2>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#32c781] to-[#1983DD]">
                Conocimiento Asegurado
              </h1>
            </div>

            <div className="relative w-full max-w-md h-96 z-10 flex flex-col items-center justify-center">
              <div className="grid grid-cols-3 gap-4 mb-8">
                {almanacSlots.map((slot) => (
                  <div
                    key={slot.id}
                    ref={slot.id === 4 ? position4Ref : null}
                    className={`w-20 h-24 rounded-lg border-2 flex items-center justify-center relative transition-all duration-500
                      ${slot.filled || (slot.id === earnedItem.id && cardPlaced) ? "border-[#32c781]/50 bg-gradient-to-br from-slate-700/50 to-slate-800/50" : "border-gray-700 bg-gray-800/50"}
                      ${slot.id === earnedItem.id && step === "ready-to-mint" ? "border-[#32c781] shadow-[0_0_15px_rgba(50,199,129,0.5)]" : ""}
                    `}
                  >
                    {slot.filled && (
                      <div className="w-12 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded flex items-center justify-center border-2 border-slate-500 shadow-lg">
                        <Award size={20} className="text-slate-300" />
                      </div>
                    )}

                    {slot.id === earnedItem.id &&
                      (step === "ready-to-mint" || cardPlaced) &&
                      !showFloatingCard && (
                        <div className="w-12 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded flex items-center justify-center border-2 border-slate-500 shadow-lg relative overflow-hidden">
                          <Award size={20} className="text-slate-300" />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#32C781]/10 to-transparent" />
                        </div>
                      )}
                  </div>
                ))}
              </div>

              {showFloatingCard && (
                <div className="absolute z-50 flex flex-col items-center translate-y-32">
                  <div
                    ref={floatingCardRef}
                    style={{
                      transform: `translate(${cardPosition.x}px, ${cardPosition.y}px) scale(${isAnimating ? 0.5 : 1})`,
                      transition: isAnimating
                        ? "transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                        : "none",
                      opacity: isAnimating && cardPosition.x !== 0 ? 0.95 : 1
                    }}
                    className="w-24 h-32 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-[0_0_30px_rgba(50,199,129,0.3)] flex items-center justify-center border-4 border-slate-600 relative overflow-hidden"
                  >
                    <div
                      className="absolute inset-0 rounded-lg border-2 border-[#32C781]/30"
                      style={{
                        animation: "pulse-ring-1 2s ease-in-out infinite"
                      }}
                    />
                    <div
                      className="absolute inset-0 rounded-lg border-2 border-[#1983DD]/20"
                      style={{
                        animation: "pulse-ring-2 2s ease-in-out 0.5s infinite"
                      }}
                    />

                    <Award
                      size={32}
                      className="text-slate-400 z-10"
                      style={{
                        animation: "float-icon 2s ease-in-out infinite"
                      }}
                    />

                    <div
                      className="absolute inset-0 bg-gradient-to-b from-transparent via-[#32C781]/20 to-transparent h-full"
                      style={{ animation: "scan-line 2s linear infinite" }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="z-20 h-20 flex items-center justify-center w-full">
              {step === "almanac" && !isAnimating && (
                <button
                  onClick={handleCollect}
                  className="bg-[#32c781] hover:bg-[#2ab871] text-white font-bold py-4 px-12 rounded-full shadow-lg text-lg flex items-center gap-2 transition-transform active:scale-95"
                >
                  Agregar al Almanaque <BookOpen size={20} />
                </button>
              )}

              {isAnimating && (
                <p className="text-[#32c781] animate-pulse font-mono">
                  Procesando...
                </p>
              )}

              {step === "ready-to-mint" && !showFloatingCard && (
                <button
                  onClick={handleMint}
                  className="bg-gradient-to-r from-[#32c781] to-[#1983DD] text-white font-bold py-4 px-12 rounded-xl shadow-xl text-lg flex items-center gap-2 ring-4 ring-[#32c781]/20 animate-[scaleIn_0.3s_ease-out]"
                >
                  <Sparkles size={20} /> Mintear Token NFT
                </button>
              )}
            </div>
          </div>
        )}

        {(step === "minting" || step === "revealed") && (
          <div className="space-y-6 flex flex-col items-center relative">
            <FloatingParticles />

            {showInitialAnimation && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
                style={{
                  animation: "fadeOut 0.5s ease-out 2s forwards"
                }}
              >
                <div
                  className="relative flex flex-col items-center"
                  style={{
                    animation:
                      "mint-entrance 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards"
                  }}
                >
                  <div
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-[#32C781] to-[#1983DD] flex items-center justify-center relative"
                    style={{
                      animation: "glow-pulse 1.5s ease-in-out infinite"
                    }}
                  >
                    <Sparkles className="w-16 h-16 text-white" />

                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-[#32C781]"
                        style={{
                          animation: `particle-burst-${i} 1s ease-out forwards`,
                          top: "50%",
                          left: "50%"
                        }}
                      />
                    ))}
                  </div>
                  <p
                    className="text-center mt-6 text-white font-semibold text-xl"
                    style={{
                      animation: "fadeInUp 0.5s ease-out 0.5s forwards",
                      opacity: 0
                    }}
                  >
                    ¡NFT Creado Exitosamente!
                  </p>
                </div>
              </div>
            )}

            {step === "minting" && !showInitialAnimation && (
              <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#0a0a0a]">
                <div
                  className="w-16 h-16 border-4 border-[#1983DD] border-t-transparent rounded-full"
                  style={{
                    animation: "spin 2s linear infinite"
                  }}
                />
                <p className="text-white font-semibold mt-6">
                  Minteando tu NFT...
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Esto puede tomar unos segundos
                </p>
              </div>
            )}

            {step === "revealed" && (
              <div
                className="relative w-full max-w-sm"
                style={{
                  perspective: "1000px",
                  minHeight: "500px",
                  opacity: 0,
                  transform: "scale(0.8) translateY(30px)",
                  animation:
                    "cardEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                }}
              >
                <div
                  className="relative w-full cursor-pointer"
                  onClick={handleReveal}
                  style={{
                    transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
                    transformStyle: "preserve-3d",
                    minHeight: "500px",
                    transition: "transform 1s ease-in-out"
                  }}
                >
                  <div
                    className="relative overflow-hidden rounded-lg"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      minHeight: "500px",
                      animation: !isFlipped
                        ? "glow-pulse-card 2s ease-in-out infinite"
                        : "none"
                    }}
                  >
                    <div className="relative h-[500px] bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border-4 border-slate-600">
                      {!isFlipped && <EnergyRings />}

                      <div className="text-slate-400 flex flex-col items-center z-10">
                        <div
                          style={{
                            animation: "float-icon 2s ease-in-out infinite"
                          }}
                        >
                          <Award className="w-16 h-16" />
                        </div>
                        <p
                          className="mt-4 font-bold text-lg"
                          style={{
                            animation: "pulse-opacity 2s ease-in-out infinite"
                          }}
                        >
                          Toca para revelar...
                        </p>
                      </div>

                      {!isFlipped && (
                        <div
                          className="absolute inset-0 bg-gradient-to-b from-transparent via-[#32C781]/20 to-transparent h-full"
                          style={{ animation: "scan-line 2s linear infinite" }}
                        />
                      )}
                    </div>
                  </div>

                  <div
                    className="absolute top-0 left-0 w-full overflow-hidden rounded-lg"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      minHeight: "500px"
                    }}
                  >
                    <div className="relative h-80 flex items-center justify-center overflow-hidden shadow-2xl shadow-[#32C781]/30">
                      <img
                        src={MOCK_MINTED_NFT.metadata.image}
                        alt={MOCK_MINTED_NFT.metadata.name}
                        className="w-full h-full object-cover"
                        style={{
                          transform: isFlipped ? "scale(1)" : "scale(0.8)",
                          opacity: isFlipped ? 1 : 0,
                          transition:
                            "transform 0.5s ease-out 0.3s, opacity 0.5s ease-out 0.3s"
                        }}
                      />

                      {isFlipped && (
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          style={{
                            animation: "shimmer 1.5s ease-in-out 0.3s forwards"
                          }}
                        />
                      )}
                    </div>

                    <div
                      className="p-4 bg-[#1a1a1a]"
                      style={{
                        transform: isFlipped
                          ? "translateY(0)"
                          : "translateY(20px)",
                        opacity: isFlipped ? 1 : 0,
                        transition:
                          "transform 0.4s ease-out 0.5s, opacity 0.4s ease-out 0.5s"
                      }}
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
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isFlipped && step === "revealed" && (
              <div
                className="w-full max-w-sm space-y-4 z-[10001] relative"
                style={{
                  opacity: 0,
                  transform: "translateY(20px)",
                  animation: "fadeInUp 0.4s ease-out 0.8s forwards"
                }}
              >
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-300 text-sm">
                    🎉 <strong>¡Felicitaciones!</strong> Has completado el
                    tutorial de minteo de NFT. Ahora sabes cómo convertir tus
                    logros en certificados digitales permanentes.
                  </p>
                </div>

                <button
                  className="w-full bg-[#1983DD] hover:bg-[#1A73E8] text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  onClick={onClose}
                >
                  Finalizar Tutorial
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
