"use client";

import React from "react";
import { ArrowLeft, Zap, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import PremiumCard from "@/components/premium-card";
import SpecialOfferCard from "@/components/offert-card";
import ZapCard from "@/components/zap-card";

export default function Store() {
  const router = useRouter();

  return (
    <div className="min-h-screen text-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <ArrowLeft
            onClick={() => router.back()}
            className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-200"
          />
          <h1 className="text-xl font-semibold">Tienda</h1>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-500" />
          <span className="text-purple-500 font-semibold">120</span>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <PremiumCard />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Ofertas especiales</h3>
          <SpecialOfferCard />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Zaps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ZapCard
              amount={1000}
              price="€4.99"
              icon={<Zap className="w-12 h-12 text-purple-500" />}
            />
            <ZapCard
              amount={3000}
              price="€9.99"
              icon={
                <div className="flex">
                  <Zap className="w-10 h-10 text-purple-500 -mr-2" />
                  <Zap className="w-10 h-10 text-purple-500" />
                </div>
              }
            />
            <ZapCard
              amount={7500}
              price="€19.99"
              icon={
                <div className="grid grid-cols-2 gap-1">
                  <Zap className="w-8 h-8 text-purple-500" />
                  <Zap className="w-8 h-8 text-purple-500" />
                  <Zap className="w-8 h-8 text-purple-500" />
                  <Zap className="w-8 h-8 text-purple-500" />
                </div>
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vidas</h3>
          <div className="bg-background rounded-2xl p-6 border border-gray-700">
            <div className="flex items-start gap-4">
              <div className="bg-red-500/20 p-3 rounded-xl">
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold mb-2">Set de vidas</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Recarga tus vidas para tener más oportunidades de continuar en
                  tus pruebas.
                </p>
                <div className="flex items-center gap-2 text-purple-500 font-semibold">
                  <span>20 Zaps</span>
                  <Zap className="w-5 h-5 fill-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
