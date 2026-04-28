import St from 'gi://St';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

function runCommand(argv) {
    return new Promise((resolve, reject) => {
        try {
            let proc = Gio.Subprocess.new(
                argv,
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );

            proc.communicate_utf8_async(null, null, (proc, res) => {
                try {
                    let [, stdout, stderr] = proc.communicate_utf8_finish(res);
                    resolve(stdout);
                } catch (e) {
                    reject(e);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}

const GpuIndicator = GObject.registerClass(
class GpuIndicator extends PanelMenu.Button {
    constructor() {
        super(0.0, "GPU Stats");

        this._label = new St.Label({
            text: "GPU: --",
            y_align: Clutter.ActorAlign.CENTER,
            style: "padding: 0 6px;"
        });

        this.add_child(this._label);

        this._tempItem = new PopupMenu.PopupMenuItem("Temp: --°C");
        this._utilItem = new PopupMenu.PopupMenuItem("Utilization: --%");
        this._vramItem = new PopupMenu.PopupMenuItem("VRAM: -- / -- GB");
        this._powerItem = new PopupMenu.PopupMenuItem("Power: -- W");

        this.menu.addMenuItem(this._tempItem);
        this.menu.addMenuItem(this._utilItem);
        this.menu.addMenuItem(this._vramItem);
        this.menu.addMenuItem(this._powerItem);

        this._timeout = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            2,
            () => {
                this._updateAsync();
                return GLib.SOURCE_CONTINUE;
            }
        );

        this._updateAsync();
    }

    async _updateAsync() {
        try {
            let stdout = await runCommand([
                '/usr/bin/nvidia-smi',
                '--query-gpu=temperature.gpu,utilization.gpu,memory.used,memory.total,power.draw',
                '--format=csv,noheader,nounits'
            ]);

            if (!stdout)
                throw new Error("No output");

            let line = stdout.trim().split('\n')[0];

            let [temp, util, memUsed, memTotal, power] =
                line.split(',').map(v => v.trim());

            let usedGB = (parseFloat(memUsed) / 1024).toFixed(2);
            let totalGB = (parseFloat(memTotal) / 1024).toFixed(2);

            power = power && power !== "[N/A]" ? power : "N/A";

            // Top bar
            this._label.set_text(
                ` GPU: ${power}W |  GPU: ${temp}°C`
            //  🎮 ${usedGB}/${totalGB}GB  | ⚡ ${util}%  |  🌡  🔌 
            );

            // Dropdown
            
            this._utilItem.label.text = `Utilization: ${util}%`;
            this._vramItem.label.text = `VRAM: ${usedGB} / ${totalGB} GB (${((usedGB / totalGB) * 100).toFixed(1)}%)`;
            //this._vramItem.label.text = `VRAM: ${usedGB} / ${totalGB} GB`;
            this._powerItem.label.text = `Power: ${power} W`;
            this._tempItem.label.text = `Temp: ${temp}°C`;

            // Color indicator
            let t = parseInt(temp);
            if (t > 80)
                this._label.set_style("color: red; padding: 0 6px;");
            else if (t > 65)
                this._label.set_style("color: orange; padding: 0 6px;");
            else
                this._label.set_style("color: white; padding: 0 6px;");

        } catch (e) {
            log(`GPU EXT ERROR: ${e}`);
            this._label.set_text("GPU: ERR");
        }
    }

    destroy() {
        if (this._timeout) {
            GLib.source_remove(this._timeout);
            this._timeout = null;
        }
        super.destroy();
    }
});

export default class GpuExtension extends Extension {
    enable() {
        this._indicator = new GpuIndicator();
        Main.panel.addToStatusArea("gpu-stats", this._indicator);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}
