// app/admin/nfts/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NFTAssetForm } from "@/components/admin/nft-asset-form";

export default function CreateNFTPage() {
  const router = useRouter();

  const handleSubmit = async (formData: {
    name: string;
    imageFile: File | null;
    imageUrl: string;
    rarity: string;
    metadataUri: string;
    collectionId?: string;
  }) => {
    const data = new FormData();
    if (formData.name) data.append("name", formData.name);
    if (formData.imageFile) data.append("file", formData.imageFile);
    if (formData.imageUrl) data.append("imageUrl", formData.imageUrl);
    if (formData.collectionId)
      data.append("collectionId", formData.collectionId);
    data.append("rarity", formData.rarity);
    if (formData.metadataUri) data.append("metadataUri", formData.metadataUri);

    const res = await fetch("/api/nft-assets", {
      method: "POST",
      body: data
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al crear NFT Asset");
    }

    router.push("/admin/nfts");
  };

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
          <h1 className="text-3xl font-bold">Nuevo NFT Asset</h1>
          <p>Crea un nuevo NFT para recompensas educativas</p>
        </div>
      </div>

      <NFTAssetForm
        onSubmit={handleSubmit}
        submitButtonText="Crear NFT Asset"
      />
    </div>
  );
}
