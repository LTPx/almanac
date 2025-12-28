import React from "react";

export const FloatingParticles = () => {
  const particles = Array.from({ length: 15 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background:
              i % 3 === 0 ? "#32C781" : i % 3 === 1 ? "#1983DD" : "#1A73E8",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float-${i} ${2 + Math.random()}s ease-in-out ${Math.random() * 2}s infinite`
          }}
        />
      ))}
      <style>{`
        ${particles
          .map(
            (_, i) => `
          @keyframes float-${i} {
            0%, 100% { transform: translateY(0) scale(0); opacity: 0; }
            50% { transform: translateY(-20px) scale(1.5); opacity: 1; }
          }
        `
          )
          .join("")}
      `}</style>
    </div>
  );
};

export const EnergyRings = () => (
  <>
    <div
      className="absolute inset-0 rounded-lg border-2 border-[#32C781]"
      style={{ animation: "pulse-ring-1 2s ease-in-out infinite" }}
    />
    <div
      className="absolute inset-0 rounded-lg border-2 border-[#1983DD]"
      style={{ animation: "pulse-ring-2 2s ease-in-out 0.5s infinite" }}
    />
    <style>{`
      @keyframes pulse-ring-1 {
        0%, 100% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.1); opacity: 0.6; }
      }
      @keyframes pulse-ring-2 {
        0%, 100% { transform: scale(1); opacity: 0.2; }
        50% { transform: scale(1.15); opacity: 0.5; }
      }
    `}</style>
  </>
);
