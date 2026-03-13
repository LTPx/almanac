// app/admin/nfts/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { NFTAssetForm } from "@/components/admin/nft-asset-form";
import { BackButton } from "@/components/admin/back-button";

export default function CreateNFTPage() {
  const router = useRouter();

  const handleSubmit = async (formData: {
    name: string;
    imageFile: File | null;
    imageUrl: string;
    rarity: string;
    metadataUri: string;
    collectionId?: string;
    curriculumId?: string;
  }) => {
    const data = new FormData();
    if (formData.name) data.append("name", formData.name);
    if (formData.imageFile) data.append("file", formData.imageFile);
    if (formData.imageUrl) data.append("imageUrl", formData.imageUrl);
    if (formData.collectionId)
      data.append("collectionId", formData.collectionId);
    data.append("rarity", formData.rarity);
    if (formData.metadataUri) data.append("metadataUri", formData.metadataUri);
    if (formData.curriculumId)
      data.append("curriculumId", formData.curriculumId);

    const res = await fetch("/api/admin/nft-assets", {
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
        <BackButton fallback="/admin/nfts" />
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
