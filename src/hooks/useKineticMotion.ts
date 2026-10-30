import { useLayoutEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import type { SchemeId } from "../lib/types";
interface Options {
  page: RefObject<HTMLDivElement | null>;
  comparison: RefObject<HTMLElement | null>;
  reduced: boolean;
  generation: number;
  sequence: string;
  selected: number | null;
}
export function useKineticMotion({
  page,
  comparison,
  reduced,
  generation,
  sequence,
  selected,
}: Options) {
  const hero = useRef<gsap.core.Timeline | null>(null);
  const navigation = useRef<gsap.core.Timeline | null>(null);
  const inspection = useRef<gsap.core.Timeline | null>(null);
  const returning = useRef<gsap.core.Tween | null>(null);
  const initial = useRef<gsap.core.Tween | null>(null);
  useLayoutEffect(() => {
    if (reduced || !page.current || generation > 0) return;
    let startFrame = 0,
      playFrame = 0;
    const scope = gsap.context(() => {
      gsap.set(".hero-word", { y: 0 });
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
      });
      tl.fromTo(
        ".hero-token",
        { yPercent: 110, rotationZ: 2 },
        { yPercent: 0, rotationZ: 0, duration: 1, stagger: 0.13 },
        0.04,
      )
        .fromTo(
          ".hero .eyebrow",
          { y: 10, opacity: 0.5 },
          { y: 0, opacity: 1, duration: 0.65 },
          0.1,
        )
        .fromTo(
          ".art-digits span",
          { yPercent: 65, rotationX: -65, opacity: 0.35 },
          {
            yPercent: 0,
            rotationX: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.11,
          },
          0.22,
        )
        .fromTo(
          ".art-wave",
          { attr: { "stroke-dasharray": 1, "stroke-dashoffset": 1 } },
          {
            attr: { "stroke-dashoffset": 0 },
            duration: 1.6,
            ease: "power2.inOut",
            stagger: 0.15,
          },
          0.3,
        )
        .fromTo(
          ".hero-caption,.art-top,.art-bottom",
          { y: 12, opacity: 0.5 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.09 },
          0.48,
        )
        .fromTo(
          ".config-label .section-index,.config-label h2,.workflow-steps",
          { y: 12 },
          { y: 0, duration: 0.6, stagger: 0.06 },
          0.62,
        );
      hero.current = tl;
      startFrame = requestAnimationFrame(() => {
        playFrame = requestAnimationFrame(() => {
          if (!page.current?.classList.contains("has-generated-score"))
            tl.play(0);
        });
      });
    }, page);
    return () => {
      cancelAnimationFrame(startFrame);
      cancelAnimationFrame(playFrame);
      hero.current = null;
      scope.revert();
    };
  }, [page, reduced]);
  useLayoutEffect(() => {
    if (!generation || reduced || !comparison.current) return;
    hero.current?.progress(1).pause();
    let startFrame = 0,
      playFrame = 0;
    const scope = gsap.context(() => {
      const tl = gsap
        .timeline({ paused: true })
        .fromTo(
          ".score-heading",
          { y: 20 },
          { y: 0, duration: 0.6, ease: "power3.out" },
          0,
        )
        .fromTo(
          ".kinetic-glyph",
          {
            y: 18,
            rotationX: -50,
            transformPerspective: 600,
            transformOrigin: "50% 100%",
          },
          {
            y: 0,
            rotationX: 0,
            duration: 0.65,
            stagger: Math.min(0.045, 0.65 / sequence.length),
            ease: "power3.out",
          },
          0.08,
        )
        .fromTo(
          ".scheme-number",
          { x: -10, opacity: 0.5 },
          { x: 0, opacity: 1, duration: 0.5, stagger: 0.045 },
          0.2,
        );
      startFrame = requestAnimationFrame(() => {
        playFrame = requestAnimationFrame(() => tl.play(0));
      });
    }, comparison);
    return () => {
      cancelAnimationFrame(startFrame);
      cancelAnimationFrame(playFrame);
      scope.revert();
    };
  }, [generation, sequence, reduced, comparison]);
  useLayoutEffect(() => {
    inspection.current?.kill();
    if (selected === null || reduced || !comparison.current) return;
    const scope = gsap.context(() => {
      inspection.current = gsap
        .timeline()
        .fromTo(
          ".selected-interval",
          { strokeWidth: 5, opacity: 0.5 },
          {
            strokeWidth: 1.5,
            opacity: 1,
            duration: 0.48,
            ease: "power2.out",
            autoRound: false,
          },
          0,
        )
        .fromTo(
          ".output-row .is-selected .output-value",
          { y: -5 },
          { y: 0, duration: 0.34, ease: "power3.out" },
          0.02,
        )
        .fromTo(
          ".bit-readout strong",
          { y: 7 },
          { y: 0, duration: 0.34, ease: "power3.out" },
          0.02,
        );
    }, comparison);
    return () => scope.revert();
  }, [selected, reduced, comparison]);
  useLayoutEffect(
    () => () => {
      navigation.current?.kill();
      inspection.current?.kill();
      returning.current?.kill();
      initial.current?.kill();
    },
    [],
  );
  useLayoutEffect(() => {
    if (reduced) {
      navigation.current?.progress(1).kill();
      returning.current?.progress(1).kill();
      initial.current?.progress(1).kill();
    }
  }, [reduced]);
  const revealScheme = (id: SchemeId) => {
    navigation.current?.progress(1).kill();
    if (reduced) return;
    const row = document.getElementById(`row-${id}`);
    if (!row) return;
    navigation.current = gsap
      .timeline()
      .fromTo(
        row.querySelector(".scheme-header"),
        { y: 12 },
        { y: 0, duration: 0.4, ease: "power3.out" },
        0,
      )
      .fromTo(
        row.querySelectorAll(".scheme-summary,.plot-shell,.output-table"),
        { y: 10 },
        {
          y: 0,
          duration: 0.42,
          stagger: 0.035,
          ease: "power3.out",
        },
        0.04,
      );
  };
  const returnToInput = () => {
    returning.current?.progress(1).kill();
    if (reduced || !page.current) return;
    returning.current = gsap.fromTo(
      page.current.querySelector(".configuration"),
      { y: 12 },
      { y: 0, duration: 0.4, ease: "power3.out" },
    );
  };
  const emphasizeInitial = (id: SchemeId) => {
    initial.current?.progress(1).kill();
    if (reduced) return;
    const row = document.getElementById(`row-${id}`);
    if (row)
      initial.current = gsap.fromTo(
        row.querySelector(".signal-path"),
        { strokeWidth: 5 },
        { strokeWidth: 3, duration: 0.5, ease: "power3.out", autoRound: false },
      );
  };
  return { revealScheme, returnToInput, emphasizeInitial };
}
