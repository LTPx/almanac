"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  BookOpen,
  MessageSquare,
  Loader2,
  CheckCircle
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface CompletedUnit {
  unitId: string;
  unitName: string;
  courseName: string;
  completedAt: string;
  hasNFT: boolean;
}

export default function CreateCertificatePage() {
  const { data: session } = useSession();
  const [completedUnits, setCompletedUnits] = useState<CompletedUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const userId = session?.user?.id;

    if (userId) {
      fetchCompletedUnits(userId);
    }
  }, [session]);

  const fetchCompletedUnits = async (userId: string) => {
    try {
      setLoadingData(true);
      const response = await fetch(
        `/api/users/${userId}/completed-curriculums`
      );
      const data = await response.json();
      setCompletedUnits(data.curriculums || []);
    } catch (error) {
      console.error("Error fetching completed units:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const selectedUnit = completedUnits.find((u) => u.unitId === selectedUnitId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const userId = session?.user?.id;

    try {
      const response = await fetch(`/api/users/${userId}/nfts/mint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          curriculumTokenId: selectedUnitId,
          description: description.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          `🎉 ¡Tu certificado digital ha sido creado! Token ID: ${data.nft.tokenId}`
        );
        // Reset form
        setSelectedUnitId("");
        setDescription("");
        // Refresh completed units to update NFT status
        // fetchCompletedUnits();
      } else {
        setError(data.message || "Error al crear certificado");
      }
    } catch (error) {
      setError("Error de conexión");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <Trophy className="mx-auto text-gray-400 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Inicia Sesión
          </h1>
          <p className="text-gray-600">
            Necesitas estar logueado para crear tus certificados.
          </p>
        </div>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="h-12 bg-gray-100 rounded"></div>
                <div className="h-12 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const availableUnits = completedUnits.filter((unit) => !unit.hasNFT);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Trophy className="text-yellow-500" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">
              Crear Mi Certificado
            </h1>
          </div>
          <p className="text-gray-600">
            Convierte tus logros educativos en certificados digitales únicos
          </p>
        </div>

        {/* No completed units */}
        {completedUnits.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No has completado ninguna unidad aún
            </h3>
            <p className="text-gray-600">
              Completa algunas unidades de tus cursos para poder crear
              certificados digitales.
            </p>
          </div>
        )}

        {/* No available units (all have NFTs) */}
        {completedUnits.length > 0 && availableUnits.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              ¡Todos tus certificados están creados!
            </h3>
            <p className="text-gray-600 mb-4">
              Ya tienes certificados digitales para todas las unidades
              completadas.
            </p>
            <p className="text-sm text-blue-600">
              Completa más unidades para obtener nuevos certificados.
            </p>
          </div>
        )}

        {/* Main Form */}
        {availableUnits.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Unit Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Award size={16} />
                  Selecciona la unidad completada
                </label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Elige una unidad...</option>
                  {availableUnits.map((unit) => (
                    <option key={unit.unitId} value={unit.unitId}>
                      {unit.courseName} - {unit.unitName}
                    </option>
                  ))}
                </select>
                {selectedUnit && (
                  <p className="text-green-600 text-sm mt-2">
                    ✅ Completada el{" "}
                    {new Date(selectedUnit.completedAt).toLocaleDateString(
                      "es-ES"
                    )}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare size={16} />
                  Mensaje personal (opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: ¡Me siento orgulloso de haber completado esta unidad! Fue un gran desafío."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={250}
                />
                <p className="text-gray-500 text-xs mt-1">
                  {description.length}/250 caracteres
                </p>
              </div>

              {/* Preview */}
              {selectedUnit && (
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Vista previa de tu certificado:
                  </h3>
                  <div className="text-sm space-y-1 text-blue-800">
                    <p>
                      <strong>Curso:</strong> {selectedUnit.courseName}
                    </p>
                    <p>
                      <strong>Unidad:</strong> {selectedUnit.unitName}
                    </p>
                    <p>
                      <strong>Completada:</strong>{" "}
                      {new Date(selectedUnit.completedAt).toLocaleDateString(
                        "es-ES"
                      )}
                    </p>
                    {description && (
                      <p>
                        <strong>Tu mensaje:</strong> "{description}"
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !selectedUnitId}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creando tu certificado...
                  </>
                ) : (
                  <>
                    <Trophy size={20} />
                    Crear Mi Certificado Digital
                  </>
                )}
              </button>
            </form>

            {/* Success/Error Messages */}
            {success && (
              <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Already Created Certificates */}
        {completedUnits.some((unit) => unit.hasNFT) && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              Certificados ya creados
            </h3>
            <div className="space-y-2">
              {completedUnits
                .filter((unit) => unit.hasNFT)
                .map((unit) => (
                  <div
                    key={unit.unitId}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div>
                      <p className="font-medium text-green-800">
                        {unit.courseName}
                      </p>
                      <p className="text-green-600 text-sm">{unit.unitName}</p>
                    </div>
                    <Trophy className="text-yellow-500" size={20} />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
          <h3 className="font-semibold text-orange-900 mb-2">
            💎 ¿Qué es un certificado digital?
          </h3>
          <ul className="text-orange-800 text-sm space-y-1">
            <li>• Es un token único que prueba tu logro educativo</li>
            <li>• Está guardado permanentemente en blockchain</li>
            <li>• Nadie puede falsificarlo o borrarlo</li>
            <li>• Puedes compartirlo en redes sociales o CV</li>
            <li>• Es completamente gratuito para ti</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
