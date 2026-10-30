import { GraphGuide } from "./components/LearningGuide";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useKineticMotion } from "./hooks/useKineticMotion";
import { Configuration } from "./components/Configuration";
import { SchemeRow } from "./components/SchemeRow";
import { Legend } from "./components/Legend";
import { ThemeToggle } from "./components/ThemeToggle";
import { ScoreToolbar } from "./components/ScoreToolbar";
import { SCHEMES } from "./lib/schemes";
import { encode } from "./lib/encoding";
import { validateBits, validateLength } from "./lib/validation";
import { AXIS_WIDTH, RIGHT_PAD } from "./lib/geometry";
import type { InitialLevel, SchemeId } from "./lib/types";
import { usePlayback } from "./hooks/usePlayback";
import { useReducedMotion } from "./hooks/useReducedMotion";

export default function App() {
  const [lengthDraft, setLengthDraft] = useState("12");
  const [confirmedLength, setConfirmedLength] = useState<number | null>(null);
  const previousLength = useRef(12);
  const [bits, setBits] = useState("");
  const [sequence, setSequence] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    "Step 1 of 3 · Choose and confirm your bit-stream length.",
  );
  const [generation, setGeneration] = useState(0);
  const [initials, setInitials] = useState({
    "nrz-i": 1 as InitialLevel,
    differential: 1 as InitialLevel,
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const inspected = selected ?? hovered;
  const [focused, setFocused] = useState<SchemeId | null>(null);
  const [activeScheme, setActiveScheme] = useState<SchemeId>("unipolar");
  const [viewportWidth, setViewportWidth] = useState(1000);
  const score = useRef<HTMLDivElement>(null);
  const comparison = useRef<HTMLElement>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const bitWidth = Math.max(
    64,
    (viewportWidth - AXIS_WIDTH - RIGHT_PAD) / Math.max(1, sequence.length),
  );
  const signals = useMemo(
    () =>
      SCHEMES.map((scheme) =>
        encode(
          scheme.id,
          sequence || "0",
          scheme.id === "nrz-i" || scheme.id === "differential"
            ? initials[scheme.id]
            : 1,
        ),
      ),
    [sequence, initials],
  );
  const revision = `${generation}-${initials["nrz-i"]}-${initials.differential}`;
  const playback = usePlayback(
    score,
    sequence.length,
    bitWidth,
    revision,
    generation,
    page,
  );
  const motion = useKineticMotion({
    page,
    comparison,
    reduced,
    generation,
    sequence,
    selected: inspected,
  });
  const stale = Boolean(
    sequence && (bits !== sequence || confirmedLength !== sequence.length),
  );

  useLayoutEffect(() => {
    if (!score.current) return;
    const observer = new ResizeObserver((entries) =>
      setViewportWidth(entries[0].contentRect.width),
    );
    observer.observe(score.current);
    return () => observer.disconnect();
  }, [sequence]);
  useLayoutEffect(() => {
    if (!generation) return;
    score.current?.scrollTo({ left: 0, behavior: "instant" });
    document
      .querySelector<HTMLElement>("#comparison-title")
      ?.focus({ preventScroll: true });
    comparison.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [generation]);
  useEffect(() => {
    if (!sequence) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const threshold =
          (toolbar.current &&
          getComputedStyle(toolbar.current).position === "sticky"
            ? toolbar.current.getBoundingClientRect().bottom
            : 0) + 60;
        let current: SchemeId = "unipolar";
        for (const scheme of SCHEMES) {
          const row = document.getElementById(`row-${scheme.id}`);
          if (row && row.getBoundingClientRect().top <= threshold)
            current = scheme.id;
        }
        setActiveScheme(current);
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, [sequence]);

  const focusField = (id: string) => {
    requestAnimationFrame(() => {
      const field = document.getElementById(id);
      field?.focus({ preventScroll: true });
      field?.scrollIntoView({ block: "center", behavior: "instant" });
    });
  };
  const confirmLength = () => {
    const validation = validateLength(lengthDraft);
    if (validation) {
      setError(validation);
      focusField("length");
      return;
    }
    const length = Number(lengthDraft);
    previousLength.current = length;
    setConfirmedLength(length);
    setLengthDraft(String(length));
    setError("");
    setNotice(
      `Step 2 of 3 · Length confirmed: ${length} bits. Enter exactly ${length} binary digits.`,
    );
  };
  const generate = () => {
    if (confirmedLength === null) {
      setError("Confirm the bit-stream length first.");
      focusField("length");
      return;
    }
    const validation = validateBits(bits, confirmedLength);
    if (validation) {
      setError(validation);
      focusField("bits");
      return;
    }
    setError("");
    setSequence(bits);
    setGeneration((value) => value + 1);
    setSelected(null);
    setHovered(null);
    setActiveScheme("unipolar");
    setNotice(
      `Step 3 of 3 · ${bits.length}-bit score ready. The complete reference trace and tables are ready. Colored drawing is optional and can be interrupted.`,
    );
  };
  const inspectBit = (bit: number) => {
    setSelected(bit);
    setHovered(null);
    playback.finish();
    const el = score.current;
    if (!el) return;
    const left = AXIS_WIDTH + bit * bitWidth;
    if (
      left < el.scrollLeft + AXIS_WIDTH ||
      left + bitWidth > el.scrollLeft + el.clientWidth - RIGHT_PAD
    )
      el.scrollTo({
        left: Math.max(0, left - (el.clientWidth - bitWidth) / 2),
        behavior: "instant",
      });
  };
  const previewBit = (bit: number | null) => {
    if (selected === null) setHovered(bit);
  };
  const returnToInput = () => {
    playback.pause();
    motion.returnToInput();
    focusField(confirmedLength === null ? "length" : "bits");
  };
  const editLength = () => {
    playback.pause();
    setConfirmedLength(null);
    setError("");
    setNotice(
      "Change the length and confirm it. Your current score and binary draft are kept.",
    );
  };
  const jumpToScheme = (id: SchemeId) => {
    setActiveScheme(id);
    const row = document.getElementById(`row-${id}`);
    if (!row) return;
    window.scrollTo({
      top:
        window.scrollY +
        row.getBoundingClientRect().top -
        (toolbar.current &&
        getComputedStyle(toolbar.current).position === "sticky"
          ? toolbar.current.offsetHeight
          : 0) -
        16,
      behavior: "instant",
    });
    motion.revealScheme(id);
  };
  const sourceKey = (event: React.KeyboardEvent, bit: number) => {
    const next =
      event.key === "ArrowRight"
        ? Math.min(sequence.length - 1, bit + 1)
        : event.key === "ArrowLeft"
          ? Math.max(0, bit - 1)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? sequence.length - 1
              : null;
    if (next !== null) {
      event.preventDefault();
      inspectBit(next);
      document
        .querySelector<HTMLButtonElement>(`.kinetic-digit[data-bit="${next}"]`)
        ?.focus({ preventScroll: true });
    }
  };
  return (
    <div
      className={`app ${sequence ? "has-generated-score" : ""}`}
      ref={page}
      onKeyDown={(event) => {
        if (
          event.key === "Escape" &&
          !(
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement ||
            event.target instanceof HTMLSelectElement
          )
        ) {
          setSelected(null);
          setHovered(null);
        }
      }}
    >
      <a className="skip-link" href="#compose">
        Skip to simulator
      </a>
      <header className="masthead">
        <a href="#" className="brand" aria-label="Signal Score home">
          <span className="brand-mark" aria-hidden="true">
            ▰
          </span>{" "}
          SIGNAL / SCORE<span className="brand-edition">Nº 08</span>
        </a>
        <div className="header-actions">
          <a className="masthead-link" href="#compose">
            COMPOSE A SIGNAL <span aria-hidden="true">↙</span>
          </a>
          <ThemeToggle />
        </div>
      </header>
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="status-dot" /> AN INTERACTIVE SIGNAL LABORATORY
            </span>
            <h1 id="hero-title">
              <span className="word-crop">
                <span className="hero-word">
                  <span className="hero-token">Bits</span>{" "}
                  <span className="hero-token">into</span>
                </span>
              </span>
              <span className="word-crop second">
                <span className="hero-word">
                  <span className="hero-token">
                    rhythm<span className="title-period">.</span>
                  </span>
                </span>
              </span>
            </h1>
            <div className="hero-caption">
              <span className="mono">WHAT IS LINE CODING?</span>
              <p>
                Line coding turns digital bits into electrical signal patterns
                over time.
              </p>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-top mono">
              <span>FIG. 01</span>
              <span>DISCRETE / CONTINUOUS</span>
            </div>
            <div className="art-digits">
              <span>1</span>
              <span>0</span>
              <span>1</span>
              <span>1</span>
            </div>
            <svg
              className="hero-signal"
              preserveAspectRatio="none"
              viewBox="0 0 480 160"
              fill="none"
            >
              <path
                className="art-grid"
                d="M0 40H480M0 120H480M60 0V160M180 0V160M300 0V160M420 0V160"
              />
              <path
                pathLength="1"
                className="art-wave shadow"
                d="M0 120H60V40H180V120H300V40H420V120H480"
              />
              <path
                pathLength="1"
                className="art-wave"
                d="M0 40H60V120H180V40H300V120H420V40H480"
              />
            </svg>
            <div className="art-bottom mono">
              <span>INFORMATION TAKES SHAPE</span>
              <span>↗</span>
            </div>
          </div>
        </section>

        <section
          id="compose"
          className="compose-section"
          aria-label="Bit stream configuration"
        >
          <Configuration
            confirmedLength={confirmedLength}
            lengthDraft={lengthDraft}
            bits={bits}
            error={error}
            generated={Boolean(sequence)}
            notice={notice}
            stale={stale}
            onLength={(value) => {
              setLengthDraft(value);
              setError("");
            }}
            onConfirm={confirmLength}
            onEditLength={editLength}
            onCancelLength={() => {
              setConfirmedLength(previousLength.current);
              setLengthDraft(String(previousLength.current));
              setError("");
              setNotice(
                "Length unchanged. Your binary draft is ready to edit.",
              );
            }}
            onBits={(value) => {
              setBits(value);
              setError("");
              if (sequence)
                setNotice(
                  value !== sequence
                    ? "Input edited. Update waveforms to apply your changes; the current score is kept."
                    : "Input matches the current score.",
                );
            }}
            onGenerate={generate}
            onViewScore={() => {
              document
                .getElementById("comparison-title")
                ?.focus({ preventScroll: true });
              comparison.current?.scrollIntoView({
                block: "start",
                behavior: "instant",
              });
            }}
          />
        </section>
        <section
          className={`comparison ${sequence ? "has-score" : ""}`}
          id="score"
          ref={comparison}
          aria-labelledby="comparison-title"
        >
          <div className="score-heading">
            <div>
              <span className="section-index">03 / THE SIGNAL SCORE</span>
              <h2 id="comparison-title" tabIndex={-1}>
                One sequence.
                <br />
                <span>Eight expressions.</span>
              </h2>
            </div>
            <div className="score-intro">
              <span className="small-cross" aria-hidden="true">
                ＋
              </span>
              <p>
                {sequence
                  ? "Time runs left to right; height shows voltage. Each column connects one input bit to its waveform and output labels."
                  : "First confirm a length, then enter your bits. Your eight synchronized encodings will appear here."}
              </p>
            </div>
          </div>
          <GraphGuide />
          {!sequence ? (
            <div className="empty-score">
              <span className="empty-line" aria-hidden="true" />
              <span className="mono">
                {confirmedLength === null
                  ? "STEP 1 · CONFIRM A LENGTH ABOVE"
                  : "STEP 2 · ENTER YOUR BINARY SEQUENCE"}
              </span>
              <button onClick={returnToInput} className="text-link">
                {confirmedLength === null ? "Choose length" : "Enter bits"} ↑
              </button>
            </div>
          ) : (
            <>
              <div className="sequence-strip">
                <span className="eyebrow">
                  SOURCE
                  <br />
                  <span className="mono">{sequence.length} BITS</span>
                </span>
                <div
                  className="kinetic-sequence"
                  aria-label={`Generated sequence ${sequence}`}
                >
                  {[...sequence].map((digit, i) => (
                    <button
                      className={`kinetic-digit ${inspected === i ? "active" : ""}`}
                      data-bit={i}
                      key={`${generation}-${i}`}
                      tabIndex={i === (selected ?? 0) ? 0 : -1}
                      aria-label={`Source bit ${i + 1}: ${digit}`}
                      aria-pressed={selected === i}
                      onClick={() => inspectBit(i)}
                      onKeyDown={(event) => sourceKey(event, i)}
                    >
                      <span className="kinetic-glyph">{digit}</span>
                    </button>
                  ))}
                </div>
                <span className="source-state mono">
                  {stale ? "DRAFT EDITED" : "SCORE READY"}
                </span>
              </div>
              {stale && (
                <p className="stale-notice">
                  {confirmedLength === null
                    ? "Length is being edited."
                    : "Input edited."}{" "}
                  The score shows your last generated sequence. Confirm the
                  length and update the score to apply changes.
                </p>
              )}
              <ScoreToolbar
                toolbarRef={toolbar}
                playback={playback}
                count={sequence.length}
                selected={inspected}
                activeScheme={activeScheme}
                onScheme={jumpToScheme}
                onEdit={returnToInput}
                onSelect={inspectBit}
                onClear={() => {
                  setSelected(null);
                  setHovered(null);
                }}
                scrollable={
                  sequence.length * 64 + AXIS_WIDTH + RIGHT_PAD > viewportWidth
                }
              />
              <div
                className="score-scroll"
                ref={score}
                tabIndex={0}
                role="region"
                aria-label="Eight line coding waveforms and output tables. Scroll horizontally for long sequences."
                style={
                  { "--score-viewport": `${viewportWidth}px` } as CSSProperties
                }
              >
                <div
                  className="score-canvas"
                  style={{
                    width: AXIS_WIDTH + sequence.length * bitWidth + RIGHT_PAD,
                  }}
                >
                  {SCHEMES.map((scheme, index) => (
                    <SchemeRow
                      key={scheme.id}
                      scheme={scheme}
                      index={index}
                      signal={signals[index]}
                      bitWidth={bitWidth}
                      selected={inspected}
                      pinned={selected !== null}
                      focused={focused === scheme.id}
                      onSelect={inspectBit}
                      onPreview={previewBit}
                      onInitial={(level) => {
                        if (
                          scheme.id === "nrz-i" ||
                          scheme.id === "differential"
                        ) {
                          motion.emphasizeInitial(scheme.id);
                          setInitials((previous) => ({
                            ...previous,
                            [scheme.id]: level,
                          }));
                          setNotice(
                            `${scheme.name} updated to initially ${level === 1 ? "high (+V)" : "low (−V)"}. Waveform and output table updated.`,
                          );
                        }
                      }}
                      onFocus={() =>
                        setFocused((previous) =>
                          previous === scheme.id ? null : scheme.id,
                        )
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="score-footnote mono">
                <span>VOLTAGE NORMALIZED TO +1 / 0 / −1</span>
                <span>
                  {playback.reduced
                    ? "REDUCED MOTION · IMMEDIATE REVEAL"
                    : "COLOR FOLLOWS BITS · SHOW ALL TO FINISH"}
                </span>
              </div>
            </>
          )}
        </section>
        <Legend />
        <details className="assignment-note">
          <summary>
            Encoding conventions <span aria-hidden="true">＋</span>
          </summary>
          <p>
            NRZ-L uses 1 = negative; Manchester uses a negative-to-positive
            midpoint transition for 1. AMI and Pseudoternary begin with a
            positive nonzero pulse. Initial high / low means +V / −V immediately
            before the first bit in NRZ-I and Differential Manchester.
          </p>
          <p>
            In Differential Manchester, inv means a beginning-of-bit inversion
            for 0; no inv means no beginning-of-bit inversion for 1. Every bit
            also transitions at its midpoint. The output labels nTp and pTn
            describe negative-to-positive and positive-to-negative midpoint
            transitions.
          </p>
        </details>
      </main>
      <footer>
        <a href="#" className="brand">
          SIGNAL / SCORE
        </a>
        <p>
          A DIGITAL SIGNAL LABORATORY
          <br />
          <span className="mono">BINARY → VOLTAGE</span>
        </p>
        <a href="#compose" className="text-link">
          Back to composition ↑
        </a>
      </footer>
    </div>
  );
}
