import React from "react";
import { Sparkles, Award, Calendar } from "lucide-react";
import { MockNFT } from "./mock-data";
import { EnergyRings } from "./animation-components";

export const MintingAnimation: React.FC = () => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
    style={{ animation: "fadeOut 0.5s ease-out 2s forwards" }}
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
        style={{ animation: "glow-pulse 1.5s ease-in-out infinite" }}
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
);

export const MintingLoader: React.FC = () => (
  <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#0a0a0a]">
    <div
      className="w-16 h-16 border-4 border-[#1983DD] border-t-transparent rounded-full"
      style={{ animation: "spin 2s linear infinite" }}
    />
    <p className="text-white font-semibold mt-6">Minteando tu NFT...</p>
    <p className="text-gray-400 text-sm mt-2">Esto puede tomar unos segundos</p>
  </div>
);

interface NFTCardProps {
  isFlipped: boolean;
  onReveal: () => void;
  nft: MockNFT;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  isFlipped,
  onReveal,
  nft
}) => (
  <div
    className="relative w-full max-w-sm"
    style={{
      perspective: "1000px",
      minHeight: "500px",
      opacity: 0,
      transform: "scale(0.8) translateY(30px)",
      animation: "cardEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
    }}
  >
    <div
      className="relative w-full cursor-pointer"
      onClick={onReveal}
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
            <div style={{ animation: "float-icon 2s ease-in-out infinite" }}>
              <Award className="w-16 h-16" />
            </div>
            <p
              className="mt-4 font-bold text-lg"
              style={{ animation: "pulse-opacity 2s ease-in-out infinite" }}
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
            src={nft.metadata.image}
            alt={nft.metadata.name}
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
              style={{ animation: "shimmer 1.5s ease-in-out 0.3s forwards" }}
            />
          )}
        </div>
        <div
          className="p-4 bg-[#1a1a1a]"
          style={{
            transform: isFlipped ? "translateY(0)" : "translateY(20px)",
            opacity: isFlipped ? 1 : 0,
            transition:
              "transform 0.4s ease-out 0.5s, opacity 0.4s ease-out 0.5s"
          }}
        >
          <div className="grid grid-cols-4">
            <div className="col-span-3 space-y-2">
              <h3 className="text-lg font-bold text-white">
                {nft.metadata.name}
              </h3>
              <p className="text-gray-300 text-sm">
                {nft.metadata.description}
              </p>
              <div className="flex items-center text-sm text-gray-400">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(nft.mintedAt).toLocaleDateString("es-ES")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
