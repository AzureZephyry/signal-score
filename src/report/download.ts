import type { ReportModel } from "./model";
export async function createReportFile(
  model: ReportModel,
): Promise<{ bytes: Uint8Array; mime: string; filename: string }> {
  const format = model.settings.format;
  const bytes =
    format === "pdf"
      ? await (await import("./pdf")).generatePdf(model)
      : await (await import("./docx")).generateDocx(model);
  if (bytes.length < 100)
    throw new Error("The report could not be completed. Please try again.");
  return {
    bytes,
    mime:
      format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    filename: `Signal-Score-${model.sequence.length}bits-${model.settings.layout}-${model.settings.content}.${format}`,
  };
}
export function downloadReport(
  file: Awaited<ReturnType<typeof createReportFile>>,
) {
  const blob = new Blob([new Uint8Array(file.bytes)], { type: file.mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
