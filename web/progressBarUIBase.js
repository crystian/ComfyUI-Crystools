export var EStatus;
(function (EStatus) {
    EStatus["executing"] = "Executing";
    EStatus["executed"] = "Executed";
    EStatus["execution_error"] = "Execution error";
})(EStatus || (EStatus = {}));
export var NewMenuOptions;
(function (NewMenuOptions) {
    NewMenuOptions["Disabled"] = "Disabled";
    NewMenuOptions["Top"] = "Top";
    NewMenuOptions["Bottom"] = "Bottom";
})(NewMenuOptions || (NewMenuOptions = {}));
export class ProgressBarUIBase {
    constructor(parentId, rootId) {
        Object.defineProperty(this, "parentId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: parentId
        });
        Object.defineProperty(this, "rootId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: rootId
        });
        Object.defineProperty(this, "htmlRoot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "htmlContainer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "htmlClassMonitor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'crystools-monitor-container'
        });
        Object.defineProperty(this, "createRoot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.htmlRoot = document.getElementById(this.rootId);
                if (!this.htmlRoot) {
                    this.htmlRoot = document.createElement('div');
                    this.htmlRoot.setAttribute('id', this.rootId);
                    const parentElement = document.getElementById(this.parentId);
                    if (parentElement) {
                        parentElement.insertAdjacentElement('afterend', this.htmlRoot);
                    }
                    else {
                        console.error('Crystools: parentElement not found', this.parentId);
                    }
                }
                this.htmlContainer = document.createElement('div');
                this.htmlContainer.classList.add(this.htmlClassMonitor);
                this.htmlContainer.setAttribute('id', this.constructor.name);
                this.htmlRoot.append(this.htmlContainer);
            }
        });
        this.createRoot();
    }
}
