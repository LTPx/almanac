import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-3xl font-bold text-red-500 mb-4">
        Pago cancelado ❌
      </h1>

      <p className="text-gray-300 max-w-md mb-6">
        Parece que el proceso de pago no se completó. Puedes intentarlo
        nuevamente cuando quieras.
      </p>

      <Link
        href="/"
        className="px-6 py-3 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
