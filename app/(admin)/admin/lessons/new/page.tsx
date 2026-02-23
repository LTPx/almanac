"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LessonForm, { LessonInput } from "@/components/admin/lesson-form";
import { BackButton } from "@/components/admin/back-button";
import { toast } from "sonner";

export default function CreateLessonPage() {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: LessonInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Error al crear lesson");
      toast.success("Lesson creada correctamente");
      router.push("/admin/lessons");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo crear la lesson");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex items-center space-x-4">
        <BackButton fallback="/admin/lessons" className="text-foreground" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nueva Lección</h1>
          <p className="text-muted-foreground">
            Crea una nueva lección para el curso
          </p>
        </div>
      </div>

      <LessonForm onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
