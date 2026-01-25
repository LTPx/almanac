"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useAdminCurriculums } from "@/hooks/useAdminCurriculums";
import { CurriculumsTable } from "@/components/admin/curriculums-table";

export default function CurriculumPage() {
  const {
    curriculums,
    loading,
    pagination,
    searchTitle,
    setSearchTitle,
    search,
    goToPage,
    deleteCurriculum,
    toggleCurriculumStatus
  } = useAdminCurriculums();

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Curriculums</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los currículums educativos
          </p>
        </div>
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Buscar por título..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
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
          <Link href="/admin/curriculums/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Curriculum
            </Button>
          </Link>
        </div>
      </div>

      {/* Curriculum Table */}
      <CurriculumsTable
        curriculums={curriculums}
        loading={loading}
        onDelete={deleteCurriculum}
        onToggleStatus={toggleCurriculumStatus}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {curriculums.length} de {pagination.total} curriculums
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
