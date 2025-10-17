// app/admin/nfts/[id]/edit/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NFTAssetForm } from "@/components/admin/nft-asset-form";
import { NFTAsset } from "@/lib/types";

export default function EditNFTPage() {
  const router = useRouter();
  const params = useParams();
  const [nftData, setNftData] = useState<NFTAsset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNFT = async () => {
      const res = await fetch(`/api/nft-assets/${params.id}`);
      if (res.ok) {
        const nft = await res.json();
        setNftData(nft);
      }
      setLoading(false);
    };
    fetchNFT();
  }, [params.id]);

  const handleSubmit = async (formData: any) => {
    const data = new FormData();
    if (formData.name) data.append("name", formData.name);
    if (formData.imageFile) data.append("file", formData.imageFile);
    if (formData.imageUrl) data.append("imageUrl", formData.imageUrl);
    data.append("rarity", formData.rarity);
    if (formData.metadataUri) data.append("metadataUri", formData.metadataUri);

    const res = await fetch(`/api/nft-assets/${params.id}`, {
      method: "PUT",
      body: data
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al actualizar NFT");
    }

    router.push("/admin/nfts");
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/nfts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar NFT Asset</h1>
          <p>Actualiza los datos del NFT</p>
        </div>
      </div>

      <NFTAssetForm
        initialData={nftData}
        onSubmit={handleSubmit}
        submitButtonText="Actualizar NFT Asset"
      />
    </div>
  );
}
