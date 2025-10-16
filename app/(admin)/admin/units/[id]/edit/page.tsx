"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Unit } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import UnitForm, { UnitInput } from "@/components/admin/unit-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export default function EditUnitPage() {
  const { id } = useParams();
  const router = useRouter();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const res = await fetch(`/api/units/${id}`);
        if (!res.ok) throw new Error("Error al cargar unidad");
        const unit = await res.json();
        setUnit(unit);
      } catch {
        toast.error("No se pudo cargar la unidad");
      } finally {
        setLoading(false);
      }
    };

    fetchUnit();
  }, [id]);

  const handleSubmit = async (data: UnitInput) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/units/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Error al guardar cambios");
      toast.success("Unidad actualizado correctamente");
      router.push("/admin/units");
    } catch {
      toast.error("No se pudo actualizar el unidad");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (!unit) return <p>No se encontró la unidad</p>;

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
          <h1 className="text-3xl font-bold">Editar Unidad</h1>
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
          <UnitForm
            initialData={unit}
            onSubmit={handleSubmit}
            submitting={submitting}
            buttonText={"Guardar Cambios"}
          />
        </CardContent>
      </Card>
    </div>
  );
}
