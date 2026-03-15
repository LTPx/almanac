"use client";

import { useRouter } from "next/navigation";
import { NFTCollectionForm } from "@/components/admin/nft-collection-form";
import { BackButton } from "@/components/admin/back-button";
import { toast } from "sonner";

export default function CreateCollectionPage() {
  const router = useRouter();

  const handleSuccess = (data: any) => {
    toast.success(`Colección "${data.name}" creada exitosamente`);
    router.push("/admin/nfts/collections");
  };

  const handleCancel = () => {
    router.push("/admin/nfts");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <BackButton fallback="/admin/nfts" />
        <div>
          <h1 className="text-3xl font-bold">Nueva Colección NFT</h1>
          <p>Crea una nueva colección de certificados NFT</p>
        </div>
      </div>
      <NFTCollectionForm
        mode="create"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
