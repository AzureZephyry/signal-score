import type { Scheme } from "./types";
export const SCHEMES: Scheme[] = [
  {
    id: "unipolar",
    name: "Unipolar NRZ",
    family: "UNIPOLAR",
    short: "One polarity. Two states.",
    rule: "1 → +V  /  0 → 0V",
    detail:
      "A one holds positive voltage for the entire bit. A zero holds the baseline. NRZ means no required return to zero within a bit.",
  },
  {
    id: "nrz-l",
    name: "Polar NRZ-L",
    family: "POLAR",
    short: "The level is the message.",
    rule: "1 → −V  /  0 → +V",
    detail:
      "The voltage level directly represents the bit: negative for one, positive for zero. Consecutive equal bits hold the same level.",
  },
  {
    id: "nrz-i",
    name: "Polar NRZ-I",
    family: "POLAR · STATEFUL",
    short: "Information in the inversion.",
    rule: "1 → invert at start  /  0 → hold",
    detail:
      "Starting from the chosen initial level, invert at the beginning of each one. A zero preserves the previous voltage. The initial level is the state immediately before bit 1.",
    stateful: true,
  },
  {
    id: "rz",
    name: "Polar RZ",
    family: "POLAR",
    short: "Every pulse comes home.",
    rule: "1 → +V, 0V  /  0 → −V, 0V",
    detail:
      "Each bit uses two equal halves. The first half is positive for one and negative for zero; the second half always returns to zero.",
  },
  {
    id: "manchester",
    name: "Manchester",
    family: "POLAR · BIPHASE",
    short: "A transition at the center.",
    rule: "1 → −V to +V  /  0 → +V to −V",
    detail:
      "Every bit has a transition at its midpoint. One rises from negative to positive (nTp); zero falls from positive to negative (pTn).",
  },
  {
    id: "differential",
    name: "Differential Manchester",
    family: "POLAR · BIPHASE · STATEFUL",
    short: "The boundary tells the story.",
    rule: "0 → invert at start  /  1 → hold; mid-bit → invert",
    detail:
      "A zero inverts at the beginning of the bit; a one does not. Every bit also inverts at its midpoint. The output describes that midpoint direction, while inv / no inv describes only the beginning.",
    stateful: true,
  },
  {
    id: "ami",
    name: "Bipolar AMI",
    family: "BIPOLAR",
    short: "Ones take turns.",
    rule: "0 → 0V  /  1 → alternate +V, −V",
    detail:
      "Zeros stay at zero voltage. Each one alternates polarity from the previous nonzero pulse. The first one is positive, even after leading zeros.",
  },
  {
    id: "pseudoternary",
    name: "Bipolar Pseudoternary",
    family: "BIPOLAR",
    short: "Zeros take the stage.",
    rule: "1 → 0V  /  0 → alternate +V, −V",
    detail:
      "Ones stay at zero voltage. Each zero alternates polarity from the previous nonzero pulse. The first zero is positive, even after leading ones.",
  },
];
