"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  X,
  ListChecks,
  BookOpen,
  HelpCircle,
  GripVertical,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface QuestionSimple {
  id: number;
  title: string;
  type: string;
  order: number;
}

interface UnitWithQuestions {
  id: number;
  name: string;
  order: number;
  questions: QuestionSimple[];
}

interface FinalTestQuestion {
  id: number;
  order: number;
  question: QuestionSimple;
}

interface FinalTest {
  id: number;
  title: string | null;
  description: string | null;
  passingScore: number;
  totalQuestions: number;
  isActive: boolean;
  questions: FinalTestQuestion[];
}

interface CurriculumWithFinalTest {
  id: string;
  title: string;
  units: UnitWithQuestions[];
  finalTest: FinalTest | null;
}

const questionTypeLabels: Record<string, string> = {
  MULTIPLE_CHOICE: "Opción múltiple",
  FILL_IN_BLANK: "Completar",
  ORDER_WORDS: "Ordenar",
  TRUE_FALSE: "V/F",
  MATCHING: "Relacionar",
  DRAG_DROP: "Arrastrar",
};

const questionTypeColors: Record<string, string> = {
  MULTIPLE_CHOICE: "bg-blue-100 text-blue-800",
  FILL_IN_BLANK: "bg-green-100 text-green-800",
  ORDER_WORDS: "bg-purple-100 text-purple-800",
  TRUE_FALSE: "bg-yellow-100 text-yellow-800",
  MATCHING: "bg-pink-100 text-pink-800",
  DRAG_DROP: "bg-orange-100 text-orange-800",
};

export default function FinalTestPage() {
  const { curriculumId } = useParams();
  const router = useRouter();

  const [curriculum, setCurriculum] = useState<CurriculumWithFinalTest | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [isActive, setIsActive] = useState(true);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);

  // Collapsible state for units
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/admin/curriculums/${curriculumId}/final-test`
        );
        if (!res.ok) throw new Error("Error al cargar datos");

        const data: CurriculumWithFinalTest = await res.json();
        setCurriculum(data);

        // Inicializar formulario con datos existentes
        if (data.finalTest) {
          setTitle(data.finalTest.title || "");
          setDescription(data.finalTest.description || "");
          setPassingScore(data.finalTest.passingScore);
          setIsActive(data.finalTest.isActive);
          setSelectedQuestionIds(
            data.finalTest.questions.map((q) => q.question.id)
          );
        }

        // Expandir todas las unidades por defecto
        setExpandedUnits(new Set(data.units.map((u) => u.id)));
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar el curriculum");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [curriculumId]);

  const toggleUnit = (unitId: number) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  };

  const toggleQuestion = (questionId: number) => {
    setSelectedQuestionIds((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const selectAllFromUnit = (unit: UnitWithQuestions) => {
    const unitQuestionIds = unit.questions.map((q) => q.id);
    const allSelected = unitQuestionIds.every((id) =>
      selectedQuestionIds.includes(id)
    );

    if (allSelected) {
      // Deseleccionar todas
      setSelectedQuestionIds((prev) =>
        prev.filter((id) => !unitQuestionIds.includes(id))
      );
    } else {
      // Seleccionar todas (agregar las que faltan)
      setSelectedQuestionIds((prev) => {
        const newIds = unitQuestionIds.filter((id) => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  };

  const removeQuestion = (questionId: number) => {
    setSelectedQuestionIds((prev) => prev.filter((id) => id !== questionId));
  };

  const handleSave = async () => {
    if (selectedQuestionIds.length === 0) {
      toast.error("Debes seleccionar al menos una pregunta");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/curriculums/${curriculumId}/final-test`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || null,
            description: description || null,
            passingScore,
            isActive,
            questionIds: selectedQuestionIds,
          }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar");
      }

      toast.success("Test final guardado correctamente");
      router.push("/admin/curriculums");
    } catch (err: any) {
      toast.error(err.message || "Error al guardar el test final");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/curriculums/${curriculumId}/final-test`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Error al eliminar");

      toast.success("Test final eliminado");
      router.push("/admin/curriculums");
    } catch {
      toast.error("Error al eliminar el test final");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Obtener los datos de las preguntas seleccionadas
  const getSelectedQuestionsData = (): QuestionSimple[] => {
    if (!curriculum) return [];
    const allQuestions = curriculum.units.flatMap((u) => u.questions);
    return selectedQuestionIds
      .map((id) => allQuestions.find((q) => q.id === id))
      .filter(Boolean) as QuestionSimple[];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontró el curriculum</p>
      </div>
    );
  }

  const totalQuestionsAvailable = curriculum.units.reduce(
    (acc, unit) => acc + unit.questions.length,
    0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Test Final</h1>
          <p className="text-muted-foreground">{curriculum.title}</p>
        </div>
        <div className="flex gap-2">
          {curriculum.finalTest && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{curriculum.units.length}</p>
                <p className="text-sm text-muted-foreground">Unidades</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalQuestionsAvailable}</p>
                <p className="text-sm text-muted-foreground">
                  Preguntas disponibles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {selectedQuestionIds.length}
                </p>
                <p className="text-sm text-muted-foreground">Seleccionadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración del Test */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Test</CardTitle>
            <CardDescription>
              Configura los parámetros del test final
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título (opcional)</Label>
              <Input
                id="title"
                placeholder="Ej: Examen Final de Historia"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descripción del test final..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passingScore">Porcentaje para aprobar (%)</Label>
              <Input
                id="passingScore"
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                El usuario debe obtener al menos este porcentaje para aprobar
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Test activo</Label>
                <p className="text-xs text-muted-foreground">
                  Los usuarios podrán realizar el test
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </CardContent>
        </Card>

        {/* Preguntas Seleccionadas */}
        <Card>
          <CardHeader>
            <CardTitle>
              Preguntas Seleccionadas ({selectedQuestionIds.length})
            </CardTitle>
            <CardDescription>
              Estas preguntas formarán parte del test final
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedQuestionIds.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay preguntas seleccionadas. Selecciona preguntas de las
                unidades de abajo.
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {getSelectedQuestionsData().map((question, index) => (
                  <div
                    key={question.id}
                    className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <span className="flex-1 text-sm truncate">
                      {question.title}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${questionTypeColors[question.type] || ""}`}
                    >
                      {questionTypeLabels[question.type] || question.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unidades y Preguntas */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Preguntas</CardTitle>
          <CardDescription>
            Selecciona las preguntas de las unidades que formarán parte del test
            final
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {curriculum.units.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Este curriculum no tiene unidades con preguntas.
            </p>
          ) : (
            curriculum.units.map((unit) => {
              const isExpanded = expandedUnits.has(unit.id);
              const unitQuestionIds = unit.questions.map((q) => q.id);
              const selectedCount = unitQuestionIds.filter((id) =>
                selectedQuestionIds.includes(id)
              ).length;
              const allSelected =
                unit.questions.length > 0 &&
                selectedCount === unit.questions.length;

              return (
                <Collapsible
                  key={unit.id}
                  open={isExpanded}
                  onOpenChange={() => toggleUnit(unit.id)}
                >
                  <div className="border rounded-lg">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <div>
                            <p className="font-medium">{unit.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {unit.questions.length} preguntas
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedCount > 0 && (
                            <Badge variant="secondary">
                              {selectedCount} seleccionadas
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectAllFromUnit(unit);
                            }}
                            disabled={unit.questions.length === 0}
                          >
                            {allSelected ? "Deseleccionar" : "Seleccionar"}{" "}
                            todas
                          </Button>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t p-4 space-y-2 bg-muted/20">
                        {unit.questions.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Esta unidad no tiene preguntas
                          </p>
                        ) : (
                          unit.questions.map((question) => {
                            const isSelected = selectedQuestionIds.includes(
                              question.id
                            );
                            return (
                              <div
                                key={question.id}
                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-primary/10 border-primary/50"
                                    : "hover:bg-muted/50"
                                }`}
                                onClick={() => toggleQuestion(question.id)}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() =>
                                    toggleQuestion(question.id)
                                  }
                                />
                                <span className="flex-1 text-sm">
                                  {question.title}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${questionTypeColors[question.type] || ""}`}
                                >
                                  {questionTypeLabels[question.type] ||
                                    question.type}
                                </Badge>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Test Final</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar el test final? Esta acción
              no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
