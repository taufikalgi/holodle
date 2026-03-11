# Holode — Hololive Daily Guessing Game

A Wordle-style daily guessing game for Hololive talents. Inspired by [Valodle](https://valodle.eu/classic).

## Tech Stack

- **Next.js 16**
- **TypeScript**
- **Tailwind CSS**
- **pnpm**

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Game Rules

- Guess the secret Hololive talent in **5 tries**
- Each guess reveals info about the talent:
  - 🟢 **Green** = correct attribute
  - 🔴 **Red** = wrong attribute
  - ↑↓ on Debut Year means the answer debuted later/earlier
- A new talent is chosen every day!

## Categories

| Column             | Description                                                           |
| ------------------ | --------------------------------------------------------------------- |
| **Branch**         | JP, EN, ID, DEV_IS, Stars JP, Stars EN                                |
| **Debut Year**     | Year the talent debuted                                               |
| **Lore Archetype** | Their character archetype (Animal, Human, Elf, etc.)                  |
| **Height**         | Smol (<150cm), Med (150-160cm), Tall (>160cm)                         |
| **Sololive**       | Whether they've held a solo live concert                              |
| **Zodiac**         | Their zodiac based on birth date (Will replace sololive in later dev) |

## Talent Pool

The game includes 80+ talents spanning:

- Hololive JP (Gen 0–6)
- Hololive EN (Myth, Promise/Council, Advent, Justice)
- Hololive ID (Gen 1–3)
- DEV_IS
- HOLOSTARS JP, EN

## Customization

Edit `src/lib/talents.ts` to:

- Add new talents
- Update height categories
- Update sololive status
- Adjust lore archetypes

## Build for Production

```bash
pnpm build
pnpm start
```

## Disclaimer

Fan-made project. Not affiliated with Cover Corp or Hololive Production.
