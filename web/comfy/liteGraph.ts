// / <reference path="/types/litegraph.d.ts" />
// A LOTS OF PATCHES FOR LITEGRAPH TYPES ¯\_(ツ)_/¯
export type * from './liteGraph.types.js';

import type { IWidget as IWidgetOld, LGraphNode as TypeGraphNode, TypeLiteGraph } from './liteGraph.types.js';

declare const LGraphNode: typeof TypeGraphNode; // just for get the type

export interface IWidget extends IWidgetOld {
  onRemove?: () => void;
  serializeValue?: () => Promise<void>;
}

export class TLGraphNode extends LGraphNode {
  // on discovery...
  static category: string;
  static shape: number;
  static color: string;
  static bgcolor: string;
  static collapsable: boolean;

  // widgets?: IWidget[];
  isVirtualNode?: boolean;
  // override onResize?: (size: [number, number]) => void;
  widgets_values?: any[];
  name?: string;

  prototype: TLGraphNode; // yes itself
}

// from globals
export const LiteGraph: TypeLiteGraph = (window as any).LiteGraph;
