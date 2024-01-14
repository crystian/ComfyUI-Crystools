export * from '/scripts/widgets.js';
export class TLGraphNode extends LGraphNode {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "widgets", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isVirtualNode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onResize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "widgets_values", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "prototype", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
export const LiteGraph = window.LiteGraph;
