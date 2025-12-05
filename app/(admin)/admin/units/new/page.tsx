"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import UnitForm, { UnitInput } from "@/components/admin/unit-form";
import { toast } from "sonner";

export default function CreateUnitPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: UnitInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Error al crear unidad");
      toast.success("Unidad creada correctamente");
      router.push("/admin/units");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo crear la unidad");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/units">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nueva Unidad</h1>
          <p className="text-muted-foreground">
            Crea una nueva unidad del curso
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Unidad</CardTitle>
          <CardDescription>
            Completa los datos básicos de la nueva unidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnitForm onSubmit={handleSubmit} submitting={submitting} />
          {/* <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Unidad *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
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
                  onChange={(e) =>
                    handleInputChange("order", parseInt(e.target.value))
                  }
                  placeholder="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe brevemente el contenido de esta unidad..."
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleInputChange("isActive", checked)
                }
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
                {isLoading ? "Guardando..." : "Crear Unidad"}
              </Button>
            </div>
          </form> */}
        </CardContent>
      </Card>
    </div>
  );
}
