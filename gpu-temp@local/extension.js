import St from 'gi://St';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

// ✅ Proper GObject class registration (fixes GType error)
const GpuTempIndicator = GObject.registerClass(
class GpuTempIndicator extends PanelMenu.Button {
    constructor() {
        super(0.0, "GPU Temp");

        this._label = new St.Label({
            text: "GPU: --°C",
            y_align: Clutter.ActorAlign.CENTER
        });

        this.add_child(this._label);

        // Poll every 2 seconds
        this._timeout = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            2,
            () => {
                this._updateTemp();
                return GLib.SOURCE_CONTINUE;
            }
        );

        this._updateTemp();
    }

    _updateTemp() {
        try {
            let [ok, stdout] = GLib.spawn_command_line_sync(
                "nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader,nounits"
            );

            if (ok && stdout) {
                let temp = stdout.toString().trim().split('\n')[0];

                if (temp) {
                    this._label.set_text(`GPU: ${temp}°C`);
                } else {
                    this._label.set_text("GPU: N/A");
                }
            } else {
                this._label.set_text("GPU: ERR");
            }
        } catch (e) {
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

export default class GpuTempExtension extends Extension {
    enable() {
        this._indicator = new GpuTempIndicator();
        Main.panel.addToStatusArea("gpu-temp", this._indicator);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}
