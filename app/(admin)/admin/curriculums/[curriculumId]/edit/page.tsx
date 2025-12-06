"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Curriculum } from "@/lib/types";
import CurriculumForm, {
  CurriculumInput
} from "@/components/admin/curriculum-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditCurriculumPage() {
  const { curriculumId } = useParams();
  const router = useRouter();
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        const res = await fetch(`/api/admin/curriculums/${curriculumId}`);
        if (!res.ok) throw new Error("Error al cargar curriculum");
        const curriculum = await res.json();
        setCurriculum(curriculum);
      } catch {
        toast.error("No se pudo cargar el curriculum");
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, [curriculumId]);

  const handleSubmit = async (data: CurriculumInput) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/curriculums/${curriculumId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Error al guardar cambios");
      toast.success("Curriculum actualizado correctamente");
      router.push("/admin/curriculums");
    } catch {
      toast.error("No se pudo actualizar el curriculum");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (!curriculum) return <p>No se encontró el curriculum</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/curriculums">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar Curriculum</h1>
          <p className="text-muted-foreground">Editar curriculum educativo</p>
        </div>
      </div>
      <CurriculumForm
        initialData={curriculum}
        onSubmit={handleSubmit}
        submitting={submitting}
        buttonText="Guardar Cambios"
      />
    </div>
  );
}
