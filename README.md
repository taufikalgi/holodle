# Holodle — Hololive Guessing Games

A collection of daily and endless guessing games for Hololive talents and songs. Inspired by [Valodle](https://valodle.eu/classic).

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Game Modes](#game-modes)
- [Classic Rules](#classic-rules)
- [Categories](#categories)
- [Data](#data)
- [Build for Production](#build-for-production)
- [License](#license)
- [Disclaimer](#disclaimer)
- [Contributing](#contributing)

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

## License

Source code is licensed under the [MIT License](LICENSE).

Not covered by that license, and documented in [NOTICE.md](NOTICE.md):

- **Fonts** — Albert Sans ships inside the build under the SIL Open Font License 1.1.
- **Runtime imagery** — talent images, Google avatars and iTunes artwork are fetched from their owners' hosts and remain under their terms.
- **Trademarks** — Hololive and Hololive Production belong to COVER Corporation; no trademark rights are granted.
- **Backend** — the API this frontend talks to is a separate private repository.

## Disclaimer

Fan-made project. Not affiliated with Cover Corp or Hololive Production.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Contributions are accepted under the MIT license.
