// app/admin/nfts/new/page.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Image as ImageIcon,
  Sparkles,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

export default function CreateNFTPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    imageUrl: "",
    imageFile: null as File | null,
    rarity: "NORMAL",
    metadataUri: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.imageFile && !formData.imageUrl) {
        alert("Debes subir un archivo o proporcionar una URL");
        return;
      }

      const data = new FormData();
      if (formData.imageFile) data.append("file", formData.imageFile);
      if (formData.imageUrl) data.append("imageUrl", formData.imageUrl);
      data.append("rarity", formData.rarity);
      if (formData.metadataUri)
        data.append("metadataUri", formData.metadataUri);

      const res = await fetch("/api/nft-assets", {
        method: "POST",
        body: data
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al crear NFT Asset");
      }

      router.push("/admin/nfts");
    } catch (error) {
      console.error("Error al crear NFT:", error);
      alert("Ocurrió un error al crear el NFT");
    } finally {
      setIsLoading(false);
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
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido");
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no debe superar los 5MB");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        imageFile: file
      }));

      // Crear preview
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

  const generateMetadataExample = () => {
    return JSON.stringify(
      {
        name: `Educational NFT #${Date.now()}`,
        description: `${selectedRarity?.label} NFT otorgado por completar una unidad educativa`,
        image: formData.imageUrl || "ipfs://...",
        attributes: [
          {
            trait_type: "Rarity",
            value: selectedRarity?.label
          },
          {
            trait_type: "Category",
            value: "Educational Achievement"
          },
          {
            trait_type: "Issued",
            value: new Date().toISOString()
          }
        ]
      },
      null,
      2
    );
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
          <h1 className="text-3xl font-bold text-gray-900">Nuevo NFT Asset</h1>
          <p className="text-gray-600">
            Crea un nuevo NFT para recompensas educativas
          </p>
        </div>
      </div>

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
                <p className="text-xs text-gray-500">
                  PNG, JPG o GIF (máx. 5MB)
                </p>
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
                <p className="text-xs text-gray-500">
                  URL pública de la imagen
                </p>
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
                <p className="text-sm text-gray-600">
                  {selectedRarity.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadataUri">Metadata URI (Opcional)</Label>
              <div className="flex space-x-2">
                <Input
                  id="metadataUri"
                  value={formData.metadataUri}
                  onChange={(e) =>
                    handleInputChange("metadataUri", e.target.value)
                  }
                  placeholder="ipfs://QmXxxx... o https://..."
                />
                {formData.metadataUri && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(formData.metadataUri, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Si ya tienes el metadata en IPFS, proporciona el URI. De lo
                contrario, se generará automáticamente.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vista previa del metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa del Metadata</CardTitle>
            <CardDescription>
              Estructura JSON que se guardará en la blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-gray-900 p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono">
                {generateMetadataExample()}
              </pre>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Este metadata se generará y subirá a IPFS automáticamente al crear
              el NFT
            </p>
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
        <div className="flex justify-end space-x-4">
          <Link href="/admin/nfts">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading || (!imagePreview && !formData.imageUrl)}
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Creando NFT..." : "Crear NFT Asset"}
          </Button>
        </div>
      </form>

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

      {/* Recursos útiles */}
      <Card>
        <CardHeader>
          <CardTitle>🔗 Recursos Útiles</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <a
              href="https://www.pinata.cloud/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium">Pinata (IPFS)</p>
                <p className="text-xs text-gray-600">
                  Servicio para subir a IPFS
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </a>

            <a
              href="https://docs.openzeppelin.com/contracts/4.x/erc721"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium">ERC-721 Standard</p>
                <p className="text-xs text-gray-600">
                  Documentación de OpenZeppelin
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </a>

            <a
              href="https://www.canva.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium">Canva</p>
                <p className="text-xs text-gray-600">
                  Diseña tus NFTs fácilmente
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </a>

            <a
              href="https://www.remove.bg/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium">Remove.bg</p>
                <p className="text-xs text-gray-600">
                  Elimina fondos de imágenes
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
