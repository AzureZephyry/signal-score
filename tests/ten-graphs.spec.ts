import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { unzipSync, strFromU8 } from "fflate";
const ids = [
  "unipolar",
  "nrz-l",
  "nrz-i",
  "nrz-i-low",
  "rz",
  "manchester",
  "differential",
  "differential-low",
  "ami",
  "pseudoternary",
];
async function generate(page: Page, sequence = "10100110") {
  await page.goto("/");
  await page
    .getByLabel("Number of bits", { exact: true })
    .fill(String(sequence.length));
  await page.getByRole("button", { name: "Set length", exact: true }).click();
  await page.getByLabel("Binary sequence", { exact: true }).fill(sequence);
  await page
    .getByRole("button", { name: "Generate waveforms", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Show all bits", exact: true })
    .click();
}
for (const sequence of ["10100110", "00110011"])
  for (const theme of ["day", "night"]) {
    test(`${sequence} / ${theme}: ten navigable graphs and exact contrasting boundary circles`, async ({
      page,
    }, info) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.addInitScript(
        (theme) => localStorage.setItem("signal-score-theme", theme),
        theme,
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      await generate(page, sequence);
      await page.evaluate(
        (theme) => (document.documentElement.dataset.theme = theme),
        theme,
      );
      await expect(page.locator(".scheme-number")).toHaveText(
        ids.map((_, i) => String(i + 1).padStart(2, "0")),
      );
      expect(
        await page
          .locator("#scheme-jump option")
          .evaluateAll((options) =>
            options.map((o) => (o as HTMLOptionElement).value),
          ),
      ).toEqual(ids);
      await expect(page.locator(".initial-control select")).toHaveCount(0);
      for (const id of ids) {
        await page
          .getByLabel("Jump to scheme", { exact: true })
          .selectOption(id);
        await expect(page.locator(`#scheme-${id}`)).toBeInViewport();
        await expect(
          page.getByLabel("Jump to scheme", { exact: true }),
        ).toHaveValue(id);
      }
      await expect(
        page.getByRole("button", { name: "Next scheme", exact: true }),
      ).toBeDisabled();
      await page
        .getByRole("button", { name: "Previous scheme", exact: true })
        .click();
      await expect(
        page.getByLabel("Jump to scheme", { exact: true }),
      ).toHaveValue("ami");
      for (const id of [
        "nrz-i",
        "nrz-i-low",
        "differential",
        "differential-low",
      ]) {
        const row = page.locator(`#row-${id}`);
        await page
          .getByLabel("Jump to scheme", { exact: true })
          .selectOption(id);
        const markers = await row
          .locator(".inversion-marker")
          .evaluateAll((circles) =>
            circles.map((c) => ({
              cx: Number(c.getAttribute("cx")),
              cy: Number(c.getAttribute("cy")),
              decision: c.getAttribute("data-decision"),
              fill: getComputedStyle(c).fill,
              stroke: getComputedStyle(c).stroke,
              visible: getComputedStyle(c).visibility,
            })),
          );
        const start = Number(
          await row.locator(".bit-boundary").first().getAttribute("x1"),
        );
        const width =
          Number(await row.locator(".bit-boundary").nth(1).getAttribute("x1")) -
          start;
        let previous = id.endsWith("-low") ? -1 : 1;
        expect(markers).toHaveLength(8);
        markers.forEach((marker, i) => {
          const invert = sequence[i] === (id.startsWith("nrz-i") ? "1" : "0");
          const level = invert ? -previous : previous;
          expect(marker.cx).toBeCloseTo(start + i * width);
          expect(marker.cy).toBe(level === 1 ? 48 : 120);
          expect(marker.decision).toBe(invert ? "invert" : "hold");
          expect(marker.visible).toBe("visible");
          if (invert) expect(marker.fill).toBe(marker.stroke);
          else expect(marker.fill).not.toBe(marker.stroke);
          previous = id.startsWith("differential") ? -level : level;
        });
        const circle = await row
          .locator(".inversion-marker")
          .first()
          .boundingBox();
        const axis = await row.locator(".voltage-axis").boundingBox();
        expect(circle!.x).toBeGreaterThan(axis!.x + axis!.width);
        await row.screenshot({
          path: info.outputPath(`${sequence}-${theme}-${id}.png`),
        });
      }
      await page.locator("#row-differential-low .bit-hit").nth(0).click();
      await expect(page.locator(".output-row .is-selected")).toHaveCount(10);
      await page
        .locator("#row-differential-low")
        .getByRole("button", { name: "Explain encoding", exact: true })
        .click();
      await expect(
        page.locator("#row-differential-low .bit-explanation"),
      ).toContainText(
        sequence[0] === "0"
          ? "solid circle (invert)"
          : "hollow circle (no invert)",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - innerWidth,
        ),
      ).toBeLessThanOrEqual(1);
      if (info.project.name === "mobile")
        await expect(page.locator(".score-toolbar")).toHaveCSS(
          "position",
          "static",
        );
      expect(errors).toEqual([]);
    });
  }
test("reset, step, replay, seek and inspection keep markers synchronized with immutable traces", async ({
  page,
}) => {
  await generate(page);
  const paths = await page
    .locator(".signal-path")
    .evaluateAll((els) => els.map((e) => e.getAttribute("d")));
  await page
    .getByRole("button", { name: "Reset playback", exact: true })
    .click();
  const visible = () =>
    page
      .locator(".inversion-marker")
      .evaluateAll(
        (els) =>
          els.filter((e) => getComputedStyle(e).visibility === "visible")
            .length,
      );
  expect(await visible()).toBe(0);
  await page.getByRole("button", { name: "Step one bit", exact: true }).click();
  expect(await visible()).toBe(4);
  await page.getByLabel("Playback position in bits", { exact: true }).fill("5");
  expect(await visible()).toBe(20);
  await page
    .getByRole("button", { name: "Show all bits", exact: true })
    .click();
  expect(await visible()).toBe(32);
  await page
    .getByRole("button", { name: "Play playback", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Pause playback", exact: true })
    .click();
  const position = await page
    .locator(".score-scroll")
    .getAttribute("data-reveal-bit");
  expect(await visible()).toBe(4 * Math.ceil(Number(position) - 0.00001));
  await page
    .getByLabel("Jump to scheme", { exact: true })
    .selectOption("differential-low");
  await page
    .getByRole("button", { name: "Show all bits", exact: true })
    .click();
  expect(
    await page
      .locator(".signal-path")
      .evaluateAll((els) => els.map((e) => e.getAttribute("d"))),
  ).toEqual(paths);
});
test("Report Studio independently selects ten variants and embeds actual markers in PDF and Word", async ({
  page,
}, info) => {
  await generate(page);
  await page
    .getByRole("button", { name: "Reset playback", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Export Report", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Encoding schemes", { exact: true })
    .selectOption("custom");
  await expect(dialog.locator(".report-scheme-list input:checked")).toHaveCount(
    10,
  );
  await dialog.screenshot({ path: info.outputPath("ten-graph-studio.png") });
  const [pdfDownload] = await Promise.all([
    page.waitForEvent("download"),
    dialog.getByRole("button", { name: "Download PDF", exact: true }).click(),
  ]);
  const bytes = await readFile((await pdfDownload.path())!);
  expect((await PDFDocument.load(bytes)).getPageCount()).toBe(5);
  await dialog
    .getByLabel("Output format", { exact: true })
    .selectOption("docx");
  const [docxDownload] = await Promise.all([
    page.waitForEvent("download"),
    dialog
      .getByRole("button", { name: "Download Word report", exact: true })
      .click(),
  ]);
  const files = unzipSync(await readFile((await docxDownload.path())!));
  const xml = strFromU8(files["word/document.xml"]);
  expect((xml.match(/<w:tbl>/g) || []).length).toBe(10);
  const svg = Object.entries(files)
    .filter(([name]) => name.endsWith(".svg"))
    .map(([, data]) => strFromU8(data))
    .join("");
  expect((svg.match(/data-decision=/g) || []).length).toBe(32);
  expect(svg).toContain("No invert / bit start");
  for (const name of [
    "Polar NRZ-I — Initially High",
    "Differential Manchester — Initially Low",
  ])
    await dialog.getByRole("checkbox", { name, exact: true }).uncheck();
  await expect(dialog.locator(".report-initials")).toContainText(
    "8 selected graphs",
  );
  await dialog
    .getByLabel("Report content", { exact: true })
    .selectOption("worksheet");
  await expect(dialog.locator(".print-waveform circle")).toHaveCount(0);
  await expect(dialog.locator(".print-waveform polyline")).toHaveCount(0);
  await dialog
    .getByLabel("Report content", { exact: true })
    .selectOption("answer-key");
  await expect(dialog.locator(".print-waveform polyline")).not.toHaveCount(0);
});
test("128 bits retain navigable ten-graph geometry and segmented preview decisions", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await generate(page, "1010011000110011".repeat(8));
  await page
    .getByLabel("Jump to scheme", { exact: true })
    .selectOption("differential-low");
  const row = page.locator("#row-differential-low");
  await expect(row.locator(".inversion-marker")).toHaveCount(128);
  await page
    .locator(".score-scroll")
    .evaluate((el) => (el.scrollLeft = el.scrollWidth));
  await row.locator(".bit-hit").last().click();
  await expect(page.locator(".output-row .is-selected")).toHaveCount(10);
  await page
    .getByRole("button", { name: "Export Report", exact: true })
    .click();
  const d = page.getByRole("dialog");
  await d
    .getByLabel("Encoding schemes", { exact: true })
    .selectOption("custom");
  for (const label of await d.locator(".report-scheme-list label").all())
    if (
      !(await label.innerText()).includes(
        "Differential Manchester — Initially Low",
      )
    )
      await label.locator("input").uncheck();
  await d
    .getByRole("button", { name: "Next report page", exact: true })
    .click();
  await expect(d.locator(".print-state")).toContainText("Continued at bit 17");
  await expect(d.locator(".print-waveform [data-bit]").first()).toHaveAttribute(
    "data-bit",
    "17",
  );
  await expect(d.locator(".print-waveform [data-decision]")).toHaveCount(16);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
});
