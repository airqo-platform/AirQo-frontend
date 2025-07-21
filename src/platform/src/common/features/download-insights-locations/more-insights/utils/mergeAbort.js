import { useRef, useEffect } from 'react';

export default function useMergeAbort() {
  const ref = useRef({});
  useEffect(
    () => () => {
      Object.values(ref.current).forEach((ctrl) =>
        ctrl?.abort ? ctrl.abort() : clearTimeout(ctrl),
      );
    },
    [],
  );
  return ref;
}
