import { test, expect, type Page } from "@playwright/test";
const sample = "111001011000";
async function generate(page: Page, bits = sample) {
  await page.goto("/");
  await page
    .getByLabel("Number of bits", { exact: true })
    .fill(String(bits.length));
  await page.getByRole("button", { name: "Set length" }).click();
  await page.getByLabel("Binary sequence", { exact: true }).fill(bits);
  await page.getByRole("button", { name: "Generate waveforms" }).click();
  await expect(page.locator("[data-scheme]")).toHaveCount(8);
  await page
    .getByRole("button", { name: "Show all bits", exact: true })
    .click();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
}

test("length first, strict validation, sample, and eight complete tables", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByLabel("Binary sequence", { exact: true })).toHaveCount(
    0,
  );
  await expect(page.locator("[data-scheme]")).toHaveCount(0);
  for (const invalid of ["0", "129", "1.5", "abc"]) {
    await page.getByLabel("Number of bits", { exact: true }).fill(invalid);
    await page.getByRole("button", { name: "Set length" }).click();
    await expect(page.getByRole("alert")).not.toBeEmpty();
    await expect(
      page.getByLabel("Binary sequence", { exact: true }),
    ).toHaveCount(0);
  }
  await page.getByLabel("Number of bits", { exact: true }).fill("12");
  await page.getByRole("button", { name: "Set length" }).click();
  await expect(
    page.getByLabel("Number of bits", { exact: true }),
  ).toBeDisabled();
  const input = page.getByLabel("Binary sequence", { exact: true });
  await input.fill("11100x011000");
  await page.getByRole("button", { name: "Generate waveforms" }).click();
  await expect(page.getByRole("alert")).toContainText("Only binary");
  await expect(page.locator("[data-scheme]")).toHaveCount(0);
  await input.fill("111");
  await page.getByRole("button", { name: "Generate waveforms" }).click();
  await expect(page.getByRole("alert")).toContainText("exactly 12");
  await input.fill("1".repeat(13));
  await page.getByRole("button", { name: "Generate waveforms" }).click();
  await expect(page.getByRole("alert")).toContainText("remove 1");
  await page.getByRole("button", { name: "Load example" }).click();
  await expect(input).toHaveValue(sample);
  await page.getByRole("button", { name: "Generate waveforms" }).click();
  await expect(page.locator(".signal-path")).toHaveCount(8);
  await expect(page.locator(".output-table")).toHaveCount(8);
  const expected: Record<string, string> = {
    unipolar: "hi hi hi lo lo hi lo hi hi lo lo lo",
    "nrz-l": "neg neg neg pos pos neg pos neg neg pos pos pos",
    "nrz-i": "neg pos neg neg neg pos pos neg pos pos pos pos",
    rz: "pos pos pos neg neg pos neg pos pos neg neg neg",
    manchester: "nTp nTp nTp pTn pTn nTp pTn nTp nTp pTn pTn pTn",
    differential: "pTn nTp pTn pTn pTn nTp nTp pTn nTp nTp nTp nTp",
    ami: "pos neg pos zero zero neg zero pos neg zero zero zero",
    pseudoternary: "zero zero zero pos neg zero pos zero zero neg pos neg",
  };
  for (const [id, labels] of Object.entries(expected)) {
    const row = page.locator(`[data-scheme="${id}"]`);
    await expect(row.locator("[data-output]")).toHaveText(labels.split(" "));
    await expect(
      row
        .locator(".output-table tbody tr")
        .first()
        .locator("td")
        .filter({ hasText: /[01]/ }),
    ).toHaveText([...sample]);
    await expect(row.locator(".bit-hit")).toHaveCount(12);
    const path = await row.locator(".signal-path").getAttribute("d");
    expect(path).toMatch(/^M[\d.,-]+(?:[HV][\d.-]+)*$/);
  }
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test("initial states update both labels and graphical voltage paths", async ({
  page,
}) => {
  await generate(page);
  const nrzi = page.locator('[data-scheme="nrz-i"]');
  const differential = page.locator('[data-scheme="differential"]');
  const highPath = await nrzi.locator(".signal-path").getAttribute("d");
  await page
    .getByLabel("Polar NRZ-I initial voltage", { exact: true })
    .selectOption("-1");
  await expect(nrzi.locator("[data-output]")).toHaveText(
    "pos neg pos pos pos neg neg pos neg neg neg neg".split(" "),
  );
  expect(await nrzi.locator(".signal-path").getAttribute("d")).not.toBe(
    highPath,
  );
  await expect(nrzi.locator(".signal-path")).toHaveAttribute(
    "d",
    /^M44,120H56V48/,
  );
  await page
    .getByLabel("Differential Manchester initial voltage", { exact: true })
    .selectOption("-1");
  await expect(differential.locator("[data-output]")).toHaveText(
    "nTp pTn nTp nTp nTp pTn pTn nTp pTn pTn pTn pTn".split(" "),
  );
  await expect(
    differential.locator(".action-row td").filter({ hasText: /inv/ }),
  ).toHaveText([
    "no inv",
    "no inv",
    "no inv",
    "inv",
    "inv",
    "no inv",
    "inv",
    "no inv",
    "no inv",
    "inv",
    "inv",
    "inv",
  ]);
  await noOverflow(page);
});

test("bit inspection synchronizes all rows, source, and explanations", async ({
  page,
}) => {
  await generate(page);
  await page
    .getByRole("button", { name: "Source bit 6: 1", exact: true })
    .click();
  await expect(page.locator(".selected-interval")).toHaveCount(8);
  await expect(page.locator(".output-row .is-selected")).toHaveText([
    "hi",
    "neg",
    "pos",
    "pos",
    "nTp",
    "nTp",
    "neg",
    "zero",
  ]);
  await expect(page.locator(".score-guide")).toContainText("INSPECTING BIT 06");
  await page
    .locator('[data-scheme="differential"]')
    .getByRole("button", { name: "Explain encoding", exact: true })
    .click();
  await expect(page.locator(".focus-detail")).toBeVisible();
  await expect(page.locator(".bit-readout strong")).toHaveText("1 → nTp");
  await expect(page.locator(".bit-readout")).toContainText("no inv at start");
  await page.getByRole("button", { name: "Clear selection" }).click();
  await expect(page.locator(".selected-interval")).toHaveCount(0);
});

test("play, pause, reset and step control the same reveal position", async ({
  page,
}) => {
  await generate(page);
  await page
    .getByRole("button", { name: "Show all bits", exact: true })
    .click();
  await expect(page.locator(".playback-status")).toContainText("12 / 12");
  await page
    .getByRole("button", { name: "Reset playback", exact: true })
    .click();
  await expect(page.locator(".playback-status")).toContainText("00 / 12");
  await page.getByRole("button", { name: "Step one bit", exact: true }).click();
  await expect(page.locator(".playback-status")).toContainText("01 / 12");
  const masks = await page
    .locator(".signal-reveal")
    .evaluateAll((elements) => elements.map((el) => el.getAttribute("width")));
  expect(new Set(masks).size).toBe(1);
  await page
    .getByRole("button", { name: "Play playback", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Pause playback", exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () =>
      Number(
        await page.locator(".signal-reveal").first().getAttribute("width"),
      ),
    )
    .toBeGreaterThan(Number(masks[0]));
  await page
    .getByRole("button", { name: "Pause playback", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Play playback", exact: true }),
  ).toBeVisible();
});

test("reduced motion reveals immediately and remains inspectable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await generate(page);
  await expect(page.locator(".playback-status")).toContainText("12 / 12");
  await expect(
    page.getByRole("button", { name: "Play playback", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".score-footnote")).toContainText("REDUCED MOTION");
  await page
    .getByRole("button", { name: "Source bit 1: 1", exact: true })
    .click();
  await expect(page.locator(".selected-interval")).toHaveCount(8);
});

test("long inputs stay aligned inside a shared scroll area without page overflow", async ({
  page,
}) => {
  await generate(page, "10".repeat(64));
  await page
    .getByRole("button", { name: "Show all bits", exact: true })
    .click();
  await expect(page.locator(".output-row [data-output]")).toHaveCount(1024);
  const scroller = page.locator(".score-scroll");
  expect(await scroller.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(
    true,
  );
  await scroller.evaluate((el) => {
    el.scrollLeft = el.scrollWidth;
  });
  const positions = await page.locator("[data-scheme]").evaluateAll((rows) =>
    rows.map((row) => {
      const lastRect = row
        .querySelector(".bit-hit:last-of-type rect")!
        .getBoundingClientRect();
      const lastCell = row
        .querySelector(".output-row td:nth-last-child(2)")!
        .getBoundingClientRect();
      const header = row
        .querySelector(".scheme-header")!
        .getBoundingClientRect();
      return {
        difference: Math.abs(
          lastRect.x + lastRect.width / 2 - lastCell.x - lastCell.width / 2,
        ),
        header: header.x,
      };
    }),
  );
  expect(positions.every((pos) => pos.difference < 1)).toBe(true);
  expect(new Set(positions.map((pos) => pos.header)).size).toBe(1);
  await noOverflow(page);
});

test("responsive layouts at narrow mobile, tablet and desktop widths", async ({
  page,
}) => {
  await generate(page);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator(".scheme-header").first()).toBeVisible();
    await noOverflow(page);
  }
});

test("editing, randomizing and changing length preserve the required workflow", async ({
  page,
}) => {
  await generate(page);
  await page
    .getByLabel("Binary sequence", { exact: true })
    .fill("0".repeat(12));
  await expect(page.getByRole("status")).toContainText("Input edited");
  await page
    .getByRole("button", { name: "Update waveforms", exact: false })
    .click();
  await expect(
    page.locator('[data-scheme="unipolar"] [data-output]'),
  ).toHaveText(Array(12).fill("lo"));
  await page.getByRole("button", { name: "Edit length", exact: false }).click();
  await expect(page.getByLabel("Binary sequence", { exact: true })).toHaveCount(
    0,
  );
  await expect(page.locator("[data-scheme]")).toHaveCount(8);
  await page.getByLabel("Number of bits", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Set length" }).click();
  await expect(
    page.getByRole("button", { name: "Load example" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Randomize", exact: true }).click();
  await expect(page.getByLabel("Binary sequence", { exact: true })).toHaveValue(
    /^[01]$/,
  );
  await page.getByRole("button", { name: "Update waveforms" }).click();
  await expect(page.locator(".signal-path")).toHaveCount(8);
});

test("capture the completed application with no blocking script errors", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await generate(page);
  await page
    .getByRole("button", { name: "Show all bits", exact: true })
    .click();
  await page.evaluate(() => document.fonts.ready);
  await page
    .getByRole("button", { name: "Source bit 6: 1", exact: true })
    .click();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page.locator(".hero-word").first()).toHaveCSS(
    "transform",
    "matrix(1, 0, 0, 1, 0, 0)",
  );
  await page.screenshot({
    path: `evidence/${testInfo.project.name}-complete.png`,
    fullPage: true,
    animations: "disabled",
  });
  await expect(page.locator(".playback-status")).toContainText("12 / 12");
  await page.screenshot({
    path: `evidence/${testInfo.project.name}-viewport.png`,
    fullPage: false,
    animations: "disabled",
  });
  await page.evaluate(() =>
    document
      .querySelector("#score")
      ?.scrollIntoView({ block: "start", behavior: "instant" }),
  );
  await page.screenshot({
    path: `evidence/${testInfo.project.name}-score.png`,
    fullPage: false,
    animations: "disabled",
  });
  expect(errors).toEqual([]);
});

test("resizing preserves paused timeline position and selected interval", async ({
  page,
}) => {
  await generate(page);
  await page
    .getByRole("button", { name: "Show all bits", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Source bit 6: 1", exact: true })
    .click();
  await page.setViewportSize({ width: 900, height: 950 });
  await expect
    .poll(async () =>
      page.locator(".score-scroll").evaluate((el) => el.clientWidth),
    )
    .toBeGreaterThan(700);
  await expect(page.locator(".playback-status")).toContainText("12 / 12");
  await expect(
    page.getByRole("button", { name: "Play playback", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".selected-interval")).toHaveCount(8);
  await page
    .getByRole("button", { name: "Reset playback", exact: true })
    .click();
  await page.getByRole("button", { name: "Step one bit", exact: true }).click();
  await page.setViewportSize({ width: 1200, height: 950 });
  await expect
    .poll(async () =>
      page.locator(".score-scroll").evaluate((el) => el.clientWidth),
    )
    .toBeGreaterThan(1000);
  await expect(page.locator(".playback-status")).toContainText("01 / 12");
  await noOverflow(page);
});
