"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lesson } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import LessonForm, { LessonInput } from "@/components/admin/lesson-form";

export default function EditUnitPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/lessons/${id}`);
        if (!res.ok) throw new Error("Error al cargar unidad");
        const lesson = await res.json();
        setLesson(lesson);
      } catch {
        toast.error("No se pudo cargar la unidad");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  const handleSubmit = async (data: LessonInput) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lessons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Error al guardar cambios");
      toast.success("Leccion actualizada correctamente");
      router.push("/admin/lessons");
    } catch {
      toast.error("No se pudo actualizar la leccion");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (!lesson) return <p>No se encontró la lesson</p>;

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
          <LessonForm
            initialData={lesson}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
