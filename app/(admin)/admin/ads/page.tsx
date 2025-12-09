"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Eye, MousePointerClick } from "lucide-react";
import { AdForm } from "@/components/admin/ad-form";

interface Ad {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  position: number;
  unit: {
    id: number;
    name: string;
  };
  _count: {
    views: number;
    clicks: number;
  };
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

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

  const handleSubmit = async (formData: any) => {
    try {
      const url = editingAd
        ? `/api/admin/ads/${editingAd.id}`
        : "/api/admin/ads";
      const method = editingAd ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchAds();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving ad:", error);
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

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingAd(null);
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Anuncio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? "Editar Anuncio" : "Nuevo Anuncio"}
              </DialogTitle>
              <DialogDescription>
                {editingAd
                  ? "Modifica los datos del anuncio"
                  : "Crea un nuevo anuncio para una unidad"}
              </DialogDescription>
            </DialogHeader>
            <AdForm
              editingAd={editingAd}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
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
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No hay anuncios creados
                </TableCell>
              </TableRow>
            ) : (
              ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">{ad.title}</TableCell>
                  <TableCell>{ad.unit.name}</TableCell>
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
                        onClick={() => handleEdit(ad)}
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
