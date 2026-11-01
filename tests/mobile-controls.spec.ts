import { test, expect, type Page } from "@playwright/test";

const sample = "111001011000";
async function generate(page: Page, bits = sample) {
  await page.goto("/");
  await page
    .getByLabel("Number of bits", { exact: true })
    .fill(String(bits.length));
  await page.getByRole("button", { name: "Set length", exact: true }).click();
  await page.getByLabel("Binary sequence", { exact: true }).fill(bits);
  await page
    .getByRole("button", { name: "Generate waveforms", exact: true })
    .click();
  await expect(page.locator("[data-scheme]")).toHaveCount(8);
  await expect(page.locator("#score-controls")).toBeFocused();
  await page.evaluate(() => document.fonts.ready);
}
async function setTheme(page: Page, theme: string) {
  await page.addInitScript(
    (value) => localStorage.setItem("signal-score-theme", value),
    theme,
  );
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
}
async function targets(page: Page) {
  return page
    .locator(".score-toolbar button,.score-toolbar input,.score-toolbar select")
    .evaluateAll((elements) =>
      elements
        .filter((el) => el.getClientRects().length)
        .map((el) => ({
          name:
            el.getAttribute("aria-label") || el.textContent?.trim() || el.id,
          width: el.getBoundingClientRect().width,
          height: el.getBoundingClientRect().height,
          clipped: el.scrollWidth > el.clientWidth + 1,
        })),
    );
}

for (const theme of ["day", "night"]) {
  for (const width of [320, 360, 375, 390, 412, 430]) {
    test(`${theme}: ${width}px phone controls flow away and give the first waveform space`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await setTheme(page, theme);
      await generate(page);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator(".score-toolbar")).toHaveCSS(
        "position",
        "static",
      );
      await expect(
        page.getByRole("button", { name: "Inspect a bit", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByLabel("Inspect bit number", { exact: true }),
      ).toBeHidden();
      const geometry = await page.evaluate(() => {
        const rect = (selector: string) =>
          document.querySelector(selector)!.getBoundingClientRect();
        return {
          panel: rect(".score-toolbar").height,
          plotBottom: rect(".plot-shell").bottom,
          previous: rect(".scheme-previous").x,
          selector: rect("#scheme-jump").x,
          next: rect(".scheme-next").x,
          editTop: rect(".toolbar-edit").top,
          exportTop: rect(".toolbar-export").top,
          playRows: [
            ...document.querySelectorAll(".playback-controls button"),
          ].map((el) => el.getBoundingClientRect().top),
        };
      });
      expect(geometry.panel).toBeLessThanOrEqual(260);
      expect(geometry.plotBottom).toBeLessThan(844);
      expect(geometry.previous).toBeLessThan(geometry.selector);
      expect(geometry.selector).toBeLessThan(geometry.next);
      expect(geometry.editTop).toBe(geometry.exportTop);
      expect(new Set(geometry.playRows).size).toBe(1);
      for (const target of await targets(page)) {
        expect(target.width, target.name).toBeGreaterThanOrEqual(44);
        expect(target.height, target.name).toBeGreaterThanOrEqual(44);
        expect(target.clipped, target.name).toBe(false);
      }
      await noOverflow(page);
      await page.screenshot({
        path: info.outputPath(`${theme}-${width}-generated.png`),
      });
      await page.evaluate(() => {
        const plot = document.querySelector(".plot-shell")!;
        window.scrollTo({
          top: scrollY + plot.getBoundingClientRect().top - 20,
          behavior: "instant",
        });
      });
      expect(
        await page
          .locator(".score-toolbar")
          .evaluate((el) => el.getBoundingClientRect().bottom),
      ).toBeLessThan(0);
      await page
        .getByLabel("Jump to scheme", { exact: true })
        .selectOption("nrz-l");
      await expect(page.locator("#scheme-nrz-l")).toBeFocused();
      const top = await page
        .locator("#row-nrz-l")
        .evaluate((el) => el.getBoundingClientRect().top);
      expect(top).toBeGreaterThanOrEqual(0);
      expect(top).toBeLessThan(32);
      await page.locator("#row-nrz-l .score-controls-link").click();
      await expect(page.locator("#score-controls")).toBeFocused();
      await expect(page.locator(".toolbar-export")).toBeInViewport();
    });
  }

  test(`${theme}: 128-bit playback, inspection, state changes, editing and Report Studio remain usable`, async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await setTheme(page, theme);
    await generate(page, "1110010110001010".repeat(8));
    await page
      .getByRole("button", { name: "Pause playback", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Reset playback", exact: true })
      .click();
    await expect(page.locator(".playback-status")).toContainText("00 / 128");
    await page
      .getByRole("button", { name: "Step one bit", exact: true })
      .click();
    await expect(page.locator(".playback-status")).toContainText("01 / 128");
    const range = page.getByLabel("Playback position in bits", { exact: true });
    await range.focus();
    await range.press("Home");
    await range.press("ArrowRight");
    await expect(range).toHaveValue("1");
    await page
      .getByRole("button", { name: "Show all bits", exact: true })
      .click();
    await expect(page.locator(".playback-status")).toContainText("128 / 128");
    const beforePlay = await page.evaluate(() => scrollY);
    await page
      .getByRole("button", { name: "Play playback", exact: true })
      .click();
    await expect
      .poll(async () =>
        Number(
          await page.locator(".score-scroll").getAttribute("data-reveal-bit"),
        ),
      )
      .toBeGreaterThan(0);
    await page
      .getByRole("button", { name: "Pause playback", exact: true })
      .click();
    expect(
      Math.abs((await page.evaluate(() => scrollY)) - beforePlay),
    ).toBeLessThan(2);
    await page
      .getByRole("button", { name: "Show all bits", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Inspect a bit", exact: true })
      .click();
    await expect(
      page.getByLabel("Inspect bit number", { exact: true }),
    ).toHaveValue("1");
    for (const target of await targets(page)) {
      expect(target.width, target.name).toBeGreaterThanOrEqual(44);
      expect(target.height, target.name).toBeGreaterThanOrEqual(44);
    }
    await page
      .getByRole("button", { name: "Clear selection", exact: true })
      .click();
    await expect(
      page.getByLabel("Inspect bit number", { exact: true }),
    ).toBeHidden();
    await page.evaluate(() => {
      const scroll = document.querySelector(".score-scroll")!;
      scroll.scrollLeft = scroll.scrollWidth;
      window.scrollTo({
        top:
          window.scrollY +
          document.querySelector(".plot-shell")!.getBoundingClientRect().top -
          20,
        behavior: "instant",
      });
    });
    const beforeSelect = await page.evaluate(() => scrollY);
    await page.locator("#row-unipolar .bit-hit").nth(127).tap();
    expect(
      Math.abs((await page.evaluate(() => scrollY)) - beforeSelect),
    ).toBeLessThan(2);
    await expect(page.locator(".output-row .is-selected")).toHaveCount(8);
    expect(
      await page.locator("[data-scheme]").evaluateAll((rows) =>
        rows.every((row) => {
          const a = row
            .querySelector(".selected-interval")!
            .getBoundingClientRect();
          const b = row
            .querySelector(".output-row .is-selected")!
            .getBoundingClientRect();
          return Math.abs(a.x + a.width / 2 - b.x - b.width / 2) < 1;
        }),
      ),
    ).toBe(true);
    await page
      .getByLabel("Polar NRZ-I initial voltage", { exact: true })
      .selectOption("-1");
    await expect(
      page.locator('[data-scheme="nrz-i"] [data-output]').first(),
    ).toHaveText("pos");
    await page.locator("#row-nrz-i .score-controls-link").click();
    await expect(
      page.getByLabel("Jump to scheme", { exact: true }),
    ).toHaveValue("nrz-i");
    await page
      .getByLabel("Jump to scheme", { exact: true })
      .selectOption("nrz-l");
    const positions = await page.locator("#row-nrz-l").evaluate(
      (el) =>
        new Promise<number[]>((resolve) => {
          const values: number[] = [];
          const sample = () => {
            values.push(el.getBoundingClientRect().top);
            if (values.length === 16) resolve(values);
            else requestAnimationFrame(sample);
          };
          requestAnimationFrame(sample);
        }),
    );
    expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(2);
    expect(positions.every((top) => top >= 0 && top < 32)).toBe(true);
    await page.locator("#row-nrz-l .score-controls-link").click();
    await page
      .getByRole("button", { name: "Export Report", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("dialog").locator(".report-initials"),
    ).toContainText("initially low");
    await page
      .getByRole("button", { name: "Close Report Studio", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Export Report", exact: true }),
    ).toBeFocused();
    await page.locator(".toolbar-edit").click();
    await expect(
      page.getByLabel("Binary sequence", { exact: true }),
    ).toBeFocused();
    await page
      .getByLabel("Binary sequence", { exact: true })
      .fill("01".repeat(64));
    await page.getByLabel("Binary sequence", { exact: true }).press("Enter");
    await expect(page.locator("#score-controls")).toBeFocused();
    await noOverflow(page);
    expect(errors).toEqual([]);
  });

  test(`${theme}: viewport-height changes never reactivate sticky controls or lose inspection`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await setTheme(page, theme);
    await generate(page);
    await page
      .getByRole("button", { name: "Inspect a bit", exact: true })
      .click();
    const height = await page
      .locator(".score-toolbar")
      .evaluate((el) => el.getBoundingClientRect().height);
    for (const nextHeight of [740, 620, 900, 844]) {
      await page.setViewportSize({ width: 390, height: nextHeight });
      await expect(page.locator(".score-toolbar")).toHaveCSS(
        "position",
        "static",
      );
      expect(
        await page
          .locator(".score-toolbar")
          .evaluate((el) => el.getBoundingClientRect().height),
      ).toBe(height);
      await expect(
        page.getByLabel("Inspect bit number", { exact: true }),
      ).toHaveValue("1");
      await page
        .getByLabel("Jump to scheme", { exact: true })
        .selectOption("nrz-l");
      expect(
        await page
          .locator(".score-toolbar")
          .evaluate((el) => el.getBoundingClientRect().bottom),
      ).toBeLessThan(0);
      await page.locator("#row-nrz-l .score-controls-link").click();
      await noOverflow(page);
    }
  });

  test(`${theme}: coarse-pointer landscape keeps normal flow and all eight schemes reachable`, async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 844, height: 390 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await setTheme(page, theme);
    await generate(page);
    for (const [width, height] of [
      [844, 390],
      [960, 430],
    ]) {
      await page.setViewportSize({ width, height });
      await expect(page.locator(".score-toolbar")).toHaveCSS(
        "position",
        "static",
      );
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
        await page
          .getByLabel("Jump to scheme", { exact: true })
          .selectOption(id);
        await expect(page.locator(`#scheme-${id}`)).toBeFocused();
        expect(
          await page
            .locator(`#row-${id}`)
            .evaluate((el) => el.getBoundingClientRect().top),
        ).toBeGreaterThanOrEqual(0);
        const rowTop = await page
          .locator(`#row-${id}`)
          .evaluate((el) => el.getBoundingClientRect().top);
        expect(
          await page
            .locator(".score-toolbar")
            .evaluate((el) => el.getBoundingClientRect().bottom),
        ).toBeLessThanOrEqual(rowTop + 1);
        const toolbarBefore = await page
          .locator(".score-toolbar")
          .evaluate((el) => el.getBoundingClientRect().top);
        await page.evaluate(() =>
          window.scrollBy({ top: 80, behavior: "instant" }),
        );
        expect(
          toolbarBefore -
            (await page
              .locator(".score-toolbar")
              .evaluate((el) => el.getBoundingClientRect().top)),
        ).toBeCloseTo(80, 0);
        await page.locator(`#row-${id} .score-controls-link`).click();
        await expect(
          page.getByLabel("Jump to scheme", { exact: true }),
        ).toHaveValue(id);
      }
      await noOverflow(page);
    }
  });
}
