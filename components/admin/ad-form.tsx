"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, Upload, Link as LinkIcon } from "lucide-react";
import { Curriculum } from "@/lib/types";

interface Ad {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  position: number;
  curriculum: {
    id: string;
    title: string;
  };
}

interface AdFormProps {
  editingAd: Ad | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function AdForm({ editingAd, onSubmit, onCancel }: AdFormProps) {
  const [formData, setFormData] = useState({
    curriculumId: "",
    curriculumTitle: "",
    title: "",
    description: "",
    imageUrl: "",
    targetUrl: "",
    position: 0,
    isActive: true
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Curriculum[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Estados para manejo de imagen
  const [useImageUpload, setUseImageUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (editingAd) {
      setFormData({
        curriculumId: editingAd.curriculum.id.toString(),
        curriculumTitle: editingAd.curriculum.title,
        title: editingAd.title,
        description: editingAd.description || "",
        imageUrl: editingAd.imageUrl,
        targetUrl: editingAd.targetUrl,
        position: editingAd.position,
        isActive: editingAd.isActive
      });
      setSearchQuery(editingAd.curriculum.title);
      // No activar modo upload si estamos editando, usar URL por defecto
      setUseImageUpload(false);
      setSelectedFile(null);
      setImagePreview("");
    }
  }, [editingAd]);

  // Buscar curriculums
  useEffect(() => {
    const searchCurriculums = async () => {
      if (searchQuery.trim().length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/admin/curriculums?search=${encodeURIComponent(searchQuery)}&pageSize=5`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.data || []);
        }
      } catch (error) {
        console.error("Error searching curriculums:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(() => {
      searchCurriculums();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSelectCurriculum = (curriculum: Curriculum) => {
    setFormData({
      ...formData,
      curriculumId: curriculum.id.toString(),
      curriculumTitle: curriculum.title
    });
    setSearchQuery(curriculum.title);
    setShowResults(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.curriculumId) {
      alert("Por favor selecciona un curriculum");
      return;
    }

    let finalImageUrl = formData.imageUrl;

    // Si se seleccionó un archivo, subirlo primero
    if (useImageUpload && selectedFile) {
      setIsUploading(true);
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);

        const response = await fetch("/api/admin/ads/upload", {
          method: "POST",
          body: uploadFormData
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.error || "Error al subir la imagen");
          setIsUploading(false);
          return;
        }

        const data = await response.json();
        finalImageUrl = data.url;
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Error al subir la imagen");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    // Validar que haya una URL de imagen
    if (!finalImageUrl) {
      alert("Por favor proporciona una imagen");
      return;
    }

    onSubmit({
      ...formData,
      imageUrl: finalImageUrl
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Search de Unidad */}
      <div className="space-y-2">
        <Label htmlFor="curriculum">Curriculum</Label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="curriculum"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Buscar curriculum..."
              className="pl-9"
              required
            />
          </div>

          {/* Resultados de búsqueda */}
          {showResults && searchQuery.length >= 2 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="p-3 text-sm text-gray-500">Buscando...</div>
              ) : searchResults.length > 0 ? (
                <ul>
                  {searchResults.map((curriculum) => (
                    <li
                      key={curriculum.id}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleSelectCurriculum(curriculum)}
                    >
                      <div className="text-gray-500 font-medium">
                        {curriculum.title}
                      </div>
                      {/* <div className="text-xs text-gray-500">ID: {curriculum.id}</div> */}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 text-sm text-gray-500">
                  No se encontraron unidades
                </div>
              )}
            </div>
          )}
        </div>
        {formData.curriculumTitle && (
          <div className="text-sm text-gray-600">
            Seleccionado:{" "}
            <span className="font-medium">{formData.curriculumTitle}</span>
          </div>
        )}
      </div>

      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      {/* Imagen - Toggle entre subir o URL */}
      <div className="space-y-3">
        <Label>Imagen del Anuncio</Label>

        {/* Toggle entre subir imagen o usar URL */}
        <div className="flex gap-2 border rounded-lg p-1 bg-card">
          <button
            type="button"
            onClick={() => {
              setUseImageUpload(false);
              setSelectedFile(null);
              setImagePreview("");
            }}
            className={`flex-1 py-2 px-3 rounded-md transition-all flex items-center justify-center gap-2 ${
              !useImageUpload
                ? "bg-green-600 shadow-sm font-medium"
                : "text-gray-300 hover:text-gray-900"
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            URL
          </button>
          <button
            type="button"
            onClick={() => setUseImageUpload(true)}
            className={`flex-1 py-2 px-3 rounded-md transition-all flex items-center justify-center gap-2 ${
              useImageUpload
                ? "bg-green-600 shadow-sm font-medium"
                : "text-gray-300 hover:text-gray-900"
            }`}
          >
            <Upload className="w-4 h-4" />
            Subir
          </button>
        </div>

        {/* Input según el modo seleccionado */}
        {useImageUpload ? (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="imageFile"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="imageFile"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {imagePreview ? (
                  <div className="relative w-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Click para cambiar imagen
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">
                        Click para seleccionar imagen
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF hasta 5MB
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>
        ) : (
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            placeholder="https://example.com/image.jpg"
            required={!useImageUpload}
          />
        )}

        {/* Preview de URL */}
        {!useImageUpload && formData.imageUrl && (
          <div className="mt-2 border rounded-lg p-2">
            <img
              src={formData.imageUrl}
              alt="Preview"
              className="max-h-32 mx-auto rounded"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {/* URL de Destino */}
      <div className="space-y-2">
        <Label htmlFor="targetUrl">URL de Destino</Label>
        <Input
          id="targetUrl"
          value={formData.targetUrl}
          onChange={(e) =>
            setFormData({ ...formData, targetUrl: e.target.value })
          }
          placeholder="https://..."
          required
        />
      </div>

      {/* Posición y Estado */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">Posición</Label>
          <Input
            id="position"
            type="number"
            value={formData.position}
            onChange={(e) =>
              setFormData({
                ...formData,
                position: parseInt(e.target.value)
              })
            }
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="isActive">Activo</Label>
          <div className="flex items-center space-x-2 h-10">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <span className="text-sm">{formData.isActive ? "Sí" : "No"}</span>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isUploading}>
          {isUploading
            ? "Subiendo imagen..."
            : editingAd
              ? "Actualizar"
              : "Crear"}
        </Button>
      </div>
    </form>
  );
}
