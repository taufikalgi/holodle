# Holodle — Hololive Guessing Games

A collection of daily and endless guessing games for Hololive talents and songs. Inspired by [Valodle](https://valodle.eu/classic).

## Tech Stack

- **Next.js 16**
- **TypeScript**
- **Tailwind CSS**
- **pnpm**

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Game Modes

- **Classic** — guess the secret talent in 6 tries. Daily and endless.
- **Avatar** — guess the talent from a gradually revealed cropped image. Daily and endless.
- **Holosong** — guess the song from a short clip. Daily and endless.
- **Holosong Quiz** — pick the correct song from three options. Daily and endless.
- **Competitive Classic** — timed, scored sessions with a leaderboard.

## Classic Rules

- You get **6 guesses**
- 🟢 Green = correct attribute
- 🔴 Red = wrong attribute
- 🟠 Orange = wrong attribute, but close
- ↑↓ on Debut Year, Height, and Birth Month means the answer is higher/lower

## Categories

| Column             | Description                                      |
| ------------------ | ------------------------------------------------ |
| **Name**           | Talent name                                      |
| **Branch**         | JP, EN, ID, DEV_IS, Stars JP, Stars EN           |
| **Debut Year**     | Year the talent debuted                          |
| **Archetype**      | Character archetype (Human, Animal, Unique)      |
| **Height**         | Talent height in cm                              |
| **Birth Month**    | Month of birth                                   |

## Data

Talents and songs are loaded from the backend API. Admin users manage them at `/admin`.

## Build for Production

```bash
pnpm build
pnpm start
```

## Disclaimer

Fan-made project. Not affiliated with Cover Corp or Hololive Production.
