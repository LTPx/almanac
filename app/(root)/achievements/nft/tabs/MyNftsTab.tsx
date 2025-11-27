"use client";

import { useState } from "react";
import { CardNFT } from "@/components/car-nft";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MyNftsTab({
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
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const handleCreateWallet = async () => {
    setCreatingWallet(true);
    setWalletError(null);

    try {
      const response = await fetch("/api/user/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear la wallet");
      }

      const data = await response.json();
      console.log("Wallet creada:", data);
      refetch();
    } catch (err) {
      setWalletError(
        err instanceof Error ? err.message : "Error al crear la wallet"
      );
    } finally {
      setCreatingWallet(false);
    }
  };

  return (
    <div className="px-4 min-h-full flex flex-col justify-between pt-6 pb-4">
      {loading && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg bg-gray-700" />
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
          {hasWallet ? (
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
                className="mb-[140px] w-full h-[50px] flex items-center justify-center bg-[#1983DD] hover:bg-[#1A73E8] text-white text-base font-medium rounded-lg"
              >
                Crear Nueva Medalla (NFT)
              </Link>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-[#1983DD] bg-opacity-20 rounded-full flex items-center justify-center">
                    <Wallet className="w-10 h-10 text-[#1983DD]" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">
                  Crea tu Wallet
                </h2>

                <p className="text-gray-400 mb-6">
                  Necesitas una wallet para poder mintear y almacenar tus NFTs
                  de forma segura en la blockchain.
                </p>

                {walletError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{walletError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleCreateWallet}
                  disabled={creatingWallet}
                  className="w-full h-12 font-medium rounded-lg"
                >
                  {creatingWallet ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creando Wallet...
                    </span>
                  ) : (
                    "Crear Wallet"
                  )}
                </Button>

                <p className="text-sm text-gray-500 mt-4">
                  Tu wallet se creará de forma automática y segura
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
