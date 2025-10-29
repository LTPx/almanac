"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Package, Loader2 } from "lucide-react";
import { NFTCollectionForm } from "@/components/admin/nft-collection-form";

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCollection = async () => {
    try {
      const response = await fetch(`/api/admin/collections/${params.id}`);
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
    alert(`✅ Colección "${data.collection.name}" actualizada exitosamente!`);
    router.push("/admin/collections");
  };

  const handleCancel = () => {
    router.push("/admin/collections");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="text-purple-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">
              Editar Colección
            </h1>
          </div>
          <p className="text-gray-600">
            Actualiza la información de la colección{" "}
            <strong>{collection?.name}</strong>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <NFTCollectionForm
            mode="edit"
            initialData={collection}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
