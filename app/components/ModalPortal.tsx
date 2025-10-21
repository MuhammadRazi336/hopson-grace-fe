import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ModalPortal({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setTarget(document.getElementById("modal-root")), []);
  if (!target) return null;
  return createPortal(children, target);
}
