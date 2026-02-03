"use client";

import { useState } from "react";
import { CardNFT } from "@/components/car-nft";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Wallet,
  Copy,
  Download,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

type WalletStep = "create" | "backup" | "complete";

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
  const [step, setStep] = useState<WalletStep>("create");
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [walletData, setWalletData] = useState<{
    address: string;
    mnemonic?: string;
  } | null>(null);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCreateWallet = async () => {
    setCreatingWallet(true);
    setWalletError(null);

    try {
      const response = await fetch("/api/user/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la wallet");
      }

      const data = await response.json();

      setWalletData({
        address: data.walletAddress,
        mnemonic: data.mnemonic
      });

      if (data.mnemonic) {
        setStep("backup");
      } else {
        setStep("complete");
        setTimeout(() => refetch(), 1000);
      }
    } catch (err: any) {
      setWalletError(err.message || "Error al crear la wallet");
    } finally {
      setCreatingWallet(false);
    }
  };

  const copyToClipboard = () => {
    if (walletData?.mnemonic) {
      navigator.clipboard.writeText(walletData.mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadMnemonic = () => {
    if (walletData?.mnemonic) {
      const content = `FRASE DE RECUPERACIÓN - MANTÉN ESTO SEGURO

${walletData.mnemonic}

Wallet Address: ${walletData.address}
Fecha: ${new Date().toLocaleString()}

⚠️ ADVERTENCIA:
- NUNCA compartas esta frase con nadie
- Si alguien obtiene esta frase, podrá acceder a tu wallet
- Guárdala en un lugar seguro y offline

`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wallet-backup-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleComplete = () => {
    setStep("complete");
    setTimeout(() => refetch(), 500);
  };

  if (hasWallet) {
    return (
      <div className="px-4 flex-1 flex flex-col pt-6 pb-4">
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

        {!loading && !error && nfts.length === 0 && (
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="mt-[140px] flex flex-col items-center gap-4 max-w-sm mx-auto text-center">
              <div className="w-20 h-20 rounded-full border-2 border-gray-600 flex items-center justify-center">
                <Sparkles
                  className="w-10 h-10 text-gray-500"
                  strokeWidth={1.5}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  Explora la colección
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Obtén tu primera medalla para explorar la colección completa
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && nfts.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {nfts.map((nft) => (
              <CardNFT
                key={nft.id}
                id={nft.id}
                image={nft.imageUrl || ""}
                title={nft.name || "Medalla NFT"}
                rarity={nft.rarity || "NORMAL"}
                description=""
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // STEP 1: CREATE WALLET
  if (step === "create") {
    return (
      <div className="px-4 flex-1 flex items-center justify-center pt-6 pb-4">
        <div className="max-w-md w-full bg-card rounded-2xl p-8 text-center border border-border">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">
            Crea tu Wallet
          </h2>

          <p className="text-muted-foreground mb-6">
            Necesitas una wallet para poder mintear y almacenar tus NFTs de
            forma segura en la blockchain.
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
            className="w-full h-12 bg-[#1983DD] hover:bg-[#1666B0] text-white font-medium rounded-lg transition-colors"
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

          <p className="text-sm text-muted-foreground mt-4">
            Tu wallet se creará de forma automática y segura
          </p>
        </div>
      </div>
    );
  }

  // STEP 2: BACKUP MNEMONIC
  if (step === "backup" && walletData?.mnemonic) {
    return (
      <div className="px-4 flex-1 flex items-center justify-center pt-6 pb-4">
        <div className="max-w-2xl w-full bg-card rounded-2xl p-8 border border-border">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3 text-center">
            ¡Importante! Guarda tu Frase de Recuperación
          </h2>

          <Alert className="mb-6 bg-primary/10 border-primary">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              Esta es la ÚNICA vez que verás esta frase. Si la pierdes, no
              podrás recuperar tu wallet.
            </AlertDescription>
          </Alert>

          <div className="bg-background rounded-lg p-6 mb-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-muted-foreground">
                Frase de Recuperación (12 palabras)
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowMnemonic(!showMnemonic)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showMnemonic ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div
              className={`font-mono text-foreground mb-4 p-4 bg-muted rounded ${showMnemonic ? "" : "blur-sm select-none"}`}
            >
              {walletData.mnemonic}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="flex-1 border-primary/30 hover:bg-primary/10 hover:border-primary"
                disabled={!showMnemonic}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
              <Button
                onClick={downloadMnemonic}
                variant="outline"
                className="flex-1 border-primary/30 hover:bg-primary/10 hover:border-primary"
                disabled={!showMnemonic}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-6 p-4 bg-background rounded-lg border border-border">
            <input
              type="checkbox"
              id="confirm"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 accent-primary"
            />
            <label
              htmlFor="confirm"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Confirmo que he guardado mi frase de recuperación en un lugar
              seguro y entiendo que no podré recuperarla después.
            </label>
          </div>

          <Button
            onClick={handleComplete}
            disabled={!confirmed}
            className="w-full h-12 bg-[#1983DD] hover:bg-[#1666B0] text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  // STEP 3: COMPLETE
  return (
    <div className="px-4 flex-1 flex items-center justify-center pt-6 pb-4">
      <div className="max-w-md w-full bg-card rounded-2xl p-8 text-center border border-border">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-3">
          ¡Wallet Creada!
        </h2>

        <p className="text-muted-foreground mb-4">
          Tu wallet ha sido creada exitosamente. Ya puedes empezar a mintear tus
          NFTs.
        </p>

        {walletData && (
          <div className="bg-background rounded-lg p-4 mb-6 border border-border">
            <p className="text-xs text-muted-foreground mb-1">
              Dirección de tu Wallet
            </p>
            <p className="text-sm text-foreground font-mono break-all">
              {walletData.address}
            </p>
          </div>
        )}

        <Button
          onClick={() => refetch()}
          className="w-full h-12 bg-[#1983DD] hover:bg-[#1666B0] text-white font-medium rounded-lg transition-colors"
        >
          Comenzar
        </Button>
      </div>
    </div>
  );
}
