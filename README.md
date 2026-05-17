# 🔫 Hehe FPS - 3D First Person Shooter

A 3D First Person Shooter game built with Three.js. Features multiple weapons, enemy waves, and both desktop + mobile controls.

## 🎮 Controls

### Desktop
| Key | Action |
|-----|--------|
| W/A/S/D | Move |
| Mouse | Look |
| Click | Shoot |
| R | Reload |
| 1/2/3 | Switch Weapon |
| Shift | Sprint |
| Escape | Pause |

### Mobile
- **Joystick** - Move
- **Touch & Drag** on screen - Look
- **🔥 Button** - Shoot
- **🔄 Button** - Reload
- **🔫 Button** - Switch Weapon

## 🎯 Game Features

- 🔫 **3 Weapons**: Pistol, Rifle, Shotgun
- 👾 **4 Enemy Types**: Basic, Fast, Tank, Boss
- 🌊 **Wave System**: Enemies get harder each wave
- ❤️ **Health Pickups**: Scattered around the arena
- 🔊 **Sound Effects**: Procedural audio via Web Audio API
- 📱 **Mobile Support**: Virtual joystick + touch controls
- 🏆 **High Score**: Auto-saved to localStorage

## 🚀 Run Locally

```bash
npm install
npm start
```

Open http://localhost:8080

## 📱 Build Android APK

### GitHub Actions (Auto Build)
1. Push to main branch
2. Go to Actions tab
3. Download APK from Artifacts or Releases

### Local Build
```bash
npm install
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## 🛠️ Tech Stack

- Three.js (3D Engine)
- HTML5 Canvas
- CSS3
- Vanilla JavaScript (ES6+)
- Web Audio API
- Capacitor (Android APK)

## 📄 License

MIT License
