import { injectCss } from './utils.js';
void injectCss('extensions/ComfyUI-Crystools/monitor.css').then(() => {
});
export var Styles;
(function (Styles) {
    Styles["BARS"] = "BARS";
})(Styles || (Styles = {}));
export var Colors;
(function (Colors) {
    Colors["CPU"] = "#0AA015";
    Colors["RAM"] = "#07630D";
    Colors["DISK"] = "#730F92";
    Colors["GPU"] = "#0C86F4";
    Colors["VRAM"] = "#176EC7";
    Colors["TEMP_START"] = "#00ff00";
    Colors["TEMP_END"] = "#ff0000";
})(Colors || (Colors = {}));
