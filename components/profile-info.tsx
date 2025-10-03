import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfileInfo({ user }: { user: any }) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-white text-2xl font-bold mb-2">{user.name}</h1>
      <p className="text-gray-400 mb-1">{user.username}</p>
      <p className="text-gray-400 text-sm mb-6">{user.joinDate}</p>

      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          className="flex-1 max-w-xs bg-transparent border-gray-600 text-white hover:bg-gray-800"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Agrega Amigos
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-transparent border-gray-600 text-white hover:bg-gray-800"
        >
          {/* tu icono svg personalizado */}
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
    </div>
  );
}
