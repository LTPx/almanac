"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function CancelPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-3xl font-bold text-red-500 mb-4">
        {t("payments", "cancelTitle")}
      </h1>

      <p className="text-gray-300 max-w-md mb-6">
        {t("payments", "cancelDescription")}
      </p>

      <Link
        href="/"
        className="px-6 py-3 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition"
      >
        {t("payments", "backToHome")}
      </Link>
    </div>
  );
}
