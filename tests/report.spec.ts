import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { strFromU8, unzipSync } from "fflate";
async function openStudio(page: Page, value = "111001011000") {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Export Report", exact: true }),
  ).toHaveCount(0);
  await page
    .getByLabel("Number of bits", { exact: true })
    .fill(String(value.length));
  await page.getByRole("button", { name: "Set length", exact: true }).click();
  await page.getByLabel("Binary sequence", { exact: true }).fill(value);
  await page
    .getByRole("button", { name: "Generate waveforms", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Source bit 4: 0", exact: true })
    .click();
  await page
    .getByLabel("Polar NRZ-I initial voltage", { exact: true })
    .selectOption("-1");
  await page
    .getByRole("button", { name: "Reset playback", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Export Report", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
}
test("Report Studio previews and exports actual PDF and editable Word data, independent of playback", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await openStudio(page);
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "From signal to page." }),
  ).toBeFocused();
  await expect(
    dialog.getByText(/Representative preview with calculated page boundaries/),
  ).toBeVisible();
  await expect(dialog.locator(".report-initials")).toContainText(
    "initially low",
  );
  await expect(dialog.locator(".report-page-nav")).toContainText("Page 1 of 4");
  const [pdfDownload] = await Promise.all([
    page.waitForEvent("download"),
    dialog.getByRole("button", { name: "Download PDF", exact: true }).click(),
  ]);
  const pdf = await PDFDocument.load(
    await readFile((await pdfDownload.path())!),
  );
  expect(pdf.getPageCount()).toBe(4);
  expect(pdf.getTitle()).toBe("Digital line coding report");
  await dialog
    .getByLabel("Output format", { exact: true })
    .selectOption("docx");
  const [wordDownload] = await Promise.all([
    page.waitForEvent("download"),
    dialog
      .getByRole("button", { name: "Download Word report", exact: true })
      .click(),
  ]);
  const files = unzipSync(await readFile((await wordDownload.path())!));
  const xml = strFromU8(files["word/document.xml"]);
  expect((xml.match(/<w:tbl>/g) || []).length).toBe(8);
  expect(xml).toContain("Initial level -V");
  expect(xml).toContain("nTp");
  expect(xml).toContain('w:orient="landscape"');
  expect(
    Object.entries(files)
      .filter(([name]) => name.endsWith(".png"))
      .every(([, data]) => data.length > 1000),
  ).toBe(true);
  await dialog
    .getByRole("button", { name: "Close Report Studio", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Export Report", exact: true }),
  ).toBeFocused();
  await expect(page.locator(".output-row .is-selected")).toHaveCount(8);
  expect(errors).toEqual([]);
});
test("custom schemes, Study reasoning, grayscale and maximum input paginate without page overflow", async ({
  page,
}) => {
  await openStudio(page, "1110010110001010".repeat(8));
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Encoding schemes", { exact: true })
    .selectOption("custom");
  for (const name of [
    "Unipolar NRZ",
    "Polar NRZ-L",
    "Polar RZ",
    "Manchester",
    "Differential Manchester",
    "Bipolar Pseudoternary",
  ])
    await dialog.getByRole("checkbox", { name, exact: true }).uncheck();
  await expect(dialog.locator(".report-initials")).toContainText(
    "2 selected schemes",
  );
  await dialog
    .getByLabel("Report layout", { exact: true })
    .selectOption("compact");
  await expect(dialog.locator(".report-page-nav")).toContainText("Page 1 of 7");
  await dialog
    .getByRole("button", { name: "Next report page", exact: true })
    .click();
  await expect(dialog.locator(".report-paper h5")).toContainText("Bits 20–38");
  await dialog
    .getByRole("checkbox", { name: "Grayscale-friendly printing", exact: true })
    .check();
  await expect(dialog.locator(".report-paper")).toHaveAttribute(
    "data-grayscale",
    "true",
  );
  await dialog
    .getByLabel("Report layout", { exact: true })
    .selectOption("study");
  await dialog
    .getByLabel("Organization", { exact: true })
    .selectOption("scheme");
  await dialog
    .getByRole("button", { name: "Next report page", exact: true })
    .click();
  await expect(dialog.locator(".print-reason")).not.toHaveCount(0);
  await expect(dialog.locator(".report-paper")).toContainText("initial level");
  for (const name of ["Polar NRZ-I", "Bipolar AMI"])
    await dialog.getByRole("checkbox", { name, exact: true }).uncheck();
  await expect(
    dialog.getByRole("button", { name: "Download PDF", exact: true }),
  ).toBeDisabled();
  await expect(dialog.getByRole("alert")).toContainText("Select at least one");
  await dialog
    .getByRole("checkbox", { name: "Polar NRZ-I", exact: true })
    .check();
  await expect(
    dialog.getByRole("button", { name: "Download PDF", exact: true }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});
test("both themes provide responsive keyboard-contained report settings and return to editing", async ({
  page,
}, info) => {
  await openStudio(page);
  const dialog = page.getByRole("dialog");
  for (const theme of ["day", "night"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    await expect(
      dialog.getByLabel("Output format", { exact: true }),
    ).toBeVisible();
    await dialog.getByLabel("Output format", { exact: true }).focus();
    await page.keyboard.press("Shift+Tab");
    expect(
      await page.evaluate(() =>
        document.querySelector("dialog")!.contains(document.activeElement),
      ),
    ).toBe(true);
    expect(
      await dialog
        .locator(".report-close")
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
    await dialog.screenshot({
      path: info.outputPath(`report-studio-${theme}.png`),
    });
    expect(
      await dialog.evaluate(
        (el) => el.getBoundingClientRect().right <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  await dialog
    .getByRole("button", { name: "Close Report Studio", exact: true })
    .click();
  await page.locator(".toolbar-edit").click();
  await expect(
    page.getByLabel("Binary sequence", { exact: true }),
  ).toBeFocused();
});
test("practice grids and separate answer keys use the same generated score without leaking answers", async ({
  page,
}) => {
  await openStudio(page);
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Encoding schemes", { exact: true })
    .selectOption("custom");
  for (const name of [
    "Unipolar NRZ",
    "Polar NRZ-L",
    "Polar NRZ-I",
    "Polar RZ",
    "Manchester",
    "Differential Manchester",
    "Bipolar Pseudoternary",
  ])
    await dialog.getByRole("checkbox", { name, exact: true }).uncheck();
  await dialog
    .getByLabel("Report content", { exact: true })
    .selectOption("worksheet");
  await expect(dialog.locator(".report-paper h4")).toHaveText(
    "Line coding practice worksheet",
  );
  await expect(dialog.locator(".print-waveform polyline")).toHaveCount(0);
  await expect(
    dialog
      .locator(".print-table tr")
      .filter({ has: page.locator('th:text-is("out")') })
      .locator("td"),
  ).toHaveText(Array(13).fill(""));
  const [worksheet] = await Promise.all([
    page.waitForEvent("download"),
    dialog.getByRole("button", { name: "Download PDF", exact: true }).click(),
  ]);
  expect(
    (
      await PDFDocument.load(await readFile((await worksheet.path())!))
    ).getTitle(),
  ).toBe("Line coding practice worksheet");
  await dialog
    .getByLabel("Report content", { exact: true })
    .selectOption("answer-key");
  await expect(dialog.locator(".report-paper h4")).toHaveText(
    "Line coding answer key",
  );
  await expect(dialog.locator(".print-waveform polyline")).toHaveCount(1);
  await dialog
    .getByLabel("Output format", { exact: true })
    .selectOption("docx");
  const [key] = await Promise.all([
    page.waitForEvent("download"),
    dialog
      .getByRole("button", { name: "Download Word report", exact: true })
      .click(),
  ]);
  const files = unzipSync(await readFile((await key.path())!));
  expect(strFromU8(files["word/document.xml"])).toContain(
    "Line coding answer key",
  );
  expect(strFromU8(files["word/document.xml"])).toContain("neg");
});
