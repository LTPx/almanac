"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Coins,
  Award,
  Zap,
  Wallet,
  User,
  Calendar,
  TrendingUp
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

export default function UserManagementPage() {
  const [searchEmail, setSearchEmail] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 20;

  // Estados para formularios
  const [zapAmount, setZapAmount] = useState<number>(0);
  const [zapReason, setZapReason] = useState("");
  const [tokenCurriculumId, setTokenCurriculumId] = useState("");
  const [tokenQuantity, setTokenQuantity] = useState(1);
  const [assigningToken, setAssigningToken] = useState(false);
  const [adjustingZaps, setAdjustingZaps] = useState(false);

  // Cargar curriculums y usuarios al montar el componente
  useEffect(() => {
    loadCurriculums();
    loadAllUsers(1); // Cargar todos los usuarios al inicio
  }, []);

  const loadAllUsers = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/users/search?page=${page}&limit=${limit}`
      );
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalUsers(data.pagination.total);
      } else {
        console.error("Error loading users:", data.error);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (searchEmail) {
        params.append("email", searchEmail);
      }

      const response = await fetch(`/api/admin/users/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalUsers(data.pagination.total);
        if (data.users.length > 0 && !selectedUser) {
          setSelectedUser(data.users[0]);
        }
      } else {
        alert(data.error || "Error al buscar usuarios");
      }
    } catch (error) {
      console.error("Error searching users:", error);
      alert("Error al buscar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const loadCurriculums = async () => {
    try {
      const response = await fetch("/api/curriculums");
      const data = await response.json();
      // El endpoint devuelve el array directamente
      setCurriculums(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading curriculums:", error);
    }
  };

  const handleAssignToken = async () => {
    if (!selectedUser || !tokenCurriculumId) {
      alert("Selecciona un curriculum");
      return;
    }

    setAssigningToken(true);
    try {
      const response = await fetch(
        `/api/admin/users/${selectedUser.id}/curriculum-tokens`,
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
        // Recargar usuario
        if (searchEmail) {
          handleSearch(currentPage);
        } else {
          loadAllUsers(currentPage);
        }
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
    if (!selectedUser || zapAmount === 0) {
      alert("Ingresa una cantidad de ZAPs");
      return;
    }

    setAdjustingZaps(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/zaps`, {
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
        // Recargar usuario
        if (searchEmail) {
          handleSearch(currentPage);
        } else {
          loadAllUsers(currentPage);
        }
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra tokens de curriculum y ZAPs de usuarios
          </p>
        </div>
        <div className="flex gap-3">
          <Input
            type="email"
            placeholder="Buscar por email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(1)}
            className="w-64"
          />
          <Button
            onClick={() => handleSearch(1)}
            disabled={loading}
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            Buscar
          </Button>
        </div>
      </div>

      {/* User Table */}
      <Card className="p-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">ZAPs</TableHead>
                <TableHead className="text-center">Hearts</TableHead>
                <TableHead className="text-center">Tokens</TableHead>
                <TableHead className="text-center">XP Total</TableHead>
                <TableHead className="text-center">Curriculums</TableHead>
                <TableHead className="text-center">Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No se encontraron usuarios
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`cursor-pointer transition-colors ${
                      selectedUser?.id === user.id
                        ? "bg-purple-50 dark:bg-purple-950"
                        : "hover:bg-gray-50 dark:hover:bg-gray-900"
                    }`}
                  >
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="gap-1">
                        <Zap className="w-3 h-3" />
                        {user.zapTokens}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="gap-1">
                        <Coins className="w-3 h-3" />
                        {user.hearts}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="gap-1">
                        <Award className="w-3 h-3" />
                        {user.userCurriculumTokens.length}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {user.totalExperiencePoints.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {user.totalCurriculumsCompleted}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {users.length} de {totalUsers} usuarios
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = currentPage - 1;
                  if (searchEmail) {
                    handleSearch(newPage);
                  } else {
                    loadAllUsers(newPage);
                  }
                }}
                disabled={currentPage === 1 || loading}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = currentPage + 1;
                  if (searchEmail) {
                    handleSearch(newPage);
                  } else {
                    loadAllUsers(newPage);
                  }
                }}
                disabled={currentPage === totalPages || loading}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* User Details */}
      {selectedUser && (
        <>
          {/* User Info Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Información del Usuario
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Nombre</div>
                <div className="font-medium">{selectedUser.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{selectedUser.email}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  ZAPs
                </div>
                <div className="font-medium text-lg">
                  {selectedUser.zapTokens}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  Hearts
                </div>
                <div className="font-medium text-lg">{selectedUser.hearts}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  XP Total
                </div>
                <div className="font-medium">
                  {selectedUser.totalExperiencePoints}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Curriculums Completados
                </div>
                <div className="font-medium">
                  {selectedUser.totalCurriculumsCompleted}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Wallet className="w-3 h-3" />
                  Wallet
                </div>
                <div className="font-medium text-xs truncate">
                  {selectedUser.walletAddress || "Sin wallet"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Registro
                </div>
                <div className="font-medium text-sm">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>

          {/* Curriculum Tokens */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Tokens de Curriculum</h2>
            {selectedUser.userCurriculumTokens.length > 0 ? (
              <div className="space-y-2 mb-4">
                {selectedUser.userCurriculumTokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex justify-between items-center p-3 border border-gray-400 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {token.curriculum.title}
                      </div>
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
                {/* <Input
                  type="number"
                  min="1"
                  value={tokenQuantity}
                  onChange={(e) => setTokenQuantity(Number(e.target.value))}
                  className="w-24"
                  placeholder="Cant."
                /> */}
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
        </>
      )}
    </div>
  );
}
