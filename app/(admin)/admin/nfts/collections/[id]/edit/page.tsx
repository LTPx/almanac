"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { BackButton } from "@/components/admin/back-button";
import { NFTCollectionForm } from "@/components/admin/nft-collection-form";

export default function EditNFTCollectionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await fetch(`/api/admin/nft-collections/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCollection(data);
        }
      } catch (error) {
        console.error("Error fetching collection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (!collection) return <div>Colección no encontrada</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <BackButton fallback="/admin/nfts/collections" />
        <div>
          <h1 className="text-3xl font-bold">Editar Colección</h1>
          <p className="text-muted-foreground">
            Modifica los datos de la colección
          </p>
        </div>
      </div>

      <NFTCollectionForm
        mode="edit"
        initialData={collection}
        onSuccess={() => router.push("/admin/nfts/collections")}
        onCancel={() => router.push("/admin/nfts/collections")}
      />
    </div>
  );
}
