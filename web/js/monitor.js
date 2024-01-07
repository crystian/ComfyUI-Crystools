import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";

app.registerExtension({
  name: "ComfyUI.monitor",
  async setup() {
    api.addEventListener("crystools.monitor", (event) => {
      const data = event.detail;
      console.log(data);
    });
  },
});

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
