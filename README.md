# 🎮 HANDWAVE — NEON CATCH

> 🖐️ Control the game with your hands. Catch the energy. Beat your high score.

HANDWAVE — NEON CATCH is an interactive browser-based game that uses real-time hand tracking and gesture recognition to control gameplay through a webcam.

Instead of traditional mouse controls, players can use hand gestures to move the catcher, activate abilities, pause the game, and restart gameplay.

---

## ✨ Project Overview

HANDWAVE combines frontend development, JavaScript game programming, computer vision, real-time gesture recognition, Canvas rendering, and modern UI/UX design into one interactive project.

The player controls a futuristic energy catcher while different objects fall from the top of the screen.

🎯 Collect valuable objects  
💣 Avoid bombs  
⚡ Use power-ups  
🔥 Build combos  
🏆 Beat your high score

---

## 🖐️ Hand Gesture Controls

| Gesture | Action |
|---|---|
| 👍 Thumbs Up | Start / Restart |
| 🖐️ Open Palm | Pause / Play |
| ☝️ Index Finger | Activate Magnet |
| ✊ Fist | Activate Shield |
| ↔️ Hand Movement | Move Catcher |

### ⌨️ Keyboard Controls

| Key | Action |
|---|---|
| `←` | Move Left |
| `→` | Move Right |
| `SPACE` | Pause / Play |

Keyboard controls are included as a fallback if hand tracking is unavailable.

---

## 💎 Game Objects

| Object | Effect |
|---|---|
| 💎 Blue Crystal | +50 Points |
| ⭐ Golden Star | +100 Points |
| 💣 Red Bomb | Lose 1 Life |
| 🟣 Purple Power | Magnet Power |
| 💠 Mega Crystal | +250 Points |

---

## 🎮 Features

- 🖐️ Real-time hand gesture control
- 📷 Webcam-based hand tracking
- 🎯 Gesture recognition
- 💎 Multiple collectible objects
- 💣 Bomb obstacles
- ⚡ Power-up system
- 🛡️ Shield ability
- 🧲 Magnet ability
- 🔥 Combo system
- ❤️ Three-life system
- 📈 Automatic level progression
- 🏆 High-score system
- 💾 Local Storage
- ✨ Particle effects
- 💥 Screen shake effects
- 🌌 Animated background
- 💡 Neon glow effects
- 🎨 Glassmorphism interface
- 📱 Responsive design
- ⌨️ Keyboard fallback controls
- ⏸️ Pause / Play system
- 🎮 Game Over and Restart system

---

## 🛠️ Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript

### APIs & Libraries

- MediaPipe Hands
- Canvas API
- Web Camera API
- Local Storage API
- RequestAnimationFrame

### UI / Design

- Glassmorphism
- Neon UI
- CSS Animations
- CSS Transitions
- Responsive Web Design
- Google Fonts
- Bootstrap Icons

### Development Tools

- Visual Studio Code
- Git
- GitHub
- Live Server
- Google Chrome

---

## 🧠 Technical Concepts

### 🎮 Game Development

- Game loop
- Object spawning
- Collision detection
- Score calculation
- Level progression
- Life management
- Game states
- Restart system
- Pause / Play system

### 🖐️ Computer Vision

MediaPipe Hands is used to detect hand landmarks from the webcam.

The application analyzes hand landmarks to recognize:

```text
👍 Thumbs Up
🖐️ Open Palm
☝️ Index Finger
✊ Fist
