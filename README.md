[**Installation Video**](https://www.youtube.com/watch?v=bV9N5nZMjJg&ab_channel=SoyAlguien)


# Alguien Client - Survev.io Client
⚠ **This client is not a hack** ⚠

⚠ **If the game is updated the client will not work, you will have to wait for the client to be updated** ⚠

⚠ **The Greasy Fork version does not include interpolation, local rotation and a working ping counter.** ⚠


## Features

### 🎮 FPS Show & Uncapping FPS
- **Show FPS**: Displays a simple FPS counter on the screen to monitor your frame rate in real-time.
- **Uncap FPS**: Allows you to uncap the FPS, providing higher frame rates. This is useful for smoother gameplay, especially on high-refresh-rate monitors.

### 💊 Health and Adrenaline Info
- Displays real-time health and adrenaline status.

### 🛠️ Weapon Border Customization
- **Weapon Borders**: Automatically changes the border color of the weapon icon based on the current weapon equipped. Different weapon categories have unique border colors for better visual clarity.

### 🏃‍♂️ Movement/Camera Interpolation & Rotation (Local-Based)
- **Movement/Camera Interpolation**: Improves the fluidity of movement and camera by interpolating player movement data for smoother transitions.
- **Rotation Based on Local Data**: Adjusts the player's rotation based on the local mouse position, without needing server response.

### 🔫 Kills and Ping Counter
- **Kills Counter**: Tracks the number of kills you've made during the game, providing a real-time update on your performance.
- **Ping Counter**: Displays your current ping, allowing you to monitor connection quality.

### 🖥️ UI Improvements
- **UI Polish**: The counters for kills, ping, and other stats are now more refined and do not overlap with the UI of teammates, ensuring a cleaner and more user-friendly experience.

### ⚙️ Menu Enhancements
- A completely revamped menu, both visually and logically, for better user experience.
- **Persistent Settings**: Your menu configurations are now saved locally, so preferences are retained across sessions.
- **Background Customization**: Choose a custom background for the menu, either by linking to an external image or selecting a local file.
- **Character Customization in Team Menu**: Now you can personalize your character even when you're in the team menu, giving you more control over your appearance.

### 📜 Menu
- A customizable menu allows players to toggle FPS display, uncap FPS, and hide or show the menu at any time using the P key. All future features will also be able to be activated or deactivated through this menu. (Coming soon!)

## Installation

To install the Alguien Client, you will need to override the existing game client using your browser's Developer Tools (DevTools). This will replace the default game client with the Alguien Client, making it active while you're playing. Follow these steps:

### Steps to Override the Client Using DevTools:
1. Download the client file (AlguienClient.js), open it, and then press Ctrl + Shift + S to save it.
2. Open Developer Tools in your browser:
   - In Chrome or Edge, press F12 or right-click on the page and select Inspect.
   - In Firefox, press F12 or right-click and select Inspect Element.
3. Go to the 'Sources' tab in DevTools.
4. Set up an override:
   - In the 'Sources' tab, locate the current game client script file (typically located under survev.io -> js -> app-######.js).
   - Right-click on the file app-######.js and select "Override content".
   - Select all the existing content and delete it, then drag and drop your downloaded AlguienClient.js file into the text editor to override the existing client script.
5. Enable Override:
   - Once the override is set, the game client will load the modded version from your local file system every time you refresh the page or restart the game.

### Another Option: Greasy Fork Installation
You can also install it through Tampermonkey via this [script on Greasy Fork](https://greasyfork.org/es/scripts/519982-alguien-client-surve-io-client)
.  
**Note:** This version does not include interpolation or local rotation.

## Important Notes:
- **Persistence**: The client will remain active as long as you have the game running with DevTools open and the override option enabled.
- **Bugs**: If you encounter any bugs or issues, please contact me via Discord: @SoyAlguien.

## Usage
- Press the **P** key to show/hide the menu.
- In the menu, you can toggle:
   - **FPS Display**: Show or hide the FPS counter.
   - **Kills Counter**: Show or hide the Kills counter.
   - **Ping Counter**: Show or hide the Ping counter.
   - **FPS Uncapping**: Toggle between capped and uncapped FPS.
   - **Change Background**: Chose your background (URL image or Local image).
   - **Hide/Show Menu**: Toggle the visibility of the mod menu.
- All other features are always activated, at least for now.
##
Thank you for using Alguien Client! Enjoy your enhanced experience! ;)
