"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdForm } from "@/components/admin/ad-form";
import { BackButton } from "@/components/admin/back-button";

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
}

export default function EditAdPage() {
  const { id } = useParams<{ id: string }>();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await fetch("/api/admin/ads");
        if (response.ok) {
          const ads: Ad[] = await response.json();
          const found = ads.find((a) => a.id === Number(id));
          setAd(found ?? null);
        }
      } catch (error) {
        console.error("Error fetching ad:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [id]);

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push("/admin/ads");
      }
    } catch (error) {
      console.error("Error updating ad:", error);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!ad) return <div>Anuncio no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <BackButton fallback="/admin/ads" />
        <div>
          <h1 className="text-3xl font-bold">Editar Anuncio</h1>
          <p className="text-muted-foreground">
            Modifica los datos del anuncio
          </p>
        </div>
      </div>

      <AdForm ref={formRef} editingAd={ad} onSubmit={handleSubmit} />

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" asChild>
          <Link href="/admin/ads">Cancelar</Link>
        </Button>
        <Button onClick={() => formRef.current?.requestSubmit()}>
          Actualizar
        </Button>
      </div>
    </div>
  );
}
