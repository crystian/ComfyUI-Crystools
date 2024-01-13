// / <reference path="/types/litegraph.d.ts" />
// A LOTS OF PATCHES FOR LITEGRAPH TYPES ¯\_(ツ)_/¯
export type * from './liteGraph.types';
export * from '/scripts/widgets.js';

import type { LGraphNode as TypeGraphNode, TypeLiteGraph } from './liteGraph.types';
declare const LGraphNode: typeof TypeGraphNode; // just for get the type

export class TLGraphNode extends LGraphNode {
  // on discovery...
  static category: string;
  static shape: number;
  static color: string;
  static bgcolor: string;
  static collapsable: boolean;

  widgets?: any[];
  isVirtualNode?: boolean;
  onResize?: (size: [number, number]) => void;
  widgets_values?: any[];
  name?: string;

  prototype: TLGraphNode; // yes itself
}

console.log('liteGraph.ts');

// from globals
export const LiteGraph: TypeLiteGraph = (window as any).LiteGraph;
