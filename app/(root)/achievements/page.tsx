"use client";

import { useUser } from "@/context/UserContext";

async function Achievements() {
  const user = useUser();
  const userId = user?.id;

  if (!userId) {
    return <div>Login...</div>;
  }
  return (
    <div className="AchievementPage">
      <div></div>
    </div>
  );
}

export default Achievements;
