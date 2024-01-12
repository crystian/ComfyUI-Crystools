// import { LGraphNode as TLGraphNode, LiteGraph as TLiteGraph } from '/types/litegraph.js';
import * as litegraph from '/types/litegraph';
export * from '/types/litegraph.js';
// export declare const LiteGraph: typeof TLiteGraph;
// export LiteGraph;

// export declare const TLGraphNode: typeof TLGraphNode = typeof TLGraphNode;
export declare type LGraphNode = litegraph.LGraphNode & {
  widgets?: any[];
  isVirtualNode?: boolean;
  onResize?: (size: [number, number]) => void;
  prototype: typeof LGraphNode;
};

export declare type LiteGraph = litegraph.LiteGraph;

// GLOBAL using: // / <reference path="./types.ts" />
// But I prefer to don't use it
// import { LGraphNode as TLGraphNode, LiteGraph as TLiteGraph } from '/types/litegraph';
// export declare const LGraphNode: typeof TLGraphNode;
// declare global {
//   const LGraphNode: LGraphNode;
// }
