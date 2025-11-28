"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ExploreTabContent from "./ExploreTabContent";
import MyNftsTab from "./MyNftsTab";
import { useNFTs } from "@/hooks/useNfts";
import { User } from "@/lib/types";

export default function MainTabs({ user }: { user: User }) {
  const [tab, setTab] = useState("explore");
  const { nfts, loading, error, refetch } = useNFTs(user.id);

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="w-full flex-1 flex flex-col overflow-hidden"
    >
      <TabsList className="w-full h-14 bg-[#32C781] rounded-none shrink-0">
        <TabsTrigger
          value="explore"
          className="flex-1 text-white data-[state=active]:bg-transparent shadow-none border-0 border-b-2 border-b-transparent data-[state=active]:border-b-white rounded-none font-medium text-sm"
        >
          Explore
        </TabsTrigger>

        <TabsTrigger
          value="friends"
          disabled
          className="flex-1 font-bold text-[#1A6E47] cursor-not-allowed text-sm rounded-none"
        >
          Friends
        </TabsTrigger>

        <TabsTrigger
          value="mis-medallas"
          className="flex-1 text-white data-[state=active]:bg-transparent shadow-none border-0 border-b-2 border-b-transparent data-[state=active]:border-b-white rounded-none font-medium"
        >
          Mis Medallas
        </TabsTrigger>
      </TabsList>

      {/* Subtabs */}
      <TabsContent value="explore" className="flex-1 overflow-y-auto m-0">
        <ExploreTabContent nfts={nfts} isActive={tab === "explore"} />
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
