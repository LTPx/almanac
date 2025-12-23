"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Flag,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface ProblemReport {
  id: number;
  questionId: number;
  userId: string | null;
  reason: string;
  description: string | null;
  status: "PENDING" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";
  createdAt: string;
  updatedAt: string;
  question: {
    id: number;
    title: string;
    type: string;
    unit: {
      id: number;
      name: string;
    };
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

const statusLabels = {
  PENDING: "Pendiente",
  IN_REVIEW: "En revisión",
  RESOLVED: "Resuelto",
  DISMISSED: "Descartado"
};

const statusColors = {
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  IN_REVIEW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  RESOLVED: "bg-green-500/10 text-green-500 border-green-500/20",
  DISMISSED: "bg-gray-500/10 text-gray-500 border-gray-500/20"
};

const statusIcons = {
  PENDING: Clock,
  IN_REVIEW: Eye,
  RESOLVED: CheckCircle,
  DISMISSED: XCircle
};

export default function ProblemReportsPage() {
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }

      const response = await fetch(`/api/admin/problem-reports?${params}`);
      if (!response.ok) {
        throw new Error("Error al cargar reportes");
      }
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (
    reportId: number,
    status: ProblemReport["status"]
  ) => {
    try {
      const response = await fetch("/api/admin/problem-reports", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reportId, status })
      });

      if (!response.ok) {
        throw new Error("Error al actualizar estado");
      }

      toast.success("Estado actualizado correctamente");
      fetchReports();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al actualizar estado");
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedStatus]);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description &&
        report.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getStatusIcon = (status: ProblemReport["status"]) => {
    const Icon = statusIcons[status];
    return Icon;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Reportes de Problemas
          </h1>
          <p className="text-muted-foreground">
            Gestiona los reportes de problemas en las preguntas
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar reportes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de reportes */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Cargando reportes...
              </p>
            </CardContent>
          </Card>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12">
                <Flag className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No se encontraron reportes
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => {
            const StatusIcon = getStatusIcon(report.status);
            return (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className={statusColors[report.status]}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusLabels[report.status]}
                        </Badge>
                        <Badge variant="outline">{report.question.type}</Badge>
                      </div>
                      <CardTitle className="text-lg">
                        {report.question.title}
                      </CardTitle>
                      <CardDescription>
                        Unidad: {report.question.unit.name} • Pregunta ID:{" "}
                        {report.questionId}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            updateReportStatus(report.id, "IN_REVIEW")
                          }
                        >
                          Marcar en revisión
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateReportStatus(report.id, "RESOLVED")
                          }
                        >
                          Marcar como resuelto
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateReportStatus(report.id, "DISMISSED")
                          }
                        >
                          Descartar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateReportStatus(report.id, "PENDING")
                          }
                        >
                          Marcar como pendiente
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">
                        Razón:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {report.reason}
                      </p>
                    </div>
                    {report.description && (
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">
                          Descripción:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {report.description}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs text-orange-400">
                        Reportado por:{" "}
                        {report.user
                          ? report.user.name || report.user.email
                          : "Anónimo"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleString("es-ES", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
