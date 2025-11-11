import { Metadata } from "next";
import NFTPublicPage from "./public-page";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;

  try {
    // Fetch NFT data para metadata
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/public/nfts/${id}`,
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      return {
        title: "NFT Not Found",
        description: "This NFT could not be found."
      };
    }

    const nft = await response.json();

    const title = `${nft.nftAsset?.name || "NFT"} - ${nft.collectionName || "Collection"}`;
    const description =
      nft.nftAsset?.collection?.description ||
      `Check out this NFT from ${nft.collectionName || "the collection"}`;
    const imageUrl = nft.nftAsset?.imageUrl || "/placeholder.png";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 1200,
            alt: nft.nftAsset?.name || "NFT"
          }
        ],
        type: "website"
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl]
      }
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "NFT",
      description: "View this unique NFT"
    };
  }
}

export default function Page() {
  return <NFTPublicPage />;
}
