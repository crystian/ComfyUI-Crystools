export var EStatus;
(function (EStatus) {
    EStatus["executing"] = "Executing";
    EStatus["executed"] = "Executed";
    EStatus["execution_error"] = "Execution error";
})(EStatus || (EStatus = {}));
export const ComfyKeyMenuDisplayOption = 'Comfy.UseNewMenu';
export var MenuDisplayOptions;
(function (MenuDisplayOptions) {
    MenuDisplayOptions["Disabled"] = "Disabled";
    MenuDisplayOptions["Top"] = "Top";
    MenuDisplayOptions["Bottom"] = "Bottom";
})(MenuDisplayOptions || (MenuDisplayOptions = {}));
export class ProgressBarUIBase {
    constructor(rootId, rootElement) {
        Object.defineProperty(this, "rootId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: rootId
        });
        Object.defineProperty(this, "rootElement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: rootElement
        });
        Object.defineProperty(this, "htmlClassMonitor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'crystools-monitors-container'
        });
        if (this.rootElement && this.rootElement.children.length === 0) {
            this.rootElement.setAttribute('id', this.rootId);
            this.rootElement.classList.add(this.htmlClassMonitor);
            this.rootElement.classList.add(this.constructor.name);
        }
        else {
        }
    }
}
