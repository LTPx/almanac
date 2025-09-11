import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ZapCardProps {
  amount: number;
  price: string;
  icon: React.ReactNode;
}

export default function ZapCard({ amount, price, icon }: ZapCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors">
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
