// app/admin/questions/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/admin/back-button";
import QuestionForm, { QuestionInput } from "@/components/admin/question-form";
import { toast } from "sonner";

export default function CreateQuestionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: QuestionInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear la pregunta");
      }

      toast.success("Pregunta creada exitosamente");
      router.push("/admin/questions");
    } catch (error) {
      console.error("Error al crear pregunta:", error);
      toast.error(
        error instanceof Error ? error.message : "No se pudo crear la pregunta"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <BackButton fallback="/admin/questions" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nueva Pregunta</h1>
          <p className="text-muted-foreground">
            Crea una nueva pregunta para las unidades
          </p>
        </div>
      </div>

      <QuestionForm onSubmit={handleSubmit} submitting={isLoading} />
    </div>
  );
}
