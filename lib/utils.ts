import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function isInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export const getExplorerUrl = (contractAddress: string, tokenId: string) => {
  return `https://amoy.polygonscan.com/token/${contractAddress}?a=${tokenId}`;
};

export function normalizeText(text: string = ""): string {
  return text
    .normalize("NFD") // separa caracteres base y tildes
    .replace(/[\u0300-\u036f]/g, "") // elimina las marcas diacríticas
    .toLowerCase()
    .trim();
}

/**
 * Calcula la distancia de Levenshtein entre dos strings.
 * Representa el número mínimo de operaciones (inserción, eliminación, sustitución)
 * necesarias para transformar una cadena en otra.
 */
export function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: b.length + 1 }, (_, i) => [
    i
  ]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1, // sustitución
              matrix[i][j - 1] + 1, // inserción
              matrix[i - 1][j] + 1 // eliminación
            );
    }
  }
  return matrix[b.length][a.length];
}
