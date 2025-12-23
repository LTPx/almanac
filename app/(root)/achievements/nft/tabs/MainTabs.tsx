"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ExploreTabContent from "./ExploreTabContent";
import MyNftsTab from "./MyNftsTab";
import { useNFTs } from "@/hooks/useNfts";
import { User } from "@/lib/types";
import { Sparkles } from "lucide-react";

export default function MainTabs({ user }: { user: User }) {
  const [tab, setTab] = useState("explore");
  const { nfts, loading, error, refetch } = useNFTs(user.id);

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="w-full flex-1 flex flex-col overflow-hidden"
    >
      <TabsList className="w-full h-14 bg-[#32C781] rounded-none shrink-0 relative p-0 gap-0">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/30"></div>
        <TabsTrigger
          value="explore"
          className="flex-1 h-full text-white data-[state=active]:bg-transparent shadow-none border-0 border-b-2 border-b-transparent data-[state=active]:border-b-white rounded-none font-medium text-sm transition-all duration-300 relative z-10"
        >
          Explore
        </TabsTrigger>

        <TabsTrigger
          value="friends"
          className="flex-1 h-full text-white data-[state=active]:bg-transparent shadow-none border-0 border-b-2 border-b-transparent data-[state=active]:border-b-white rounded-none font-medium text-sm transition-all duration-300 relative z-10"
        >
          Friends
        </TabsTrigger>

        <TabsTrigger
          value="mis-medallas"
          className="flex-1 h-full text-white data-[state=active]:bg-transparent shadow-none border-0 border-b-2 border-b-transparent data-[state=active]:border-b-white rounded-none font-medium transition-all duration-300 relative z-10"
        >
          Mis Medallas
        </TabsTrigger>
      </TabsList>
      <TabsContent value="explore" className="flex-1 overflow-y-auto m-0">
        <ExploreTabContent nfts={nfts} isActive={tab === "explore"} />
      </TabsContent>
      <TabsContent
        value="friends"
        className="flex-1 flex flex-col items-center justify-center m-0"
      >
        <div className="min-h-full flex flex-col items-center justify-center mb-[150px]">
          <div className="flex flex-col items-center gap-4 max-w-sm mx-auto text-center">
            <div className="w-20 h-20 rounded-full border-2 border-gray-600 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-gray-500" strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Coming Soon</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Conecta con tus amigos
              </p>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="mis-medallas" className="flex-1 overflow-y-auto m-0">
        <MyNftsTab
          nfts={nfts}
          loading={loading}
          error={error}
          refetch={refetch}
          hasWallet={!!user.hasWallet}
        />
      </TabsContent>
    </Tabs>
  );
}
