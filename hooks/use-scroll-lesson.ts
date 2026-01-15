import { useEffect, useRef } from "react";

interface UseScrollToAvailableNodeOptions {
  enabled?: boolean;
  delay?: number;
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
}

export const useScrollToAvailableNode = (
  dependencies: any[] = [],
  options: UseScrollToAvailableNodeOptions = {}
) => {
  const {
    enabled = true,
    delay = 600,
    behavior = "smooth",
    block = "center"
  } = options;

  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      const availableNodes = Array.from(
        document.querySelectorAll('[data-available-node="true"]')
      );

      if (availableNodes.length === 0) {
        hasScrolledRef.current = true;
        return;
      }

      const sortedNodes = availableNodes.sort((a, b) => {
        const getRow = (el: Element) => {
          const parent = el.closest("[data-row]");
          return parent
            ? parseInt(parent.getAttribute("data-row") || "999")
            : 999;
        };
        return getRow(a) - getRow(b);
      });

      sortedNodes[0]?.scrollIntoView({
        behavior,
        block,
        inline: "center"
      });

      hasScrolledRef.current = true;
    }, delay);

    return () => clearTimeout(timer);
  }, dependencies);

  const resetScroll = () => {
    hasScrolledRef.current = false;
  };

  return {
    hasScrolled: hasScrolledRef.current,
    resetScroll
  };
};
