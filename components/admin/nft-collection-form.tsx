"use client";

import { useState } from "react";
import {
  Loader2,
  Save,
  Palette,
  Hash,
  FileText,
  Link as LinkIcon,
  Globe,
  Wallet,
  Percent,
  Package,
  Shield,
  ShoppingBag
} from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface NFTCollectionFormProps {
  mode: "create" | "edit";
  initialData?: {
    id?: string;
    name: string;
    symbol: string;
    description?: string;
    contractAddress: string;
    chainId: number;
    isActive: boolean;
    defaultArtistAddress?: string;
    defaultRoyaltyBps?: number;
    maxSupply?: number;
    certificateContractAddress?: string;
    collectibleContractAddress?: string;
  };
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export function NFTCollectionForm({
  mode,
  initialData,
  onSuccess,
  onCancel
}: NFTCollectionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    symbol: initialData?.symbol || "",
    description: initialData?.description || "",
    contractAddress: initialData?.contractAddress || "",
    chainId: initialData?.chainId || 80002,
    isActive: initialData?.isActive ?? true,
    defaultArtistAddress: initialData?.defaultArtistAddress || "",
    defaultRoyaltyBps: initialData?.defaultRoyaltyBps ?? 500,
    maxSupply: initialData?.maxSupply ?? "",
    certificateContractAddress: initialData?.certificateContractAddress || "",
    collectibleContractAddress: initialData?.collectibleContractAddress || ""
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) : value
    }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      isActive: e.target.checked
    }));
  };

  const isValidAddress = (addr: string) =>
    !addr.trim() || /^0x[a-fA-F0-9]{40}$/.test(addr);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("El nombre es requerido");
      return false;
    }
    if (!formData.symbol.trim()) {
      setError("El símbolo es requerido");
      return false;
    }
    if (!formData.contractAddress.trim()) {
      setError("La dirección del contrato es requerida");
      return false;
    }
    if (!formData.contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError(
        "Dirección del contrato inválida (debe ser 0x seguido de 40 caracteres hexadecimales)"
      );
      return false;
    }
    if (!isValidAddress(formData.defaultArtistAddress)) {
      setError("Dirección del artista inválida");
      return false;
    }
    if (!isValidAddress(formData.certificateContractAddress)) {
      setError("Dirección del contrato de certificados inválida");
      return false;
    }
    if (!isValidAddress(formData.collectibleContractAddress)) {
      setError("Dirección del contrato de coleccionables inválida");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const url =
        mode === "create"
          ? "/api/admin/nft-collections"
          : `/api/admin/nft-collections/${initialData?.id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess?.(data);
      } else {
        setError(data.message || "Error al guardar la colección");
      }
    } catch (error) {
      setError("Error de conexión");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la colección</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Palette size={16} />
              Nombre de la Colección
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Certificados Matemáticas"
              required
            />
          </div>

          {/* Symbol */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Hash size={16} />
              Símbolo (Ticker)
            </label>
            <Input
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              placeholder="Ej: MATH"
              maxLength={10}
              required
            />
            <p className="text-xs mt-2">
              Máximo 10 caracteres (se mostrará en mayúsculas)
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <FileText size={16} />
              Descripción (opcional)
            </label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe esta colección de NFTs..."
              rows={3}
            />
          </div>

          {/* Contract Address */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <LinkIcon size={16} />
              Dirección del Contrato
            </label>
            <Input
              type="text"
              name="contractAddress"
              value={formData.contractAddress}
              onChange={handleChange}
              placeholder="0x..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              required
            />
            <p className="text-xs mt-2">
              Dirección del contrato NFT desplegado en la blockchain
            </p>
          </div>

          {/* Chain ID */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Globe size={16} />
              Red Blockchain
            </label>
            <select
              name="chainId"
              value={formData.chainId}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value={80002}>Polygon Amoy Testnet (80002)</option>
              <option value={137}>Polygon Mainnet (137)</option>
              <option value={11155111}>Ethereum Sepolia (11155111)</option>
              <option value={1}>Ethereum Mainnet (1)</option>
            </select>
          </div>

          {/* Certificate Contract Address */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Shield size={16} />
              Contrato de Certificados (opcional)
            </label>
            <Input
              type="text"
              name="certificateContractAddress"
              value={formData.certificateContractAddress}
              onChange={handleChange}
              placeholder="0x..."
              className="font-mono text-sm"
            />
            <p className="text-xs mt-2">
              Address del contrato AlmanacCertificate (soulbound)
            </p>
          </div>

          {/* Collectible Contract Address */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <ShoppingBag size={16} />
              Contrato de Coleccionables (opcional)
            </label>
            <Input
              type="text"
              name="collectibleContractAddress"
              value={formData.collectibleContractAddress}
              onChange={handleChange}
              placeholder="0x..."
              className="font-mono text-sm"
            />
            <p className="text-xs mt-2">
              Address del contrato AlmanacCollectible (tradeable)
            </p>
          </div>

          {/* Artist Wallet */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Wallet size={16} />
              Wallet del Artista (opcional)
            </label>
            <Input
              type="text"
              name="defaultArtistAddress"
              value={formData.defaultArtistAddress}
              onChange={handleChange}
              placeholder="0x..."
              className="font-mono text-sm"
            />
            <p className="text-xs mt-2">
              Recibe royalties de los coleccionables (ERC-2981)
            </p>
          </div>

          {/* Royalty + Max Supply row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Percent size={16} />
                Royalties (bps)
              </label>
              <Input
                type="number"
                name="defaultRoyaltyBps"
                value={formData.defaultRoyaltyBps}
                onChange={handleChange}
                placeholder="500"
                min={0}
                max={10000}
              />
              <p className="text-xs mt-2">500 = 5%, 1000 = 10%</p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Package size={16} />
                Max Supply
              </label>
              <Input
                type="number"
                name="maxSupply"
                value={formData.maxSupply}
                onChange={handleChange}
                placeholder="10000"
                min={1}
              />
              <p className="text-xs mt-2">Supply máximo de NFTs</p>
            </div>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
            <Input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleCheckbox}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Colección activa (permitir minteo de NFTs)
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {mode === "create" ? "Creando..." : "Guardando..."}
                </>
              ) : (
                <>
                  <Save size={20} />
                  {mode === "create" ? "Crear Colección" : "Guardar Cambios"}
                </>
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                disabled={loading}
                variant="outline"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
