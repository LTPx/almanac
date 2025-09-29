"use client";

import { CardNFT } from "@/components/car-nft";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useNFTs } from "@/hooks/useNfts";
import { useUser } from "@/context/UserContext";
import Link from "next/link";

function Achievements() {
  const user = useUser();
  const userId = user?.id;

  if (!userId) {
    return <div>Login...</div>;
  }
  const { nfts, loading, error, refetch } = useNFTs(userId);

  return (
    <div className="AchievementPage px-4 h-[70dvh]">
      <div className="flex items-center justify-between pt-[20px]">
        <h4 className="text-[22px] font-bold">Medallas</h4>
      </div>

      <div className="h-full pt-6 flex flex-col justify-between">
        {loading && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                size="sm"
                variant="outline"
                onClick={refetch}
                className="ml-3"
              >
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && nfts.length === 0 && (
          <p className="text-gray-400 mb-6">
            Aún no tienes medallas (NFTs). Completa cursos para obtenerlas 🎖️
          </p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {!loading &&
            nfts.map((nft) => (
              <CardNFT
                key={nft.id}
                image={nft.metadata?.image || ""}
                title={nft.metadata?.name || `Certificado #${nft.tokenId}`}
                description={nft.metadata?.description}
              />
            ))}
        </div>
        <Link
          href={"/achievements/new"}
          className="w-full h-[50px] text-center bg-[#1983DD] hover:bg-[#1A73E8] text-white py-4 text-base font-medium rounded-lg mb-8"
        >
          Crear Nueva Medalla (NFT)
        </Link>
      </div>
    </div>
  );
}

export default Achievements;
