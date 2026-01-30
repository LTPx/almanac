"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Plus,
  Coins,
  Award,
  Zap,
  Wallet,
  User,
  Calendar,
  TrendingUp,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface UserResult {
  id: string;
  name: string;
  email: string;
  walletAddress: string | null;
  zapTokens: number;
  hearts: number;
  totalExperiencePoints: number;
  totalCurriculumsCompleted: number;
  createdAt: string;
  userCurriculumTokens: {
    id: string;
    curriculumId: string;
    quantity: number;
    curriculum: {
      id: string;
      title: string;
    };
  }[];
}

interface Curriculum {
  id: string;
  title: string;
}

interface UnitProgress {
  id: number;
  name: string;
  order: number;
  experiencePoints: number;
  isCompleted: boolean;
  completedAt: string | null;
  earnedXP: number;
}

export default function UserManagePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);

  // Estados para formularios
  const [zapAmount, setZapAmount] = useState<number>(0);
  const [zapReason, setZapReason] = useState("");
  const [tokenCurriculumId, setTokenCurriculumId] = useState("");
  const [tokenQuantity, setTokenQuantity] = useState(1);
  const [assigningToken, setAssigningToken] = useState(false);
  const [adjustingZaps, setAdjustingZaps] = useState(false);

  // Estados para progreso de unidades
  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
  const [units, setUnits] = useState<UnitProgress[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [togglingUnit, setTogglingUnit] = useState<number | null>(null);

  useEffect(() => {
    loadUser();
    loadCurriculums();
  }, [userId]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/search?email=`);
      const data = await response.json();

      if (response.ok) {
        const foundUser = data.users.find((u: UserResult) => u.id === userId);
        if (foundUser) {
          setUser(foundUser);
        } else {
          alert("Usuario no encontrado");
          router.push("/admin/users");
        }
      } else {
        console.error("Error loading user:", data.error);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurriculums = async () => {
    try {
      const response = await fetch("/api/curriculums");
      const data = await response.json();
      setCurriculums(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading curriculums:", error);
    }
  };

  const loadUnits = async (curriculumId: string) => {
    if (!curriculumId || !userId) return;

    setLoadingUnits(true);
    try {
      const response = await fetch(
        `/api/admin/users/${userId}/unit-progress?curriculumId=${curriculumId}`
      );
      const data = await response.json();

      if (response.ok) {
        setUnits(data.units || []);
      } else {
        console.error("Error loading units:", data.error);
        setUnits([]);
      }
    } catch (error) {
      console.error("Error loading units:", error);
      setUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleCurriculumSelect = (curriculumId: string) => {
    setSelectedCurriculumId(curriculumId);
    loadUnits(curriculumId);
  };

  const handleToggleUnit = async (
    unitId: number,
    isCurrentlyCompleted: boolean
  ) => {
    setTogglingUnit(unitId);
    try {
      const method = isCurrentlyCompleted ? "DELETE" : "POST";
      const response = await fetch(`/api/admin/users/${userId}/unit-progress`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId })
      });

      const data = await response.json();

      if (response.ok) {
        // Recargar las unidades para actualizar el estado
        loadUnits(selectedCurriculumId);
      } else {
        alert(data.error || "Error al actualizar progreso");
      }
    } catch (error) {
      console.error("Error toggling unit:", error);
      alert("Error al actualizar progreso");
    } finally {
      setTogglingUnit(null);
    }
  };

  const handleAssignToken = async () => {
    if (!user || !tokenCurriculumId) {
      alert("Selecciona un curriculum");
      return;
    }

    setAssigningToken(true);
    try {
      const response = await fetch(
        `/api/admin/users/${user.id}/curriculum-tokens`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            curriculumId: tokenCurriculumId,
            quantity: tokenQuantity
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        loadUser();
        setTokenCurriculumId("");
        setTokenQuantity(1);
      } else {
        alert(data.error || "Error al asignar token");
      }
    } catch (error) {
      console.error("Error assigning token:", error);
      alert("Error al asignar token");
    } finally {
      setAssigningToken(false);
    }
  };

  const handleAdjustZaps = async () => {
    if (!user || zapAmount === 0) {
      alert("Ingresa una cantidad de ZAPs");
      return;
    }

    setAdjustingZaps(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/zaps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: zapAmount,
          reason: zapReason || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        loadUser();
        setZapAmount(0);
        setZapReason("");
      } else {
        alert(data.error || "Error al ajustar ZAPs");
      }
    } catch (error) {
      console.error("Error adjusting ZAPs:", error);
      alert("Error al ajustar ZAPs");
    } finally {
      setAdjustingZaps(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Usuario no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/users")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuario</h1>
          <p className="text-muted-foreground mt-1">{user.name}</p>
        </div>
      </div>

      {/* User Info Card */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Información del Usuario
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Nombre</div>
            <div className="font-medium">{user.name}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium">{user.email}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" />
              ZAPs
            </div>
            <div className="font-medium text-lg">{user.zapTokens}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Coins className="w-3 h-3" />
              Hearts
            </div>
            <div className="font-medium text-lg">{user.hearts}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              XP Total
            </div>
            <div className="font-medium">{user.totalExperiencePoints}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Award className="w-3 h-3" />
              Curriculums Completados
            </div>
            <div className="font-medium">{user.totalCurriculumsCompleted}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              Wallet
            </div>
            <div className="font-medium text-xs truncate">
              {user.walletAddress || "Sin wallet"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Registro
            </div>
            <div className="font-medium text-sm">
              {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </Card>

      {/* Curriculum Tokens */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Tokens de Curriculum</h2>
        {user.userCurriculumTokens.length > 0 ? (
          <div className="space-y-2 mb-4">
            {user.userCurriculumTokens.map((token) => (
              <div
                key={token.id}
                className="flex justify-between items-center p-3 border border-gray-400 rounded-lg"
              >
                <div>
                  <div className="font-medium">{token.curriculum.title}</div>
                  <div className="text-sm text-muted-foreground">
                    ID: {token.curriculumId}
                  </div>
                </div>
                <Badge className="gap-1">
                  <Award className="w-3 h-3" />
                  {token.quantity} token(s)
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mb-4">
            Este usuario no tiene tokens de curriculum
          </p>
        )}

        {/* Assign Token Form */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Asignar Nuevo Token</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <Select
                value={tokenCurriculumId}
                onValueChange={setTokenCurriculumId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona curriculum" />
                </SelectTrigger>
                <SelectContent>
                  {curriculums.map((curr) => (
                    <SelectItem key={curr.id} value={curr.id}>
                      {curr.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAssignToken}
              className="gap-2"
              disabled={assigningToken}
            >
              <Plus className="w-4 h-4" />
              {assigningToken ? "Asignando..." : "Asignar"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Adjust ZAPs */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Ajustar ZAPs</h2>
        <div className="space-y-3">
          <div>
            <Label htmlFor="zap-amount">
              Cantidad (positivo para agregar, negativo para quitar)
            </Label>
            <Input
              id="zap-amount"
              type="number"
              value={zapAmount}
              onChange={(e) => setZapAmount(Number(e.target.value))}
              placeholder="ej: 100 o -50"
            />
          </div>
          <div>
            <Label htmlFor="zap-reason">Razón (opcional)</Label>
            <Input
              id="zap-reason"
              type="text"
              value={zapReason}
              onChange={(e) => setZapReason(e.target.value)}
              placeholder="ej: Compensación por error"
            />
          </div>
          <Button
            onClick={handleAdjustZaps}
            className="w-full gap-2"
            disabled={zapAmount === 0 || adjustingZaps}
          >
            <Zap className="w-4 h-4" />
            {adjustingZaps ? "Ajustando..." : "Ajustar ZAPs"}
          </Button>
        </div>
      </Card>

      {/* Progreso de Unidades */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Gestión de Progreso de Unidades
        </h2>

        {/* Selector de Curriculum */}
        <div className="mb-4">
          <Label htmlFor="curriculum-select">Selecciona un Curriculum</Label>
          <Select
            value={selectedCurriculumId}
            onValueChange={handleCurriculumSelect}
          >
            <SelectTrigger id="curriculum-select">
              <SelectValue placeholder="Selecciona un curriculum" />
            </SelectTrigger>
            <SelectContent>
              {curriculums.map((curr) => (
                <SelectItem key={curr.id} value={curr.id}>
                  {curr.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Unidades */}
        {selectedCurriculumId && (
          <div className="border-t pt-4">
            {loadingUnits ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">
                  Cargando unidades...
                </span>
              </div>
            ) : units.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No hay unidades en este curriculum
              </p>
            ) : (
              <div className="space-y-2">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      unit.isCompleted
                        ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleToggleUnit(unit.id, unit.isCompleted)
                        }
                        disabled={togglingUnit === unit.id}
                        className="focus:outline-none"
                      >
                        {togglingUnit === unit.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        ) : unit.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                      <div>
                        <p className="font-medium text-gray-500">
                          {unit.order}. {unit.name}
                        </p>
                        {unit.isCompleted && unit.completedAt && (
                          <div className="text-xs text-muted-foreground">
                            Completado:{" "}
                            {new Date(unit.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={unit.isCompleted ? "default" : "secondary"}
                        className="gap-1"
                      >
                        <TrendingUp className="w-3 h-3" />
                        {unit.experiencePoints} XP
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="pt-2 text-sm text-muted-foreground text-right">
                  Completadas: {units.filter((u) => u.isCompleted).length} /{" "}
                  {units.length}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
