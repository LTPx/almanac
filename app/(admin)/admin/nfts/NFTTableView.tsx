"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  CheckCircle,
  Image as ImageIcon,
  Sparkles,
  Loader2
} from "lucide-react";
import { NFTAsset, EducationalNFT } from "@/lib/types";

type CollectibleRef = {
  tokenId: string;
  contractAddress: string;
  linkedCertTokenId: string | null;
  transactionHash: string | null;
};

type NFTAssetWithCollectible = NFTAsset & {
  collectibleNFT?: CollectibleRef | null;
};
import { getExplorerUrl } from "@/lib/utils";
import { toast } from "sonner";

const rarityConfig = {
  NORMAL: { label: "Normal", color: "bg-gray-100 text-gray-800", icon: "⚪" },
  RARE: { label: "Raro", color: "bg-blue-100 text-blue-800", icon: "🔵" },
  EPIC: { label: "Épico", color: "bg-purple-100 text-purple-800", icon: "🟣" },
  UNIQUE: { label: "Unico", color: "bg-yellow-100 text-yellow-800", icon: "⭐" }
};

type EducationalNFTWithUser = EducationalNFT & {
  user?: { id: string; name: string; email: string };
};

interface NFTTableViewProps {
  nfts: NFTAssetWithCollectible[];
  onDelete: (id: number) => void;
}

export default function NFTTableView({ nfts, onDelete }: NFTTableViewProps) {
  const [tradeableTarget, setTradeableTarget] =
    useState<EducationalNFTWithUser | null>(null);
  const [minting, setMinting] = useState(false);

  const handleMintTradeable = async () => {
    if (!tradeableTarget) return;
    const userId = tradeableTarget.user?.id ?? tradeableTarget.userId;
    if (!userId) {
      toast.error("No se encontró el usuario del certificado");
      return;
    }

    setMinting(true);
    try {
      const res = await fetch(`/api/users/${userId}/nfts/mint-collectible`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateNftId: tradeableTarget.id })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`NFT tradeable creado — Token #${data.nft?.tokenId}`);
        setTradeableTarget(null);
      } else {
        toast.error(data.error || "Error al crear NFT tradeable");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setMinting(false);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vista</TableHead>
              <TableHead>NFT Asset</TableHead>
              <TableHead>Colección</TableHead>
              <TableHead>Curriculum</TableHead>
              <TableHead className="text-center">Rareza</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Token ID</TableHead>
              <TableHead className="text-center">Minted</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nfts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No se encontraron NFTs
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              nfts.map((nft) => {
                const rarityInfo =
                  rarityConfig[nft.rarity as keyof typeof rarityConfig];
                const edNFT = nft.educationalNFT as
                  | EducationalNFTWithUser
                  | undefined;
                const isCertificate =
                  nft.isUsed &&
                  edNFT?.tokenType === "CERTIFICATE" &&
                  !nft.collectibleNFT;

                return (
                  <TableRow key={nft.id}>
                    <TableCell>
                      <div className="w-16 h-16 relative rounded overflow-hidden">
                        <img
                          src={nft.imageUrl}
                          alt={`NFT #${edNFT ? edNFT.tokenId : "-"}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <Link
                          href={`/admin/nfts/${nft.id}/edit`}
                          className="hover:underline hover:text-primary"
                        >
                          <p className="font-semibold">
                            {nft.name || "No name"}
                          </p>
                        </Link>
                        {nft.metadataUri && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {nft.metadataUri}
                          </p>
                        )}
                        <p className="text-muted-foreground">
                          {new Date(nft.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/collections/${nft.collectionId || ""}/edit`}
                        className="text-sm text-muted-foreground hover:underline hover:text-primary"
                      >
                        {nft.collection?.name || "No collection"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      {nft.curriculum ? (
                        <span>{nft.curriculum.title}</span>
                      ) : (
                        <span className="text-muted-foreground">Any</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={rarityInfo.color}>
                        <span className="mr-1">{rarityInfo.icon}</span>
                        {rarityInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {nft.isUsed ? (
                        <Badge variant="default" className="gap-1 bg-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Minted
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          Disponible
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex  items-center gap-1">
                        {edNFT ? (
                          <Link
                            href={getExplorerUrl(
                              edNFT.contractAddress,
                              edNFT.tokenId
                            )}
                            target="_blank"
                            className="text-xs hover:underline flex items-center gap-1"
                          >
                            <Badge
                              variant="outline"
                              className="text-xs font-mono text-muted-foreground"
                            >
                              🔒 #{edNFT.tokenId}
                            </Badge>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                        {nft.collectibleNFT && (
                          <Link
                            href={getExplorerUrl(
                              nft.collectibleNFT.contractAddress,
                              nft.collectibleNFT.tokenId
                            )}
                            target="_blank"
                            className="text-xs hover:underline flex items-center gap-1"
                          >
                            <Badge
                              variant="outline"
                              className="text-xs font-mono text-muted-foreground"
                            >
                              💰 #{nft.collectibleNFT.tokenId}
                            </Badge>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {nft.isUsed && nft.usedAt
                        ? new Date(nft.usedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {isCertificate && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTradeableTarget(edNFT!)}
                          >
                            <Sparkles className="w-4 h-4" />
                            Tradeable
                          </Button>
                        )}
                        {nft.isUsed && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/nft/${edNFT?.id}`}
                              target="_blank"
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Ver
                            </Link>
                          </Button>
                        )}
                        {!nft.isUsed && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/admin/nfts/${nft.id}/edit`}
                              className="gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </Link>
                          </Button>
                        )}
                        {nft.metadataUri && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              window.open(nft.metadataUri, "_blank")
                            }
                            className="gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Metadata
                          </Button>
                        )}
                        {!nft.isUsed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(nft.id)}
                            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal crear NFT tradeable */}
      <Dialog
        open={!!tradeableTarget}
        onOpenChange={(open) => !open && setTradeableTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Crear NFT Tradeable
            </DialogTitle>
            <DialogDescription>
              Se creará una versión coleccionable y transferible de este
              certificado no transferible.
            </DialogDescription>
          </DialogHeader>

          {tradeableTarget && (
            <div className="space-y-3 py-2">
              <div className="rounded-lg border p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certificado</span>
                  <span className="font-mono font-medium">
                    #{tradeableTarget.tokenId}
                  </span>
                </div>
                {tradeableTarget.user && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Usuario</span>
                    <span className="font-medium">
                      {tradeableTarget.user.name}
                    </span>
                  </div>
                )}
                {tradeableTarget.user && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="text-muted-foreground">
                      {tradeableTarget.user.email}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                El NFT tradeable quedará vinculado al certificado y podrá ser
                transferido o vendido por el usuario.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setTradeableTarget(null)}
              disabled={minting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleMintTradeable}
              disabled={minting}
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              {minting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Crear NFT Tradeable
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
