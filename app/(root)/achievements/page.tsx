"use client";

import { CardNFT } from "@/components/car-nft";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Award } from "lucide-react";
import { useNFTs } from "@/hooks/useNfts";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

function Achievements() {
  const user = useUser();
  const userId = user?.id;

  if (!userId) {
    return <div>Login...</div>;
  }

  return <AchievementsContent userId={userId} />;
}

interface CompletedUnit {
  unitId: string;
  unitName: string;
  courseName: string;
  completedAt: string;
  hasNFT: boolean;
}

function AchievementsContent({ userId }: { userId: string }) {
  const { nfts, loading, error, refetch } = useNFTs(userId);
  const [completedUnits, setCompletedUnits] = useState<CompletedUnit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);

  const fetchCompletedUnits = useCallback(async () => {
    try {
      setLoadingUnits(true);
      const response = await fetch(`/api/users/${userId}/completed-units`);
      const data = await response.json();
      setCompletedUnits(data.units || []);
    } catch (error) {
      console.error("Error fetching completed units:", error);
    } finally {
      setLoadingUnits(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCompletedUnits();
  }, [fetchCompletedUnits]);

  const availableUnitsToMint = completedUnits.filter((unit) => !unit.hasNFT);
  const hasCompletedUnits = completedUnits.length > 0;
  const hasAvailableUnits = availableUnitsToMint.length > 0;

  return (
    <div className="AchievementPage px-4 h-[70dvh]">
      <div className="flex items-center justify-between pt-[20px]">
        <h4 className="text-[22px] font-bold">Medallas</h4>
      </div>

      <div className="h-full pt-6 flex flex-col justify-between">
        {(loading || loadingUnits) && (
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

        {!loading &&
        !loadingUnits &&
        !error &&
        nfts.length === 0 &&
        !hasCompletedUnits ? (
          <div className="flex-1 flex flex-col items-center justify-center -mt-20">
            <div className="flex flex-col items-center gap-4 max-w-sm mx-auto text-center">
              <div className="w-20 h-20 rounded-full border-2 border-gray-200 flex items-center justify-center">
                <Award className="w-10 h-10 text-gray-300" strokeWidth={1.5} />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-700">
                  No tienes medallas aún
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Completa unidades y obtén certificados NFT únicos que validan
                  tus logros
                </p>
              </div>

              <Link
                href={"/home"}
                className="mt-4 px-6 py-3 bg-[#1983DD] hover:bg-[#1A73E8] text-white text-sm font-medium rounded-lg transition-colors"
              >
                Completar mi primera unidad
              </Link>
            </div>
          </div>
        ) : (
          <>
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

            {!loadingUnits && hasAvailableUnits && (
              <Link
                href={"/achievements/new"}
                className="w-full h-[50px] text-center bg-[#1983DD] hover:bg-[#1A73E8] text-white py-4 text-base font-medium rounded-lg mb-8"
              >
                Crear Nueva Medalla (NFT)
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Achievements;
