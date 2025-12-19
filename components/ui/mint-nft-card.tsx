"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Calendar, ExternalLink, Share2, Sparkles } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface NFT {
  id: string;
  tokenId: string;
  unitId: string;
  contractAddress: string;
  transactionHash: string | null;
  metadataUri: string;
  mintedAt: string;
  metadata?: NFTMetadata;
}

interface NFTRevealCardProps {
  mintedNFT: NFT;
  onRevealComplete?: () => void;
}

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

export const NFTRevealCard = ({
  mintedNFT,
  onRevealComplete
}: NFTRevealCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showInitialAnimation, setShowInitialAnimation] = useState(true);
  const [canInteract, setCanInteract] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleReveal = () => {
    if (!canInteract || isFlipped) return;
    setIsFlipped(true);

    setTimeout(() => {
      triggerConfetti();
    }, 400);

    onRevealComplete?.();
  };

  const handleShare = async () => {
    const urlNft = `/nft/${mintedNFT.id}`;
    const shareData = {
      title: mintedNFT.metadata?.name || "Mi NFT",
      text: mintedNFT.metadata?.description || "Mira mi certificado NFT",
      url: urlNft
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin + urlNft);
        alert("Enlace copiado al portapapeles");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const triggerConfetti = () => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    if (typeof window !== "undefined" && (window as any).confetti) {
      (window as any).confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ["#32C781", "#1983DD", "#1A73E8", "#ffffff"],
        disableForReducedMotion: true
      });
    }
  };

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowInitialAnimation(false);
    }, 2000);

    const timer2 = setTimeout(() => {
      setCanInteract(true);
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="space-y-6 flex flex-col items-center relative pb-4">
      <FloatingParticles />
      <AnimatePresence>
        {showInitialAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
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
              className="relative"
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
                className="text-center mt-4 text-white font-semibold"
              >
                Preparando tu NFT...
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
        style={{ perspective: "1000px" }}
      >
        <motion.div
          ref={cardRef}
          className="relative w-full cursor-pointer"
          onClick={handleReveal}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            className="relative overflow-hidden rounded-lg h-full"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            }}
            animate={
              !isFlipped && canInteract
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
            <div className="relative h-full min-h-[400px] bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border-4 border-slate-600">
              {!isFlipped && <EnergyRings />}
              <div className="text-slate-400 flex flex-col items-center z-10">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </motion.div>
                <motion.p
                  className="mt-4 font-bold text-lg"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {canInteract ? "Toca para revelar..." : "Preparando..."}
                </motion.p>
              </div>

              {!isFlipped && canInteract && (
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
              transform: "rotateY(180deg)"
            }}
          >
            <div className="relative h-60 flex items-center justify-center overflow-hidden shadow-2xl shadow-[#32C781]/30">
              {mintedNFT.metadata?.image ? (
                <motion.img
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={isFlipped ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  src={mintedNFT.metadata.image}
                  alt={mintedNFT.metadata.name || "NFT Certificate"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Award className="h-16 w-16 text-white opacity-80" />
              )}

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
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-[#32C781]/20 to-[#1983DD]/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{
                      duration: 2,
                      repeat: 2,
                      delay: 0.5
                    }}
                  />
                </>
              )}
            </div>

            <motion.div
              className="p-4 bg-card"
              initial={{ y: 20, opacity: 0 }}
              animate={isFlipped ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <div className="grid grid-cols-4">
                <div className="col-span-3 space-y-2">
                  <h3 className="text-lg font-bold text-white">
                    {mintedNFT.metadata?.name ||
                      `Certificado #${mintedNFT.tokenId}`}
                  </h3>
                  {mintedNFT.metadata?.description && (
                    <p className="text-gray-300 text-sm">
                      {mintedNFT.metadata.description}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(mintedNFT.mintedAt).toLocaleDateString("es-ES")}
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button asChild size="sm">
                      <a
                        href={`https://amoy.polygonscan.com/token/${mintedNFT.contractAddress}?a=${mintedNFT.tokenId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Explorer
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="col-span-1 flex justify-end items-end">
                  <QRCodeSVG
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/nft/${mintedNFT.id}`}
                    size={80}
                  />
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
            className="w-full max-w-sm space-y-4 mt-[30px]"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShare}
              className="w-full bg-[#1983DD] hover:bg-[#1A73E8] text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <Share2 size={20} /> Compartir
            </motion.button>
            <div className="flex justify-center">
              <Link
                href={"/achievements"}
                className="text-center cursor-pointer w-full text-[#708BB1] hover:text-[#8FA6C7] py-2 transition-colors"
              >
                Volver a Mis Medallas
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
