"use client";

import { CardNFT } from "@/components/car-nft";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NftsTab({
  nfts,
  loading,
  error,
  refetch,
  hasWallet
}: {
  nfts: any[];
  loading: boolean;
  error: any;
  refetch: () => void;
  hasWallet: boolean;
}) {
  if (hasWallet) {
    return (
      <div className="px-4 min-h-full flex flex-col justify-between pt-6 pb-4">
        {loading && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg bg-card" />
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

        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {nfts.map((nft) => (
                <CardNFT
                  key={nft.id}
                  id={nft.id}
                  image={nft.imageUrl || ""}
                  title={nft.name || "Medalla NFT"}
                  description=""
                />
              ))}
            </div>
            <Link
              href={"/achievements/new"}
              className="mb-[140px] w-full h-[50px] flex items-center justify-center bg-[#1983DD] hover:bg-[#1666B0] text-white text-base font-medium rounded-lg transition-colors"
            >
              Crear Nueva Medalla (NFT)
            </Link>
          </>
        )}
      </div>
    );
  }

  return null;
}
