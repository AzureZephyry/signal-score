import type { EncodedSignal } from "../lib/types";
import { AXIS_WIDTH, RIGHT_PAD } from "../lib/geometry";
export function OutputTable({
  signal,
  bitWidth,
  selected,
  onSelect,
  name,
}: {
  signal: EncodedSignal;
  bitWidth: number;
  selected: number | null;
  onSelect: (index: number) => void;
  name: string;
}) {
  const hasActions = signal.bits.some((bit) => bit.action);
  return (
    <table
      className="output-table"
      aria-label={`${name} per-bit input and output`}
      style={{ width: AXIS_WIDTH + bitWidth * signal.bits.length + RIGHT_PAD }}
    >
      <colgroup>
        <col style={{ width: AXIS_WIDTH }} />
        {signal.bits.map((bit) => (
          <col key={bit.index} style={{ width: bitWidth }} />
        ))}
        <col style={{ width: RIGHT_PAD }} />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">bit</th>
          {signal.bits.map((bit) => (
            <th
              key={bit.index}
              scope="col"
              className={selected === bit.index ? "is-selected" : ""}
            >
              <button
                tabIndex={bit.index === (selected ?? 0) ? 0 : -1}
                data-bit={bit.index}
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
                    event.currentTarget
                      .closest("tr")
                      ?.querySelector<HTMLButtonElement>(
                        `button[data-bit="${next}"]`,
                      )
                      ?.focus({ preventScroll: true });
                  }
                }}
                onClick={() => onSelect(bit.index)}
                aria-label={`Select bit ${bit.index + 1}`}
              >
                {String(bit.index + 1).padStart(2, "0")}
              </button>
            </th>
          ))}
          <th aria-hidden="true" />
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">in</th>
          {signal.bits.map((bit) => (
            <td
              key={bit.index}
              className={selected === bit.index ? "is-selected" : ""}
            >
              {bit.input}
            </td>
          ))}
          <td />
        </tr>
        <tr className="output-row">
          <th scope="row">out</th>
          {signal.bits.map((bit) => (
            <td
              key={bit.index}
              className={selected === bit.index ? "is-selected" : ""}
              data-output={bit.output}
              data-reveal-bit={bit.index}
            >
              <button
                className="output-value"
                tabIndex={-1}
                onClick={() => onSelect(bit.index)}
                aria-label={`Inspect output for bit ${bit.index + 1}`}
              >
                {bit.output}
              </button>
            </td>
          ))}
          <td />
        </tr>
        {hasActions && (
          <tr className="action-row">
            <th scope="row">{signal.id === "rz" ? "mid" : "start"}</th>
            {signal.bits.map((bit) => (
              <td
                data-reveal-bit={bit.index}
                key={bit.index}
                className={selected === bit.index ? "is-selected" : ""}
              >
                {bit.action}
              </td>
            ))}
            <td />
          </tr>
        )}
      </tbody>
    </table>
  );
}
