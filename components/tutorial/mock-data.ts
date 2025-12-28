export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface MockNFT {
  id: string;
  tokenId: string;
  contractAddress: string;
  transactionHash: string;
  mintedAt: string;
  metadata: NFTMetadata;
}

export const MOCK_MINTED_NFT: MockNFT = {
  id: "nft-tutorial-1",
  tokenId: "12345",
  contractAddress: "0x1234567890abcdef",
  transactionHash: "0xabcdef1234567890",
  mintedAt: new Date().toISOString(),
  metadata: {
    name: "Certificado de Educación Básica",
    description:
      "Logro obtenido por completar exitosamente la unidad de Educación Básica",
    image:
      "https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?w=600&h=600&fit=crop",
    attributes: [
      { trait_type: "Nivel", value: "Básico" },
      { trait_type: "Año", value: "2024" }
    ]
  }
};
