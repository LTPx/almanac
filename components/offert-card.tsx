import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Play } from "lucide-react";

export default function SpecialOfferCard() {
  return (
    <Card className="bg-background border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-purple-500" />
            <div>
              <h4 className="font-semibold text-white">Zaps gratis</h4>
              <p className="text-sm text-gray-400">
                Mira un anuncio y gana hasta 20 zaps
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            OBTENER
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
