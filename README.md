# 🐍 Hehe Snake Game

A fun, colorful Snake game built with HTML5 Canvas. Supports both desktop (keyboard) and mobile (touch/swipe) controls.

## 🎮 How to Play

| Control | Desktop | Mobile |
|---------|---------|--------|
| Move Up | ⬆️ / W | Swipe Up / ⬆️ Button |
| Move Down | ⬇️ / S | Swipe Down / ⬇️ Button |
| Move Left | ⬅️ / A | Swipe Left / ⬅️ Button |
| Move Right | ➡️ / D | Swipe Right / ➡️ Button |

## 🎯 Game Rules

- 🍎 **Red Food** = +10 points
- ⭐ **Gold Star (Bonus)** = +50 points (disappears after a few seconds!)
- 💀 Hit the wall or yourself = Game Over
- 🏆 High score is saved automatically

## 🚀 Run Locally

```bash
# Install dependencies
npm install

# Start local server
npm start
```

Then open http://localhost:8080 in your browser.

## 📱 Build Android APK

### Method 1: Using Capacitor (Recommended)

```bash
# Install dependencies
npm install

# Add Android platform
npx cap add android

# Sync web assets to Android
npx cap sync android

# Build APK
cd android && ./gradlew assembleDebug

# APK will be at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Method 2: Using GitHub Actions

1. Push code to GitHub
2. Go to **Actions** tab
3. Click **Build Android APK** workflow
4. Click **Run workflow**
5. Download the APK from **Artifacts** or **Releases**

### Prerequisites for local APK build:
- Node.js 20+
- Java JDK 17+
- Android SDK (Android Studio)

## 🛠️ Tech Stack

- HTML5 Canvas
- CSS3 (Gradients, Animations)
- Vanilla JavaScript (ES6+)
- Capacitor (for Android APK)

## 📄 License

MIT License
