import { AnimatedExplanation } from "./AnimatedExplanation";
import type { EncodedSignal, InitialLevel, Scheme } from "../lib/types";
import { SCHEME_SUMMARIES, explainBit } from "../lib/explanations";
import { Waveform } from "./Waveform";
import { OutputTable } from "./OutputTable";
interface Props {
  scheme: Scheme;
  index: number;
  signal: EncodedSignal;
  bitWidth: number;
  selected: number | null;
  focused: boolean;
  pinned: boolean;
  onPreview: (bit: number | null) => void;
  onSelect: (bit: number) => void;
  onInitial: (level: InitialLevel) => void;
  onFocus: () => void;
}
export function SchemeRow({
  scheme,
  index,
  signal,
  bitWidth,
  selected,
  focused,
  pinned,
  onPreview,
  onSelect,
  onInitial,
  onFocus,
}: Props) {
  const bit = selected !== null ? signal.bits[selected] : undefined;
  return (
    <article
      className={`scheme-row ${focused ? "is-focused" : ""}`}
      data-scheme={scheme.id}
      id={`row-${scheme.id}`}
      aria-labelledby={`scheme-${scheme.id}`}
    >
      <div className="scheme-header">
        <span className="scheme-number">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="scheme-title">
          <span className="eyebrow">{scheme.family}</span>
          <h3 tabIndex={-1} id={`scheme-${scheme.id}`}>
            {scheme.name}
          </h3>
        </div>
        <p className="scheme-rule">{scheme.rule}</p>
        <div className="scheme-tools">
          {scheme.stateful && (
            <label className="initial-control">
              Initial voltage
              <select
                aria-label={`${scheme.name} initial voltage`}
                value={signal.initial}
                onChange={(event) =>
                  onInitial(Number(event.target.value) as InitialLevel)
                }
              >
                <option value={1}>+V (high)</option>
                <option value={-1}>−V (low)</option>
              </select>
            </label>
          )}
          <button
            className="focus-button"
            onClick={onFocus}
            aria-expanded={focused}
            aria-controls={`detail-${scheme.id}`}
          >
            {focused ? "Hide explanation" : "Explain encoding"}
            <span aria-hidden="true">{focused ? "−" : "+"}</span>
          </button>
        </div>
      </div>
      <p className="scheme-summary">{SCHEME_SUMMARIES[scheme.id]}</p>
      <AnimatedExplanation open={focused}>
        <div className="focus-detail" id={`detail-${scheme.id}`}>
          <div>
            <span className="eyebrow">THE ENCODING RULE</span>
            <h4>{scheme.short}</h4>
            <p>{scheme.detail}</p>
          </div>
          <div className="bit-readout">
            <span className="eyebrow">
              {bit
                ? `WHY BIT ${String(bit.index + 1).padStart(2, "0")} DOES THIS`
                : "TRY SELECTING A BIT"}
            </span>
            <strong>
              {bit ? `${bit.input} → ${bit.output}` : "Choose a bit"}
            </strong>
            <p className="bit-explanation">
              {bit
                ? explainBit(signal, bit.index)
                : "Click a source digit, a waveform interval, or an output label to see why that particular bit creates its signal. You can also use the arrow keys."}
            </p>
            {bit && (
              <p className="interval-readout">
                {bit.segments
                  .map(
                    (segment, i) =>
                      `${bit.segments.length === 2 ? `${i === 0 ? "First" : "Second"} half` : "Whole bit"}: ${segment.level === 1 ? "+V" : segment.level === -1 ? "−V" : "0V"}`,
                  )
                  .join(" · ")}
                {bit.action
                  ? ` · ${bit.action === "RZ" ? "Return to zero" : `${bit.action} at start`}`
                  : ""}
              </p>
            )}
          </div>
        </div>
      </AnimatedExplanation>
      <Waveform
        signal={signal}
        bitWidth={bitWidth}
        selected={selected}
        onSelect={onSelect}
        onPreview={onPreview}
        pinned={pinned}
        name={scheme.name}
      />
      <OutputTable
        signal={signal}
        bitWidth={bitWidth}
        selected={selected}
        onSelect={onSelect}
        name={scheme.name}
      />
    </article>
  );
}
