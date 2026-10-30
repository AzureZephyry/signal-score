import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { EncodedSignal, SchemeId } from "../lib/types";
import { SCHEMES } from "../lib/schemes";
import {
  graphHeight,
  buildReport,
  DEFAULT_SETTINGS,
  tableRows,
  type ReportSettings,
  type ReportModel,
} from "./model";
import { waveformSvg } from "./graphics";
import { createReportFile, downloadReport } from "./download";
import "./report.css";
function Preview({ model }: { model: ReportModel }) {
  const [pageIndex, setPageIndex] = useState(0);
  useEffect(() => setPageIndex(0), [model]);
  const index = Math.min(pageIndex, model.pages.length - 1),
    page = model.pages[index];
  return (
    <section className="report-preview" aria-labelledby="report-preview-title">
      <div className="report-preview-heading">
        <h3 id="report-preview-title">Your report, in view.</h3>
        <span className="mono">A4 LANDSCAPE</span>
      </div>
      <p className="report-preview-note">
        Representative preview with calculated page boundaries. PDF typography
        may differ; Word can reflow when edited or opened in another version.
      </p>
      <nav className="report-page-nav" aria-label="Report preview pages">
        <button
          type="button"
          onClick={() => setPageIndex(index - 1)}
          disabled={index === 0}
          aria-label="Previous report page"
        >
          ←
        </button>
        <span aria-live="polite">
          Page {index + 1} of {model.pages.length}
        </span>
        <button
          type="button"
          onClick={() => setPageIndex(index + 1)}
          disabled={index === model.pages.length - 1}
          aria-label="Next report page"
        >
          →
        </button>
      </nav>
      <div
        className="report-paper-scroll"
        tabIndex={0}
        role="region"
        aria-label="Representative print page. Scroll horizontally on small screens."
      >
        <article
          className="report-paper"
          data-preview-page={index + 1}
          data-grayscale={model.settings.grayscale}
        >
          <div className="print-brand">
            SIGNAL / SCORE <span>REPORT STUDIO</span>
          </div>
          <h4>{model.title}</h4>
          <p>
            {model.sequence.length} bits · {model.schemes.length} schemes ·{" "}
            {model.settings.layout} ·{" "}
            {model.settings.organization === "range"
              ? "Compare by bit range"
              : "Study by encoding scheme"}
          </p>
          <p className="print-source">
            <strong>Source</strong> {model.sequence}
          </p>
          <h5>
            Bits {page.range.start + 1}–{page.range.end}{" "}
            <span>
              {model.sequence.slice(page.range.start, page.range.end)}
            </span>
          </h5>
          {page.blocks.map((block, i) => (
            <section className="print-block" key={`${block.scheme.id}-${i}`}>
              <h6>
                {block.scheme.name}
                {block.kind === "reasoning" ? " · Bit reasoning" : ""}
              </h6>
              {block.kind === "signal" ? (
                <>
                  <p className="print-rule">{block.rules.join(" ")}</p>
                  {block.description.length > 0 && (
                    <p>{block.description.join(" ")}</p>
                  )}
                  <p className="print-state">{block.state}</p>
                  <div
                    className="print-waveform"
                    dangerouslySetInnerHTML={{
                      __html: waveformSvg(
                        block,
                        model.settings.grayscale,
                        undefined,
                        graphHeight(model.settings),
                        model.settings.content !== "worksheet",
                      ),
                    }}
                  />
                  {model.settings.tables && (
                    <table className="print-table">
                      <colgroup>
                        <col style={{ width: "5.72%" }} />
                        {block.bits.map((b) => (
                          <col key={b.index} />
                        ))}
                        <col style={{ width: "1.56%" }} />
                      </colgroup>
                      <tbody>
                        {tableRows(block, model.settings).map((row) => (
                          <tr key={row.label}>
                            <th scope="row">{row.label}</th>
                            {row.values.map((v, j) => (
                              <td key={j}>{v}</td>
                            ))}
                            <td />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              ) : (
                block.entries.map((entry) => (
                  <p className="print-reason" key={entry.index}>
                    {entry.lines.join(" ")}
                  </p>
                ))
              )}
            </section>
          ))}
          <div className="print-page-foot">
            <span>Normalized voltage levels</span>
            <span>
              {index + 1} / {model.pages.length}
            </span>
          </div>
        </article>
      </div>
      <details className="report-page-outline">
        <summary>
          Page plan · {model.pages.length} pages / {model.columns} bits per
          segment maximum
        </summary>
        <ol>
          {model.pages.map((p, i) => (
            <li key={i}>
              <button
                type="button"
                aria-current={i === index ? "page" : undefined}
                onClick={() => setPageIndex(i)}
              >
                <strong>{i + 1}</strong> Bits {p.range.start + 1}–{p.range.end}{" "}
                ·{" "}
                {p.blocks
                  .map(
                    (b) =>
                      b.scheme.name +
                      (b.kind === "reasoning" ? " reasoning" : ""),
                  )
                  .join(", ")}
              </button>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
export function ReportStudio({
  sequence,
  signals,
  onClose,
}: {
  sequence: string;
  signals: EncodedSignal[];
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    heading = useRef<HTMLHeadingElement>(null),
    alive = useRef(true);
  const [settings, setSettings] = useState<ReportSettings>(() => ({
    ...DEFAULT_SETTINGS,
    schemes: [...DEFAULT_SETTINGS.schemes],
  }));
  const [selection, setSelection] = useState<"all" | "custom">("all");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [status, setStatus] = useState("");
  const result = useMemo(() => {
    try {
      return { model: buildReport(sequence, signals, settings), error: "" };
    } catch (error) {
      return {
        model: null,
        error:
          error instanceof Error
            ? error.message
            : "Choose valid report settings.",
      };
    }
  }, [sequence, signals, settings]);
  useLayoutEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    alive.current = true;
    dialog.current?.showModal();
    heading.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      alive.current = false;
      dialog.current?.close();
      document.body.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
  }, []);
  const update = <K extends keyof ReportSettings>(
    key: K,
    value: ReportSettings[K],
  ) => {
    setSettings((s) => ({ ...s, [key]: value }));
    setError("");
    setStatus("");
  };
  const selectScheme = (id: SchemeId) =>
    update(
      "schemes",
      settings.schemes.includes(id)
        ? settings.schemes.filter((s) => s !== id)
        : [...settings.schemes, id],
    );
  const exportReport = async () => {
    if (!result.model || busy) return;
    setBusy(true);
    setError("");
    setStatus("Preparing your complete report…");
    try {
      const file = await createReportFile(result.model);
      if (alive.current) {
        downloadReport(file);
        setStatus(
          `${settings.format === "pdf" ? "PDF" : "Word"} report ready. Your download has started.`,
        );
      }
    } catch (error) {
      if (alive.current) {
        setError(
          error instanceof Error
            ? error.message
            : "The report could not be created. Please try again.",
        );
        setStatus("");
      }
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  return (
    <dialog
      className="report-dialog"
      ref={dialog}
      aria-labelledby="report-studio-title"
      aria-describedby="report-studio-description"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="report-header">
        <div>
          <span className="section-index">SIGNAL / SCORE · REPORT STUDIO</span>
          <h2 id="report-studio-title" ref={heading} tabIndex={-1}>
            From signal to page.
          </h2>
          <p id="report-studio-description">
            Shape a readable report from your generated score. Your current
            initial conditions are included.
          </p>
        </div>
        <button
          type="button"
          className="report-close"
          aria-label="Close Report Studio"
          onClick={onClose}
        >
          Close ×
        </button>
      </header>
      <div className="report-workspace">
        <form
          className="report-settings"
          onSubmit={(e) => {
            e.preventDefault();
            void exportReport();
          }}
        >
          <fieldset disabled={busy}>
            <legend>Report settings</legend>
            <label className="report-field">
              Report content
              <select
                aria-label="Report content"
                value={settings.content}
                onChange={(e) =>
                  update("content", e.target.value as ReportSettings["content"])
                }
              >
                <option value="report">Waveform report</option>
                <option value="worksheet">
                  Practice worksheet · empty grids
                </option>
                <option value="answer-key">
                  Answer key · calculated signals
                </option>
              </select>
            </label>
            {settings.content === "worksheet" && (
              <p className="report-field-help">
                Draw your own signals on empty grids. Choose Answer key to
                export the calculated waveforms separately with the same
                sequence and initial conditions.
              </p>
            )}
            <label className="report-field">
              Output format
              <select
                aria-label="Output format"
                value={settings.format}
                onChange={(e) =>
                  update("format", e.target.value as ReportSettings["format"])
                }
              >
                <option value="pdf">PDF · vector waveforms</option>
                <option value="docx">Word (.docx) · editable tables</option>
              </select>
            </label>
            <label className="report-field">
              Report layout
              <select
                aria-label="Report layout"
                value={settings.layout}
                onChange={(e) =>
                  update("layout", e.target.value as ReportSettings["layout"])
                }
              >
                <option value="compact">Compact</option>
                <option value="detailed">Detailed</option>
                <option value="study">Study</option>
              </select>
            </label>
            <p className="report-field-help">
              {settings.layout === "study"
                ? "Adds contextual, per-bit reasoning on separate pages."
                : settings.layout === "compact"
                  ? "Shorter plots and denser segments; labels remain readable."
                  : "A balanced view of waveforms, labels and encoding rules."}
            </p>
            <label className="report-field">
              Organization
              <select
                aria-label="Organization"
                value={settings.organization}
                onChange={(e) =>
                  update(
                    "organization",
                    e.target.value as ReportSettings["organization"],
                  )
                }
              >
                <option value="range">Compare by bit range</option>
                <option value="scheme">Study by encoding scheme</option>
              </select>
            </label>
            <label className="report-field">
              Encoding schemes
              <select
                aria-label="Encoding schemes"
                value={selection}
                onChange={(e) => {
                  const mode = e.target.value as typeof selection;
                  setSelection(mode);
                  if (mode === "all")
                    update(
                      "schemes",
                      SCHEMES.map((s) => s.id),
                    );
                }}
              >
                <option value="all">All eight</option>
                <option value="custom">Custom selection</option>
              </select>
            </label>
            {selection === "custom" && (
              <fieldset className="report-scheme-list">
                <legend>Include schemes</legend>
                {SCHEMES.map((s) => (
                  <label className="report-check" key={s.id}>
                    <input
                      type="checkbox"
                      checked={settings.schemes.includes(s.id)}
                      onChange={() => selectScheme(s.id)}
                    />
                    {s.name}
                  </label>
                ))}
              </fieldset>
            )}
            <fieldset className="report-options">
              <legend>Optional content</legend>
              {(
                [
                  ["explanations", "Encoding explanations"],
                  ["tables", "Per-bit output tables"],
                  ["positions", "Original bit positions"],
                  ["grayscale", "Grayscale-friendly printing"],
                ] as const
              ).map(([key, label]) => (
                <label className="report-check" key={key}>
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(e) => update(key, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
              {settings.layout === "study" &&
                settings.content !== "worksheet" && (
                  <label className="report-check">
                    <input
                      type="checkbox"
                      checked={settings.reasoning}
                      onChange={(e) => update("reasoning", e.target.checked)}
                    />
                    Detailed reasoning
                  </label>
                )}
            </fieldset>
          </fieldset>
          <div className="report-initials">
            <strong>Generated score</strong>
            <span>
              {sequence.length} bits · {result.model?.schemes.length ?? 0}{" "}
              selected schemes
            </span>
            {signals
              .filter((s) => s.initial !== undefined)
              .map((s) => (
                <span key={s.id}>
                  {SCHEMES.find((meta) => meta.id === s.id)!.name}: initially{" "}
                  {s.initial === 1 ? "high (+V)" : "low (−V)"}
                </span>
              ))}
          </div>
          <p className="report-local-note">
            Created on your device. Your sequence is not uploaded.
          </p>
        </form>
        {result.model ? (
          <Preview model={result.model} />
        ) : (
          <section className="report-preview report-empty">
            <h3>Choose your schemes.</h3>
            <p>
              Select at least one encoding scheme to preview and export the
              report.
            </p>
          </section>
        )}
      </div>
      <footer className="report-footer">
        <div>
          <p className="report-error" role="alert">
            {error || result.error}
          </p>
          <p role="status" aria-live="polite">
            {status ||
              (result.model
                ? `${result.model.pages.length} planned pages · ${result.model.columns} bits per segment maximum`
                : "No report to export yet.")}
          </p>
        </div>
        <button
          type="button"
          className="button accent"
          disabled={busy || !result.model}
          onClick={() => void exportReport()}
        >
          {busy
            ? "Preparing report…"
            : `Download ${settings.format === "pdf" ? "PDF" : "Word report"}`}{" "}
          <span aria-hidden="true">↓</span>
        </button>
      </footer>
    </dialog>
  );
}
