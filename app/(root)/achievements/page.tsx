"use client";

import { useUser } from "@/context/UserContext";
import AchievementsContent from "./AchievementsContent";

function Achievements() {
  const user = useUser();
  const userId = user?.id;

  if (!userId) {
    return <div>Login...</div>;
  }

  return <AchievementsContent user={user} />;
}

export default Achievements;
