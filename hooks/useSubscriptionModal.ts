import { useState } from "react";

export function useSubscriptionModal(userId: string, testAttemptId?: number) {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      closeModal();

      const response = await fetch("/api/payments/stripe/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, testAttemptId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear suscripción");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Ocurrió un error al procesar tu suscripción");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    showModal,
    isLoading,
    openModal,
    closeModal,
    handleSubscribe
  };
}
