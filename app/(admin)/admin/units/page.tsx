"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { useAdminUnits } from "@/hooks/useAdminUnits";
import { UnitsTable } from "@/components/admin/units-table";

export default function UnitsPage() {
  const {
    units,
    loading,
    pagination,
    searchName,
    setSearchName,
    curriculumId,
    setCurriculumId,
    curriculums,
    search,
    goToPage,
    deleteUnit,
    toggleUnitStatus
  } = useAdminUnits();

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Unidades</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las unidades del curso
          </p>
        </div>
        <div className="flex gap-3">
          <Select
            value={curriculumId}
            onValueChange={(value) => {
              setCurriculumId(value === "all" ? "" : value);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por curriculum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los curriculums</SelectItem>
              {curriculums.map((curriculum) => (
                <SelectItem key={curriculum.id} value={curriculum.id}>
                  {curriculum.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(1)}
            className="w-64"
          />
          <Button
            onClick={() => search(1)}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            Buscar
          </Button>
          <Link href="/admin/units/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Unidad
            </Button>
          </Link>
        </div>
      </div>

      {/* Units Table */}
      <UnitsTable
        units={units}
        loading={loading}
        onDelete={deleteUnit}
        onToggleStatus={toggleUnitStatus}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {units.length} de {pagination.total} unidades
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
