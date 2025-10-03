import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function PremiumCard() {
  return (
    <Card className="bg-gradient-to-b from-[#1881F0] to-[#1F960D] border-none text-white overflow-hidden relative">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold leading-tight">
              Funciones
              <br />
              para acelerar tu
              <br />
              aprendizaje
            </h2>
            <p className="text-blue-100 text-sm">
              Disfruta de vidas ilimitadas
              <br />y dile adiós a los anuncios
            </p>
            <Button
              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-3 rounded-full"
              size="lg"
            >
              PRUEBA 1 SEMANA GRATIS
            </Button>
          </div>
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <Plus className="w-8 h-8 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
