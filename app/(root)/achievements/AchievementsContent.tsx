"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/lib/types";
import MyNftsTab from "./nft/tabs/MyNftsTab";
import { useNFTs } from "@/hooks/useNfts";
import ExploreTabContent from "./nft/tabs/ExploreTabContent";
import { useState } from "react";
import TokenAvailableCard from "./nft/tabs/ready-tab";
import { useSearchParams } from "next/navigation";

export default function AchievementsContent({ user }: { user: User }) {
  const { nfts, loading, error, refetch } = useNFTs(user.id);
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || "medallas");

  return (
    <div className="AchievementPage bg-black flex flex-col">
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="w-full flex-1 flex flex-col "
      >
        <TabsList className="w-full h-14 bg-[#32C781] rounded-none shrink-0 relative p-0 gap-0">
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/30"></div>
          <TabsTrigger
            value="medallas"
            className="flex-1 h-full text-white data-[state=active]:bg-transparent shadow-none border-0 border-b-2 border-b-transparent data-[state=active]:border-b-white rounded-none font-medium transition-all duration-300 relative z-10"
          >
            Medallas
          </TabsTrigger>
          <TabsTrigger
            value="disponible"
            className="flex-1 h-full text-white data-[state=active]:bg-transparent shadow-none border-0 border-b-2 border-b-transparent data-[state=active]:border-b-white rounded-none font-medium transition-all duration-300 relative z-10"
          >
            Disponible
          </TabsTrigger>
          <TabsTrigger
            value="explorar"
            className="flex-1 h-full text-white data-[state=active]:bg-transparent shadow-none border-0 border-b-2 border-b-transparent data-[state=active]:border-b-white rounded-none font-medium transition-all duration-300 relative z-10"
          >
            Explorar
          </TabsTrigger>
        </TabsList>
        <TabsContent value="medallas" className="min-h-screen py-[20px] flex-1">
          <MyNftsTab
            nfts={nfts}
            loading={loading}
            error={error}
            refetch={refetch}
            hasWallet={!!user.hasWallet}
          />
        </TabsContent>
        <TabsContent
          value="disponible"
          className="min-h-screen py-[20px] flex-1 flex flex-col"
        >
          <TokenAvailableCard />
        </TabsContent>
        <TabsContent
          value="explorar"
          className="min-h-screen py-[20px] flex-1 flex flex-col"
        >
          <ExploreTabContent nfts={nfts} isActive={tab === "explorar"} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
