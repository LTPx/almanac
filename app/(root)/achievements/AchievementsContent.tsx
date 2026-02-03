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
        <TabsList className="w-full h-14 bg-[#1a1a1a] rounded-none shrink-0 relative p-0 gap-0">
          <TabsTrigger
            value="medallas"
            className="flex-1 h-full text-gray-400 data-[state=active]:text-white data-[state=active]:bg-transparent shadow-none border-0 border-b-4 border-b-transparent data-[state=active]:border-b-[#32C781] rounded-none font-semibold transition-all duration-300 relative z-10 data-[state=active]:scale-105"
          >
            Medallas
          </TabsTrigger>
          <TabsTrigger
            value="disponible"
            className="flex-1 h-full text-gray-400 data-[state=active]:text-white data-[state=active]:bg-transparent shadow-none border-0 border-b-4 border-b-transparent data-[state=active]:border-b-[#32C781] rounded-none font-semibold transition-all duration-300 relative z-10 data-[state=active]:scale-105"
          >
            Disponible
          </TabsTrigger>
          <TabsTrigger
            value="explorar"
            className="flex-1 h-full text-gray-400 data-[state=active]:text-white data-[state=active]:bg-transparent shadow-none border-0 border-b-4 border-b-transparent data-[state=active]:border-b-[#32C781] rounded-none font-semibold transition-all duration-300 relative z-10 data-[state=active]:scale-105"
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
