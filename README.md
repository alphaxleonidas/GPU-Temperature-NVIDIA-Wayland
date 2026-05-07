# GPU-Temperature-NVIDIA-GNOME

GNOME Extension to show NVIDIA GPU Stats (Utilization, VRAM, Power Draw, Temp) in Top Bar of GNOME 45/46 in Wayland.

For Editing: `extension.js`


# Context

GreenWithEnvy is EOL and works only under X11. Rest of the system monitor extensions show the GPU stats except temperature.


# Installation

```
cd ~

git clone https://github.com/alphaxleonidas/GPU-Stats-NVIDIA-GNOME.git

cp -r GPU-Stats-NVIDIA-GNOME/* ~/.local/share/gnome-shell/extensions/

gnome-extensions enable gpu-temp@local
```
Logout and relogin to restart the session. 

Note the display temperature on the right side of the bar.

<img width="186" height="35" alt="image" src="https://github.com/user-attachments/assets/b8ea893a-6b25-4d22-87cb-a8ead1dc39c5" />
