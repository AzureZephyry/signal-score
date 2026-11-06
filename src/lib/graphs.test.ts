import { describe, expect, it } from "vitest";
import { GRAPHS, encodeGraph, encodeGraphs } from "./graphs";
import { inversionDecisions } from "./inversion";
import { bitX, voltageY } from "./geometry";
import { explainBit } from "./explanations";

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
const affected = GRAPHS.filter((g) => g.stateful);
const fixtures = [
  "10100110",
  "00110011",
  "00000000",
  "11111111",
  "01010101",
  "10101010",
  "1",
  "0",
  "1010011000110011".repeat(8),
];
describe("ten addressable graphs across eight algorithms", () => {
  it("preserves stable unique ordering and legacy section IDs", () => {
    expect(GRAPHS.map((g) => g.id)).toEqual(ids);
    expect(new Set(GRAPHS.map((g) => g.id)).size).toBe(10);
    expect(new Set(GRAPHS.map((g) => g.algorithm)).size).toBe(8);
  });
  it.each([
    ["10100110", [-1, -1, 1, 1, 1, -1, 1, 1], [1, 1, -1, -1, -1, 1, -1, -1]],
    ["00110011", [1, 1, -1, 1, 1, 1, -1, 1], [-1, -1, 1, -1, -1, -1, 1, -1]],
  ] as const)(
    "matches independently specified polarity fixtures for %s",
    (sequence, nrz, diff) => {
      const signals = encodeGraphs(sequence);
      for (const [id, expected] of [
        ["nrz-i", nrz],
        ["differential", diff],
      ] as const) {
        const high = signals.find((s) => s.graphId === id)!;
        const low = signals.find((s) => s.graphId === `${id}-low`)!;
        expect(high.bits.map((b) => b.segments[0].level)).toEqual(expected);
        expect(low.bits.map((b) => b.segments[0].level)).toEqual(
          expected.map((n) => -n),
        );
        if (id === "differential") {
          expect(high.bits.map((b) => b.segments[1].level)).toEqual(
            expected.map((n) => -n),
          );
          expect(low.bits.map((b) => b.segments[1].level)).toEqual(expected);
        }
      }
    },
  );
  it.each(
    affected.flatMap((graph) =>
      fixtures.map((sequence) => ({ graph, sequence })),
    ),
  )(
    "$graph.id / $sequence retains previous state, decisions and boundary positions",
    ({ graph, sequence }) => {
      const signal = encodeGraph(graph, sequence);
      const decisions = inversionDecisions(signal);
      expect(decisions).toHaveLength(sequence.length);
      let previous = graph.initial!;
      for (const [i, b] of signal.bits.entries()) {
        const invert =
          sequence[i] === (graph.algorithm === "nrz-i" ? "1" : "0");
        const first = invert ? -previous : previous;
        expect(b.segments[0].level).toBe(first);
        const last = graph.algorithm === "differential" ? -first : first;
        expect(b.segments.at(-1)!.level).toBe(last);
        expect(decisions[i]).toEqual({
          index: i,
          invert,
          previous,
          level: first,
        });
        expect(b.action).toBe(invert ? "inv" : "no inv");
        expect(explainBit(signal, i)).toContain(
          invert ? "solid circle (invert)" : "hollow circle (no invert)",
        );
        for (const width of [64, 80, 170]) {
          expect(bitX(decisions[i].index, width)).toBe(56 + i * width);
          expect(voltageY(decisions[i].level)).toBe(first === 1 ? 48 : 120);
        }
        previous = last as 1 | -1;
      }
    },
  );
  it("uses opposite solid/hollow decisions for the two stateful families", () => {
    const signals = encodeGraphs("10100110");
    for (const signal of signals.filter((s) => s.initial !== undefined)) {
      const markers = inversionDecisions(signal);
      expect(markers.filter((m) => m.invert).map((m) => m.index + 1)).toEqual(
        signal.id === "nrz-i" ? [1, 3, 6, 7] : [2, 4, 5, 8],
      );
    }
  });
});
