"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { NFTCollectionForm } from "@/components/admin/nft-collection-form";
import { BackButton } from "@/components/admin/back-button";
import { toast } from "sonner";

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollection();
  }, []);

  const fetchCollection = async () => {
    try {
      const response = await fetch(
        `/api/nft-collections/${params.collectionId}`
      );
      const data = await response.json();

      if (response.ok) {
        setCollection(data.collection);
      } else {
        setError(data.message || "Error al cargar la colección");
      }
    } catch (error) {
      setError("Error de conexión");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (data: any) => {
    toast.success(`Colección "${data.name}" actualizada exitosamente`);
    router.push("/admin/nfts/collections");
  };

  const handleCancel = () => {
    router.push("/admin/nfts");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-card from-purple-50 to-blue-50">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-purple-600"
            size={48}
          />
          <p className="text-gray-600">Cargando colección...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <BackButton fallback="/admin/nfts" />
        <div>
          <h1 className="text-3xl font-bold">Editar Colección</h1>
          <p>
            Actualiza la información de la colección{" "}
            <strong>{collection?.name}</strong>
          </p>
        </div>
      </div>
      <NFTCollectionForm
        mode="edit"
        initialData={collection}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
