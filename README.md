# Alguien Client - Survev.io client

# ⚠ This client it's not a hack ⚠

## Features

### FPS Show & Uncapping FPS
- **Show FPS:** A simple FPS counter displayed on the screen to monitor your frame rate in real-time.
- **Uncap FPS:** Allows you to uncap the FPS to get higher frame rates (useful for smoother gameplay, especially on high-refresh-rate monitors).

### Health and Adrenaline info

### Weapon Border Customization
- **Weapon Borders:** Automatically changes the border color of the weapon icon based on the current weapon equipped. Different weapon categories have unique border colors for better visual clarity.

### Movement/Camera Interpolation & Rotation (Local-Based)
- **Movement/Camera Interpolation:** Improves the fluidity of movement and the camera by interpolating player movement data for smoother transitions.
- **Rotation Based on Local Data:** The clients calculates and adjusts the player's rotation based on the local mouse position, without the need for server response.

### Menu
- A customizable menu allows players to toggle FPS display, uncap FPS, and hide or show the menu at any time with the **P** key. Also, all the actual/future features will be possible to activate or deactivate in this menu. <- **soon**

## Installation

To install the **Alguien Client**, you will need to **override** the existing game client using your browser's **Developer Tools (DevTools)**. This will replace the default game client with the Alguien Client, making it active while you're playing. Follow these steps to install the client:

### Steps to Override the Client Using DevTools:

1. **Download the client file** (AlguienClient.js) open it and then **ctrl + shift + s**.
2. **Open Developer Tools in your browser**:
   - In **Chrome** or **Edge**, press **F12** or right-click on the page and select **Inspect**.
   - In **Firefox**, press **F12** or right-click and select **Inspect Element**.
3. **Go to the 'Sources' tab** in DevTools.
4. **Set up an override**:
   - In the **'Sources'** tab, locate the current game client script file (top -> survev.io -> js -> **app-######.js**).
   - **Right-click** on the file **app-######.js** and select **"Override content"**.
   - Now, select all the actual content and delete it, then **drag and drop** your downloaded `AlguienClient.js` file into the text editor to **override** the existing client script.
5. **Enable Override**:
   - Once the override is set, the game client will load the modded version from your local file system every time you refresh the page or restart the game.
     
### Important Notes:
- **Persistence:** The client will be active as long as you have started the game with the dev tools opened and the override option enabled.
- **Bugs:** For any bug or issue contact me via discord: **@SoyAlguien**.

## Usage

- Press the **P** show/hide the menu.
- In the menu, you can toggle:
  - **FPS Display:** Show or hide the FPS counter.
  - **FPS Uncapping:** Toggle between capped and uncapped FPS.
  - **Hide/Show Menu:** Toggle the visibility of the mod menu.
- The other features will always be activated, at least for now.

---

Thank you for using **Alguien Client**! ;)
