import { useState, useEffect } from "react";

type Breakpoint = "mobile" | "tablet" | "desktop" | "wide";

const getBreakpoint = (width: number): Breakpoint => {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  if (width < 1280) return "desktop";
  return "wide";
};

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(
    getBreakpoint(window.innerWidth),
  );
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => {
      setWidth(window.innerWidth);
      setBreakpoint(getBreakpoint(window.innerWidth));
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return {
    breakpoint,
    width,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isDesktop: breakpoint === "desktop" || breakpoint === "wide",
    isWide: breakpoint === "wide",
  };
};
