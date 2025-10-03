"use client";

import UserNFTs from "@/components/nft/user-nfts";
import { useUser } from "@/context/UserContext";

function NftsPage() {
  const user = useUser();
  const userId = user?.id;

  if (!userId) {
    return <div>Login...</div>;
  }

  return (
    <div className="container">
      <UserNFTs userId={userId} />
    </div>
  );
}

export default NftsPage;
