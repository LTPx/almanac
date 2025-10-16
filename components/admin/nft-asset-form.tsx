"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Upload, X, Image as ImageIcon, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { NFTAsset } from "@/lib/types";

const rarityOptions = [
  {
    value: "NORMAL",
    label: "Normal",
    icon: "⚪",
    color: "bg-gray-100 text-gray-800",
    description: "NFT básico para completar unidades iniciales"
  },
  {
    value: "RARE",
    label: "Raro",
    icon: "🔵",
    color: "bg-blue-100 text-blue-800",
    description: "NFT especial para unidades intermedias"
  },
  {
    value: "EPIC",
    label: "Épico",
    icon: "🟣",
    color: "bg-purple-100 text-purple-800",
    description: "NFT premium para unidades avanzadas"
  },
  {
    value: "UNIQUE",
    label: "Unico",
    icon: "⭐",
    color: "bg-yellow-100 text-yellow-800",
    description: "NFT exclusivo para logros excepcionales"
  }
];

interface NFTFormProps {
  initialData?: NFTAsset | null;
  onSubmit: (formData: {
    imageFile: File | null;
    imageUrl: string;
    rarity: string;
    metadataUri: string;
  }) => Promise<void>;
  submitButtonText?: string;
  isLoading?: boolean;
}

export function NFTAssetForm({
  initialData,
  onSubmit,
  submitButtonText = "Crear NFT Asset",
  isLoading = false
}: NFTFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    initialData?.imageUrl || ""
  );
  const [formData, setFormData] = useState({
    imageUrl: initialData?.imageUrl || "",
    imageFile: null as File | null,
    rarity: initialData?.rarity || "NORMAL",
    metadataUri: initialData?.metadataUri || ""
  });
  const [localLoading, setLocalLoading] = useState(false);

  const loading = isLoading || localLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);

    try {
      if (!formData.imageFile && !formData.imageUrl) {
        alert("Debes subir un archivo o proporcionar una URL");
        return;
      }

      await onSubmit(formData);
    } catch (error) {
      console.error("Error en el formulario:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no debe superar los 5MB");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        imageFile: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: url,
      imageFile: null
    }));
    setImagePreview(url);
  };

  const clearImage = () => {
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      imageUrl: "",
      imageFile: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const selectedRarity = rarityOptions.find((r) => r.value === formData.rarity);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Imagen del NFT */}
      <Card>
        <CardHeader>
          <CardTitle>Imagen del NFT</CardTitle>
          <CardDescription>
            Sube una imagen o proporciona una URL. Recomendado: 512x512px o
            superior, formato PNG o JPG
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview */}
          {imagePreview ? (
            <div className="relative w-full max-w-md mx-auto">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto">
              <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Sin imagen seleccionada
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload options */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Subir desde computadora</Label>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Seleccionar archivo
                </Button>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG o GIF (máx. 5MB)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">O proporciona una URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.png"
                disabled={!!formData.imageFile}
              />
              <p className="text-xs text-gray-500">URL pública de la imagen</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración del NFT */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del NFT</CardTitle>
          <CardDescription>
            Define las características y rareza del NFT
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rarity">Rareza *</Label>
            <Select
              value={formData.rarity}
              onValueChange={(value) => handleInputChange("rarity", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rarityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRarity && (
              <p className="text-sm">{selectedRarity.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vista previa de la tarjeta NFT */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa de la Tarjeta</CardTitle>
          <CardDescription>Así se verá el NFT en la interfaz</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm mx-auto">
            <Card className="overflow-hidden">
              <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="NFT Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  {selectedRarity && (
                    <Badge className={selectedRarity.color}>
                      <span className="mr-1">{selectedRarity.icon}</span>
                      {selectedRarity.label}
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-2 right-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-500/90 text-white"
                  >
                    Disponible
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">NFT #NEW</h3>
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>Creado: {new Date().toLocaleDateString()}</p>
                    <p>Rareza: {selectedRarity?.label}</p>
                  </div>

                  {formData.metadataUri && (
                    <p className="text-xs text-gray-600 truncate">
                      {formData.metadataUri}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || (!imagePreview && !formData.imageUrl)}
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Guardando..." : submitButtonText}
        </Button>
      </div>

      {/* Información adicional */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">
            💡 Guía para crear NFTs
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 text-sm space-y-2">
          <ul className="space-y-2">
            <li>
              <strong>Calidad de imagen:</strong> Usa imágenes de alta
              resolución (mínimo 512x512px). Formatos recomendados: PNG con
              transparencia o JPG.
            </li>
            <li>
              <strong>Distribución de rareza:</strong> Mantén un balance
              adecuado entre rarezas para crear un sistema de recompensas
              atractivo.
            </li>
            <li>
              <strong>Común (⚪):</strong> 50-60% del total - Para unidades
              básicas
            </li>
            <li>
              <strong>Raro (🔵):</strong> 25-30% del total - Para unidades
              intermedias
            </li>
            <li>
              <strong>Épico (🟣):</strong> 10-15% del total - Para unidades
              avanzadas
            </li>
            <li>
              <strong>Legendario (⭐):</strong> 5-10% del total - Para logros
              especiales
            </li>
            <li>
              <strong>Metadata:</strong> Si no proporcionas un URI, se generará
              automáticamente un metadata JSON estándar compatible con ERC-721.
            </li>
            <li>
              <strong>IPFS:</strong> Las imágenes y metadata se subirán a IPFS
              para garantizar permanencia y descentralización.
            </li>
          </ul>
        </CardContent>
      </Card>
    </form>
  );
}
