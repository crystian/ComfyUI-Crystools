// A LOTS OF PATCHES FOR LITEGRAPH TYPES ¯\_(ツ)_/¯
import { LGraph } from 'types/litegraph.js';

export type * from 'types/litegraph.js';
// export type * from 'scripts/widgets';
// export type * from 'scripts/app';
// export type { api } from 'scripts/api';
//
// import { LGraph, LiteGraph } from '/types/litegraph';

export declare type TypeLiteGraph = typeof LiteGraph & {
  graph: LGraph;
};

// export declare type ComfyApi = typeof api;
export declare type ComfyNode = any;

// I prefer not use global, but if I change of opinion:
// / <reference path="./types.ts" />
// import { LGraphNode as TLGraphNode, LiteGraph as TLiteGraph } from '/types/litegraph';
// export declare const LGraphNode: typeof TLGraphNode;
// declare global {
//   const LGraphNode: LGraphNode;
// }
