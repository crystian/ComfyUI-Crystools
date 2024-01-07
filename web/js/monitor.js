import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";

//ram_used = ram.used / (1024 ** 3)
//    ram_total = ram.total / (1024 ** 3)
//    ram_stats = f"Used RAM: {ram_used:.2f} GB / Total RAM: {ram_total:.2f} GB"
//used_space = hard_drive.used / (1024 ** 3)
//    total_space = hard_drive.total / (1024 ** 3)
//    hard_drive_stats = f"Used Space: {used_space:.2f} GB / Total Space: {total_space:.2f} GB"
//    print(hard_drive_stats)
//    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
//    vram_used = torch.cuda.memory_allocated(device) / (1024 ** 3)
//    vram_total = torch.cuda.get_device_properties(device).total_memory / (1024 ** 3)
//    vram_stats = f"Used VRAM: {vram_used:.2f} GB / Total VRAM: {vram_total:.2f} GB"

class CrystoolsMonitor {
  idExtensionName = 'Crystools.monitor';
  idShowMonitor = 'Crystools.showMonitor';
  defaultShowMonitor = true;
  menuPrefix = '';
  htmlIdCrystoolsRoot = 'crystools-root';
  htmlIdCrystoolsMonitorContainer = 'crystools-monitor-container';

  constructor() {
    this.createSettings();
  }

  createSettings = () => {
    app.ui.settings.addSetting({
      id: this.idShowMonitor,
      name: this.menuPrefix + 'Show monitors in menu',
      type: 'boolean',
      defaultValue: this.defaultShowMonitor,
      onChange: this.showMonitor,
    });
  };

  showMonitor = (value) => {
    const container = document.getElementById(this.htmlIdCrystoolsMonitorContainer);

    // validation because this run before setup
    if (container) {
      container.style.display = value ? 'block' : 'none';
    }
  };

  updateDisplay = () => {

  };

  setup() {
    const parentElement= document.getElementById('queue-button');

    let ctoolsRoot = document.getElementById(this.htmlIdCrystoolsRoot);
    if(!ctoolsRoot){
      ctoolsRoot = document.createElement('div');
      ctoolsRoot.setAttribute('id', this.htmlIdCrystoolsRoot);
      ctoolsRoot.style.display = 'flex';
      ctoolsRoot.style.width = '100%';
      ctoolsRoot.style.flexDirection = 'column';
      parentElement.insertAdjacentElement('afterend', ctoolsRoot);
    }

    const htmlContainer = document.createElement('div');
    htmlContainer.setAttribute('id', this.htmlIdCrystoolsMonitorContainer);
    htmlContainer.setAttribute('title', '...');
    htmlContainer.style.margin = '4px 0';
    htmlContainer.style.width = '100%';
    htmlContainer.style.cursor = 'pointer';
    htmlContainer.style.order = '1';
    htmlContainer.innerHTML = 'algo';
    ctoolsRoot.append(htmlContainer);

    this.showMonitor(app.ui.settings.getSettingValue(this.idShowMonitor, this.defaultShowMonitor));
    this.registerListeners();
  }

  registerListeners = () => {
    api.addEventListener("crystools.monitor", (event) => {
      const data = event.detail;
      console.log(data);
    });
  };
}

const crystoolsMonitor = new CrystoolsMonitor();
app.registerExtension({
  name: crystoolsMonitor.idExtensionName,
  setup: crystoolsMonitor.setup.bind(crystoolsMonitor),
})