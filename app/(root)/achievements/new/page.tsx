"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Loader2,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Zap,
  Share2,
  Award,
  Calendar,
  ExternalLink
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  const [completedUnits, setCompletedUnits] = useState<CompletedUnit[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [mintedNFT, setMintedNFT] = useState<NFT | null>(null);

  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [description, setDescription] = useState("");

  const selectedUnit = completedUnits.find((u) => u.unitId === selectedUnitId);
  const availableUnits = completedUnits.filter((unit) => !unit.hasNFT);

  useEffect(() => {
    const userId = session?.user?.id;
    if (userId) {
      fetchCompletedUnits(userId);
    }
  }, [session]);

  const fetchCompletedUnits = async (userId: string) => {
    try {
      setLoadingData(true);
      const response = await fetch(`/api/users/${userId}/completed-units`);
      const data = await response.json();
      setCompletedUnits(data.units || []);
    } catch (error) {
      console.error("Error fetching completed units:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleContinue = () => {
    if (currentStep === 1 && selectedUnitId) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handleMintNFT();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleMintNFT = async () => {
    if (!session?.user?.id || !selectedUnitId) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/users/${session.user.id}/nfts/mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: selectedUnitId,
          description: description.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMintedNFT(data.nft);
        setSuccess(
          `¡Tu certificado digital ha sido creado! Token ID: ${data.nft.tokenId}`
        );
        setCurrentStep(3);
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

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((num, i) => (
        <div key={num} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === num
                ? "bg-[#32C781] text-white"
                : currentStep > num
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

  if (availableUnits.length === 0 && currentStep !== 3) {
    return (
      <div className="min-h-screen flex items-center py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="rounded-xl p-8 text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-white mb-2">
              ¡Todos tus certificados están creados!
            </h3>
            <p className="text-gray-400">
              Completa más unidades para obtener nuevos certificados.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="text-white hover:text-gray-300"
            disabled={currentStep === 1}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-white">Minting</h1>
          <div className="w-6" />
        </div>
        <StepIndicator />
        <div className="text-center mb-8">
          <h2 className="text-[22px] font-bold text-white">
            {currentStep === 1 && "Crea tu Medalla NFT"}
            {currentStep === 2 && "Confirma los datos"}
            {currentStep === 3 && "¡Éxito!"}
          </h2>
        </div>

        <div className="rounded-xl py-6 px-2 lg:p-6 pb-[100px]">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Token
                </label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full p-4 border border-gray-600 rounded-lg text-white"
                  required
                >
                  <option value="">Selecciona una unidad...</option>
                  {availableUnits.map((unit) => (
                    <option key={unit.unitId} value={unit.unitId}>
                      {unit.unitName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Dedico este logro a..."
                  className="w-full p-4 border border-gray-600 rounded-lg text-white resize-none"
                  rows={4}
                  maxLength={250}
                />
              </div>

              <button
                onClick={handleContinue}
                disabled={!selectedUnitId}
                className="w-full bg-[#1983DD] hover:bg-blue-700 disabled:opacity-50 text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2"
              >
                Continuar
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <p className="text-white">
                Vas a crear un NFT de: {selectedUnit?.unitName}
              </p>
              {description && <p className="text-gray-300">"{description}"</p>}

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center gap-2 flex-1 bg-gray-600 hover:bg-gray-700 text-white py-4 px-6 rounded-lg"
                >
                  <ArrowLeft size={20} /> Atrás
                </button>
                <button
                  onClick={handleContinue}
                  disabled={loading}
                  className="cursor-pointer flex-1 bg-[#1983DD] text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} /> Minting...
                    </>
                  ) : (
                    <>
                      Crear NFT <Zap size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && mintedNFT && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="mx-auto text-green-500" size={64} />
                <p className="text-white font-bold">{success}</p>
              </div>

              <div className="overflow-hidden rounded-lg shadow-lg bg-gray-900">
                <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {mintedNFT.metadata?.image ? (
                    <img
                      src={mintedNFT.metadata.image}
                      alt={mintedNFT.metadata.name || "NFT Certificate"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Award className="h-16 w-16 text-white opacity-80" />
                  )}
                  <Badge className="absolute top-2 right-2" variant="secondary">
                    #{mintedNFT.tokenId}
                  </Badge>
                </div>

                <div className="p-4 space-y-2">
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
                    {mintedNFT.metadataUri && (
                      <Button asChild variant="outline" size="sm">
                        <a
                          href={
                            mintedNFT.metadataUri.startsWith("ipfs://")
                              ? mintedNFT.metadataUri.replace(
                                  "ipfs://",
                                  "https://ipfs.io/ipfs/"
                                )
                              : mintedNFT.metadataUri
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Metadata
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2">
                <Share2 size={20} /> Compartir
              </button>
            </div>
          )}
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-900 border border-red-600 text-red-300 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
