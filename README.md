# 🎯 Valorant Haven Aim Trainer

Professional web-based aim trainer inspired by Valorant's Haven map. A Progressive Web App (PWA) that works both online and offline, featuring AI enemies, multiple difficulty levels, and score tracking.

## 🚀 Features

### Core Gameplay
- **Defender Role**: Play as the defender against AI attackers
- **Haven Map**: Simplified version of Valorant's Haven with A, B, C sites
- **AI Enemies**: 5 AI opponents with different behaviors per difficulty
- **Spike Mechanic**: AI plants spike, you have 45 seconds to eliminate all enemies
- **Three Difficulty Levels**: Easy, Medium, Hard with different AI behaviors

### Controls
- **Desktop**: WASD (movement) + Mouse (aim & shoot)
- **Mobile**: Virtual joystick (movement) + Fire button (shoot)
- **Responsive Design**: Adapts to all screen sizes

### Technical Features
- **Progressive Web App**: Install on any device, works offline
- **Firebase Integration**: Real-time score tracking and leaderboards
- **Offline Support**: Play without internet, scores sync when online
- **Cross-Platform**: Works on desktop, tablet, and mobile

## 📱 Installation

### Quick Setup (GitHub Pages)
1. Fork this repository
2. Go to Settings → Pages
3. Set source to "Deploy from a branch" → main
4. Your game will be available at `https://eywallahorg.github.io/aim`

### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/valorant-haven-trainer.git
cd valorant-haven-trainer

# Serve locally (Python 3)
python -m http.server 8000

# Or use Node.js
npx serve .

# Open http://localhost:8000
```

## 🔧 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Get your config from Project Settings → General → Your apps
5. Replace the config in `firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scores/{document} {
      allow read, write: if true; // Adjust based on your needs
    }
  }
}
```

## 🎮 How to Play

1. **Choose Difficulty**: Select Easy, Medium, or Hard
2. **Movement**: Use WASD or virtual joystick to move
3. **Aiming**: Point crosshair at enemies
4. **Shooting**: Click mouse or tap fire button
5. **Objective**: Eliminate all 5 AI enemies before time runs out
6. **Spike Warning**: If AI plants spike, you have 45 seconds!

### AI Behavior
- **Easy**: Slow movement, predictable paths, pauses when planting
- **Medium**: Normal speed, shoots when sees player
- **Hard**: Fast, aggressive, quick spike plants, smart pathing

## 📊 Scoring System

- **Kill**: +100 points per enemy eliminated
- **Win Bonus**: Additional points for completing the round
- **Difficulty Multiplier**: Higher difficulties give more points
- **Time Bonus**: Faster completion = higher score

## 🛠 File Structure

```
valorant-haven-trainer/
├── index.html              # Main game file
├── manifest.json           # PWA configuration
