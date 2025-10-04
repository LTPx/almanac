import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  ExternalLink,
  Calendar,
  Award,
  RefreshCw,
  AlertCircle
} from "lucide-react";

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

interface UserNFTsProps {
  userId: string;
  useThirdweb?: boolean;
}

const UserNFTs: React.FC<UserNFTsProps> = ({ userId, useThirdweb = false }) => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [isThirdwebEnabled, setIsThirdwebEnabled] = useState(useThirdweb);

  const fetchNFTs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = useThirdweb
        ? `/api/users/${userId}/nfts/thirdweb`
        : `/api/users/${userId}/nfts`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error("Error al cargar los NFTs");
      }

      const data = await response.json();
      setNfts(data.nfts || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching NFTs:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, useThirdweb]);

  useEffect(() => {
    fetchNFTs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // }, [userId, isThirdwebEnabled]);

  // const parseMetadata = (metadataUri: string) => {
  //   try {
  //     if (
  //       metadataUri.startsWith("ipfs://") ||
  //       metadataUri.startsWith("https://")
  //     ) {
  //       return { metadataUrl: metadataUri };
  //     }
  //     return JSON.parse(metadataUri);
  //   } catch {
  //     return null;
  //   }
  // };

  const getExplorerUrl = (contractAddress: string, tokenId: string) => {
    return `https://amoy.polygonscan.com/token/${contractAddress}?a=${tokenId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="flex space-x-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNFTs}
            className="ml-4"
          >
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (nfts.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent className="pt-6">
          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="mb-2">No tienes certificados NFT aún</CardTitle>
          <CardDescription>
            Completa unidades del curso para obtener tus primeros certificados
            NFT.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Mis Certificados NFT
          </h2>
          <p className="text-muted-foreground">
            {nfts.length} certificado{nfts.length !== 1 ? "s" : ""} obtenido
            {nfts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* <div className="flex items-center space-x-2">
            <Switch
              id="thirdweb-mode"
              checked={isThirdwebEnabled}
              onCheckedChange={setIsThirdwebEnabled}
            />
            <Label htmlFor="thirdweb-mode" className="text-sm">
              Usar Thirdweb
            </Label>
          </div> */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNFTs}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.map((nft) => {
          const metadata = nft.metadata as any;
          return (
            <Card
              key={nft.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header con imagen */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {metadata?.image ? (
                  <img
                    src={metadata.image}
                    alt={metadata.name || "NFT Certificate"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback si la imagen no carga
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                ) : null}
                {(!metadata?.image || metadata?.loading) && (
                  <div className="flex flex-col items-center text-white">
                    <Award className="h-16 w-16 opacity-80 mb-2" />
                    {metadata?.loading && (
                      <Loader2 className="h-6 w-6 animate-spin opacity-60" />
                    )}
                  </div>
                )}
                <Badge className="absolute top-2 right-2" variant="secondary">
                  #{nft.tokenId}
                </Badge>
              </div>

              <CardHeader>
                <CardTitle className="text-lg">
                  {metadata?.name || `Certificado #${nft.tokenId}`}
                </CardTitle>
                {metadata?.description && (
                  <CardDescription className="line-clamp-2">
                    {metadata.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Atributos */}
                {metadata?.attributes && metadata.attributes.length > 0 ? (
                  <div className="space-y-2">
                    {metadata.attributes
                      .slice(0, 3)
                      .map((attr: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {attr.trait_type}:
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {attr.value}
                          </Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Unidad:</span>
                      <Badge variant="outline" className="text-xs">
                        #{nft.unitId}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tipo:</span>
                      <Badge variant="outline" className="text-xs">
                        Certificado Educativo
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Fecha de minteo */}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Obtenido: {formatDate(nft.mintedAt)}</span>
                </div>

                {/* Enlaces */}
                <div className="flex space-x-2 pt-2">
                  <Button asChild className="flex-1" size="sm">
                    <a
                      href={getExplorerUrl(nft.contractAddress, nft.tokenId)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Explorer
                    </a>
                  </Button>

                  {nft.metadataUri && (
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={
                          nft.metadataUri.startsWith("ipfs://")
                            ? nft.metadataUri.replace(
                                "ipfs://",
                                "https://ipfs.io/ipfs/"
                              )
                            : nft.metadataUri
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Metadata
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UserNFTs;
