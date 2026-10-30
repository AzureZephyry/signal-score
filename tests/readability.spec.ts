import { test, expect, type Page } from "@playwright/test";
async function generate(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Set length" }).click();
  await page
    .getByLabel("Binary sequence", { exact: true })
    .fill("111001011000");
  await page.getByRole("button", { name: "Generate waveforms" }).click();
  await page
    .getByRole("button", { name: "Show all bits", exact: true })
    .click();
}

test("beginner guides and contextual explanations connect selected bits to actual signal state", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText("WHAT IS LINE CODING?", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Line coding turns digital bits into electrical signal patterns over time.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.locator(".learning-guide summary").click();
  await expect(page.locator(".learning-guide")).toContainText(
    "exactly that many binary digits",
  );
  await page.locator(".graph-guide summary").click();
  await expect(page.locator(".graph-guide")).toContainText(
    "one equal bit interval",
  );
  await expect(page.locator(".graph-guide")).toContainText(
    "vertical steps show a change",
  );
  await page.getByRole("button", { name: "Set length" }).click();
  await page
    .getByLabel("Binary sequence", { exact: true })
    .fill("111001011000");
  await page.getByLabel("Binary sequence", { exact: true }).press("Enter");
  await expect(page.locator(".scheme-summary")).toHaveCount(8);
  await page
    .getByRole("button", { name: "Source bit 4: 0", exact: true })
    .click();
  const row = page.locator('[data-scheme="differential"]');
  await row
    .getByRole("button", { name: "Explain encoding", exact: true })
    .click();
  await expect(row.locator(".bit-explanation")).toContainText(
    "previous bit ended at −V",
  );
  await expect(row.locator(".bit-explanation")).toContainText(
    "Input 0 adds a beginning inversion to +V (inv)",
  );
  await page
    .getByLabel("Differential Manchester initial voltage", { exact: true })
    .selectOption("-1");
  await expect(row.locator(".bit-explanation")).toContainText(
    "previous bit ended at +V",
  );
  await expect(row.locator(".bit-explanation")).toContainText(
    "inversion to −V",
  );
  await expect(page.locator(".output-row .is-selected")).toHaveCount(8);
  await row
    .getByRole("button", { name: "Hide explanation", exact: true })
    .click();
  await expect(row.locator(".focus-detail")).toHaveCount(0);
});

test("both themes remain readable at the three requested laptop resolutions", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await generate(page);
  await page
    .getByRole("button", { name: "Source bit 6: 1", exact: true })
    .click();
  for (const theme of ["day", "night"]) {
    if ((await page.locator("html").getAttribute("data-theme")) !== theme)
      await page
        .getByRole("button", {
          name: `Switch to ${theme === "day" ? "Day" : "Night"} Mode`,
          exact: true,
        })
        .click();
    for (const size of [
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 },
    ]) {
      await page.setViewportSize(size);
      await page
        .getByLabel("Jump to scheme", { exact: true })
        .selectOption("unipolar");
      await expect(page.locator(".scheme-summary").first()).toHaveCSS(
        "font-size",
        "16px",
      );
      await expect(page.locator(".scheme-rule").first()).toHaveCSS(
        "font-size",
        "15px",
      );
      await expect(page.locator(".voltage-label").first()).toHaveCSS(
        "font-size",
        "14px",
      );
      await expect(page.locator(".bit-digit").first()).toHaveCSS(
        "font-size",
        "16px",
      );
      await expect(page.locator("[data-output]").first()).toHaveCSS(
        "font-size",
        "14px",
      );
      await expect(
        page.getByRole("button", { name: "Generate waveforms" }),
      ).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      const geometry = await page
        .locator('[data-scheme="unipolar"]')
        .evaluate((row) => {
          const a = row
            .querySelector(".selected-interval")!
            .getBoundingClientRect();
          const b = row
            .querySelector(".output-row .is-selected")!
            .getBoundingClientRect();
          return Math.abs(a.x + a.width / 2 - b.x - b.width / 2);
        });
      expect(geometry).toBeLessThan(1);
      const plot = await page
        .locator(".plot-shell")
        .first()
        .evaluate((el) => ({
          surface: getComputedStyle(el).backgroundColor,
          page: getComputedStyle(document.body).backgroundColor,
        }));
      expect(plot.surface).not.toBe(plot.page);
      const contrasts = await page
        .locator('[data-scheme="unipolar"]')
        .evaluate((row) => {
          const luminance = (color: string) => {
            const channels = color
              .match(/[\d.]+/g)!
              .slice(0, 3)
              .map(Number)
              .map((n) => {
                const c = n / 255;
                return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
              });
            return (
              channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
            );
          };
          const ratio = (a: string, b: string) => {
            const x = luminance(a),
              y = luminance(b);
            return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
          };
          const surface = getComputedStyle(
            row.querySelector(".plot-shell")!,
          ).backgroundColor;
          const label = getComputedStyle(
            row.querySelector(".voltage-label")!,
          ).fill;
          const stroke = getComputedStyle(
            row.querySelector(".signal-path")!,
          ).stroke;
          const cell = row.querySelector(".output-row .is-selected")!;
          return {
            label: ratio(label, surface),
            signal: ratio(stroke, surface),
            selected: ratio(
              getComputedStyle(cell).color,
              getComputedStyle(cell).backgroundColor,
            ),
          };
        });
      expect(contrasts.label).toBeGreaterThan(4.5);
      expect(contrasts.signal).toBeGreaterThan(3);
      expect(contrasts.selected).toBeGreaterThan(4.5);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: `evidence/readability-${theme}-${size.width}x${size.height}-${info.project.name}.png`,
        fullPage: false,
        animations: "disabled",
      });
    }
  }
  expect(errors).toEqual([]);
});

test("125% and 200% zoom-equivalent reflow retains operable controls and aligned scientific data", async ({
  browser,
}, info) => {
  for (const scale of [1.25, 2]) {
    const context = await browser.newContext({
      viewport: {
        width: Math.round(1366 / scale),
        height: Math.round(768 / scale),
      },
      deviceScaleFactor: scale,
      baseURL: "http://127.0.0.1:4173",
    });
    const page = await context.newPage();
    await generate(page);
    await page
      .getByLabel("Jump to scheme", { exact: true })
      .selectOption("pseudoternary");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await expect(page.locator(".score-toolbar")).toHaveCSS(
      "position",
      "static",
    );
    await page.locator(".toolbar-edit").click();
    await expect(
      page.getByLabel("Binary sequence", { exact: true }),
    ).toBeFocused();
    await page
      .getByLabel("Binary sequence", { exact: true })
      .fill("010101010101");
    await page.getByLabel("Binary sequence", { exact: true }).press("Enter");
    await expect(page.locator("[data-scheme]")).toHaveCount(8);
    await page
      .getByRole("button", { name: "Source bit 12: 1", exact: true })
      .click();
    const aligned = await page.locator("[data-scheme]").evaluateAll((rows) =>
      rows.every((row) => {
        const a = row
          .querySelector(".selected-interval")!
          .getBoundingClientRect();
        const b = row
          .querySelector(".output-row .is-selected")!
          .getBoundingClientRect();
        return Math.abs(a.x + a.width / 2 - b.x - b.width / 2) < 1;
      }),
    );
    expect(aligned).toBe(true);
    await page
      .getByLabel("Jump to scheme", { exact: true })
      .selectOption("unipolar");
    await page.screenshot({
      path: `evidence/readability-zoom-${scale * 100}-${info.project.name}.png`,
      fullPage: false,
      animations: "disabled",
    });
    await context.close();
  }
});
