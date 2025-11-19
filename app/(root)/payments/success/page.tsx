import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h1 className="text-3xl font-bold text-green-500 mb-4">
        ¡Pago completado! 🎉
      </h1>

      <p className="text-gray-300 max-w-md mb-6">
        Gracias por tu compra. Tus tokens estarán disponibles en tu cuenta en
        unos momentos.
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
