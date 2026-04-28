# GPU-Temperature-NVIDIA-Wayland

GNOME Extension to show NVIDIA GPU Temperature in Top Bar of GNOME 45/46 in Wayland


# Context

GreenWithEnvy is EOL and works only under X11. Rest of the system monitor extensions show the GPU stats except temperature.

# Disclaimer

This repo is for self use. Use it at your own risk. I am not responsible for any damage that would occur. 

# Installation

```
cd ~

git clone https://github.com/alphaxleonidas/GPU-Temperature-NVIDIA-Wayland.git

cp -r GPU-Temperature-NVIDIA-Wayland/* ~/.local/share/gnome-shell/extensions/

gnome-extensions enable gpu-temp@local
```
Logout and relogin to restart the session. 

Note the display temperature on the right side of the bar.

<img width="186" height="35" alt="image" src="https://github.com/user-attachments/assets/b8ea893a-6b25-4d22-87cb-a8ead1dc39c5" />
