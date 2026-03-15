"use client";

import { useState } from "react";
import {
  Loader2,
  Save,
  Palette,
  Hash,
  FileText,
  Globe,
  Wallet,
  Percent,
  Package,
  Shield,
  ShoppingBag,
  Link as LinkIcon
} from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) : value
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
      setError("La dirección del contrato principal es requerida");
      return false;
    }
    if (!formData.contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError("Dirección del contrato inválida (debe ser 0x + 40 hex chars)");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess?.(data);
      } else {
        setError(data.message || "Error al guardar la colección");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Sección 1: Información General ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette size={18} />
            Información General
          </CardTitle>
          <CardDescription>
            Nombre, símbolo y descripción que identifican la colección.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Palette size={14} />
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Certificados Matemáticas"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Hash size={14} />
                Símbolo (Ticker) <span className="text-destructive">*</span>
              </Label>
              <Input
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                placeholder="Ej: MATH"
                maxLength={10}
                required
              />
              <p className="text-xs text-muted-foreground">
                Máx. 10 caracteres · se mostrará en mayúsculas
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <FileText size={14} />
              Descripción
            </Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe esta colección de NFTs..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Colección activa</p>
              <p className="text-xs text-muted-foreground">
                Permite el minteo de NFTs en esta colección
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Sección 2: Contratos Blockchain ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe size={18} />
            Contratos Blockchain
          </CardTitle>
          <CardDescription>
            Red y direcciones de los contratos desplegados en la blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <Globe size={14} />
              Red Blockchain
            </Label>
            <Select
              value={String(formData.chainId)}
              onValueChange={(val) =>
                setFormData((prev) => ({ ...prev, chainId: parseInt(val) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="80002">
                  Polygon Amoy Testnet (80002)
                </SelectItem>
                <SelectItem value="137">Polygon Mainnet (137)</SelectItem>
                <SelectItem value="11155111">
                  Ethereum Sepolia (11155111)
                </SelectItem>
                <SelectItem value="1">Ethereum Mainnet (1)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <LinkIcon size={14} />
              Contrato Principal <span className="text-destructive">*</span>
            </Label>
            <Input
              name="contractAddress"
              value={formData.contractAddress}
              onChange={handleChange}
              placeholder="0x..."
              className="font-mono text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Dirección del contrato NFT principal desplegado
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Shield size={14} />
                Contrato Certificados
              </Label>
              <Input
                name="certificateContractAddress"
                value={formData.certificateContractAddress}
                onChange={handleChange}
                placeholder="0x..."
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                AlmanacCertificate · soulbound
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <ShoppingBag size={14} />
                Contrato Coleccionables
              </Label>
              <Input
                name="collectibleContractAddress"
                value={formData.collectibleContractAddress}
                onChange={handleChange}
                placeholder="0x..."
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                AlmanacCollectible · tradeable
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Sección 3: Royalties & Economía ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent size={18} />
            Royalties & Economía
          </CardTitle>
          <CardDescription>
            Configuración de regalías para el artista y límite de supply.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <Wallet size={14} />
              Wallet del Artista
            </Label>
            <Input
              name="defaultArtistAddress"
              value={formData.defaultArtistAddress}
              onChange={handleChange}
              placeholder="0x..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Recibe royalties de los coleccionables (ERC-2981)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Percent size={14} />
                Royalties (bps)
              </Label>
              <Input
                type="number"
                name="defaultRoyaltyBps"
                value={formData.defaultRoyaltyBps}
                onChange={handleChange}
                placeholder="500"
                min={0}
                max={10000}
              />
              <p className="text-xs text-muted-foreground">
                500 = 5% · 1000 = 10%
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Package size={14} />
                Max Supply
              </Label>
              <Input
                type="number"
                name="maxSupply"
                value={formData.maxSupply}
                onChange={handleChange}
                placeholder="10000"
                min={1}
              />
              <p className="text-xs text-muted-foreground">
                Dejar vacío para supply ilimitado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Acciones */}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              {mode === "create" ? "Creando..." : "Guardando..."}
            </>
          ) : (
            <>
              <Save className="mr-2" size={16} />
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
  );
}
