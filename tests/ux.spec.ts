import { test, expect, type Page } from "@playwright/test";
const sample = "111001011000";
async function compose(page: Page, value = sample) {
  await page.goto("/");
  await page
    .getByLabel("Number of bits", { exact: true })
    .fill(String(value.length));
  await page.getByLabel("Number of bits", { exact: true }).press("Enter");
  await expect(
    page.getByLabel("Binary sequence", { exact: true }),
  ).toBeFocused();
  await page.getByLabel("Binary sequence", { exact: true }).fill(value);
  await page.getByLabel("Binary sequence", { exact: true }).press("Enter");
  await expect(page.locator("#comparison-title")).toBeFocused();
  await page
    .getByRole("button", { name: "Show all bits", exact: true })
    .click();
}
async function theme(page: Page, next: "day" | "night") {
  if ((await page.locator("html").getAttribute("data-theme")) !== next)
    await page
      .getByRole("button", {
        name: `Switch to ${next === "night" ? "Night" : "Day"} Mode`,
        exact: true,
      })
      .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", next);
}

test("theme follows system until explicitly saved, persists on reload, and supports keyboard", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "night");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "day");
  const toggle = page.getByRole("button", {
    name: "Switch to Night Mode",
    exact: true,
  });
  await toggle.focus();
  await toggle.press("Space");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "night");
  expect(
    await page.evaluate(() => localStorage.getItem("signal-score-theme")),
  ).toBe("night");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "night");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "night");
  await page
    .getByRole("button", { name: "Switch to Day Mode", exact: true })
    .click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "day");
});

test("saved theme applies before the application JavaScript loads", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() =>
    localStorage.setItem("signal-score-theme", "night"),
  );
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    (url) => /\/src\/main\.tsx|\/assets\/[^/]+\.js$/.test(url.pathname),
    async (route) => {
      await gate;
      await route.continue();
    },
  );
  await page.goto("/", { waitUntil: "commit" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "night");
  await expect(page.locator("html")).toHaveCSS(
    "background-color",
    "rgb(36, 39, 34)",
  );
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    "#242722",
  );
  release();
  await expect(
    page.getByRole("button", { name: "Switch to Day Mode", exact: true }),
  ).toBeVisible();
});

test("theme toggle works when browser storage is unavailable", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, "getItem", {
      value() {
        throw new Error("Storage unavailable");
      },
    });
    Object.defineProperty(Storage.prototype, "setItem", {
      value() {
        throw new Error("Storage unavailable");
      },
    });
  });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await theme(page, "night");
  await theme(page, "day");
  expect(errors).toEqual([]);
});

test("keyboard workflow, useful validation, immediate results, and non-destructive length edits", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.locator('.workflow-steps [aria-current="step"]'),
  ).toContainText("Set length");
  await page.getByLabel("Number of bits", { exact: true }).fill("0");
  await page.getByLabel("Number of bits", { exact: true }).press("Enter");
  await expect(
    page.getByLabel("Number of bits", { exact: true }),
  ).toBeFocused();
  await expect(
    page.getByLabel("Number of bits", { exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
  await page.getByLabel("Number of bits", { exact: true }).fill("12");
  await page.getByLabel("Number of bits", { exact: true }).press("Enter");
  await expect(
    page.locator('.workflow-steps [aria-current="step"]'),
  ).toContainText("Enter bits");
  const bits = page.getByLabel("Binary sequence", { exact: true });
  await bits.fill("101");
  await expect(page.locator("#bits-help")).toContainText("9 more needed");
  await bits.press("Enter");
  await expect(bits).toBeFocused();
  await expect(page.getByRole("alert")).toContainText("exactly 12");
  await bits.fill(sample);
  await bits.press("Enter");
  await expect(page.locator("#comparison-title")).toBeFocused();
  await page
    .getByRole("button", { name: "Show all bits", exact: true })
    .click();
  await expect(page.locator(".playback-status")).toContainText("12 / 12");
  await expect(
    page.getByRole("button", { name: "Play playback", exact: true }),
  ).toContainText("Replay");
  await expect(
    page.locator('.workflow-steps [aria-current="step"]'),
  ).toContainText("Read score");
  await page.locator(".toolbar-edit").click();
  await expect(bits).toBeFocused();
  await page.getByRole("button", { name: "Edit length" }).click();
  await expect(
    page.getByLabel("Number of bits", { exact: true }),
  ).toBeFocused();
  await expect(page.locator("[data-scheme]")).toHaveCount(8);
  await page.getByRole("button", { name: "Cancel length change" }).click();
  await expect(bits).toHaveValue(sample);
  await expect(bits).toBeFocused();
  await bits.fill("0".repeat(12));
  await expect(page.getByRole("status")).toContainText("Input edited");
  await expect(
    page.locator('[data-scheme="unipolar"] [data-output]').first(),
  ).toHaveText("hi");
  await bits.press("Enter");
  await expect(
    page.locator('[data-scheme="unipolar"] [data-output]'),
  ).toHaveText(Array(12).fill("lo"));
});

test("sticky scheme navigation reaches every scheme and returns focus to editing", async ({
  page,
}) => {
  await compose(page);
  for (const id of [
    "unipolar",
    "nrz-l",
    "nrz-i",
    "rz",
    "manchester",
    "differential",
    "ami",
    "pseudoternary",
  ]) {
    await page.getByLabel("Jump to scheme", { exact: true }).selectOption(id);
    const positions = await page.evaluate(
      (id) => ({
        toolbar: document
          .querySelector(".score-toolbar")!
          .getBoundingClientRect().bottom,
        row: document.querySelector(`#row-${id}`)!.getBoundingClientRect().top,
      }),
      id,
    );
    expect(positions.row).toBeGreaterThanOrEqual(positions.toolbar - 1);
    expect(positions.row - positions.toolbar).toBeLessThan(30);
    await expect(page.locator(".toolbar-edit")).toBeInViewport();
  }
  await page
    .getByRole("button", { name: "Previous scheme", exact: true })
    .click();
  await expect(page.getByLabel("Jump to scheme", { exact: true })).toHaveValue(
    "ami",
  );
  await page.locator(".toolbar-edit").click();
  await expect(
    page.getByLabel("Binary sequence", { exact: true }),
  ).toBeFocused();
});

test("pinned inspection remains visible, does not change on hover, and has bounded tab stops", async ({
  page,
}) => {
  await compose(page, "10".repeat(64));
  await page
    .getByRole("button", { name: "Source bit 128: 0", exact: true })
    .click();
  const visible = await page.locator(".score-scroll").evaluate((el) => {
    const box = el.getBoundingClientRect(),
      selected = el
        .querySelector(".selected-interval")!
        .getBoundingClientRect();
    return selected.left >= box.left + 55 && selected.right <= box.right + 1;
  });
  expect(visible).toBe(true);
  await expect(page.locator(".selected-interval")).toHaveCount(8);
  await page.locator('[data-scheme="unipolar"] .bit-hit').nth(126).hover();
  await expect(page.locator("#inspect-bit")).toHaveValue("128");
  const control = page
    .locator('[data-scheme="unipolar"] .output-table thead button')
    .last();
  await control.focus();
  await control.press("ArrowLeft");
  await expect(page.locator("#inspect-bit")).toHaveValue("127");
  await expect(page.locator(".output-row .is-selected")).toHaveCount(8);
  const stops = await page
    .locator(
      'button:not(:disabled):not([tabindex="-1"]),select,a,[tabindex="0"]',
    )
    .count();
  expect(stops).toBeLessThan(100);
  const alignment = await page.locator("[data-scheme]").evaluateAll((rows) =>
    rows.map((row) => {
      const selection = row
        .querySelector(".selected-interval")!
        .getBoundingClientRect();
      const output = row
        .querySelector(".output-row .is-selected")!
        .getBoundingClientRect();
      return Math.abs(
        selection.left + selection.width / 2 - output.left - output.width / 2,
      );
    }),
  );
  expect(alignment.every((d) => d < 1)).toBe(true);
  await expect(page.locator(".voltage-axis").first()).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(page.locator("#inspect-bit")).toHaveValue("");
});

test("initial changes keep results complete and timeline scrubbing is predictable", async ({
  page,
}) => {
  await compose(page);
  await page
    .getByRole("button", { name: "Source bit 6: 1", exact: true })
    .click();
  await page
    .getByLabel("Polar NRZ-I initial voltage", { exact: true })
    .selectOption("-1");
  await expect(page.locator(".playback-status")).toContainText("12 / 12");
  await expect(
    page.getByRole("button", { name: "Pause playback", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("#inspect-bit")).toHaveValue("6");
  await page.getByLabel("Playback position in bits", { exact: true }).fill("5");
  await expect(page.locator(".playback-status")).toContainText("05 / 12");
  await page.getByRole("button", { name: "Step one bit", exact: true }).click();
  await expect(page.locator(".playback-status")).toContainText("06 / 12");
  await page
    .getByRole("button", { name: "Show all bits", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Step one bit", exact: true }),
  ).toBeDisabled();
});

for (const mode of ["day", "night"] as const) {
  test(`${mode} theme: responsive geometry, text contrast, console and real screenshot`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await compose(page);
    await theme(page, mode);
    const contrast = await page.evaluate(() => {
      const linear = (v: number) => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      const luminance = (color: string) => {
        const c = color
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number)
          .map(linear);
        return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
      };
      const ratio = (a: string, b: string) => {
        const x = luminance(a),
          y = luminance(b);
        return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
      };
      const root = getComputedStyle(document.body);
      const muted = getComputedStyle(
        document.querySelector(".scheme-rule")!,
      ).color;
      const output = getComputedStyle(
        document.querySelector("[data-output]")!,
      ).color;
      return {
        text: ratio(root.color, root.backgroundColor),
        muted: ratio(muted, root.backgroundColor),
        output: ratio(output, root.backgroundColor),
      };
    });
    expect(contrast.text).toBeGreaterThan(7);
    expect(contrast.muted).toBeGreaterThan(4.5);
    expect(contrast.output).toBeGreaterThan(4.5);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      const targets = await page
        .locator(
          ".theme-toggle,.initial-control select,.play-button,.toolbar-edit,.scheme-navigation .nav-arrow,.bit-navigation button,.kinetic-digit,.timeline-scrub input",
        )
        .evaluateAll((els) =>
          els.map((el) => ({
            height: el.getBoundingClientRect().height,
            width: el.getBoundingClientRect().width,
          })),
        );
      expect(
        targets.every((target) => target.height >= 44 && target.width >= 44),
      ).toBe(true);
    }
    await page.setViewportSize({
      width: info.project.name === "desktop" ? 1440 : 390,
      height: info.project.name === "desktop" ? 1400 : 844,
    });
    await page
      .getByRole("button", { name: "Source bit 1: 1", exact: true })
      .click();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `evidence/ux-final-${mode}-${info.project.name}.png`,
      fullPage: false,
      animations: "disabled",
    });
    await page.evaluate(() =>
      document
        .querySelector("#score")!
        .scrollIntoView({ block: "start", behavior: "instant" }),
    );
    await page.screenshot({
      path: `evidence/ux-score-${mode}-${info.project.name}.png`,
      fullPage: false,
      animations: "disabled",
    });
    expect(errors).toEqual([]);
  });
}

test("live reduced-motion preference stops playback without stealing focus or scrolling", async ({
  page,
}) => {
  await compose(page);
  await page
    .getByLabel("Jump to scheme", { exact: true })
    .selectOption("pseudoternary");
  const play = page.locator(".play-button");
  await play.click();
  await expect(play).toHaveAttribute("aria-label", "Pause playback");
  await play.focus();
  const before = await page.evaluate(() => window.scrollY);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(play).toHaveAttribute("aria-label", "Play playback");
  await expect(page.locator(".playback-status")).toContainText("12 / 12");
  await expect(play).toBeFocused();
  expect(
    Math.abs((await page.evaluate(() => window.scrollY)) - before),
  ).toBeLessThan(2);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(play).toBeFocused();
  await expect(play).toHaveAttribute("aria-label", "Play playback");
});
