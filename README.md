# 🌙 XINYI - VESPERA Discord Bot

> **Auto-leveling | Leaderboard | Admin System | Nitro Rewards | Profile Cards**

---

## 📁 File Structure (Flat - No Subfolders)

```
xinyi-bot/
├── .env                    # Environment variables (secrets)
├── package.json            # Node.js dependencies & scripts
├── index.js                # Bot main entry point
├── firebase.js             # Firebase Realtime Database setup
├── utils.js                # Helper functions, Canvas image generator
├── profile.js              # /profile command
├── leaderboard.js          # /leaderboard command
├── rank.js                 # /rank command
├── admin.js                # All admin commands (7 commands)
├── nitro.js                # /nitroreward command
├── stats.js                # /serverstats & /config commands
├── help.js                 # /help command
└── README.md               # This file
```

---

## 🚀 Quick Start

### Step 1: Upload to GitHub

```bash
cd xinyi-bot/
git init
git add .
git commit -m "Xinyi Bot v1.0 - VESPERA"
git branch -M main
git remote add origin https://github.com/username/xinyi-bot.git
git push -u origin main
```

### Step 2: Import to Replit

1. Open [Replit](https://replit.com)
2. Click **Create** → **Import from GitHub**
3. Paste your repo URL
4. Set **Run command** to: `node index.js`
5. Click **Create Repl**

### Step 3: Add Environment Variables (Secrets)

In Replit, go to **Tools** → **Secrets** and add these:

| Key | Value | Description |
|-----|-------|-------------|
| `DISCORD_TOKEN` | `MTUxNzQwNjQzNjg3MzczMjA5Ng.GYVqlo.SflO4OuT7y13uN-a7KsPh-7U5EjC2JGSeZATIA` | Bot token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | `1517406436873732096` | Application ID |
| `DISCORD_GUILD_ID` | `1398875124257652736` | Your VESPERA server ID |
| `FIREBASE_API_KEY` | `AIzaSyAwqh5JlOu5mEdLgLHI3AXaYQbxHKIGozM` | Firebase API key |
| `FIREBASE_AUTH_DOMAIN` | `vespera-7da88.firebaseapp.com` | Firebase auth domain |
| `FIREBASE_PROJECT_ID` | `vespera-7da88` | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | `vespera-7da88.firebasestorage.app` | Firebase storage |
| `FIREBASE_MESSAGING_SENDER_ID` | `501953267232` | Firebase messaging |
| `FIREBASE_APP_ID` | `1:501953267232:web:274e017131cefd39c7de45` | Firebase app ID |
| `FIREBASE_MEASUREMENT_ID` | `G-PQ6SRS2LJJ` | Firebase analytics |

### Step 4: Install & Run

```bash
npm install
npm start
```

Or click **Run** button in Replit.

---

## 🤖 Bot Setup (Discord Developer Portal)

### 1. Create Application
- Go to [Discord Developer Portal](https://discord.com/developers/applications)
- Click **New Application** → Name it "Xinyi"
- Go to **Bot** tab → Click **Add Bot**
- Enable these **Privileged Gateway Intents**:
  - ✅ Presence Intent
  - ✅ Server Members Intent
  - ✅ Message Content Intent
- Copy **Token** → Paste in `.env` as `DISCORD_TOKEN`
- Copy **Application ID** → Paste as `DISCORD_CLIENT_ID`

### 2. Invite Bot to Server
- Go to **OAuth2** → **URL Generator**
- Select scopes: `bot`, `applications.commands`
- Bot permissions:
  - ✅ Send Messages
  - ✅ Embed Links
  - ✅ Attach Files
  - ✅ Read Message History
  - ✅ Use External Emojis
  - ✅ Add Reactions
  - ✅ Manage Roles
  - ✅ Manage Channels
  - ✅ Kick Members
  - ✅ Ban Members
  - ✅ View Audit Log
- Copy URL → Open in browser → Select VESPERA server → Authorize

### 3. Get Guild ID
- In Discord, enable **Developer Mode** (User Settings → Advanced)
- Right-click VESPERA server name → **Copy Server ID**
- Paste in `.env` as `DISCORD_GUILD_ID`

---

## 🔥 Firebase Setup

### 1. Create Project
- Go to [Firebase Console](https://console.firebase.google.com)
- Click **Add project** → Name: `vespera-7da88`
- Disable Google Analytics (or enable if you want)

### 2. Enable Realtime Database
- Go to **Build** → **Realtime Database**
- Click **Create Database**
- Choose location: `asia-southeast1` (closest to you)
- Start in **test mode** (for development)

### 3. Get Config
- Go to **Project Settings** → **General** tab
- Scroll to **Your apps** → Click **</>** (Web)
- Register app: "xinyi-bot"
- Copy config values → Paste in `.env`

### 4. Database Rules (for development)
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
> ⚠️ **WARNING**: Change to stricter rules before production!

---

## 📋 Commands Reference

### 👤 User Commands (Everyone)

| Command | Usage | Description |
|---------|-------|-------------|
| `/profile` | `/profile` | View your profile card with avatar, level, XP bar |
| `/profile @user` | `/profile @Haipil` | View another member's profile |
| `/leaderboard` | `/leaderboard` | View top 10 leaderboard image |
| `/leaderboard limit:15` | `/leaderboard 15` | View top 15 (5-25 range) |
| `/rank` | `/rank` | Quick view of your rank, level, progress |
| `/help` | `/help` | Show all available commands |

### 🔒 Admin Commands (OWNER / MOD only)

| Command | Usage | Description |
|---------|-------|-------------|
| `/setleaderboardinfo` | `/setleaderboardinfo #leaderboard` | Set channel for auto-updating leaderboard |
| `/setcommandchannel` | `/setcommandchannel #admin-commands kick,ban,mute` | Set private admin command channel |
| `/setwelcome` | `/setwelcome #welcome` | Set channel for welcome messages |
| `/setautorole` | `/setautorole @Member` | Auto-assign role to new members |
| `/givexp` | `/givexp @user 500` | Give XP to a user |
| `/removexp` | `/removexp @user 200` | Remove XP from user |
| `/resetuser` | `/resetuser @user` | Reset all user data to zero |
| `/nitroreward` | `/nitroreward` | Award Nitro to top 3 leaderboard |
| `/serverstats` | `/serverstats` | View total members, messages, active today |
| `/config` | `/config` | View current bot configuration |

---

## ✨ Features

### 🎮 Auto-Leveling System
- **XP Gain**: 15-25 XP per message
- **Cooldown**: 1 minute between XP gains
- **Level Formula**: `Level = floor(sqrt(XP / 100)) + 1`
- **Level Up**: Bot sends celebration message when you level up

### 🏆 Rank System (7 Tiers)

| Rank | Min XP | Icon | Color |
|------|--------|------|-------|
| Novice | 0 | 🌱 | Gray |
| Explorer | 100 | 🔍 | Blue |
| Adventurer | 500 | ⚔️ | Green |
| Knight | 1,500 | 🛡️ | Purple |
| Elite | 3,500 | 👑 | Red |
| Legend | 7,000 | 🏆 | Gold |
| Vespera | 15,000 | 🌙 | Purple |

### 🔥 Streak System
- Chat every day to maintain streak
- Streak resets if inactive for >24 hours
- Displayed on profile card

### 🎨 Profile Cards
- Custom Canvas-generated image
- Avatar with circular crop
- Animated gradient background
- Progress bar with purple-pink gradient
- Stats: Messages, Streak, Nitro Wins

### 🏅 Leaderboard Image
- Auto-updates every **5 minutes**
- Top 10 members with medals (🥇🥈🥉)
- Gold/Silver/Bronze highlight for top 3
- "NITRO ELIGIBLE" badge for top 3
- Beautiful gradient design

### 🎁 Nitro Rewards
- **1st Place**: 3 Days Discord Nitro
- **2nd Place**: 3 Days Discord Nitro
- **3rd Place**: 3 Days Discord Nitro
- Use `/nitroreward` to distribute
- Winners tracked in database

### 🛡️ Admin Security
- Admin commands restricted to **OWNER** and **MOD** roles
- Admin commands only work in designated **command channel**
- Wrong channel = instant rejection
- All admin actions logged

### 👋 Auto Welcome
- New members automatically registered in database
- Welcome message sent to designated channel
- Auto-role assignment (optional)

---

## 🗄️ Database Structure

```
vespera-7da88-default-rtdb
├── users/
│   └── {guildId}/
│       └── {userId}/
│           ├── xp: number
│           ├── messages: number
│           ├── joinDate: timestamp
│           ├── lastActive: timestamp
│           ├── nitroWins: number
│           └── streak: number
│
└── config/
    └── {guildId}/
        ├── leaderboardChannel: string
        ├── commandChannel: string
        ├── welcomeChannel: string
        ├── autoRole: string
        └── allowedCommands: array
```

---

## 🎨 UI Design

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#6B4EE6` | Main accent, borders |
| Secondary | `#9B7BFF` | Subtitles, secondary text |
| Accent | `#FF6B9D` | Progress bar end, highlights |
| Gold | `#FFD700` | Top 1, Nitro badges |
| Silver | `#C0C0C0` | Top 2 |
| Bronze | `#CD7F32` | Top 3 |
| Dark | `#1E1E2E` | Backgrounds |

### Theme
- **Dark mode** with purple gradient accents
- **Glassmorphism** style panels
- **Venom/VESPERA** aesthetic
- Clean, modern Discord embeds

---

## 🔧 Troubleshooting

### Bot not responding?
1. Check `DISCORD_TOKEN` is correct
2. Ensure bot has proper permissions in server
3. Check Replit logs for errors
4. Make sure intents are enabled in Developer Portal

### Commands not showing?
1. Wait up to 1 hour for global commands
2. Or use guild-specific registration (already in code)
3. Re-invite bot with `applications.commands` scope

### Firebase not connecting?
1. Check all Firebase config values in `.env`
2. Ensure Realtime Database is created
3. Check database rules allow read/write
4. Verify project ID matches

### Canvas/Images not working?
1. `canvas` package requires native dependencies
2. On Replit: should work automatically
3. Locally: may need `apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`

### Leaderboard not updating?
1. Run `/setleaderboardinfo #channel` first
2. Check bot has permission to send messages in that channel
3. Cron job runs every 5 minutes

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `discord.js` | ^14.15.3 | Discord API wrapper |
| `firebase` | ^10.12.2 | Firebase Realtime Database |
| `dotenv` | ^16.4.5 | Environment variables |
| `canvas` | ^2.11.2 | Image generation (profile & leaderboard) |
| `node-cron` | ^3.0.3 | Scheduled tasks (auto leaderboard update) |

---

## 📝 Changelog

### v1.0.0
- ✅ Auto-register new members
- ✅ XP leveling system with 7 ranks
- ✅ Streak system
- ✅ Profile cards (Canvas)
- ✅ Leaderboard images (Canvas)
- ✅ Auto leaderboard update (5 min)
- ✅ Admin command channel restriction
- ✅ Nitro rewards for top 3
- ✅ Welcome messages & auto-role
- ✅ Server statistics

---

## 👤 Author

**VESPERA Community** - Discord Server
- Owner: Haipil
- Bot: Xinyi

---

## 📄 License

MIT License - Feel free to use and modify!

---

> 🌙 **"In the twilight, legends are born."** - VESPERA
