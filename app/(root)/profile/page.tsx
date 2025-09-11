"use client";

import ProfileHeader from "@/components/profile-header";
import ProfileInfo from "@/components/profile-info";
import StatsGrid from "@/components/stats-grid";
import AchievementsProfile from "@/components/achievements-profile";
import { useUser } from "@/context/UserContext";

export default function Profile() {
  const user = useUser();

  const userData = {
    name: user?.name || "",
    username: "",
    joinDate: "Enero 2025",
    avatar: "",
    stats: {
      streak: 3,
      xp: 5200,
      challenges: 7,
      division: "Papel"
    }
  };

  return (
    <div className="min-h-screen bg-[#28538B]">
      <div className="relative px-6 pt-8 pb-24">
        <ProfileHeader avatar={userData.avatar} name={userData.name} />
      </div>
      <div className="bg-[#1B1C1F] rounded-t-3xl -mt-16 pt-8 px-6 min-h-screen">
        <ProfileInfo user={userData} />
        <StatsGrid stats={userData.stats} />
        <AchievementsProfile />
      </div>
    </div>
  );
}
