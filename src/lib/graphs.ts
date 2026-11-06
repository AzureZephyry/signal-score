import { SCHEMES } from "./schemes";
import { encode } from "./encoding";
import type { Graph, GraphId, EncodedSignal } from "./types";

// High variants retain the original IDs so existing section links remain valid.
export const GRAPHS: Graph[] = SCHEMES.flatMap((scheme): Graph[] => {
  const base = { ...scheme, algorithm: scheme.id };
  return scheme.stateful
    ? ([1, -1] as const).map((initial) => ({
        ...base,
        id: (initial === 1 ? scheme.id : `${scheme.id}-low`) as GraphId,
        initial,
        name: `${scheme.name} — Initially ${initial === 1 ? "High" : "Low"}`,
      }))
    : [
        {
          ...base,
          name: scheme.id === "pseudoternary" ? "Pseudoternary" : scheme.name,
        },
      ];
});
export function encodeGraph(graph: Graph, sequence: string): EncodedSignal {
  return {
    ...encode(graph.algorithm, sequence, graph.initial),
    graphId: graph.id,
  };
}
export const encodeGraphs = (sequence: string) =>
  GRAPHS.map((graph) => encodeGraph(graph, sequence));
export const signalGraphId = (signal: EncodedSignal): GraphId =>
  signal.graphId ?? signal.id;
