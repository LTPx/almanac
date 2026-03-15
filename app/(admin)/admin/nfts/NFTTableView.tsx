"use client";

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
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  CheckCircle,
  Image as ImageIcon
} from "lucide-react";
import { NFTAsset } from "@/lib/types";
import { getExplorerUrl } from "@/lib/utils";

const rarityConfig = {
  NORMAL: { label: "Normal", color: "bg-gray-100 text-gray-800", icon: "⚪" },
  RARE: { label: "Raro", color: "bg-blue-100 text-blue-800", icon: "🔵" },
  EPIC: { label: "Épico", color: "bg-purple-100 text-purple-800", icon: "🟣" },
  UNIQUE: { label: "Unico", color: "bg-yellow-100 text-yellow-800", icon: "⭐" }
};

interface NFTTableViewProps {
  nfts: NFTAsset[];
  onDelete: (id: number) => void;
}

export default function NFTTableView({ nfts, onDelete }: NFTTableViewProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vista</TableHead>
            <TableHead>NFT Asset</TableHead>
            <TableHead>Colección</TableHead>
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
              return (
                <TableRow key={nft.id}>
                  <TableCell>
                    <div className="w-16 h-16 relative rounded overflow-hidden">
                      <img
                        src={nft.imageUrl}
                        alt={`NFT #${nft.educationalNFT ? nft.educationalNFT.tokenId : "-"}`}
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
                        <p className="font-semibold">{nft.name || "No name"}</p>
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
                    {nft.educationalNFT ? (
                      <Link
                        href={getExplorerUrl(
                          nft.educationalNFT.contractAddress,
                          nft.educationalNFT.tokenId
                        )}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        #{nft.educationalNFT.tokenId}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {nft.isUsed && nft.usedAt
                      ? new Date(nft.usedAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {nft.isUsed && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/nft/${nft.educationalNFT?.id}`}
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
                          onClick={() => window.open(nft.metadataUri, "_blank")}
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
  );
}
