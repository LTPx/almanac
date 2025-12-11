// app/admin/questions/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import QuestionForm, {
  QuestionInput,
  QuestionData
} from "@/components/admin/question-form";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`/api/admin/questions/${questionId}`);

        if (!response.ok) {
          throw new Error("No se pudo cargar la pregunta");
        }

        const data = await response.json();
        setInitialData(data);
      } catch (error) {
        console.error("Error al cargar la pregunta:", error);
        toast.error("No se pudo cargar la pregunta");
        router.push("/admin/questions");
      } finally {
        setLoading(false);
      }
    };

    if (questionId) {
      fetchQuestion();
    }
  }, [questionId, router]);

  const handleSubmit = async (data: QuestionInput) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar la pregunta");
      }

      toast.success("Pregunta actualizada exitosamente");
      // router.push("/admin/questions");
    } catch (error) {
      console.error("Error al actualizar pregunta:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la pregunta"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Cargando pregunta...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No se encontró la pregunta
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/questions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Editar Pregunta
          </h1>
          <p className="text-muted-foreground">
            Modifica la información de la pregunta
          </p>
        </div>
      </div>

      <QuestionForm
        initialData={initialData}
        onSubmit={handleSubmit}
        submitting={isLoading}
      />
    </div>
  );
}
