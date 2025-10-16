"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import Link from "next/link";
import { Unit } from "@/lib/types";

interface UnitFormProps {
  initialData?: Unit | null;
  onSubmit: (data: UnitInput) => Promise<void>;
  submitting?: boolean;
  buttonText?: string;
}

export type UnitInput = {
  name: string;
  description: string;
  order: number;
  isActive: boolean;
};

export default function UnitForm({
  initialData,
  onSubmit,
  submitting,
  buttonText
}: UnitFormProps) {
  const [formData, setFormData] = useState<UnitInput>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    order: initialData?.order || 1,
    isActive: !!initialData?.isActive
  });

  const isLoading = submitting;

  const handleChange = (
    key: keyof UnitInput,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la Unidad *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ej: Introducción a Blockchain"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Orden</Label>
          <Input
            id="order"
            type="number"
            min="1"
            value={formData.order}
            onChange={(e) => handleChange("order", parseInt(e.target.value))}
            placeholder="1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe brevemente el contenido de esta unidad..."
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => handleChange("isActive", checked)}
        />
        <Label htmlFor="isActive">Unidad activa</Label>
      </div>

      <div className="flex justify-end space-x-4">
        <Link href="/admin/units">
          <Button variant="outline" type="button">
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Guardando..." : buttonText || "Crear Unidad"}
        </Button>
      </div>
    </form>
  );
}
