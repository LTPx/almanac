"use client";

import StoreContent from "@/components/store-content";
import { useRouter } from "next/navigation";

export default function StorePage() {
  const router = useRouter();

  return <StoreContent onBack={() => router.back()} showBackButton={true} />;
}
