"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Languages,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  BookOpen,
  GraduationCap,
  Library,
  RefreshCw,
  DatabaseZap,
  HelpCircle,
  Square
} from "lucide-react";
import { toast } from "sonner";

interface Stats {
  totalCurriculums: number;
  curriculumsWithEN: number;
  curriculumsWithES: number;
  totalUnits: number;
  unitsWithEN: number;
  unitsWithES: number;
  totalLessons: number;
  lessonsWithEN: number;
  lessonsWithES: number;
  totalQuestions: number;
  questionsWithEN: number;
  questionsWithES: number;
}

interface LogEntry {
  id: number | string;
  name: string;
  translated?: string;
  error?: string;
  status: "ok" | "error" | "skipped";
}

interface JobState {
  running: boolean;
  processed: number;
  total: number;
  errors: number;
  done: boolean;
  log: LogEntry[];
}

interface SectionMigrationState {
  running: boolean;
  done: boolean;
  migrated: number;
  skipped: number;
}

const initialJob: JobState = {
  running: false,
  processed: 0,
  total: 0,
  errors: 0,
  done: false,
  log: []
};

const initialSectionMigration: SectionMigrationState = {
  running: false,
  done: false,
  migrated: 0,
  skipped: 0
};

export default function TranslationsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [curriculumsMigration, setCurriculumsMigration] =
    useState<SectionMigrationState>(initialSectionMigration);
  const [unitsMigration, setUnitsMigration] = useState<SectionMigrationState>(
    initialSectionMigration
  );
  const [lessonsMigration, setLessonsMigration] =
    useState<SectionMigrationState>(initialSectionMigration);
  const [questionsMigration, setQuestionsMigration] =
    useState<SectionMigrationState>(initialSectionMigration);
  const [curriculumsJob, setCurriculumsJob] = useState<JobState>(initialJob);
  const [unitsJob, setUnitsJob] = useState<JobState>(initialJob);
  const [lessonsJob, setLessonsJob] = useState<JobState>(initialJob);
  const [questionsJob, setQuestionsJob] = useState<JobState>(initialJob);
  const curriculumsScrollRef = useRef<HTMLDivElement>(null);
  const unitsScrollRef = useRef<HTMLDivElement>(null);
  const lessonsScrollRef = useRef<HTMLDivElement>(null);
  const questionsScrollRef = useRef<HTMLDivElement>(null);
  const curriculumsESRef = useRef<EventSource | null>(null);
  const unitsESRef = useRef<EventSource | null>(null);
  const lessonsESRef = useRef<EventSource | null>(null);
  const questionsESRef = useRef<EventSource | null>(null);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/translate/stats");
      if (!res.ok) throw new Error("Error al cargar estadísticas");
      const data = await res.json();
      setStats(data);
    } catch {
      toast.error("No se pudieron cargar las estadísticas");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    curriculumsScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [curriculumsJob.log.length]);

  useEffect(() => {
    unitsScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [unitsJob.log.length]);

  useEffect(() => {
    lessonsScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lessonsJob.log.length]);

  useEffect(() => {
    questionsScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [questionsJob.log.length]);

  const startSectionMigration = (
    section: "curriculums" | "units" | "lessons" | "questions"
  ) => {
    const setState =
      section === "curriculums"
        ? setCurriculumsMigration
        : section === "units"
          ? setUnitsMigration
          : section === "lessons"
            ? setLessonsMigration
            : setQuestionsMigration;

    setState({ running: true, done: false, migrated: 0, skipped: 0 });

    const eventSource = new EventSource(
      `/api/admin/migrate?section=${section}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "done") {
        setState({
          running: false,
          done: true,
          migrated: data.totalMigrated,
          skipped: data.totalSkipped
        });
        eventSource.close();
        fetchStats();
        if (data.totalMigrated > 0) {
          toast.success(`${data.totalMigrated} registros migrados`);
        } else {
          toast.success("Todo ya estaba migrado");
        }
      }

      if (data.type === "fatal") {
        setState((prev) => ({ ...prev, running: false, done: true }));
        eventSource.close();
        toast.error(data.error || "Error fatal en la migración");
      }
    };

    eventSource.onerror = () => {
      setState((prev) => ({ ...prev, running: false, done: true }));
      eventSource.close();
      toast.error("Se perdió la conexión con el servidor");
    };
  };

  const stopJob = (type: "curriculums" | "units" | "lessons" | "questions") => {
    const ref =
      type === "curriculums"
        ? curriculumsESRef
        : type === "units"
          ? unitsESRef
          : type === "lessons"
            ? lessonsESRef
            : questionsESRef;
    const setJob =
      type === "curriculums"
        ? setCurriculumsJob
        : type === "units"
          ? setUnitsJob
          : type === "lessons"
            ? setLessonsJob
            : setQuestionsJob;

    ref.current?.close();
    ref.current = null;
    setJob((prev) => ({ ...prev, running: false, done: true }));
    toast.info("Traducción detenida");
  };

  const startJob = (
    type: "curriculums" | "units" | "lessons" | "questions",
    onlyMissing: boolean = true
  ) => {
    const esRef =
      type === "curriculums"
        ? curriculumsESRef
        : type === "units"
          ? unitsESRef
          : type === "lessons"
            ? lessonsESRef
            : questionsESRef;
    const setJob =
      type === "curriculums"
        ? setCurriculumsJob
        : type === "units"
          ? setUnitsJob
          : type === "lessons"
            ? setLessonsJob
            : setQuestionsJob;

    setJob({
      running: true,
      processed: 0,
      total: 0,
      errors: 0,
      done: false,
      log: []
    });

    const url = `/api/admin/translate/bulk?type=${type}&onlyMissing=${onlyMissing}`;
    const eventSource = new EventSource(url);
    esRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setJob((prev) => {
        const next = { ...prev };

        if (data.type === "start") {
          next.total = data.total;
          if (data.total === 0) {
            next.running = false;
            next.done = true;
            const label =
              type === "curriculums"
                ? "currículums"
                : type === "units"
                  ? "unidades"
                  : type === "lessons"
                    ? "lecciones"
                    : "preguntas";
            toast.success(`Todos los ${label} ya están traducidos`);
            eventSource.close();
          }
        }

        if (data.type === "progress") {
          next.processed = data.processed;
          next.errors = data.errors;
          next.log = [
            ...prev.log,
            {
              id: data.current.id,
              name: data.current.name,
              translated: data.current.translated,
              status: "ok"
            }
          ];
        }

        if (data.type === "error") {
          next.processed = data.processed;
          next.errors = data.errors;
          next.log = [
            ...prev.log,
            {
              id: data.current.id,
              name: data.current.name,
              error: data.current.error,
              status: "error"
            }
          ];
        }

        if (data.type === "done") {
          next.running = false;
          next.done = true;
          next.processed = data.processed;
          next.errors = data.errors;
          eventSource.close();
          fetchStats();
          if (data.errors === 0) {
            toast.success(
              `¡Traducción completada! ${data.processed} elementos traducidos`
            );
          } else {
            toast.warning(`Completado con ${data.errors} errores`);
          }
        }

        if (data.type === "fatal") {
          next.running = false;
          next.done = true;
          eventSource.close();
          toast.error(data.error || "Error fatal en la traducción");
        }

        return next;
      });
    };

    eventSource.onerror = () => {
      setJob((prev) => ({ ...prev, running: false, done: true }));
      eventSource.close();
      toast.error("Se perdió la conexión con el servidor");
    };
  };

  const progressPercent = (job: JobState) =>
    job.total > 0 ? Math.round((job.processed / job.total) * 100) : 0;

  const JobPanel = ({
    type,
    job,
    icon: Icon,
    title,
    description,
    total,
    translated,
    scrollRef
  }: {
    type: "curriculums" | "units" | "lessons" | "questions";
    job: JobState;
    icon: any;
    title: string;
    description: string;
    total: number;
    translated: number;
    scrollRef: React.RefObject<HTMLDivElement | null>;
  }) => {
    const handleStop = () => stopJob(type);
    const missing = total - translated;
    const allDone = missing === 0;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={allDone ? "default" : "secondary"}>
                {translated}/{total} traducidas
              </Badge>
              {!allDone && (
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-300"
                >
                  {missing} pendientes
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => startJob(type, true)}
              disabled={job.running || allDone}
              className="gap-2"
            >
              {job.running ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {job.running
                ? "Traduciendo..."
                : allDone
                  ? "Todo traducido"
                  : `Traducir ${missing} pendientes`}
            </Button>
            {job.running && (
              <Button
                onClick={handleStop}
                variant="destructive"
                className="gap-2"
              >
                <Square className="w-4 h-4" />
                Detener
              </Button>
            )}
            {!job.running && (
              <Button
                onClick={() => startJob(type, false)}
                disabled={allDone && !job.done}
                variant="outline"
                className="gap-2"
                title="Re-traducir todo, incluyendo los que ya tienen traducción ES"
              >
                <RefreshCw className="w-4 h-4" />
                Re-traducir todo
              </Button>
            )}
          </div>

          {(job.running || job.done) && job.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {job.processed} / {job.total} procesados
                  {job.errors > 0 && (
                    <span className="text-red-500 ml-2">
                      ({job.errors} errores)
                    </span>
                  )}
                </span>
                <span>{progressPercent(job)}%</span>
              </div>
              <Progress value={progressPercent(job)} className="h-2" />
              {job.done && (
                <p className="text-sm text-green-600 font-medium">
                  ✓ Traducción completada
                </p>
              )}
            </div>
          )}

          {job.log.length > 0 && (
            <ScrollArea className="h-52 rounded-md border bg-muted/30 p-3">
              <div className="space-y-1 font-mono text-xs">
                {job.log.map((entry, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 ${entry.status === "error" ? "text-red-500" : "text-foreground"}`}
                  >
                    {entry.status === "ok" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    )}
                    <span className="text-muted-foreground">[{entry.id}]</span>
                    <span className="truncate">{entry.name}</span>
                    {entry.translated && (
                      <>
                        <span className="text-muted-foreground">→</span>
                        <span className="truncate text-green-600">
                          {entry.translated}
                        </span>
                      </>
                    )}
                    {entry.error && (
                      <span className="text-red-400">{entry.error}</span>
                    )}
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Languages className="w-8 h-8" />
            Traducciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Migración y traducción por lote EN ↔ ES
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchStats}
          disabled={loadingStats}
          className="gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${loadingStats ? "animate-spin" : ""}`}
          />
          Actualizar stats
        </Button>
      </div>

      {loadingStats ? (
        <div className="text-center py-12 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Cargando estadísticas...
        </div>
      ) : stats ? (
        <>
          {/* SECCIÓN: Migración EN */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <DatabaseZap className="w-5 h-5" />
                Migración de datos a EN
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Copia los datos originales (title/name/description) a las tablas
                de traducción EN. Solo procesa los registros que aún no tienen
                traducción EN.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="divide-y">
                  {[
                    {
                      section: "curriculums" as const,
                      label: "Currículums",
                      icon: Library,
                      withEN: stats.curriculumsWithEN,
                      total: stats.totalCurriculums,
                      state: curriculumsMigration
                    },
                    {
                      section: "units" as const,
                      label: "Unidades",
                      icon: GraduationCap,
                      withEN: stats.unitsWithEN,
                      total: stats.totalUnits,
                      state: unitsMigration
                    },
                    {
                      section: "lessons" as const,
                      label: "Lecciones",
                      icon: BookOpen,
                      withEN: stats.lessonsWithEN,
                      total: stats.totalLessons,
                      state: lessonsMigration
                    },
                    {
                      section: "questions" as const,
                      label: "Preguntas",
                      icon: HelpCircle,
                      withEN: stats.questionsWithEN,
                      total: stats.totalQuestions,
                      state: questionsMigration
                    }
                  ].map(
                    ({ section, label, icon: Icon, withEN, total, state }) => {
                      const missing = total - withEN;
                      const allDone = missing === 0;
                      return (
                        <div
                          key={section}
                          className="flex items-center justify-between py-3 gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="font-medium text-sm">{label}</span>
                            <span className="text-sm text-muted-foreground">
                              {withEN}
                              <span className="text-muted-foreground/60">
                                /{total}
                              </span>
                            </span>
                            {allDone ? (
                              <Badge
                                variant="default"
                                className="bg-green-600 text-xs py-0"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Listo
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-orange-600 border-orange-300 text-xs py-0"
                              >
                                {missing} pendientes
                              </Badge>
                            )}
                            {state.done && state.migrated > 0 && (
                              <span className="text-xs text-green-600">
                                ✓ {state.migrated} migrados
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant={allDone ? "outline" : "default"}
                            onClick={() => startSectionMigration(section)}
                            disabled={state.running || allDone}
                            className="gap-1.5 shrink-0"
                          >
                            {state.running ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : allDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <DatabaseZap className="w-3.5 h-3.5" />
                            )}
                            {state.running
                              ? "Migrando..."
                              : allDone
                                ? "Migrado"
                                : "Migrar"}
                          </Button>
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* SECCIÓN: Traducciones ES */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Traducción EN → ES con IA
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Traduce el contenido de EN a ES usando Gemini. Requiere tener la
                migración EN completa.
              </p>
            </div>

            <JobPanel
              type="curriculums"
              job={curriculumsJob}
              icon={Library}
              title="Currículums"
              description="Traduce el título de cada currículum de EN a ES"
              total={stats.totalCurriculums}
              translated={stats.curriculumsWithES}
              scrollRef={curriculumsScrollRef}
            />
            <JobPanel
              type="units"
              job={unitsJob}
              icon={GraduationCap}
              title="Unidades"
              description="Traduce nombre y descripción de cada unidad de EN a ES"
              total={stats.totalUnits}
              translated={stats.unitsWithES}
              scrollRef={unitsScrollRef}
            />
            <JobPanel
              type="lessons"
              job={lessonsJob}
              icon={BookOpen}
              title="Lecciones"
              description="Traduce nombre y descripción de cada lección de EN a ES"
              total={stats.totalLessons}
              translated={stats.lessonsWithES}
              scrollRef={lessonsScrollRef}
            />
            {/* <JobPanel
              type="questions"
              job={questionsJob}
              icon={HelpCircle}
              title="Preguntas"
              description="Traduce título y contenido (sentence, options, explanation) de cada pregunta de EN a ES. También crea AnswerTranslation para opción múltiple."
              total={stats.totalQuestions}
              translated={stats.questionsWithES}
              scrollRef={questionsScrollRef}
            /> */}
          </div>
        </>
      ) : (
        <p className="text-muted-foreground">
          No se pudieron cargar las estadísticas
        </p>
      )}
    </div>
  );
}
