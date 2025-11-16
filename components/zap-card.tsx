"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ZapCardProps {
  amount: number;
  price: string;
  icon: React.ReactNode;
  priceId: string;
}

export default function ZapCard({
  amount,
  price,
  icon,
  priceId
}: ZapCardProps) {
  async function handleClick() {
    const res = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId })
    });

    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  return (
    <Card
      onClick={handleClick}
      className="bg-background border-gray-700 hover:border-purple-500 transition-colors cursor-pointer"
    >
      <CardContent className="p-6 text-center space-y-4">
        <div className="flex justify-center">{icon}</div>
        <div>
          <div className="text-2xl font-bold text-white">{amount}</div>
          <div className="text-blue-400 font-semibold">{price}</div>
        </div>
      </CardContent>
    </Card>
  );
}
