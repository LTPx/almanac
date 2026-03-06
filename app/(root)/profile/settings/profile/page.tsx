"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import { useTranslation } from "@/hooks/useTranslation";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

export default function ProfileEditPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      setName(user.name || "");
      setEmail(user.email || "");

      if (user.dateOfBirth) {
        const dateOfBirth = dayjs.utc(user.dateOfBirth);
        setDay(dateOfBirth.format("DD"));
        setMonth(dateOfBirth.format("MM"));
        setYear(dateOfBirth.format("YYYY"));
      }
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let dateOfBirth = null;
    if (day && month && year) {
      if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
        toast.error(t("profileEdit", "invalidDateFormat"));
        return;
      }

      const dateString = `${year}-${month}-${day}`;
      const date = dayjs(dateString, "YYYY-MM-DD", true);

      if (!date.isValid()) {
        toast.error(t("profileEdit", "invalidDate"));
        return;
      }

      if (date.isAfter(dayjs())) {
        toast.error(t("profileEdit", "futureDateError"));
        return;
      }

      if (date.isBefore(dayjs("1900-01-01"))) {
        toast.error(t("profileEdit", "ancientDateError"));
        return;
      }

      dateOfBirth = date.format("YYYY-MM-DD");
    }

    setIsUpdating(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, dateOfBirth })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("profileEdit", "updateError"));
      }

      toast.success(t("profileEdit", "updateSuccess"));
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || t("profileEdit", "updateError"));
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
          {t("profileEdit", "title")}
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
            {t("profileEdit", "name")}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t("profileEdit", "namePlaceholder")}
          />
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-blue-400 mb-2"
          >
            {t("profileEdit", "email")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t("profileEdit", "emailPlaceholder")}
            required
          />
        </div>

        {/* Date of Birth Field */}
        <div>
          <label className="block text-sm font-medium text-blue-400 mb-2">
            {t("profileEdit", "dateOfBirth")}
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
            {t("profileEdit", "dateOfBirthOptional")}
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isUpdating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
          >
            {isUpdating
              ? t("profileEdit", "saving")
              : t("profileEdit", "saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  );
}
