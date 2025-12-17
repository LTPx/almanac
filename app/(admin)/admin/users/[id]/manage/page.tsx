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
  ArrowLeft
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

  useEffect(() => {
    loadUser();
    loadCurriculums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    </div>
  );
}
