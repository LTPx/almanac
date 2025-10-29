"use client";

import { useState, useRef, useEffect } from "react";
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
import { Save, Upload, X, Image as ImageIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
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
    label: "Único",
    icon: "⭐",
    color: "bg-yellow-100 text-yellow-800",
    description: "NFT exclusivo para logros excepcionales"
  }
];

interface NFTFormProps {
  initialData?: NFTAsset | null;
  onSubmit: (formData: {
    name: string;
    imageFile: File | null;
    imageUrl: string;
    rarity: string;
    metadataUri: string;
    collectionId: string;
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
    name: initialData?.name || "",
    imageUrl: initialData?.imageUrl || "",
    imageFile: null as File | null,
    rarity: initialData?.rarity || "NORMAL",
    metadataUri: initialData?.metadataUri || "",
    collectionId: initialData?.collectionId || ""
  });
  const [localLoading, setLocalLoading] = useState(false);
  const [collections, setCollections] = useState<
    { id: string; name: string }[]
  >([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  const loading = isLoading || localLoading;

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setCollectionsLoading(true);
        const res = await fetch("/api/nft-collections");
        if (!res.ok) throw new Error("Error al obtener colecciones");
        const data = await res.json();
        setCollections(data);
      } catch (error) {
        console.error("Error cargando colecciones:", error);
      } finally {
        setCollectionsLoading(false);
      }
    };

    fetchCollections();
  }, []);

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

      setFormData((prev) => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url, imageFile: null }));
    setImagePreview(url);
  };

  const clearImage = () => {
    setImagePreview("");
    setFormData((prev) => ({ ...prev, imageUrl: "", imageFile: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectedRarity = rarityOptions.find((r) => r.value === formData.rarity);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del NFT</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          required
        />
      </div>

      {/* 🔹 Selección de colección */}
      <div className="space-y-2">
        <Label htmlFor="collection">Colección *</Label>
        <Select
          value={formData.collectionId}
          onValueChange={(value) => handleInputChange("collectionId", value)}
          disabled={collectionsLoading}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                collectionsLoading
                  ? "Cargando colecciones..."
                  : "Selecciona una colección"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {collections.map((col) => (
              <SelectItem key={col.id} value={col.id}>
                {col.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Imagen del NFT */}
      <Card>
        <CardHeader>
          <CardTitle>Imagen del NFT</CardTitle>
          <CardDescription>
            Sube una imagen o proporciona una URL. Recomendado: 512x512px o
            superior, formato PNG o JPG.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {/* Upload y URL */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Subir desde computadora</Label>
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

      {/* Rareza */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración del NFT</CardTitle>
          <CardDescription>
            Define las características y rareza del NFT.
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

      {/* Botones */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button">
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            loading ||
            (!imagePreview && !formData.imageUrl) ||
            !formData.collectionId
          }
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Guardando..." : submitButtonText}
        </Button>
      </div>
    </form>
  );
}
