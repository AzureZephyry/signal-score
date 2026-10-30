import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useReducedMotion } from "../hooks/useReducedMotion";
export function AnimatedExplanation({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  const [present, setPresent] = useState(open);
  const node = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const entered = useRef(false);
  useLayoutEffect(() => {
    if (open && !present) {
      setPresent(true);
      return;
    }
    if (!present || !node.current) return;
    const el = node.current;
    if (reduced) {
      el.style.height = "auto";
      if (!open) setPresent(false);
      return;
    }
    const target = open ? el.scrollHeight : 0;
    const start = entered.current ? el.getBoundingClientRect().height : 0;
    entered.current = true;
    const tween = gsap.fromTo(
      el,
      { height: start },
      {
        height: target,
        duration: open ? 0.4 : 0.24,
        ease: open ? "power3.out" : "power2.inOut",
        overwrite: true,
        paused: true,
        onComplete: () => {
          if (open) el.style.height = "auto";
          else {
            entered.current = false;
            setPresent(false);
          }
        },
      },
    );
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => tween.play(0));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      tween.kill();
    };
  }, [open, present, reduced]);
  return present ? (
    <div
      className="explanation-stage"
      ref={node}
      inert={!open}
      aria-hidden={!open}
      data-open={open}
    >
      {children}
    </div>
  ) : null;
}
