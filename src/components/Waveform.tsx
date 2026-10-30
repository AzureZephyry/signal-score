import { useId } from "react";
import type { EncodedSignal } from "../lib/types";
import {
  AXIS_WIDTH,
  bitX,
  GRAPH_HEIGHT,
  RIGHT_PAD,
  stepPath,
  voltageY,
} from "../lib/geometry";
interface Props {
  signal: EncodedSignal;
  bitWidth: number;
  selected: number | null;
  onSelect: (bit: number) => void;
  name: string;
  pinned: boolean;
  onPreview: (bit: number | null) => void;
}
export function Waveform({
  signal,
  bitWidth,
  selected,
  onSelect,
  name,
  pinned,
  onPreview,
}: Props) {
  const clipId = useId().replace(/:/g, "");
  const width = AXIS_WIDTH + signal.bits.length * bitWidth + RIGHT_PAD;
  return (
    <div className="plot-shell">
      <svg
        className="waveform"
        width={width}
        height={GRAPH_HEIGHT}
        viewBox={`0 0 ${width} ${GRAPH_HEIGHT}`}
        role="group"
        aria-label={`${name} waveform. Arrow keys move between bits; Enter pins a bit.`}
        onMouseLeave={() => onPreview(null)}
      >
        <defs>
          <clipPath id={clipId}>
            <rect
              className="signal-reveal"
              x={AXIS_WIDTH - 12}
              y="30"
              width={signal.bits.length * bitWidth + 12}
              height="104"
            />
          </clipPath>
        </defs>
        {selected !== null && (
          <rect
            className="selected-interval"
            x={bitX(selected, bitWidth)}
            y="8"
            width={bitWidth}
            height="134"
          />
        )}
        {([1, 0, -1] as const).map((level) => (
          <line
            key={level}
            className={level === 0 ? "zero-grid" : "voltage-grid"}
            x1={AXIS_WIDTH}
            x2={width - RIGHT_PAD}
            y1={voltageY(level)}
            y2={voltageY(level)}
          />
        ))}
        {Array.from({ length: signal.bits.length + 1 }, (_, index) => (
          <line
            className="bit-boundary"
            key={index}
            x1={bitX(index, bitWidth)}
            x2={bitX(index, bitWidth)}
            y1="32"
            y2="136"
          />
        ))}
        {signal.bits.map((bit) => (
          <g key={bit.index}>
            {bit.segments.length === 2 && (
              <line
                className="mid-boundary"
                x1={bitX(bit.index + 0.5, bitWidth)}
                x2={bitX(bit.index + 0.5, bitWidth)}
                y1="36"
                y2="132"
              />
            )}
            <text
              className={`bit-digit ${selected === bit.index ? "active" : ""}`}
              data-reveal-bit={bit.index}
              x={bitX(bit.index + 0.5, bitWidth)}
              y="23"
              textAnchor="middle"
            >
              {bit.input}
            </text>
          </g>
        ))}
        <path
          className="signal-reference"
          d={stepPath(signal, bitWidth)}
          aria-hidden="true"
        />
        <path
          className="signal-path"
          d={stepPath(signal, bitWidth)}
          clipPath={`url(#${clipId})`}
        />
        <line
          className="playback-cursor"
          x1={width - RIGHT_PAD}
          x2={width - RIGHT_PAD}
          y1="32"
          y2="136"
        />
        {signal.bits.map((bit) => (
          <g
            key={bit.index}
            data-bit={bit.index}
            className="bit-hit"
            role="button"
            tabIndex={bit.index === (selected ?? 0) ? 0 : -1}
            aria-label={`Inspect bit ${bit.index + 1}, input ${bit.input}, output ${bit.output}${bit.action ? `, ${bit.action}` : ""}`}
            aria-pressed={pinned && selected === bit.index}
            onClick={() => onSelect(bit.index)}
            onMouseEnter={() => onPreview(bit.index)}
            onFocus={() => onPreview(bit.index)}
            onBlur={() => onPreview(null)}
            onKeyDown={(event) => {
              const next =
                event.key === "ArrowRight"
                  ? Math.min(signal.bits.length - 1, bit.index + 1)
                  : event.key === "ArrowLeft"
                    ? Math.max(0, bit.index - 1)
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? signal.bits.length - 1
                        : null;
              if (next !== null) {
                event.preventDefault();
                onSelect(next);
                event.currentTarget.parentElement
                  ?.querySelector<SVGGElement>(`.bit-hit[data-bit="${next}"]`)
                  ?.focus({ preventScroll: true });
              } else if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(bit.index);
              }
            }}
          >
            <rect
              x={bitX(bit.index, bitWidth) + 1}
              y="8"
              width={bitWidth - 2}
              height="130"
              fill="transparent"
            />
          </g>
        ))}
        <text
          x={width - RIGHT_PAD}
          y="151"
          textAnchor="end"
          className="time-label"
        >
          Time →
        </text>
      </svg>
      <svg
        className="voltage-axis"
        width={AXIS_WIDTH}
        height={GRAPH_HEIGHT}
        viewBox={`0 0 ${AXIS_WIDTH} ${GRAPH_HEIGHT}`}
        aria-hidden="true"
      >
        {([1, 0, -1] as const).map((level) => (
          <text
            key={level}
            className="voltage-label"
            x="35"
            y={voltageY(level) + 4}
            textAnchor="end"
          >
            {level === 1 ? "+V" : level === 0 ? "0V" : "−V"}
          </text>
        ))}
        {signal.initial !== undefined && (
          <text
            x={AXIS_WIDTH - 4}
            y="151"
            textAnchor="end"
            className="time-label"
          >
            init {signal.initial === 1 ? "+" : "−"}
          </text>
        )}
      </svg>
    </div>
  );
}
