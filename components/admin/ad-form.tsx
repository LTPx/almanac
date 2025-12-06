"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";

interface Unit {
  id: number;
  name: string;
}

interface Ad {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  position: number;
  unit: {
    id: number;
    name: string;
  };
}

interface AdFormProps {
  editingAd: Ad | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function AdForm({ editingAd, onSubmit, onCancel }: AdFormProps) {
  const [formData, setFormData] = useState({
    unitId: "",
    unitName: "",
    title: "",
    description: "",
    imageUrl: "",
    targetUrl: "",
    position: 0,
    isActive: true
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Unit[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (editingAd) {
      setFormData({
        unitId: editingAd.unit.id.toString(),
        unitName: editingAd.unit.name,
        title: editingAd.title,
        description: editingAd.description || "",
        imageUrl: editingAd.imageUrl,
        targetUrl: editingAd.targetUrl,
        position: editingAd.position,
        isActive: editingAd.isActive
      });
      setSearchQuery(editingAd.unit.name);
    }
  }, [editingAd]);

  // Buscar unidades
  useEffect(() => {
    const searchUnits = async () => {
      if (searchQuery.trim().length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/admin/units?search=${encodeURIComponent(searchQuery)}&pageSize=5`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.data || []);
        }
      } catch (error) {
        console.error("Error searching units:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(() => {
      searchUnits();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSelectUnit = (unit: Unit) => {
    setFormData({
      ...formData,
      unitId: unit.id.toString(),
      unitName: unit.name
    });
    setSearchQuery(unit.name);
    setShowResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.unitId) {
      alert("Por favor selecciona una unidad");
      return;
    }

    onSubmit({
      ...formData,
      unitId: parseInt(formData.unitId)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Search de Unidad */}
      <div className="space-y-2">
        <Label htmlFor="unit">Unidad</Label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="unit"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Buscar unidad..."
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
                  {searchResults.map((unit) => (
                    <li
                      key={unit.id}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleSelectUnit(unit)}
                    >
                      <div className="text-gray-500 font-medium">
                        {unit.name}
                      </div>
                      {/* <div className="text-xs text-gray-500">ID: {unit.id}</div> */}
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
        {formData.unitName && (
          <div className="text-sm text-gray-600">
            Seleccionado:{" "}
            <span className="font-medium">{formData.unitName}</span>
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

      {/* URL de Imagen */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl">URL de Imagen</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) =>
            setFormData({ ...formData, imageUrl: e.target.value })
          }
          placeholder="https://..."
          required
        />
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{editingAd ? "Actualizar" : "Crear"}</Button>
      </div>
    </form>
  );
}
