export type Voltage = -1 | 0 | 1;
export type InitialLevel = -1 | 1;
export type SchemeId =
  | "unipolar"
  | "nrz-l"
  | "nrz-i"
  | "rz"
  | "manchester"
  | "differential"
  | "ami"
  | "pseudoternary";
export type GraphId = SchemeId | "nrz-i-low" | "differential-low";
export interface Graph extends Omit<Scheme, "id"> {
  id: GraphId;
  algorithm: SchemeId;
  initial?: InitialLevel;
}
export interface Segment {
  start: number;
  end: number;
  level: Voltage;
}
export interface EncodedBit {
  index: number;
  input: "0" | "1";
  segments: Segment[];
  output: string;
  action?: string;
}
export interface EncodedSignal {
  id: SchemeId;
  graphId?: GraphId;
  bits: EncodedBit[];
  segments: Segment[];
  initial?: InitialLevel;
}
export interface Scheme {
  id: SchemeId;
  name: string;
  family: string;
  short: string;
  rule: string;
  detail: string;
  stateful?: boolean;
}
