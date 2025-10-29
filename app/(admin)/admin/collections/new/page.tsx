"use client";

import { useRouter } from "next/navigation";
import { NFTCollectionForm } from "@/components/admin/nft-collection-form";

import { Package } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="text-purple-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">
              Nueva Colección NFT
            </h1>
          </div>
          <p className="text-gray-600">
            Crea una nueva colección de certificados NFT para asociar con tus
            curriculums.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <NFTCollectionForm
            mode="create"
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">
            ℹ️ Antes de crear una colección:
          </h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Asegúrate de tener el contrato NFT desplegado en Thirdweb</li>
            <li>• Copia la dirección del contrato exactamente como aparece</li>
            <li>
              • Verifica que estás usando la red correcta (Testnet o Mainnet)
            </li>
            <li>
              • Puedes desactivar la colección temporalmente si es necesario
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
