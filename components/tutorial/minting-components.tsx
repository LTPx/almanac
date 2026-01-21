import React from "react";
import { Sparkles, Award } from "lucide-react";
import { MockNFT } from "./mock-data";
import { EnergyRings } from "./animation-components";

const DAYS_DURATION = 10;

const getFakeCurriculumDates = () => {
  const today = new Date();

  const startDate = new Date();
  startDate.setDate(today.getDate() - DAYS_DURATION);

  return {
    start: startDate,
    end: today
  };
};

const calculateDaysDuration = (start: Date, end: Date): number => {
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

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
  onClose: () => void;
  nft: MockNFT;
}

const ChevronDown: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 7.5L10 12.5L15 7.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const NFTCard: React.FC<NFTCardProps> = ({
  isFlipped,
  onReveal,
  onClose,
  nft
}) => {
  const [aboutExpanded, setAboutExpanded] = React.useState(true);
  const [collectionExpanded, setCollectionExpanded] = React.useState(false);
  const [blockchainExpanded, setBlockchainExpanded] = React.useState(false);
  const { start, end } = getFakeCurriculumDates();
  const days = calculateDaysDuration(start, end);

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

  return (
    <div
      className="relative w-full max-w-md"
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
          className="absolute top-0 left-0 w-full overflow-hidden rounded-lg bg-black"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            minHeight: "500px"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full h-[280px] flex items-center justify-center overflow-hidden">
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
            className="px-4 py-6 space-y-6 overflow-y-auto"
            style={{
              transform: isFlipped ? "translateY(0)" : "translateY(20px)",
              opacity: isFlipped ? 1 : 0,
              transition:
                "transform 0.4s ease-out 0.5s, opacity 0.4s ease-out 0.5s"
              // maxHeight: "220px"
            }}
          >
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {nft.metadata.name}
              </h3>
              <p className="text-gray-400 text-sm">
                Tutorial Collection · Owned by{" "}
                {formatAddress(nft.contractAddress)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-purple-400 font-semibold text-sm px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
                Epic
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAboutExpanded(!aboutExpanded);
                }}
                className="flex items-center justify-between w-full mb-3"
              >
                <h2 className="text-lg font-semibold">About</h2>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    aboutExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {aboutExpanded && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xl font-bold mb-2">
                      About {nft.metadata.name} #{nft.tokenId}
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {nft.metadata.description}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Duración del logro</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">
                          Fecha de inicio
                        </span>
                        <span className="text-white text-sm font-medium">
                          {formatDate(start)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">
                          Fecha de finalización
                        </span>
                        <span className="text-white text-sm font-medium">
                          {formatDate(end)}
                        </span>
                      </div>

                      <div className="pt-2 mt-2 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">
                            Tiempo total
                          </span>
                          <span className="text-[#32C781] text-sm font-bold">
                            {days} {days === 1 ? "día" : "días"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold mb-1">Minted:</p>
                    <p className="text-gray-400 text-sm">
                      {formatDate(new Date(nft.mintedAt))}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-800 pt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCollectionExpanded(!collectionExpanded);
                }}
                className="flex items-center justify-between w-full"
              >
                <h2 className="text-lg font-semibold">
                  About Tutorial Collection
                </h2>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    collectionExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {collectionExpanded && (
                <div className="mt-3">
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Colección educativa de NFTs que certifica el progreso y
                    logros en diferentes áreas del aprendizaje.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-800 pt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBlockchainExpanded(!blockchainExpanded);
                }}
                className="flex items-center justify-between w-full"
              >
                <h2 className="text-lg font-semibold">Blockchain details</h2>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    blockchainExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {blockchainExpanded && (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contract address</span>
                    <span className="text-blue-400">
                      {formatAddress(nft.contractAddress)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Token ID</span>
                    <span>{nft.tokenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Token Standard</span>
                    <span>ERC721</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Chain</span>
                    <span>Polygon</span>
                  </div>
                </div>
              )}
            </div>
            {isFlipped && (
              <div
                className="w-full max-w-md space-y-4 z-[10001] relative"
                style={{
                  opacity: 0,
                  transform: "translateY(20px)",
                  animation: "fadeInUp 0.4s ease-out 0.8s forwards"
                }}
              >
                <button
                  className="w-full bg-[#1983DD] hover:bg-[#1A73E8] text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  onClick={onClose}
                >
                  Empezar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
