import React, { useState, useRef } from "react";
import { BookOpen, Sparkles, ChevronLeft } from "lucide-react";
import { AlmanacSlot, FloatingCard } from "./almanac-componets";
import { FloatingParticles } from "./animation-components";
import { MintingAnimation, MintingLoader, NFTCard } from "./minting-components";
import { MOCK_MINTED_NFT } from "./mock-data";

interface TutorialNFTMintingProps {
  onClose: () => void;
  onBack?: () => void;
}

type Step = "almanac" | "ready-to-mint" | "minting" | "revealed";

interface AlmanacSlotData {
  id: number;
  filled: boolean;
}

export default function TutorialNFTMinting({
  onClose,
  onBack
}: TutorialNFTMintingProps) {
  const [step, setStep] = useState<Step>("almanac");
  const [isFlipped, setIsFlipped] = useState(false);
  const [showInitialAnimation, setShowInitialAnimation] = useState(false);
  const [showFloatingCard, setShowFloatingCard] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [cardPlaced, setCardPlaced] = useState(false);

  const floatingCardRef = useRef<HTMLDivElement>(null!);
  const position4Ref = useRef<HTMLDivElement>(null!);

  const earnedItem = { id: 4, name: "Verbs: Level 1", icon: "V1" };
  const almanacSlots: AlmanacSlotData[] = [
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

      setTimeout(() => setCardPosition({ x: deltaX, y: deltaY }), 50);

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
    if (!isFlipped) setIsFlipped(true);
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
          <h1 className="text-xl font-semibold text-white">Minteo NFT</h1>
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
                  <AlmanacSlot
                    key={slot.id}
                    slot={slot}
                    earnedItem={earnedItem}
                    cardPlaced={cardPlaced}
                    step={step}
                    showFloatingCard={showFloatingCard}
                    positionRef={position4Ref}
                  />
                ))}
              </div>

              {showFloatingCard && (
                <FloatingCard
                  cardRef={floatingCardRef}
                  cardPosition={cardPosition}
                  isAnimating={isAnimating}
                />
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

            {showInitialAnimation && <MintingAnimation />}
            {step === "minting" && !showInitialAnimation && <MintingLoader />}

            {step === "revealed" && (
              <NFTCard
                isFlipped={isFlipped}
                onReveal={handleReveal}
                nft={MOCK_MINTED_NFT}
              />
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
