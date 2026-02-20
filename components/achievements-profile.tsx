import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

export default function AchievementsProfile() {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <h2 className="text-white text-xl font-bold mb-4">{t("profile", "achievementsTitle")}</h2>
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t("profile", "noAchievements")}</p>
            <p className="text-sm mt-1">
              {t("profile", "completeToUnlock")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
