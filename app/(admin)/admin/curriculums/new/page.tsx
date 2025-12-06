"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CurriculumForm, {
  CurriculumInput
} from "@/components/admin/curriculum-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewCurriculumPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: CurriculumInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/curriculums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Error al crear curriculum");
      toast.success("Curriculum creado correctamente");
      router.push("/admin/curriculums");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo crear el curriculum");
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="text-3xl font-bold">Nuevo Curriculum</h1>
          <p className="text-muted-foreground">Crear curriculum educativo</p>
        </div>
      </div>
      <CurriculumForm onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
