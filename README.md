# Planning Poker — Next.js + WebSocket + Tailwind


## Description

**Planning Poker** is a simple game that helps teams estimate the difficulty of tasks during sprint planning.

Each player picks a number to represent how hard the task is. When everyone has voted, a short countdown starts, and at the end, the average score is shown.
If the average score is 21 or higher, the task should be split into smaller and simpler ones.
---

Implementation of a technical task: real-time Planning Poker built with::

- **Next.js (App Router)**
- **TailwindCSS** - for styling
- **Zustand** - for state management
- **Socket.io** - for synchronization
- **Next.theme** - for dark theme
- **Uuid** - for ID generation

---

## Project Setup

```
npm install
npm run dev
```

---

## WebSocket Events
- `name` — set player name after joining a room

- `vote` — send a vote for the current ticket

- `show` — reveal all votes when everyone has voted

- `restart` — reset all votes and start next voting round

disconnect — triggered automatically when a user leaves

---

## Testing
- Open /lobby
- Enter your name and join
- Open the same room in another tab
- Cast votes from both tabs
- Check synchronization and `Reset`

---

## Structure
```
/src
  /app
    /(root)
      /lobby
      /room/[roomId]
    /lib
      /store
      /types
  /components
/server
```

---
