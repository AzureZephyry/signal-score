import { describe, expect, it } from "vitest";
import { encode } from "./encoding";
import { explainBit, SCHEME_SUMMARIES } from "./explanations";
import { SCHEMES } from "./schemes";
const sample = "111001011000";
describe("contextual explanations from computed encoding data", () => {
  it.each(SCHEMES)(
    "$name has a plain-English introduction and a sample-bit explanation",
    ({ id }) => {
      expect(SCHEME_SUMMARIES[id].length).toBeGreaterThan(30);
      expect(explainBit(encode(id, sample), 5)).toContain("Input 1");
    },
  );
  it("explains Unipolar zero without confusing it with negative voltage", () => {
    expect(explainBit(encode("unipolar", "0"), 0)).toContain("0V");
    expect(explainBit(encode("unipolar", "0"), 0)).toContain("lo");
  });
  it("explains the NRZ-L polarity convention", () =>
    expect(explainBit(encode("nrz-l", "1"), 0)).toContain(
      "negative voltage (neg)",
    ));
  it("reads the initial NRZ-I high and low states", () => {
    expect(explainBit(encode("nrz-i", "1", 1), 0)).toContain(
      "initial level was +V. Input 1 inverts that level to −V",
    );
    expect(explainBit(encode("nrz-i", "1", -1), 0)).toContain(
      "initial level was −V. Input 1 inverts that level to +V",
    );
  });
  it("reads the preceding NRZ-I state at a later bit", () => {
    expect(explainBit(encode("nrz-i", sample, 1), 5)).toContain(
      "previous bit ended at −V. Input 1 inverts that level to +V",
    );
    expect(explainBit(encode("nrz-i", sample, -1), 5)).toContain(
      "previous bit ended at +V. Input 1 inverts that level to −V",
    );
  });
  it("explains holding an NRZ-I level for a zero", () =>
    expect(explainBit(encode("nrz-i", "10"), 1)).toContain(
      "Input 0 keeps that level at −V, with no beginning transition (no inv)",
    ));
  it("explains both halves of Polar RZ", () =>
    expect(explainBit(encode("rz", "0"), 0)).toContain(
      "−V during the first half, then returns to 0V halfway through",
    ));
  it("explains each Manchester midpoint direction", () => {
    expect(explainBit(encode("manchester", "1"), 0)).toContain(
      "negative-to-positive rise is labeled nTp",
    );
    expect(explainBit(encode("manchester", "0"), 0)).toContain(
      "positive-to-negative fall is labeled pTn",
    );
  });
  it("uses the previous END level for Differential Manchester", () =>
    expect(explainBit(encode("differential", sample), 3)).toContain(
      "previous bit ended at −V. Input 0 adds a beginning inversion to +V (inv). Halfway through, +V changes to −V (pTn)",
    ));
  it("explains both initial conditions for Differential Manchester", () => {
    expect(explainBit(encode("differential", "1", 1), 0)).toContain(
      "initial level was +V. Input 1 keeps +V at the beginning (no inv)",
    );
    expect(explainBit(encode("differential", "1", -1), 0)).toContain(
      "Halfway through, −V changes to +V (nTp)",
    );
  });
  it("explains AMI pulse history across zero-voltage bits", () =>
    expect(explainBit(encode("ami", sample), 5)).toContain(
      "previous nonzero pulse was +V at bit 3, so this pulse uses the opposite polarity",
    ));
  it("explains Pseudoternary pulse history", () =>
    expect(explainBit(encode("pseudoternary", sample), 4)).toContain(
      "previous nonzero pulse was +V at bit 4",
    ));
  it("explains the first positive pulse after leading inactive bits", () => {
    expect(explainBit(encode("ami", "001"), 2)).toContain(
      "first nonzero pulse, which starts positive",
    );
    expect(explainBit(encode("pseudoternary", "110"), 2)).toContain(
      "first nonzero pulse, which starts positive",
    );
  });
  it("explains why inactive bits do not advance pulse history", () =>
    expect(explainBit(encode("ami", "10"), 1)).toContain(
      "most recent nonzero pulse was +V at bit 1; this zero-voltage bit does not change that pulse history",
    ));
  it("does not mutate the computed signal", () => {
    const signal = encode("ami", sample);
    const before = JSON.stringify(signal);
    signal.bits.forEach((bit) => explainBit(signal, bit.index));
    expect(JSON.stringify(signal)).toBe(before);
  });
  it("has a safe empty-selection message", () =>
    expect(explainBit(encode("unipolar", "1"), -1)).toContain("Select a bit"));
});
