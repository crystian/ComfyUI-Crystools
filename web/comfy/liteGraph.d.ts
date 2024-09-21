export type * from './liteGraph.types.js';
import type { IWidget as IWidgetOld, LGraphNode as TypeGraphNode, TypeLiteGraph } from './liteGraph.types.js';
declare const LGraphNode: typeof TypeGraphNode;
export interface IWidget extends IWidgetOld {
    onRemove?: () => void;
    serializeValue?: () => Promise<void>;
}
export declare class TLGraphNode extends LGraphNode {
    static category: string;
    static shape: number;
    static color: string;
    static bgcolor: string;
    static collapsable: boolean;
    isVirtualNode?: boolean;
    widgets_values?: any[];
    name?: string;
    prototype: TLGraphNode;
}
export declare const LiteGraph: TypeLiteGraph;
