import type { LiteGraph as TLiteGraph } from '/types/litegraph';
declare const LiteGraph: typeof TLiteGraph;

declare global {
  const LiteGraph: LiteGraph;
}
