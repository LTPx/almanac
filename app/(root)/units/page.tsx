"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, BookOpen, CheckCircle, Clock, Star, Trophy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Tipos para TypeScript
type Unit = {
  id: number;
  name: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
  _count: {
    lessons: number;
  };
};

type Lesson = {
  id: number;
  name: string;
  description: string | null;
  experiencePoints: number;
  order: number;
  _count: {
    questions: number;
  };
};

type UserProgress = {
  id: number;
  isCompleted: boolean;
  experiencePoints: number;
  completedAt: Date | null;
  unit: Unit;
} | null;

export default function HomePage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>(null);
  const [loading, setLoading] = useState(true);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  // Mock userId - reemplaza con tu sistema de autenticación
  const userId = "mock-user-123";

  // API call functions
  const fetchUnits = async () => {
    const response = await fetch('/api/units');
    if (!response.ok) {
      throw new Error('Failed to fetch units');
    }
    return response.json();
  };

  const fetchLessonsByUnit = async (unitId: number) => {
    const response = await fetch(`/api/units/${unitId}/lessons`);
    if (!response.ok) {
      throw new Error('Failed to fetch lessons');
    }
    return response.json();
  };

  const fetchUserProgress = async (userId: string, unitId: number) => {
    const response = await fetch(`/api/users/${userId}/progress?unitId=${unitId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user progress');
    }
    return response.json();
  };

  // Cargar unidades al montar el componente
  useEffect(() => {
    const loadUnits = async () => {
      try {
        const unitsData = await fetchUnits();
        setUnits(unitsData);
        
        // Seleccionar la primera unidad por defecto
        if (unitsData.length > 0) {
          setSelectedUnitId(unitsData[0].id.toString());
        }
      } catch (error) {
        console.error('Error loading units:', error);
        // toast({
        //   title: "Error",
        //   description: "No se pudieron cargar las unidades",
        //   variant: "destructive",
        // });
      } finally {
        setLoading(false);
      }
    };

    loadUnits();
  }, [toast]);

  // Cargar lecciones y progreso cuando cambia la unidad seleccionada
  useEffect(() => {
    const loadUnitData = async () => {
      if (!selectedUnitId) return;
      
      setLessonsLoading(true);
      try {
        const unitId = parseInt(selectedUnitId);
        const [lessonsData, progressData] = await Promise.all([
          fetchLessonsByUnit(unitId),
          fetchUserProgress(userId, unitId)
        ]);
        
        setLessons(lessonsData);
        setUserProgress(progressData);
      } catch (error) {
        console.error('Error loading unit data:', error);
        // toast({
        //   title: "Error",
        //   description: "No se pudieron cargar los datos de la unidad",
        //   variant: "destructive",
        // });
      } finally {
        setLessonsLoading(false);
      }
    };

    loadUnitData();
  }, [selectedUnitId, userId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedUnit = units.find(unit => unit.id.toString() === selectedUnitId);
  const completedLessons = lessons.filter(lesson => 
    userProgress?.unit.lessons.some(ul => ul.id === lesson.id)
  ).length;
  const totalExperience = userProgress?.experiencePoints || 0;
  const progressPercentage = selectedUnit ? (completedLessons / selectedUnit._count.lessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            ¡Bienvenido de vuelta! 🎓
          </h1>
          <p className="text-lg text-muted-foreground">
            Continúa tu aprendizaje seleccionando una unidad
          </p>
        </div>

        {/* Unit Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Selecciona una Unidad</CardTitle>
            <CardDescription>
              Elige la unidad con la que quieres trabajar hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una unidad..." />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{unit.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {unit._count.lessons} lecciones
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedUnit && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Progress Section */}
            <div className="lg:col-span-1 space-y-6">
              {/* Progress Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Tu Progreso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progreso General</span>
                      <span className="text-sm font-bold text-primary">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 text-center bg-green-50 border-green-200">
                      <div className="text-2xl font-bold text-green-600">{completedLessons}</div>
                      <div className="text-sm text-green-700">Completadas</div>
                    </Card>
                    <Card className="p-4 text-center bg-blue-50 border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">{totalExperience}</div>
                      <div className="text-sm text-blue-700">XP Ganados</div>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Unit Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Información de la Unidad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold mb-2">{selectedUnit.name}</h3>
                  {selectedUnit.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {selectedUnit.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{selectedUnit._count.lessons} lecciones en total</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lessons Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Lecciones de {selectedUnit.name}
                  </CardTitle>
                  <CardDescription>
                    Progresa a través de las lecciones para dominar esta unidad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {lessonsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : lessons.length > 0 ? (
                    <div className="space-y-4">
                      {lessons.map((lesson) => {
                        const isCompleted = userProgress?.unit.lessons.some(ul => ul.id === lesson.id);
                        
                        return (
                          <Card
                            key={lesson.id}
                            className={`transition-all duration-200 cursor-pointer hover:shadow-md ${
                              isCompleted 
                                ? 'border-green-200 bg-green-50/50' 
                                : 'hover:border-primary/50'
                            }`}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex-shrink-0">
                                    {isCompleted ? (
                                      <CheckCircle className="h-8 w-8 text-green-500" />
                                    ) : (
                                      <Clock className="h-8 w-8 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg mb-1">{lesson.name}</h3>
                                    {lesson.description && (
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {lesson.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-4">
                                      <Badge variant="outline" className="text-xs">
                                        {lesson._count.questions} preguntas
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        <Trophy className="h-3 w-3 mr-1" />
                                        +{lesson.experiencePoints} XP
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex-shrink-0">
                                  {isCompleted ? (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                      Completada
                                    </Badge>
                                  ) : (
                                    <Button>
                                      Comenzar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-semibold mb-2">No hay lecciones disponibles</h3>
                      <p className="text-muted-foreground">
                        Esta unidad no tiene lecciones configuradas aún
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {!selectedUnit && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📚</div>
            <h3 className="text-2xl font-semibold mb-4">
              Selecciona una unidad para comenzar
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Elige una unidad del selector de arriba para ver las lecciones disponibles 
              y comenzar tu aprendizaje
            </p>
          </div>
        )}
      </div>
    </div>
  );
}