import { describe, expect, it } from "vitest";
import { encode } from "./encoding";
import { SCHEMES } from "./schemes";
import type { SchemeId, Voltage } from "./types";
import { SAMPLE, validateBits, validateLength } from "./validation";
import { AXIS_WIDTH, stepPath, voltageY } from "./geometry";

const output = (id: SchemeId, input: string, initial: 1 | -1 = 1) =>
  encode(id, input, initial)
    .bits.map((bit) => bit.output)
    .join(" ");
const levels = (id: SchemeId, input: string, initial: 1 | -1 = 1) =>
  encode(id, input, initial).segments.map((segment) => segment.level);

const sampleOutputs: Record<SchemeId, string> = {
  unipolar: "hi hi hi lo lo hi lo hi hi lo lo lo",
  "nrz-l": "neg neg neg pos pos neg pos neg neg pos pos pos",
  "nrz-i": "neg pos neg neg neg pos pos neg pos pos pos pos",
  rz: "pos pos pos neg neg pos neg pos pos neg neg neg",
  manchester: "nTp nTp nTp pTn pTn nTp pTn nTp nTp pTn pTn pTn",
  differential: "pTn nTp pTn pTn pTn nTp nTp pTn nTp nTp nTp nTp",
  ami: "pos neg pos zero zero neg zero pos neg zero zero zero",
  pseudoternary: "zero zero zero pos neg zero pos zero zero neg pos neg",
};
const sampleLevels: Record<SchemeId, Voltage[]> = {
  unipolar: [1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0],
  "nrz-l": [-1, -1, -1, 1, 1, -1, 1, -1, -1, 1, 1, 1],
  "nrz-i": [-1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1],
  rz: [
    1, 0, 1, 0, 1, 0, -1, 0, -1, 0, 1, 0, -1, 0, 1, 0, 1, 0, -1, 0, -1, 0, -1,
    0,
  ],
  manchester: [
    -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, 1, 1, -1, 1, -1,
    1, -1,
  ],
  differential: [
    1, -1, -1, 1, 1, -1, 1, -1, 1, -1, -1, 1, -1, 1, 1, -1, -1, 1, -1, 1, -1, 1,
    -1, 1,
  ],
  ami: [1, -1, 1, 0, 0, -1, 0, 1, -1, 0, 0, 0],
  pseudoternary: [0, 0, 0, 1, -1, 0, 1, 0, 0, -1, 1, -1],
};

describe("instructor sample: 111001011000", () => {
  it.each(SCHEMES)(
    "$name produces the verified per-bit labels and voltage intervals",
    ({ id }) => {
      expect(output(id, SAMPLE)).toBe(sampleOutputs[id]);
      expect(levels(id, SAMPLE)).toEqual(sampleLevels[id]);
    },
  );
  it("supports the initially-low NRZ-I example", () => {
    expect(output("nrz-i", SAMPLE, -1)).toBe(
      "pos neg pos pos pos neg neg pos neg neg neg neg",
    );
  });
  it("supports the initially-low Differential Manchester example", () => {
    expect(output("differential", SAMPLE, -1)).toBe(
      "nTp pTn nTp nTp nTp pTn pTn nTp pTn pTn pTn pTn",
    );
  });
  it("places inversion annotations at the bit beginning, correcting the document shifts", () => {
    expect(encode("nrz-i", SAMPLE).bits.map((bit) => bit.action)).toEqual([
      "inv",
      "inv",
      "inv",
      "no inv",
      "no inv",
      "inv",
      "no inv",
      "inv",
      "inv",
      "no inv",
      "no inv",
      "no inv",
    ]);
    expect(
      encode("differential", SAMPLE).bits.map((bit) => bit.action),
    ).toEqual([
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
    expect(encode("rz", SAMPLE).bits.every((bit) => bit.action === "RZ")).toBe(
      true,
    );
  });
});

type Fixture = [SchemeId, string, string, string];
const fixtures: Fixture[] = [
  ["unipolar", "lo lo lo lo", "hi hi hi hi", "lo hi lo hi"],
  ["nrz-l", "pos pos pos pos", "neg neg neg neg", "pos neg pos neg"],
  ["nrz-i", "pos pos pos pos", "neg pos neg pos", "pos neg neg pos"],
  ["rz", "neg neg neg neg", "pos pos pos pos", "neg pos neg pos"],
  ["manchester", "pTn pTn pTn pTn", "nTp nTp nTp nTp", "pTn nTp pTn nTp"],
  ["differential", "nTp nTp nTp nTp", "pTn nTp pTn nTp", "nTp pTn pTn nTp"],
  ["ami", "zero zero zero zero", "pos neg pos neg", "zero pos zero neg"],
  [
    "pseudoternary",
    "pos neg pos neg",
    "zero zero zero zero",
    "pos zero neg zero",
  ],
];
for (const [id, zeros, ones, alternating] of fixtures) {
  describe(id, () => {
    it("encodes all zeros", () => expect(output(id, "0000")).toBe(zeros));
    it("encodes all ones", () => expect(output(id, "1111")).toBe(ones));
    it("encodes alternating bits", () =>
      expect(output(id, "0101")).toBe(alternating));
    it("encodes each single-bit input", () => {
      expect(output(id, "0")).toBe(zeros.split(" ")[0]);
      expect(output(id, "1")).toBe(ones.split(" ")[0]);
    });
  });
}

describe("stateful initial conditions and continuity", () => {
  for (const id of ["nrz-i", "differential"] as const) {
    it.each(["0", "1", "0000", "1111", "0101", SAMPLE])(
      `${id}: low initial condition negates every high-initial interval for %s`,
      (input) => {
        expect(levels(id, input, -1)).toEqual(
          levels(id, input, 1).map((level) => -level),
        );
        expect(encode(id, input, -1).initial).toBe(-1);
      },
    );
  }
  it("NRZ-I flips only at ones", () => {
    for (const initial of [1, -1] as const) {
      const result = encode("nrz-i", SAMPLE, initial);
      let previous: Voltage = initial;
      for (const bit of result.bits) {
        const current = bit.segments[0].level;
        expect(current === previous).toBe(bit.input === "0");
        previous = current;
      }
    }
  });
  it("Differential Manchester always flips at midpoint and starts with a flip only for zero", () => {
    for (const initial of [1, -1] as const) {
      let previous: Voltage = initial;
      for (const bit of encode("differential", SAMPLE, initial).bits) {
        const [first, second] = bit.segments;
        expect(first.level).toBe(-second.level);
        expect(first.level === previous).toBe(bit.input === "1");
        previous = second.level;
      }
    }
  });
  it("alternation ignores zero-voltage bits and first nonzero pulse is positive", () => {
    expect(output("ami", "0001001101")).toBe(
      "zero zero zero pos zero zero neg pos zero neg",
    );
    expect(output("pseudoternary", "1110110010")).toBe(
      "zero zero zero pos zero zero neg pos zero neg",
    );
  });
});

describe("normalized geometry", () => {
  it.each(SCHEMES)(
    "$name covers exact non-overlapping bit intervals",
    ({ id }) => {
      const result = encode(id, SAMPLE);
      expect(result.segments[0].start).toBe(0);
      expect(result.segments.at(-1)!.end).toBe(12);
      result.segments.forEach((segment, i) => {
        expect([-1, 0, 1]).toContain(segment.level);
        expect(segment.end).toBeGreaterThan(segment.start);
        if (i) expect(segment.start).toBe(result.segments[i - 1].end);
      });
      const path = stepPath(result, 72);
      expect(path).toMatch(/^M[\d.,-]+(?:[HV][\d.-]+)*$/);
      expect(path).not.toMatch(/[LCSQTAZ]/i);
      expect(path.endsWith(`H${AXIS_WIDTH + 12 * 72}`)).toBe(true);
    },
  );
  it("renders the actual initial boundary transition", () => {
    expect(stepPath(encode("nrz-i", "1", 1), 72)).toBe("M44,48H56V120H128");
    expect(stepPath(encode("nrz-i", "0", -1), 72)).toBe("M44,120H56V120H128");
  });
  it("does not add a false trailing transition", () => {
    expect(stepPath(encode("unipolar", "1"), 72)).toBe("M56,48H128");
  });
  it("uses normalized voltage coordinates", () => {
    expect([voltageY(1), voltageY(0), voltageY(-1)]).toEqual([48, 84, 120]);
  });
  it.each(SCHEMES)("$name handles the maximum input size", ({ id }) => {
    expect(encode(id, "10".repeat(64)).bits).toHaveLength(128);
  });
});

describe("strict input validation", () => {
  it.each(["1", "12", "128", " 12 "])("accepts valid length %s", (length) =>
    expect(validateLength(length)).toBeNull(),
  );
  it.each([
    "",
    "0",
    "-1",
    "129",
    "1.5",
    "abc",
    "Infinity",
    "12e0",
    "1 2",
    "99999999999999999999999",
  ])("rejects invalid length %s", (length) =>
    expect(validateLength(length)).not.toBeNull(),
  );
  it.each(["111a", "10 1", "101\n", "1012", "０１", "10.1"])(
    "rejects invalid binary characters %s",
    (bits) => expect(validateBits(bits, 4)).toContain("Only binary"),
  );
  it.each(["", "1", "111", "11111"])(
    "rejects incorrect sequence length %s",
    (bits) => expect(validateBits(bits, 4)).toContain("exactly 4"),
  );
  it("accepts exact input only", () =>
    expect(validateBits("1010", 4)).toBeNull());
  it.each([0, -1, 1.5, 129, NaN])(
    "rejects unconfirmed/invalid numeric length %s",
    (length) =>
      expect(validateBits("1", length)).toBe("Confirm a valid length first."),
  );
  it.each(SCHEMES)(
    "$name rejects invalid input at the engine boundary",
    ({ id }) => {
      expect(() => encode(id, "")).toThrow();
      expect(() => encode(id, "102")).toThrow();
      expect(() => encode(id, "0".repeat(129))).toThrow();
    },
  );
});
