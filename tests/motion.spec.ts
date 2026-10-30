import { test, expect, type Page } from "@playwright/test";
async function generate(page: Page, value = "111001011000") {
  await page.goto("/");
  await page.getByRole("button", { name: "Set length" }).click();
  await page.getByLabel("Binary sequence", { exact: true }).fill(value);
  await page.getByRole("button", { name: "Generate waveforms" }).click();
  await expect(page.locator("[data-scheme]")).toHaveCount(8);
}
async function samples(
  page: Page,
  selector: string,
  property: string,
  frames = 20,
) {
  return page.evaluate(
    ({ selector, property, frames }) =>
      new Promise<string[]>((resolve) => {
        const values: string[] = [];
        const frame = () => {
          const el = document.querySelector(selector);
          values.push(
            el
              ? property.startsWith("@")
                ? (el.getAttribute(property.slice(1)) ?? "")
                : getComputedStyle(el).getPropertyValue(property)
              : "missing",
          );
          if (values.length < frames) requestAnimationFrame(frame);
          else resolve(values);
        };
        requestAnimationFrame(frame);
      }),
    { selector, property, frames },
  );
}
async function observeDuring(
  page: Page,
  selector: string,
  property: string,
  action: () => Promise<unknown>,
) {
  await page.evaluate(
    ({ selector, property }) => {
      const state = { values: [] as string[], stop: false };
      (
        window as unknown as { motionObservation: typeof state }
      ).motionObservation = state;
      const tick = () => {
        const el = document.querySelector(selector);
        if (el)
          state.values.push(getComputedStyle(el).getPropertyValue(property));
        if (!state.stop) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    { selector, property },
  );
  await action();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let n = 0;
        const tick = () => {
          if (++n < 20) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      }),
  );
  return page.evaluate(() => {
    const state = (
      window as unknown as {
        motionObservation: { values: string[]; stop: boolean };
      }
    ).motionObservation;
    state.stop = true;
    return state.values;
  });
}
const distinct = (values: string[]) =>
  new Set(values.filter((value) => value !== "missing")).size;

test("normal-motion first load actually animates hero typography and signal illustration without disabling input", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const frames: { hero: string; signal: string }[] = [];
    (window as unknown as { entryFrames: typeof frames }).entryFrames = frames;
    const sample = () => {
      const hero = document.querySelector(".hero-token"),
        signal = document.querySelector(".art-wave");
      if (hero && signal)
        frames.push({
          hero: getComputedStyle(hero).transform,
          signal: getComputedStyle(signal).strokeDashoffset,
        });
      if (frames.length < 100) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Set length" })).toBeEnabled();
  await page.waitForFunction(
    () =>
      (window as unknown as { entryFrames: unknown[] }).entryFrames.length >=
      65,
  );
  const frames = await page.evaluate(
    () =>
      (window as unknown as { entryFrames: { hero: string; signal: string }[] })
        .entryFrames,
  );
  expect(distinct(frames.map((frame) => frame.hero))).toBeGreaterThan(8);
  expect(distinct(frames.map((frame) => frame.signal))).toBeGreaterThan(8);
  expect(frames.some((frame) => parseFloat(frame.signal) > 0.2)).toBe(true);
  await expect(page.locator(".hero-token").first()).toHaveCSS(
    "transform",
    "matrix(1, 0, 0, 1, 0, 0)",
  );
});

test("generation draws actual paths over time, synchronizes labels, and retains complete accessible data", async ({
  page,
}) => {
  await generate(page);
  await expect(page.locator(".signal-reference")).toHaveCount(8);
  await expect(page.locator("[data-output]")).toHaveCount(96);
  const frames = await page.evaluate(
    () =>
      new Promise<
        { width: number; aligned: boolean; labels: boolean; digit: string }[]
      >((resolve) => {
        const values: {
          width: number;
          aligned: boolean;
          labels: boolean;
          digit: string;
        }[] = [];
        const sample = () => {
          const root = document.querySelector(".score-scroll")!;
          const masks = [...root.querySelectorAll(".signal-reveal")].map(
            (el) => +el.getAttribute("width")!,
          );
          const svg = root.querySelector(".waveform")!;
          const fraction = (masks[0] - 12) / (+svg.getAttribute("width")! - 80);
          const bit = Math.min(
            11,
            Math.floor(
              Number((root as HTMLElement).dataset.revealBit) + 0.0001,
            ),
          );
          const active = [
            ...root.querySelectorAll(".output-row .is-playback-active"),
          ];
          values.push({
            width: fraction,
            aligned: masks.every((width) => Math.abs(width - masks[0]) < 0.01),
            labels:
              active.length === 8 &&
              active.every(
                (el) => Number((el as HTMLElement).dataset.revealBit) === bit,
              ),
            digit: getComputedStyle(
              document.querySelector(
                ".kinetic-digit:last-child .kinetic-glyph",
              )!,
            ).transform,
          });
          if (values.length < 30) requestAnimationFrame(sample);
          else resolve(values);
        };
        requestAnimationFrame(sample);
      }),
  );
  expect(new Set(frames.map((frame) => frame.width)).size).toBeGreaterThan(10);
  expect(frames.at(-1)!.width).toBeGreaterThan(frames[0].width);
  expect(frames.every((frame) => frame.aligned && frame.labels)).toBe(true);
  expect(distinct(frames.map((frame) => frame.digit))).toBeGreaterThan(2);
  const data = await page
    .locator("[data-scheme]")
    .evaluateAll((rows) =>
      rows.every(
        (row) =>
          row.querySelector(".signal-reference")!.getAttribute("d") ===
          row.querySelector(".signal-path")!.getAttribute("d"),
      ),
    );
  expect(data).toBe(true);
  await page
    .getByRole("button", { name: "Show all bits", exact: true })
    .click();
  await expect(page.locator(".playback-status")).toContainText("12 / 12");
  await expect(page.locator(".is-playback-active")).toHaveCount(0);
});

test("inspection, scheme navigation and explanation expansion produce measured motion while preserving selected data", async ({
  page,
}) => {
  await generate(page);
  const pulse = await observeDuring(page, ".selected-interval", "opacity", () =>
    page.getByRole("button", { name: "Source bit 6: 1", exact: true }).click(),
  );
  expect(distinct(pulse)).toBeGreaterThan(2);
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
  const navigation = await observeDuring(
    page,
    '[data-scheme="nrz-i"] .scheme-header',
    "transform",
    () =>
      page.getByLabel("Jump to scheme", { exact: true }).selectOption("nrz-i"),
  );
  expect(distinct(navigation)).toBeGreaterThan(2);
  const button = page.locator('[data-scheme="nrz-i"] .focus-button');
  const heights = (
    await observeDuring(page, ".explanation-stage", "height", () =>
      button.click(),
    )
  ).map(parseFloat);
  expect(Math.max(...heights) - Math.min(...heights)).toBeGreaterThan(15);
  await expect(page.locator(".bit-explanation")).toContainText(
    "previous bit ended at −V",
  );
  await button.click();
  await expect(page.locator(".explanation-stage")).toHaveCount(0);
  for (let i = 0; i < 3; i++) {
    await button.click();
    await button.click();
  }
  await expect(page.locator(".focus-detail")).toHaveCount(0);
  await button.click();
  await expect
    .poll(() =>
      page
        .locator(".explanation-stage")
        .evaluate((el) =>
          Math.abs(el.getBoundingClientRect().height - el.scrollHeight),
        ),
    )
    .toBeLessThan(2);
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".bit-explanation")).toContainText(
    "Input 1 inverts",
  );
});

test("pause, seeking, rapid regeneration and theme switching remain interruptible and error-free", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await generate(page);
  await page
    .getByRole("button", { name: "Pause playback", exact: true })
    .click();
  const paused = await samples(page, ".signal-reveal", "@width", 16);
  expect(distinct(paused)).toBe(1);
  const seeking = await observeDuring(
    page,
    ".playback-cursor",
    "stroke-width",
    () =>
      page.getByLabel("Playback position in bits", { exact: true }).fill("5"),
  );
  await expect(page.locator(".playback-status")).toContainText("05 / 12");
  expect(distinct(seeking)).toBeGreaterThan(2);
  for (const value of ["000000000000", "101010101010", "010101010101"]) {
    await page.locator(".toolbar-edit").click();
    await page.getByLabel("Binary sequence", { exact: true }).fill(value);
    await page.getByLabel("Binary sequence", { exact: true }).press("Enter");
  }
  await expect(
    page.locator('[data-scheme="unipolar"] [data-output]'),
  ).toHaveText([
    "lo",
    "hi",
    "lo",
    "hi",
    "lo",
    "hi",
    "lo",
    "hi",
    "lo",
    "hi",
    "lo",
    "hi",
  ]);
  await page
    .getByRole("button", { name: "Switch to Night Mode", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "night");
  await page
    .getByRole("button", { name: "Show all bits", exact: true })
    .click();
  await expect(page.locator(".signal-reveal").first()).toHaveAttribute(
    "width",
    /\d/,
  );
  const widths = await page
    .locator(".signal-reveal")
    .evaluateAll((els) => els.map((el) => el.getAttribute("width")));
  expect(new Set(widths).size).toBe(1);
  await expect(page.locator("body")).toHaveCSS("font-size", "16px");
  expect(errors).toEqual([]);
});

test("reduced motion has an immediate complete alternative, including live preference changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await generate(page);
  await expect(page.locator(".playback-status")).toContainText("12 / 12");
  expect(distinct(await samples(page, ".signal-reveal", "@width", 16))).toBe(1);
  await expect(page.locator(".hero-token").first()).toHaveCSS(
    "transform",
    "none",
  );
  await page
    .getByRole("button", { name: "Source bit 4: 0", exact: true })
    .click();
  await expect(page.locator(".selected-interval").first()).toHaveCSS(
    "stroke-width",
    "1.5px",
  );
  await page
    .getByLabel("Jump to scheme", { exact: true })
    .selectOption("differential");
  await page.locator('[data-scheme="differential"] .focus-button').click();
  expect(
    distinct(await samples(page, ".explanation-stage", "height", 12)),
  ).toBe(1);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page
    .getByRole("button", { name: "Play playback", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Pause playback", exact: true }),
  ).toBeVisible();
  const control = page.locator(".play-button");
  await control.focus();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(control).toBeFocused();
  await expect(page.locator(".playback-status")).toContainText("12 / 12");
  expect(distinct(await samples(page, ".signal-reveal", "@width", 12))).toBe(1);
});
