"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdForm } from "@/components/admin/ad-form";
import { BackButton } from "@/components/admin/back-button";

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
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <BackButton fallback="/admin/ads" />
        <div>
          <h1 className="text-3xl font-bold">Nuevo Anuncio</h1>
          <p className="text-muted-foreground">Crea un nuevo anuncio</p>
        </div>
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
