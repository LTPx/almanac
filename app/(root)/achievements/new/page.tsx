"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Trophy, Loader2, ChevronLeft, Zap } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { NFTRevealCard } from "@/components/ui/mint-nft-card";

interface CompletedUnit {
  unitId: string;
  unitName: string;
  courseName: string;
  completedAt: string;
  hasNFT: boolean;
  subjects?: Array<{
    name: string;
    percentage: number;
  }>;
}

interface NFTCollection {
  id: string;
  name: string;
}

interface NFT {
  id: string;
  tokenId: string;
  unitId: string;
  contractAddress: string;
  transactionHash: string | null;
  metadataUri: string;
  mintedAt: string;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
  };
}

export default function CreateCertificatePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [curriculumTokens, setCurriculumTokens] = useState<CompletedUnit[]>([]);
  const [collectionNfts, setCollectionNfts] = useState<NFTCollection[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [mintedNFT, setMintedNFT] = useState<NFT | null>(null);

  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >();
  const [description, setDescription] = useState("");

  const selectedUnit = curriculumTokens.find(
    (u) => u.unitId === selectedUnitId
  );
  const availableUnits = curriculumTokens.filter((unit) => !unit.hasNFT);

  const MINT_COST_ZAPS = 500;

  useEffect(() => {
    const userId = session?.user?.id;
    if (userId) {
      fetchCompletedUnits(userId);
    }
  }, [session]);

  const fetchCompletedUnits = async (userId: string) => {
    try {
      setLoadingData(true);
      const response = await fetch(`/api/users/${userId}/nfts/reward`);
      const data = await response.json();
      setCurriculumTokens(data.curriculums || []);
      setCollectionNfts(data.collections || []);
    } catch (error) {
      console.error("Error fetching completed units:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleBack = () => {
    if (showSuccess) {
      setShowSuccess(false);
      setMintedNFT(null);
      setSelectedUnitId("");
      setSelectedCollectionId(null);
      setDescription("");
    } else {
      router.push("/achievements?tab=disponible");
    }
  };

  const handleMintNFT = async () => {
    if (!session?.user?.id || !selectedUnitId || !selectedCollectionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${session.user.id}/nfts/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curriculumTokenId: selectedUnitId,
          description: description.trim(),
          collectionId: selectedCollectionId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMintedNFT(data.nft);
        setShowSuccess(true);
        fetchCompletedUnits(session.user.id);
      } else {
        setError(data.message || "Error al crear certificado");
      }
    } catch (error) {
      setError("Error de conexión");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <Trophy className="mx-auto text-gray-400 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-white mb-4">Inicia Sesión</h1>
          <p className="text-gray-400">
            Necesitas estar logueado para crear tus certificados.
          </p>
        </div>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-[0px] z-10 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between p-4 mx-auto">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-white">Minting</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 py-8">
        <div className="mx-auto pb-[30px]">
          {!showSuccess ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-[22px] font-bold text-white">
                  Crea tu Medalla NFT
                </h2>
              </div>

              <div className="rounded-xl py-6 px-2 lg:p-6 pb-[100px]">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                      Token
                    </label>
                    <div className="relative">
                      <select
                        value={selectedUnitId}
                        onChange={(e) => setSelectedUnitId(e.target.value)}
                        className="w-full p-4 pr-10 border border-border rounded-lg text-foreground bg-card/50 backdrop-blur-sm appearance-none cursor-pointer transition-all hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        required
                      >
                        <option
                          value=""
                          className="bg-card text-muted-foreground"
                        >
                          Selecciona un token...
                        </option>
                        {availableUnits.map((unit) => (
                          <option
                            key={unit.unitId}
                            value={unit.unitId}
                            className="bg-card text-foreground"
                          >
                            {unit.unitName}
                          </option>
                        ))}
                      </select>
                      <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 rotate-[-90deg] w-5 h-5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                      Colección
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCollectionId || ""}
                        onChange={(e) =>
                          setSelectedCollectionId(e.target.value)
                        }
                        className="w-full p-4 pr-10 border border-border rounded-lg text-foreground bg-card/50 backdrop-blur-sm appearance-none cursor-pointer transition-all hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        required
                      >
                        <option
                          value=""
                          className="bg-card text-muted-foreground"
                        >
                          Selecciona una colección...
                        </option>
                        {collectionNfts.map((collection) => (
                          <option
                            key={collection.id}
                            value={collection.id}
                            className="bg-card text-foreground"
                          >
                            {collection.name}
                          </option>
                        ))}
                      </select>
                      <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 rotate-[-90deg] w-5 h-5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                      Descripción
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Dedico este logro a..."
                      className="w-full p-4 border border-border rounded-lg text-foreground bg-card/50 backdrop-blur-sm resize-none placeholder:text-muted-foreground/50 transition-all hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      rows={4}
                      maxLength={250}
                    />
                    <div className="flex justify-end mt-1">
                      <span className="text-xs text-muted-foreground">
                        {description.length}/250
                      </span>
                    </div>
                  </div>

                  {selectedUnitId && selectedCollectionId && (
                    <div className="bg-card/50 rounded-lg p-5 border border-border backdrop-blur-sm">
                      <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
                        Resumen de Transacción
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <span className="text-muted-foreground text-sm">
                            Token seleccionado
                          </span>
                          <span className="text-foreground text-sm font-medium text-right">
                            {selectedUnit?.unitName}
                          </span>
                        </div>
                        <div className="h-px bg-border"></div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-foreground text-base font-medium">
                            Costo total
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-md border border-primary/20">
                              <Zap
                                size={18}
                                className="text-primary fill-primary"
                              />
                              <span className="text-foreground text-base font-bold">
                                {MINT_COST_ZAPS}
                              </span>
                              <span className="text-muted-foreground text-sm font-medium">
                                Zaps
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {availableUnits.length === 0 ? (
                    <Link href="/">
                      <button className="w-full bg-[#1983DD] hover:bg-[#1A73E8] text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2 font-medium">
                        Obtener tokens de minteo
                      </button>
                    </Link>
                  ) : (
                    <button
                      onClick={handleMintNFT}
                      disabled={
                        loading || !selectedUnitId || !selectedCollectionId
                      }
                      className="w-full bg-[#1983DD] hover:bg-[#1666B0] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Minting...
                        </>
                      ) : (
                        <>
                          Crear NFT
                          <Zap size={20} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-900 border border-red-600 text-red-300 rounded-lg">
                  {error}
                </div>
              )}
            </>
          ) : (
            mintedNFT && (
              <NFTRevealCard
                mintedNFT={mintedNFT}
                onRevealComplete={() => {
                  console.log("¡NFT revelado!");
                }}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
