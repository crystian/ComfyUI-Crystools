export type * from './liteGraph.types';
export * from '/scripts/widgets.js';
import type { LGraphNode as TypeGraphNode, TypeLiteGraph } from './liteGraph.types';
declare const LGraphNode: typeof TypeGraphNode;
export declare class TLGraphNode extends LGraphNode {
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
    prototype: TLGraphNode;
}
export declare const LiteGraph: TypeLiteGraph;
