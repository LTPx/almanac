"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/lib/types";
import MainTabs from "./nft/tabs/MainTabs";

export default function AchievementsContent({ user }: { user: User }) {
  return (
    <div className="AchievementPage h-[100dvh] bg-black flex flex-col">
      <Tabs
        value="medallas"
        className="w-full flex-1 flex flex-col overflow-hidden"
      >
        {/* Tabs principales */}
        <TabsList className="w-full h-14 bg-[#32C781] rounded-none border-b shrink-0">
          <TabsTrigger
            value="desafios"
            disabled
            className="flex-1 font-bold text-[#1A6E47] cursor-not-allowed rounded-none"
          >
            Desafíos
          </TabsTrigger>

          <TabsTrigger
            value="medallas"
            className="flex-1 text-white data-[state=active]:bg-transparent shadow-none border-0 border-b-2 border-b-transparent data-[state=active]:border-b-white rounded-none font-medium"
          >
            Medallas
          </TabsTrigger>
        </TabsList>

        {/* Contenido */}
        <TabsContent
          value="medallas"
          className="flex-1 flex flex-col overflow-hidden m-0"
        >
          <MainTabs user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
