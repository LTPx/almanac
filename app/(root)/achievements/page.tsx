"use client";

import { CardNFT } from "@/components/car-nft";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      const response = await fetch(
        `/api/users/${userId}/completed-curriculums`
      );
      const data = await response.json();
      setCompletedUnits(data.curriculums || []);
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
    <div className="AchievementPage h-[100dvh] bg-black flex flex-col">
      <Tabs
        value="medallas"
        className="w-full flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="w-full h-14 bg-[#32C781] rounded-none border-b shrink-0">
          <TabsTrigger
            value="desafios"
            disabled
            className="flex-1 font-bold text-[#1A6E47] cursor-not-allowed rounded-none"
          >
            Desafíos
          </TabsTrigger>
          <TabsTrigger
            value="medallas"
            className="flex-1 text-white data-[state=active]:bg-transparent shadow-none border-0 border-b-2 border-b-transparent data-[state=active]:border-b-white rounded-none font-medium"
          >
            Medallas
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="medallas"
          className="flex-1 flex flex-col overflow-hidden m-0"
        >
          <Tabs
            value="mis-medallas"
            className="w-full flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="w-full h-14 bg-[#32C781] rounded-none shrink-0">
              <TabsTrigger
                value="explore"
                disabled
                className="flex-1 font-bold text-[#1A6E47] cursor-not-allowed rounded-none text-sm"
              >
                Explore
              </TabsTrigger>
              <TabsTrigger
                value="friends"
                disabled
                className="flex-1 font-bold text-[#1A6E47] cursor-not-allowed rounded-none text-sm"
              >
                Friends
              </TabsTrigger>
              <TabsTrigger
                value="mis-medallas"
                className="flex-1 text-white data-[state=active]:bg-transparent shadow-none border-0 border-b-2 border-b-transparent data-[state=active]:border-b-white rounded-none font-medium"
              >
                Mis Medallas
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="mis-medallas"
              className="flex-1 overflow-y-auto m-0"
            >
              <div className="px-4 min-h-full flex flex-col justify-between pt-6 pb-4">
                {(loading || loadingUnits) && (
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-40 w-full rounded-lg bg-gray-700"
                      />
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
                      <div className="w-20 h-20 rounded-full border-2 border-gray-600 flex items-center justify-center">
                        <Award
                          className="w-10 h-10 text-gray-500"
                          strokeWidth={1.5}
                        />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">
                          No tienes medallas aún
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          Completa unidades y obtén certificados NFT únicos que
                          validan tus logros
                        </p>
                      </div>

                      <Link
                        href={"/"}
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
                            id={nft.id}
                            image={nft.imageUrl || ""}
                            title={nft.name || "Medalla NFT"}
                            description={""}
                          />
                        ))}
                    </div>

                    {!loadingUnits && hasAvailableUnits && (
                      <Link
                        href={"/achievements/new"}
                        className="mb-[140px] w-full h-[50px] text-center bg-[#1983DD] hover:bg-[#1A73E8] text-white py-4 text-base font-medium rounded-lg mb-8"
                      >
                        Crear Nueva Medalla (NFT)
                      </Link>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Achievements;
