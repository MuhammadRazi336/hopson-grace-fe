import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function StickyBarPortal({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setTarget(document.getElementById("sticky-bar-root")), []);
  if (!target) return null;
  return createPortal(children, target);
}

