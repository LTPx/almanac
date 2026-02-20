"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

export default function SuccessPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const testAttemptId = searchParams.get("testAttemptId");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-3xl font-bold text-green-500 mb-4">
        {t("payments", "successTitle")}
      </h1>

      <p className="text-gray-300 max-w-md mb-6">
        {sessionId
          ? t("payments", "subscriptionText")
          : t("payments", "tokensText")}
      </p>

      {testAttemptId ? (
        <Link
          href={`/?resumeTest=${testAttemptId}`}
          className="px-6 py-3 bg-green-600 rounded-lg text-white hover:bg-green-700 transition font-semibold"
        >
          {t("payments", "backToExam")}
        </Link>
      ) : (
        <Link
          href="/"
          className="px-6 py-3 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition"
        >
          {t("payments", "backToHome")}
        </Link>
      )}
    </div>
  );
}
