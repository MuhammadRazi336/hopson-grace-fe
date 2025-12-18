import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function AlertPortal({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setTarget(document.getElementById("alert-root")), []);
  if (!target) return null;
  return createPortal(children, target);
}

