"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface CurriculumOption {
  id: string;
  title: string;
}

interface LayerTraitUploaderProps {
  categoryId: string;
  onTraitCreated: () => void;
  curriculums?: CurriculumOption[];
}

export function LayerTraitUploader({
  categoryId,
  onTraitCreated,
  curriculums
}: LayerTraitUploaderProps) {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("100");
  const [curriculumId, setCurriculumId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));

    // Auto-fill name from filename if empty
    if (!name) {
      const baseName = selected.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name.trim()) {
      toast.error("Nombre y archivo son requeridos");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("categoryId", categoryId);
      formData.append("name", name.trim());
      formData.append("weight", weight);
      if (curriculumId && curriculumId !== "none") {
        formData.append("curriculumId", curriculumId);
      }

      const res = await fetch("/api/admin/layer-traits", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al crear trait");
      }

      toast.success(`Trait "${name}" creado`);
      setName("");
      setWeight("100");
      setCurriculumId("");
      clearFile();
      onTraitCreated();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear trait"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1 min-w-0">
        <Label className="text-xs mb-1">Nombre</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Gold Background"
          className="h-9"
        />
      </div>

      <div className="w-20">
        <Label className="text-xs mb-1">Peso</Label>
        <Input
          type="number"
          min="1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="h-9"
        />
      </div>

      {curriculums && curriculums.length > 0 && (
        <div className="w-40">
          <Label className="text-xs mb-1">Curriculum</Label>
          <Select value={curriculumId} onValueChange={setCurriculumId}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Genérico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Genérico</SelectItem>
              {curriculums.map((cur) => (
                <SelectItem key={cur.id} value={cur.id}>
                  {cur.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-end gap-2">
        {preview ? (
          <div className="relative w-9 h-9 rounded border overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={clearFile}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <Button type="submit" size="sm" className="h-9" disabled={loading || !file}>
          {loading ? "..." : "Agregar"}
        </Button>
      </div>
    </form>
  );
}
