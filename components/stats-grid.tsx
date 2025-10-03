import { Star, CheckCircle, Gift, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function StatsGrid({ stats }: { stats: any }) {
  const items = [
    {
      label: "Días de racha",
      value: stats.streak,
      icon: <Star className="w-6 h-6 text-yellow-500 fill-current" />,
      bg: "bg-yellow-500/20"
    },
    {
      label: "XP obtenidos",
      value: stats.xp,
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      bg: "bg-green-500/20"
    },
    {
      label: "Desafíos",
      value: stats.challenges,
      icon: <Gift className="w-6 h-6 text-blue-500" />,
      bg: "bg-blue-500/20"
    },
    {
      label: "División actual",
      value: stats.division,
      icon: <Award className="w-6 h-6 text-purple-500" />,
      bg: "bg-purple-500/20"
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-white text-xl font-bold mb-4">Resumen</h2>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className={`p-2 ${item.bg} rounded-lg`}>{item.icon}</div>
              <div>
                <p className="text-white text-xl font-bold">{item.value}</p>
                <p className="text-gray-400 text-sm">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
