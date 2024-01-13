/* es lint-disable */

// import { LGraphNode as TLGraphNode, LiteGraph as TLiteGraph } from '/types/litegraph.js';
import type { LGraph, LiteGraph, LGraphNode } from '/types/litegraph.js';
export * from '/types/litegraph.js';

// export declare const TLiteGraph: typeof LiteGraph;
export declare type TLiteGraph = typeof LiteGraph & {
  graph: LGraph;
};

// export declare const TLGraphNode: typeof TLGraphNode = typeof TLGraphNode;
export declare type TLGraphNode = LGraphNode & {
  widgets?: any[];
  isVirtualNode?: boolean;
  onResize?: (size: [number, number]) => void;
  prototype: typeof TLGraphNode;
};

console.log('types.ts');
// I prefer not use global, but if I change of opinion:
// / <reference path="./types.ts" />
// import { LGraphNode as TLGraphNode, LiteGraph as TLiteGraph } from '/types/litegraph';
// export declare const LGraphNode: typeof TLGraphNode;
// declare global {
//   const LGraphNode: LGraphNode;
// }
