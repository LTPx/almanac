import { UserPlus, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTutorial } from "@/components/tutorial/tutorial-provider";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProfileInfo({ user }: { user: any }) {
  const { t } = useTranslation();
  const { resetTutorial } = useTutorial();
  const router = useRouter();

  const handleStartTutorial = () => {
    resetTutorial();
    router.push("/");
  };

  return (
    <div className="text-center mb-8">
      <h1 className="text-white text-2xl font-bold mb-2">{user.name}</h1>
      <p className="text-gray-400 mb-1">{user.username}</p>
      <p className="text-gray-400 text-sm mb-6">{user.joinDate}</p>

      <div className="flex flex-col gap-3 items-center">
        {/* Agregar Amigos */}
        <div className="flex gap-4 w-full max-w-xs">
          <Button
            variant="outline"
            className="flex-1 bg-transparent border-gray-600 text-white hover:bg-gray-800"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {t("profile", "addFriends")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-transparent border-gray-600 text-white hover:bg-gray-800"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </Button>
        </div>

        {/* Ver Tutorial */}
        <Button
          onClick={handleStartTutorial}
          className="w-full max-w-xs bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-lg shadow-purple-500/20"
        >
          <GraduationCap className="w-4 h-4 mr-2" />
          {t("profile", "viewTutorial")}
        </Button>
      </div>
    </div>
  );
}
