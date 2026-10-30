import { useLayoutEffect, type RefObject } from "react";
import { SCHEMES } from "../lib/schemes";
import type { SchemeId } from "../lib/types";
import type { usePlayback } from "../hooks/usePlayback";
interface Props {
  toolbarRef: RefObject<HTMLDivElement | null>;
  playback: ReturnType<typeof usePlayback>;
  count: number;
  selected: number | null;
  activeScheme: SchemeId;
  onScheme: (id: SchemeId) => void;
  onEdit: () => void;
  onSelect: (index: number) => void;
  onClear: () => void;
  scrollable: boolean;
}
export function ScoreToolbar({
  toolbarRef,
  playback,
  count,
  selected,
  activeScheme,
  onScheme,
  onEdit,
  onSelect,
  onClear,
  scrollable,
}: Props) {
  useLayoutEffect(() => {
    if (!toolbarRef.current) return;
    const observer = new ResizeObserver(() =>
      document.documentElement.style.setProperty(
        "--toolbar-height",
        `${toolbarRef.current!.offsetHeight}px`,
      ),
    );
    observer.observe(toolbarRef.current);
    return () => observer.disconnect();
  }, [toolbarRef]);
  const index = SCHEMES.findIndex((scheme) => scheme.id === activeScheme);
  return (
    <div
      className="score-toolbar"
      ref={toolbarRef}
      role="region"
      aria-label="Score controls"
    >
      <nav className="scheme-navigation" aria-label="Encoding schemes">
        <label htmlFor="scheme-jump">
          Jump to scheme
          <select
            id="scheme-jump"
            aria-label="Jump to scheme"
            value={activeScheme}
            onChange={(event) => onScheme(event.target.value as SchemeId)}
          >
            {SCHEMES.map((scheme, i) => (
              <option key={scheme.id} value={scheme.id}>
                {String(i + 1).padStart(2, "0")} · {scheme.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="nav-arrow"
          aria-label="Previous scheme"
          title="Previous scheme"
          disabled={index === 0}
          onClick={() => onScheme(SCHEMES[index - 1].id)}
        >
          ↑
        </button>
        <button
          className="nav-arrow"
          aria-label="Next scheme"
          title="Next scheme"
          disabled={index === SCHEMES.length - 1}
          onClick={() => onScheme(SCHEMES[index + 1].id)}
        >
          ↓
        </button>
        <button className="button light toolbar-edit" onClick={onEdit}>
          Edit input <span aria-hidden="true">↑</span>
        </button>
      </nav>
      <div className="transport">
        <div className="playback-controls" aria-label="Timeline controls">
          <button
            className="button dark play-button"
            onClick={playback.playing ? playback.pause : playback.play}
            aria-label={playback.playing ? "Pause playback" : "Play playback"}
          >
            {playback.playing
              ? "Ⅱ Pause"
              : playback.completed === count
                ? "↻ Replay"
                : "▶ Play"}
          </button>
          <button onClick={playback.reset} aria-label="Reset playback">
            Reset ↶
          </button>
          <button
            onClick={playback.step}
            aria-label="Step one bit"
            disabled={playback.completed === count}
          >
            Step →
          </button>
          <button onClick={playback.finish} aria-label="Show all bits">
            Show all
          </button>
        </div>
        <div className="timeline-scrub">
          <label htmlFor="timeline" className="sr-only">
            Playback position in bits
          </label>
          <input
            id="timeline"
            type="range"
            min={0}
            max={count}
            step={1}
            value={playback.completed}
            onChange={(event) => playback.seek(Number(event.target.value))}
            aria-valuetext={`${playback.completed} of ${count} bits revealed`}
          />
          <span className="playback-status mono">
            {String(playback.completed).padStart(2, "0")} /{" "}
            {String(count).padStart(2, "0")} BITS
          </span>
        </div>
      </div>
      <div className="score-guide">
        <span className="mono">
          {selected === null
            ? "SELECT A BIT TO COMPARE ALL EIGHT"
            : `INSPECTING BIT ${String(selected + 1).padStart(2, "0")}`}
        </span>
        <div className="bit-navigation">
          <button
            aria-label="Previous bit"
            title="Previous bit"
            disabled={selected === null || selected === 0}
            onClick={() => onSelect(selected! - 1)}
          >
            ←
          </button>
          <label className="sr-only" htmlFor="inspect-bit">
            Inspect bit number
          </label>
          <input
            id="inspect-bit"
            type="number"
            min={1}
            max={count}
            value={selected === null ? "" : selected + 1}
            placeholder="Bit"
            onChange={(event) => {
              const bit = Number(event.target.value);
              if (Number.isInteger(bit) && bit >= 1 && bit <= count)
                onSelect(bit - 1);
            }}
          />
          <button
            aria-label="Next bit"
            title="Next bit"
            disabled={selected === count - 1}
            onClick={() => onSelect(selected === null ? 0 : selected + 1)}
          >
            →
          </button>
        </div>
        <button
          onClick={onClear}
          aria-label="Clear selection"
          title="Clear selection (Escape)"
          disabled={selected === null}
        >
          Clear ×
        </button>
        <span className="scroll-hint">
          {scrollable
            ? "SCROLL SIGNALS ↔ · TAP TO PIN A BIT"
            : "TAP TO PIN · ARROW KEYS TO MOVE"}
        </span>
      </div>
    </div>
  );
}
