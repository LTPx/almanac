"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdForm } from "@/components/admin/ad-form";
import { ChevronLeft } from "lucide-react";

export default function NewAdPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push("/admin/ads");
      }
    } catch (error) {
      console.error("Error creating ad:", error);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/admin/ads"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a anuncios
        </Link>
        <h1 className="text-3xl font-bold">Nuevo Anuncio</h1>
        <p className="text-muted-foreground">Crea un nuevo anuncio</p>
      </div>

      <AdForm ref={formRef} editingAd={null} onSubmit={handleSubmit} />

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" asChild>
          <Link href="/admin/ads">Cancelar</Link>
        </Button>
        <Button onClick={() => formRef.current?.requestSubmit()}>Crear</Button>
      </div>
    </div>
  );
}
