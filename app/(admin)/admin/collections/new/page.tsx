"use client";

import { useRouter } from "next/navigation";
import { NFTCollectionForm } from "@/components/admin/nft-collection-form";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateCollectionPage() {
  const router = useRouter();

  const handleSuccess = (data: any) => {
    alert(`✅ Colección "${data.collection.name}" creada exitosamente!`);
    router.push("/admin/nfts");
  };

  const handleCancel = () => {
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
