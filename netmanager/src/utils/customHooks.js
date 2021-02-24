import { useEffect } from "react";

export function useInitScrollTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}
