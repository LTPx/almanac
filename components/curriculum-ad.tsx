"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Ad {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  targetUrl: string;
  position: number;
  _count: {
    views: number;
    clicks: number;
  };
}

interface CurriculumAdProps {
  unitId: number;
  className?: string;
}

export function CurriculumAd({ unitId, className }: CurriculumAdProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hasRegisteredView, setHasRegisteredView] = useState(false);

  useEffect(() => {
    fetchAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  useEffect(() => {
    // Registrar vista cuando el componente se monta y hay un ad visible
    if (ads.length > 0 && !hasRegisteredView && isVisible) {
      registerView(ads[currentAdIndex].id);
      setHasRegisteredView(true);
    }
  }, [ads, currentAdIndex, hasRegisteredView, isVisible]);

  const fetchAds = async () => {
    try {
      const response = await fetch(`/api/units/${unitId}/ads`);
      if (response.ok) {
        const data = await response.json();
        setAds(data);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    }
  };

  const registerView = async (adId: number) => {
    try {
      await fetch(`/api/ads/${adId}/view`, {
        method: "POST"
      });
    } catch (error) {
      console.error("Error registering view:", error);
    }
  };

  const registerClick = async (adId: number) => {
    try {
      await fetch(`/api/ads/${adId}/click`, {
        method: "POST"
      });
    } catch (error) {
      console.error("Error registering click:", error);
    }
  };

  const handleAdClick = (ad: Ad) => {
    registerClick(ad.id);
    window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Si no hay ads o está cerrado, no mostrar nada
  if (ads.length === 0 || !isVisible) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  return (
    <div
      className={cn(
        "relative rounded-lg border bg-card overflow-hidden shadow-sm",
        className
      )}
    >
      {/* Botón de cerrar */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Contenido del ad */}
      <div className="cursor-pointer" onClick={() => handleAdClick(currentAd)}>
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={currentAd.imageUrl}
            alt={currentAd.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1">{currentAd.title}</h3>
          {currentAd.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {currentAd.description}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Anuncio</span>
            <span className="text-xs font-medium text-primary hover:underline">
              Más información →
            </span>
          </div>
        </div>
      </div>

      {/* Indicadores si hay múltiples ads */}
      {ads.length > 1 && (
        <div className="flex justify-center gap-2 pb-4">
          {ads.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentAdIndex
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              )}
              onClick={() => {
                setCurrentAdIndex(index);
                setHasRegisteredView(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
