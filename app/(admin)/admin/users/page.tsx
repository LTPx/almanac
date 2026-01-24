"use client";

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
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { subscriptionStatusConfig } from "@/lib/subscription-status";

export default function UsersPage() {
  const router = useRouter();
  const {
    users,
    loading,
    pagination,
    searchEmail,
    setSearchEmail,
    search,
    goToPage
  } = useAdminUsers();

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
            onKeyDown={(e) => e.key === "Enter" && search(1)}
            className="w-64"
          />
          <Button
            onClick={() => search(1)}
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
              <TableHead className="text-center">Subscription</TableHead>
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
                <TableCell colSpan={10} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
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
                    <Badge
                      variant={
                        subscriptionStatusConfig[user.subscriptionStatus]
                          .variant
                      }
                    >
                      {subscriptionStatusConfig[user.subscriptionStatus].label}
                    </Badge>
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
                        onClick={() =>
                          router.push(`/admin/users/${user.id}/manage`)
                        }
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/users/${user.id}/tutor`)
                        }
                        className="gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        title="Ver estadísticas del Almanac Tutor"
                      >
                        <BookOpen className="w-4 h-4" />
                        Tutor
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {users.length} de {pagination.total} usuarios
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || loading}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
