"use client";

import { ExploreTab } from "@/components/explore-tab";
import { EducationalNFTAsset } from "@/lib/types";

export default function ExploreTabContent({
  nfts,
  isActive
}: {
  nfts: EducationalNFTAsset[];
  isActive: boolean;
}) {
  return <ExploreTab nfts={nfts} isActive={isActive} />;
}
