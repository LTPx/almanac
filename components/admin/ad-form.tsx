"use client";

import { useState, useEffect, forwardRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, Upload, Link as LinkIcon, Globe, Image } from "lucide-react";
import { Curriculum } from "@/lib/types";

interface Ad {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  position: number;
  curriculum?: {
    id: string;
    title: string;
  } | null;
}

interface AdFormProps {
  editingAd: Ad | null;
  onSubmit: (data: any) => void;
}

export const AdForm = forwardRef<HTMLFormElement, AdFormProps>(function AdForm(
  { editingAd, onSubmit },
  ref
) {
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

  const [useImageUpload, setUseImageUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (editingAd) {
      setFormData({
        curriculumId: editingAd.curriculum?.id?.toString() ?? "",
        curriculumTitle: editingAd.curriculum?.title ?? "",
        title: editingAd.title,
        description: editingAd.description || "",
        imageUrl: editingAd.imageUrl,
        targetUrl: editingAd.targetUrl,
        position: editingAd.position,
        isActive: editingAd.isActive
      });
      setSearchQuery(editingAd.curriculum?.title ?? "");
      setUseImageUpload(false);
      setSelectedFile(null);
      setImagePreview("");
    }
  }, [editingAd]);

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

    const debounce = setTimeout(searchCurriculums, 300);
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

  const handleClearCurriculum = () => {
    setFormData({ ...formData, curriculumId: "", curriculumTitle: "" });
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImageUrl = formData.imageUrl;

    if (useImageUpload && selectedFile) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);
        if (formData.curriculumId) {
          uploadFormData.append("curriculumId", formData.curriculumId);
        }

        const response = await fetch("/api/admin/ads/upload", {
          method: "POST",
          body: uploadFormData
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.error || "Error al subir la imagen");
          return;
        }

        const data = await response.json();
        finalImageUrl = data.url;
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Error al subir la imagen");
        return;
      }
    }

    if (!finalImageUrl) {
      alert("Por favor proporciona una imagen");
      return;
    }

    onSubmit({
      ...formData,
      curriculumId: formData.curriculumId || null,
      imageUrl: finalImageUrl
    });
  };

  return (
    <form ref={ref} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6 items-start">
      {/* Información general */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Información del Anuncio
          </CardTitle>
          <CardDescription>
            Datos principales y curriculum asociado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Curriculum */}
          <div className="space-y-2">
            <Label htmlFor="curriculum">Curriculum</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="curriculum"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (formData.curriculumId) {
                    setFormData({
                      ...formData,
                      curriculumId: "",
                      curriculumTitle: ""
                    });
                  }
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                placeholder="Buscar curriculum... (opcional)"
                className="pl-9 bg-background border-border"
              />
              {showResults && searchQuery.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-3 text-sm text-muted-foreground">
                      Buscando...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ul>
                      {searchResults.map((curriculum) => (
                        <li
                          key={curriculum.id}
                          className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                          onClick={() => handleSelectCurriculum(curriculum)}
                        >
                          <span className="text-sm font-medium">
                            {curriculum.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 text-sm text-muted-foreground">
                      No se encontraron curriculums
                    </div>
                  )}
                </div>
              )}
            </div>
            {formData.curriculumTitle ? (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Seleccionado:{" "}
                  <span className="font-medium text-foreground">
                    {formData.curriculumTitle}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleClearCurriculum}
                  className="text-xs text-destructive hover:underline"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                <Globe className="h-4 w-4 shrink-0" />
                <span>
                  Global ads do not need a curriculum — leave blank to apply to
                  all curriculums.
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="bg-background border-border"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-background border-border"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Imagen */}
      <Card className="bg-card border-border h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Imagen del Anuncio
          </CardTitle>
          <CardDescription>
            Sube una imagen o proporciona una URL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle URL / Upload */}
          <div className="flex gap-2 border border-border rounded-lg p-1 bg-background">
            <button
              type="button"
              onClick={() => {
                setUseImageUpload(false);
                setSelectedFile(null);
                setImagePreview("");
              }}
              className={`flex-1 py-2 px-3 rounded-md transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                !useImageUpload
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              URL
            </button>
            <button
              type="button"
              onClick={() => setUseImageUpload(true)}
              className={`flex-1 py-2 px-3 rounded-md transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                useImageUpload
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Upload className="w-4 h-4" />
              Subir
            </button>
          </div>

          {useImageUpload ? (
            <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-muted-foreground transition-colors">
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
                  <div className="w-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                      Click para cambiar imagen
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        Click para seleccionar imagen
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, GIF hasta 5MB
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className="bg-background border-border"
                required={!useImageUpload}
              />
              {formData.imageUrl && (
                <div className="border border-border rounded-lg p-2">
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
          )}
        </CardContent>
      </Card>
      </div>

      {/* Configuración */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
          <CardDescription>URL de destino, posición y estado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetUrl">URL de Destino *</Label>
            <Input
              id="targetUrl"
              value={formData.targetUrl}
              onChange={(e) =>
                setFormData({ ...formData, targetUrl: e.target.value })
              }
              placeholder="https://..."
              className="bg-background border-border"
              required
            />
          </div>

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
                className="bg-background border-border"
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
                <span className="text-sm text-muted-foreground">
                  {formData.isActive ? "Sí" : "No"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
});

AdForm.displayName = "AdForm";
