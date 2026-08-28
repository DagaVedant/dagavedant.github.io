import { useEffect, useState } from "react";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export const NARROW_QUERY = "(max-width: 1023px)";
export const MOBILE_QUERY = "(max-width: 767px)";
export const COARSE_QUERY = "(pointer: coarse)";

export const useIsNarrow = () => useMediaQuery(NARROW_QUERY);
export const useIsMobile = () => useMediaQuery(MOBILE_QUERY);

export default useMediaQuery;
