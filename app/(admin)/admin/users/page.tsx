"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Search, Coins, Zap, Eye, Heart, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export default function UsersPage() {
  const router = useRouter();
  const [searchEmail, setSearchEmail] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 20;

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadAllUsers(1);
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

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}/manage`);
  };

  const handleViewTutorStats = (userId: string) => {
    router.push(`/admin/users/${userId}/tutor`);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
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
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
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
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="gap-1">
                      <Zap className="w-3 h-3 text-purple-500 fill-current" />
                      {user.zapTokens}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="gap-1">
                      <Heart className="w-3 h-3 text-red-500 fill-current" />
                      {user.hearts}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="gap-1">
                      <Coins className="w-3 h-3 text-yellow-500" />
                      {user.userCurriculumTokens.length}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-primary">
                    {user.totalExperiencePoints.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {user.totalCurriculumsCompleted}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewUser(user.id)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Button>
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTutorStats(user.id)}
                        className="gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        title="Ver estadísticas del Almanac Tutor"
                      >
                        <BookOpen className="w-4 h-4" />
                        Tutor
                      </Button> */}
                    </div>
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
    </div>
  );
}
