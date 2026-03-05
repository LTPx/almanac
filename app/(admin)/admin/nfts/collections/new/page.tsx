"use client";

import { useRouter } from "next/navigation";
import { BackButton } from "@/components/admin/back-button";
import { NFTCollectionForm } from "@/components/admin/nft-collection-form";

export default function NewNFTCollectionPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <BackButton fallback="/admin/nfts/collections" />
        <div>
          <h1 className="text-3xl font-bold">Nueva Colección</h1>
          <p className="text-muted-foreground">
            Crea una nueva colección de NFTs
          </p>
        </div>
      </div>

      <NFTCollectionForm
        mode="create"
        onSuccess={() => router.push("/admin/nfts/collections")}
        onCancel={() => router.push("/admin/nfts/collections")}
      />
    </div>
  );
}
