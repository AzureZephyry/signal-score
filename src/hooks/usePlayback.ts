import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { AXIS_WIDTH } from "../lib/geometry";
import { useReducedMotion } from "./useReducedMotion";
export function usePlayback(
  root: RefObject<HTMLDivElement | null>,
  count: number,
  bitWidth: number,
  revision: string,
  generation: number,
  source: RefObject<HTMLDivElement | null>,
) {
  const reduced = useReducedMotion();
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const width = useRef(bitWidth);
  const repaint = useRef<() => void>(() => {});
  const lastGeneration = useRef(0);
  const pendingStart = useRef<number[]>([]);
  const cancelStart = () => {
    pendingStart.current.forEach(cancelAnimationFrame);
    pendingStart.current = [];
  };
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(count);
  useLayoutEffect(() => {
    width.current = bitWidth;
    repaint.current();
  }, [bitWidth]);
  useLayoutEffect(() => {
    if (!root.current || !count) return;
    const el = root.current;
    const shouldAnimate = generation !== lastGeneration.current && !reduced;
    lastGeneration.current = generation;
    const cells = [...el.querySelectorAll<HTMLElement>("[data-reveal-bit]")];
    const digits = [
      ...source.current!.querySelectorAll<HTMLElement>(".kinetic-digit"),
    ];
    const groups = new Map<number, HTMLElement[]>();
    cells.forEach((cell) => {
      const bit = Number(cell.dataset.revealBit);
      groups.set(bit, [...(groups.get(bit) ?? []), cell]);
    });
    let active = -1;
    const clearActive = () => {
      cells.forEach((cell) => cell.classList.remove("is-playback-active"));
      digits.forEach((digit) => digit.classList.remove("is-timeline-bit"));
    };
    const scope = gsap.context(() => {
      const masks = el.querySelectorAll(".signal-reveal");
      const cursors = el.querySelectorAll(".playback-cursor");
      const proxy = { bit: 0 };
      let last = -1;
      const paint = () => {
        gsap.set(masks, { attr: { width: 12 + proxy.bit * width.current } });
        gsap.set(cursors, {
          attr: {
            x1: AXIS_WIDTH + proxy.bit * width.current,
            x2: AXIS_WIDTH + proxy.bit * width.current,
          },
        });
        el.dataset.revealBit = String(proxy.bit);
        el.style.setProperty(
          "--reveal-fraction",
          String(proxy.bit - Math.floor(proxy.bit)),
        );
        const whole = Math.min(count, Math.floor(proxy.bit + 0.0001));
        const next = whole < count ? whole : -1;
        if (next !== active) {
          clearActive();
          active = next;
          if (next >= 0) {
            groups
              .get(next)
              ?.forEach((cell) => cell.classList.add("is-playback-active"));
            digits[next]?.classList.add("is-timeline-bit");
          }
        }
        if (whole !== last) {
          setCompleted(whole);
          last = whole;
        }
      };
      repaint.current = paint;
      const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
          setPlaying(false);
          el.dataset.playState = "complete";
          clearActive();
        },
      });
      tl.to(proxy, {
        bit: count,
        duration: Math.min(7, Math.max(1.6, count * 0.26)),
        ease: "none",
        onUpdate: paint,
      });
      timeline.current = tl;
      if (shouldAnimate) {
        paint();
        el.dataset.playState = "playing";
        setPlaying(true);
        pendingStart.current.push(
          requestAnimationFrame(() => {
            pendingStart.current.push(
              requestAnimationFrame(() => {
                if (
                  timeline.current === tl &&
                  el.dataset.playState === "playing"
                )
                  tl.play(0);
              }),
            );
          }),
        );
      } else {
        tl.progress(1).pause();
        setCompleted(count);
        setPlaying(false);
        el.dataset.playState = "complete";
      }
    }, root);
    return () => {
      cancelStart();
      timeline.current = null;
      repaint.current = () => {};
      clearActive();
      gsap.killTweensOf(el.querySelectorAll(".playback-cursor"));
      scope.revert();
      delete el.dataset.playState;
    };
  }, [root, count, revision, generation, source]);
  useLayoutEffect(() => {
    if (reduced) {
      timeline.current?.pause().progress(1);
      setCompleted(count);
      setPlaying(false);
      if (root.current) root.current.dataset.playState = "complete";
    }
  }, [reduced, count, root]);
  const play = () => {
    cancelStart();
    const tl = timeline.current;
    if (!tl) return;
    if (reduced) {
      tl.pause().progress(1);
      setPlaying(false);
      return;
    }
    if (tl.progress() >= 1) tl.restart();
    else tl.play();
    setPlaying(true);
    if (root.current) root.current.dataset.playState = "playing";
  };
  const pause = () => {
    cancelStart();
    timeline.current?.pause();
    setPlaying(false);
    if (root.current) root.current.dataset.playState = "paused";
  };
  const seek = (bit: number) => {
    cancelStart();
    const next = Math.min(count, Math.max(0, bit));
    timeline.current?.pause().progress(next / count);
    setCompleted(next);
    setPlaying(false);
    if (root.current) {
      root.current.dataset.playState = next === count ? "complete" : "paused";
      if (!reduced)
        pendingStart.current.push(
          requestAnimationFrame(() => {
            pendingStart.current.push(
              requestAnimationFrame(() => {
                if (
                  root.current &&
                  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
                )
                  gsap.fromTo(
                    root.current.querySelectorAll(".playback-cursor"),
                    { strokeWidth: 2.5 },
                    {
                      strokeWidth: 1.25,
                      duration: 0.35,
                      autoRound: false,
                      ease: "power2.out",
                      overwrite: true,
                    },
                  );
              }),
            );
          }),
        );
    }
  };
  const reset = () => seek(0);
  const step = () => seek(completed + 1);
  const finish = () => seek(count);
  return {
    playing,
    completed,
    reduced,
    play,
    pause,
    reset,
    step,
    finish,
    seek,
  };
}
