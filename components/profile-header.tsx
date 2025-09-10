import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function ProfileHeader({
  avatar,
  name
}: {
  avatar: string;
  name: string;
}) {
  return (
    <>
      <div className="flex justify-end mb-8">
        <Link
          href="/profile/settings"
          className="text-white hover:bg-white/10 h-12 w-12 flex items-center justify-center rounded-full"
        >
          <Settings className="h-8 w-8" />
        </Link>
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-blue-400/30 flex items-center justify-center bg-blue-500/20">
            <Avatar className="w-28 h-28">
              <AvatarImage src={avatar} />
              <AvatarFallback className="bg-blue-400 text-white text-2xl font-bold">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </>
  );
}
