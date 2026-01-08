"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ProfileEditPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);

  // Parse date of birth
  const userDateOfBirth = (session?.user as any)?.dateOfBirth
    ? new Date((session?.user as any)?.dateOfBirth)
    : null;

  const [name, setName] = useState((session?.user as any)?.name || "");
  const [email, setEmail] = useState((session?.user as any)?.email || "");
  const [day, setDay] = useState(
    userDateOfBirth ? userDateOfBirth.getDate().toString().padStart(2, "0") : ""
  );
  const [month, setMonth] = useState(
    userDateOfBirth
      ? (userDateOfBirth.getMonth() + 1).toString().padStart(2, "0")
      : ""
  );
  const [year, setYear] = useState(
    userDateOfBirth ? userDateOfBirth.getFullYear().toString() : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar fecha de nacimiento si está presente
    let dateOfBirth = null;
    if (day && month && year) {
      if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
        toast.error("Invalid date format");
        return;
      }

      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      if (
        dayNum < 1 ||
        dayNum > 31 ||
        monthNum < 1 ||
        monthNum > 12 ||
        yearNum < 1900 ||
        yearNum > new Date().getFullYear()
      ) {
        toast.error("Invalid date");
        return;
      }

      dateOfBirth = `${year}-${month}-${day}`;
    }

    setIsUpdating(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          dateOfBirth
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      console.error("Profile update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 2);
    setDay(value);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 2);
    setMonth(value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYear(value);
  };

  return (
    <div className="min-h-screen text-white pb-[60px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <button
          onClick={() => router.back()}
          className="text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-white text-center flex-1">
          Editar Perfil
        </h1>
        <div className="w-6" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-blue-400 mb-2"
          >
            Nombre
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tu nombre completo"
          />
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-blue-400 mb-2"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tu@email.com"
            required
          />
        </div>

        {/* Date of Birth Field */}
        <div>
          <label className="block text-sm font-medium text-blue-400 mb-2">
            Fecha de nacimiento
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={day}
              onChange={handleDayChange}
              placeholder="DD"
              className="w-20 px-3 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={2}
            />
            <span className="text-gray-400">/</span>
            <input
              type="text"
              value={month}
              onChange={handleMonthChange}
              placeholder="MM"
              className="w-20 px-3 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={2}
            />
            <span className="text-gray-400">/</span>
            <input
              type="text"
              value={year}
              onChange={handleYearChange}
              placeholder="YYYY"
              className="w-24 px-3 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={4}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Tu fecha de nacimiento es opcional
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isUpdating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
          >
            {isUpdating ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
