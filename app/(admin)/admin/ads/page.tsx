"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye, MousePointerClick, Globe } from "lucide-react";

interface Ad {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  position: number;
  curriculum?: {
    id: string;
    title: string;
  } | null;
  _count: {
    views: number;
    clicks: number;
  };
}

export default function AdsPage() {
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await fetch("/api/admin/ads");
      const data = await response.json();
      setAds(data);
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este anuncio?")) return;

    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        fetchAds();
      }
    } catch (error) {
      console.error("Error deleting ad:", error);
    }
  };

  const getCTR = (views: number, clicks: number) => {
    if (views === 0) return "0.00";
    return ((clicks / views) * 100).toFixed(2);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Anuncios</h1>
          <p className="text-muted-foreground">
            Gestiona los anuncios de las unidades
          </p>
        </div>
        <Button onClick={() => router.push("/admin/ads/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Anuncio
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">
                <Eye className="inline h-4 w-4 mr-1" />
                Vistas
              </TableHead>
              <TableHead className="text-right">
                <MousePointerClick className="inline h-4 w-4 mr-1" />
                Clicks
              </TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No hay anuncios creados
                </TableCell>
              </TableRow>
            ) : (
              ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">{ad.title}</TableCell>
                  <TableCell>
                    {ad.curriculum ? (
                      ad.curriculum.title
                    ) : (
                      <span className="flex items-center gap-1 text-blue-600 text-sm">
                        <Globe className="h-3 w-3" />
                        Global
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {ad.isActive ? (
                      <Badge variant="default">Activo</Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {ad._count.views}
                  </TableCell>
                  <TableCell className="text-right">
                    {ad._count.clicks}
                  </TableCell>
                  <TableCell className="text-right">
                    {getCTR(ad._count.views, ad._count.clicks)}%
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/ads/${ad.id}/edit`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
