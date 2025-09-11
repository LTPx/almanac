import { CardNFT } from "@/components/car-nft";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

async function Achievements() {
  const medals = [
    {
      id: 1,
      name: "Algebra 3",
      year: "2025",
      image: "/api/placeholder/120/120"
    },
    {
      id: 2,
      name: "Algebra 2",
      year: "2024",
      image: "/api/placeholder/120/120"
    },
    {
      id: 3,
      name: "Curso",
      year: "2025",
      image: "/api/placeholder/120/120"
    }
  ];

  return (
    <div className="AchievementPage min-h-screen">
      <h4 className="text-[30px] pt-[20px]">Medallas</h4>
      <div className="px-4 pt-6">
        <div className="grid grid-cols-2 gap-4 mb-8">
          {medals.map((medal) => (
            <CardNFT key={medal.id} image={medal.image} title={medal.name} />
          ))}
        </div>

        <Button className="w-full h-[60px] bg-[#1983DD] hover:bg-[#1A73E8] text-white py-4 text-base font-medium rounded-lg mb-8">
          Crear Nueva Medalla (NFT)
        </Button>
      </div>
    </div>
  );
}

export default Achievements;
