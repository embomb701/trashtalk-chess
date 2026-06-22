# TrashTalk Chess

**Chess with a mouthy AI that roasts you.**

TrashTalk Chess is a polished browser MVP where you always play White against a trash-talking AI that mocks your mistakes in text and optional browser voice. It includes standard chess rules, scalable AI difficulty, persistent unlocks, theme switching, and a GitHub/Vercel-friendly static file structure.

## Features

- Standard 8x8 chess powered by **chess.js**
- AI opponent with **minimax + alpha-beta pruning**
- Difficulty levels **1-10**
- Reactive trash talk in **Mature** and **PG / Clean** modes
- Browser **SpeechSynthesis** voice taunts with rate/volume/pitch controls
- Unlockable **5 board themes** and **5 piece themes**
- Persistent progression saved with **localStorage**
- Works as a **static site** on GitHub Pages or Vercel
- Responsive UI for desktop and mobile browsers

## Quick Start

### Option 1: Open locally

Just open `index.html` in a modern browser.

### Option 2: Host on GitHub Pages

1. Create a new GitHub repo.
2. Upload the contents of this folder.
3. Enable **GitHub Pages** in repo settings.
4. Play from the generated site URL.

### Option 3: Deploy to Vercel

1. Import the repo into Vercel.
2. Use the default static site settings.
3. Deploy.

No build step is required.

## Controls

- **Click / tap** a piece to select it.
- Legal moves highlight on the board.
- Click / tap a destination square to move.
- Promotions use an on-screen piece picker.
- **Menu** returns to the main menu.
- **Resign** ends the current game immediately.
- **Voice** toggles AI speech on/off.

## Difficulty

The AI scales with minimax depth and randomness.

- **Level 1:** mostly random
- **Levels 2-4:** shallow search, intentionally messy
- **Levels 5-7:** decent tactical play
- **Levels 8-10:** deeper search with much less randomness

## Trash Talk System

The AI taunts you during:

- game start
- normal moves
- blunders
- captures
- checks
- promotions
- game end

Two language modes are included:

- **Mature** — profanity and harsher insults
- **PG / Clean** — same mocking tone without profanity

Special endgame logic:

- Beat **Level 10** → the AI shows respect
- Win or lose below **Level 10** → the AI roasts you for not choosing max difficulty

## Progression / Unlocks

### Board Themes

- **Classic Wood** — starts unlocked
- **Tournament Green** — unlock at **2 wins**
- **Marble Luxury** — unlock at **5 wins**
- **Blood Arena** — unlock by **beating Level 3**
- **Neon Void** — unlock by **beating Level 6** or reaching **15 wins**

### Piece Themes

- **Standard** — starts unlocked
- **Medieval Steel** — unlock at **3 wins**
- **Cyber Neon** — unlock by **beating Level 4**
- **Pirate Gold** — unlock by **beating Level 5**
- **Dragon Fantasy** — unlock by **beating Level 8** or reaching **25 wins**

## Save / Persistence

The game stores:

- settings
- wins
- games played
- highest level beaten
- unlocked boards
- unlocked piece themes

Data is saved in your browser with `localStorage`.

## Selling / Distribution Notes

This is an MVP ready for:

- **itch.io**
- **Gumroad**
- direct `.zip` download
- **GitHub Pages** hosting
- **Vercel** hosting

For offline distribution, just zip the folder and share it.

Easy future upgrade path:

- add PWA support for installable app feel
- add Stockfish.js for stronger AI
- add online multiplayer via WebSockets
- add more taunt packs and cosmetics
- add achievements and daily challenges

## Repo Structure

```text
trashtalk-chess/
├── README.md
├── index.html
├── style.css
├── script.js
├── chess.min.js
├── .gitignore
└── assets/
```

## License

MIT
