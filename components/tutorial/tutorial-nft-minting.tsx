import React, { useState, useRef } from "react";
import { Sparkles, ChevronLeft } from "lucide-react";
import { AlmanacSlot } from "./almanac-componets";
import { FloatingParticles } from "./animation-components";
import { MintingAnimation, NFTCard } from "./minting-components";
import { MOCK_MINTED_NFT } from "./mock-data";

interface TutorialNFTMintingProps {
  onClose: () => void;
  onBack?: () => void;
}

type Step = "ready-to-mint" | "revealed";

interface AlmanacSlotData {
  id: number;
  filled: boolean;
}

export default function TutorialNFTMinting({
  onClose,
  onBack
}: TutorialNFTMintingProps) {
  const [step, setStep] = useState<Step>("ready-to-mint");
  const [isFlipped, setIsFlipped] = useState(false);
  const [showInitialAnimation, setShowInitialAnimation] = useState(false);

  const position4Ref = useRef<HTMLDivElement>(null!);

  const earnedItem = { id: 4, name: "Verbs: Level 1", icon: "V1" };
  const almanacSlots: AlmanacSlotData[] = [
    { id: 1, filled: true },
    { id: 2, filled: true },
    { id: 3, filled: true },
    { id: 4, filled: true }, // Este es el recién completado
    { id: 5, filled: false },
    { id: 6, filled: false }
  ];

  const handleMint = async () => {
    setShowInitialAnimation(true);
    setTimeout(() => {
      setShowInitialAnimation(false);
      setStep("revealed");
    }, 1500);
  };

  const handleReveal = () => {
    if (!isFlipped) setIsFlipped(true);
  };

  const handleBack = () => {
    if (step === "ready-to-mint" && onBack) {
      onBack();
    } else if (step === "revealed") {
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
        {step === "ready-to-mint" && (
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
                    step={step}
                    positionRef={position4Ref}
                  />
                ))}
              </div>
            </div>

            <div className="z-20 h-20 flex items-center justify-center w-full">
              <button
                onClick={handleMint}
                className="bg-gradient-to-r from-[#32c781] to-[#1983DD] text-white font-bold py-4 px-12 rounded-xl shadow-xl text-lg flex items-center gap-2 ring-4 ring-[#32c781]/20 animate-[scaleIn_0.3s_ease-out]"
              >
                <Sparkles size={20} /> Mintear Token NFT
              </button>
            </div>
          </div>
        )}

        {(showInitialAnimation || step === "revealed") && (
          <div className="space-y-6 flex flex-col items-center relative">
            <FloatingParticles />

            {showInitialAnimation && <MintingAnimation />}

            {step === "revealed" && (
              <NFTCard
                isFlipped={isFlipped}
                onReveal={handleReveal}
                nft={MOCK_MINTED_NFT}
                onClose={onClose}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
