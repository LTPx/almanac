"use client";

// import { useSession } from "better-auth/react";
import { useState, useEffect } from "react";
import { Trophy, Award, Calendar, ExternalLink } from "lucide-react";

interface NFT {
  id: string;
  tokenId: string;
  contractAddress: string;
  transactionHash: string;
  mintedAt: string;
  unit: {
    name: string;
    course: {
      name: string;
    };
  };
}

export default function UserCertificates({ userId }: { userId: string }) {
  // const { data: session } = useSession();

  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserNFTs();
  }, []);

  const fetchUserNFTs = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/nfts`);
      const data = await response.json();
      setNfts(data.nfts || []);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    } finally {
      setLoading(false);
    }
  };

  const openInPolygonscan = (txHash: string) => {
    window.open(`https://amoy.polygonscan.com/tx/${txHash}`, "_blank");
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-purple-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-purple-100 rounded"></div>
            <div className="h-20 bg-purple-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="text-yellow-500" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">
          Mis Certificados Digitales
        </h2>
      </div>

      {nfts.length === 0 ? (
        <div className="text-center py-8">
          <Award className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">
            ¡Completa tu primera unidad para obtener tu primer certificado!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nfts.map((nft) => (
            <div
              key={nft.id}
              className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow border border-purple-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                    {nft.unit.course.name}
                  </h3>
                  <p className="text-purple-600 text-xs font-medium">
                    {nft.unit.name}
                  </p>
                </div>
                <Award
                  className="text-yellow-500 flex-shrink-0 ml-2"
                  size={20}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <Calendar size={14} />
                {new Date(nft.mintedAt).toLocaleDateString("es-ES")}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Token #{nft.tokenId}
                </span>
                <button
                  onClick={() => openInPolygonscan(nft.transactionHash)}
                  className="text-blue-500 hover:text-blue-700 p-1"
                  title="Ver en blockchain"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💎 ¿Sabías qué?</strong> Cada certificado es único y está
          guardado permanentemente en la blockchain. ¡Nadie puede falsificarlos!
        </p>
      </div>
    </div>
  );
}
