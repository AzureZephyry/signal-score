import { LearningGuide } from "./LearningGuide";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { SAMPLE, validateBits } from "../lib/validation";
import { useReducedMotion } from "../hooks/useReducedMotion";
interface Props {
  confirmedLength: number | null;
  lengthDraft: string;
  bits: string;
  error: string;
  generated: boolean;
  stale: boolean;
  notice: string;
  onLength: (value: string) => void;
  onConfirm: () => void;
  onEditLength: () => void;
  onCancelLength: () => void;
  onBits: (value: string) => void;
  onGenerate: () => void;
  onViewScore: () => void;
}
export function Configuration({
  confirmedLength: length,
  lengthDraft,
  bits,
  error,
  generated,
  stale,
  notice,
  onLength,
  onConfirm,
  onEditLength,
  onCancelLength,
  onBits,
  onGenerate,
  onViewScore,
}: Props) {
  const form = useRef<HTMLDivElement>(null);
  const binaryInput = useRef<HTMLTextAreaElement>(null);
  const previous = useRef<number | null>(null);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    if (length === null) {
      if (previous.current !== null) document.getElementById("length")?.focus();
      previous.current = length;
      return;
    }
    previous.current = length;
    binaryInput.current?.focus({ preventScroll: true });
    binaryInput.current?.scrollIntoView({
      block: "nearest",
      behavior: "instant",
    });
  }, [length]);
  useLayoutEffect(() => {
    if (length === null || reduced) return;
    const ctx = gsap.context(
      () =>
        gsap.from(".binary-stage", {
          y: 5,
          duration: 0.18,
          ease: "power2.out",
        }),
      form,
    );
    return () => ctx.revert();
  }, [length, reduced]);
  const validation = length !== null ? validateBits(bits, length) : null;
  const stage = length === null ? 1 : generated && !stale ? 3 : 2;
  return (
    <div className="configuration" ref={form}>
      <div className="config-label">
        <span className="section-index">01 / COMPOSE</span>
        <h2>
          Start with a<br />
          little information.
        </h2>
        <p>
          Three clear steps.
          <br />
          One sequence. Eight encodings.
        </p>
        <ol className="workflow-steps" aria-label="Encoding workflow">
          {["Set length", "Enter bits", "Read score"].map((label, i) => (
            <li
              key={label}
              aria-current={stage === i + 1 ? "step" : undefined}
              className={stage > i + 1 ? "step-done" : ""}
            >
              <span>{stage > i + 1 ? "✓" : `0${i + 1}`}</span>
              {label}
            </li>
          ))}
        </ol>
        <LearningGuide />
      </div>
      <div className="config-controls">
        <form
          className="length-stage"
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm();
          }}
        >
          <div className="field-heading">
            <label htmlFor="length">Number of bits</label>
            <span className="mono">1–128 BITS</span>
          </div>
          <div className="length-row">
            <span className="step-tag" aria-hidden="true">
              01
            </span>
            <div
              className="length-field"
              data-disabled={length !== null}
              data-invalid={length === null && Boolean(error)}
            >
              <input
                id="length"
                name="length"
                inputMode="numeric"
                type="text"
                value={lengthDraft}
                onChange={(event) => onLength(event.target.value)}
                disabled={length !== null}
                aria-invalid={length === null && Boolean(error)}
                aria-describedby="length-help config-error"
                autoComplete="off"
              />
              <span className="unit" aria-hidden="true">
                bits
              </span>
            </div>
            {length === null ? (
              <button key="set-length" className="button dark" type="submit">
                Set length <span aria-hidden="true">↗</span>
              </button>
            ) : (
              <button
                key="edit-length"
                className="button light"
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  onEditLength();
                }}
              >
                Edit length <span aria-hidden="true">↶</span>
              </button>
            )}
          </div>
          <p className="field-help" id="length-help">
            {length === null
              ? "Step 1 · Confirm a whole-number length to unlock binary entry."
              : `✓ ${length} bits confirmed. Step 2 · Enter exactly ${length} digits below.`}
          </p>
          {length === null && generated && (
            <button
              className="cancel-length"
              type="button"
              onClick={onCancelLength}
            >
              Cancel length change · keep current length
            </button>
          )}
        </form>
        {length === null ? (
          <div className="locked-stage">
            <span className="step-tag" aria-hidden="true">
              02
            </span>
            <span>Binary sequence</span>
            <span className="mono">CONFIRM LENGTH FIRST</span>
          </div>
        ) : (
          <form
            className="binary-stage"
            onSubmit={(event) => {
              event.preventDefault();
              onGenerate();
            }}
          >
            <div className="field-heading">
              <label htmlFor="bits">
                <span className="step-tag" aria-hidden="true">
                  02
                </span>
                Binary sequence
              </label>
              <span
                className={`counter mono ${validation ? "incomplete" : "complete"}`}
              >
                {bits.length} / {length} bits
              </span>
            </div>
            <textarea
              id="bits"
              aria-label="Binary sequence"
              name="bits"
              ref={binaryInput}
              value={bits}
              onChange={(event) => onBits(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onGenerate();
                }
              }}
              placeholder={"0".repeat(Math.min(length, 16))}
              rows={length > 32 ? 3 : 2}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              inputMode="numeric"
              aria-invalid={Boolean(error || /[^01]/.test(bits))}
              aria-describedby="bits-help config-error"
            />
            <p
              id="bits-help"
              className={`field-help ${bits && validation ? "validation-hint" : ""}`}
            >
              {!bits
                ? `Enter ${length} binary digits, with no spaces. Press Enter to generate.`
                : (validation ??
                  "✓ Exact length. Press Enter or Generate to read your score.")}
            </p>
            <div className="input-actions">
              <div className="sample-actions">
                <button
                  type="button"
                  onClick={() => {
                    onBits(SAMPLE);
                    binaryInput.current?.focus();
                  }}
                  disabled={length !== 12}
                  aria-describedby={length !== 12 ? "sample-help" : undefined}
                >
                  Load example <span aria-hidden="true">↙</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const random = crypto.getRandomValues(
                      new Uint8Array(length),
                    );
                    onBits([...random].map((n) => String(n % 2)).join(""));
                    binaryInput.current?.focus();
                  }}
                >
                  Randomize
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onBits("");
                    binaryInput.current?.focus();
                  }}
                >
                  Clear
                </button>
              </div>
              <button type="submit" className="button accent">
                {generated ? "Update waveforms" : "Generate waveforms"}{" "}
                <span aria-hidden="true">→</span>
              </button>
            </div>
            {length !== 12 && (
              <p id="sample-help" className="field-help">
                The example uses 12 bits. Set the length to 12 to load it.
              </p>
            )}
          </form>
        )}
        <p id="config-error" className="error" role="alert">
          {error}
        </p>
        <div className="workflow-feedback">
          <p className="workflow-status" role="status" aria-live="polite">
            {notice}
          </p>
          {generated && (
            <button className="text-link" type="button" onClick={onViewScore}>
              View waveforms ↓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
