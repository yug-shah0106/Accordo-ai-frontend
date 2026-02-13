import { useEffect } from "react";

/**
 * Observes all `.scroll-reveal` elements and toggles the `.revealed` class
 * every time they enter / leave the viewport.  Supports:
 *   - `data-reveal-delay="<ms>"` for staggered entrance
 *   - `.scroll-reveal-child` children that reveal together with the parent
 *
 * Animations replay on every scroll (not just the first time).
 */
export function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".scroll-reveal");

    if (elements.length === 0) return;

    // Track pending timeouts so we can cancel them when an element leaves
    const pendingTimeouts = new Map<Element, number[]>();

    const clearPending = (el: Element) => {
      const ids = pendingTimeouts.get(el);
      if (ids) {
        ids.forEach((id) => clearTimeout(id));
        pendingTimeouts.delete(el);
      }
    };

    const reveal = (el: HTMLElement) => {
      const delay = Number(el.dataset.revealDelay) || 0;
      const timeoutIds: number[] = [];

      const apply = () => {
        el.classList.add("revealed");
        // Also reveal children marked as scroll-reveal-child
        el.querySelectorAll<HTMLElement>(".scroll-reveal-child").forEach(
          (child) => {
            const childDelay = Number(child.dataset.revealDelay) || 0;
            if (childDelay > 0) {
              const id = window.setTimeout(
                () => child.classList.add("revealed"),
                childDelay,
              );
              timeoutIds.push(id);
            } else {
              child.classList.add("revealed");
            }
          },
        );
      };

      if (delay > 0) {
        const id = window.setTimeout(apply, delay);
        timeoutIds.push(id);
      } else {
        apply();
      }

      pendingTimeouts.set(el, timeoutIds);
    };

    const hide = (el: HTMLElement) => {
      clearPending(el);
      el.classList.remove("revealed");
      el.querySelectorAll<HTMLElement>(".scroll-reveal-child").forEach(
        (child) => child.classList.remove("revealed"),
      );
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            reveal(el);
          } else {
            hide(el);
          }
        });
      },
      { threshold: 0.1 },
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      pendingTimeouts.forEach((ids) => ids.forEach((id) => clearTimeout(id)));
      pendingTimeouts.clear();
    };
  }, []);
}
