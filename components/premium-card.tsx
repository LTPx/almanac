import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";

export default function PremiumCard({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/payments/stripe/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear suscripción");
      }

      // Redirigir a Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Ocurrió un error al procesar tu suscripción");
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="space-y-2">
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-3 rounded-full w-full sm:w-auto"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "PRUEBA 1 SEMANA GRATIS"
                )}
              </Button>
              <p className="text-xs text-white/80 mt-2">
                Luego $1/mes. Cancela cuando quieras.
              </p>
            </div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
            <Plus className="w-8 h-8 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
