export interface GameMode {
  href: string;
  logo: string;
  alt: string;
  title: string;
  description: string;
}

export interface GameVariant {
  href: string;
  logo: string;
  alt: string;
  title: string;
  /** Short label inside dropdown: "Daily" | "Endless" | "Competitive" */
  label: string;
  description: string;
}

export interface GameCategory {
  id: string;
  label: string;
  variants: GameVariant[];
}

export const GAME_CATEGORIES: GameCategory[] = [
  {
    id: "classic",
    label: "Classic",
    variants: [
      {
        href: "/classic/daily",
        logo: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Airani-Iofifteen_list_thumb.png",
        alt: "classic logo",
        title: "Classic",
        label: "Daily",
        description:
          "Guess the talent by their attributes — branch, debut year, lore archetype and more.",
      },
      {
        href: "/classic/endless",
        logo: "https://hololive.hololivepro.com/wp-content/uploads/2023/07/Cecilia-Immergreen_list_thumb.png",
        alt: "endless classic logo",
        title: "Endless Classic",
        label: "Endless",
        description:
          "Guess the talent by their attributes. Keep guessing as long as you want. How far can you keep the streak going?",
      },
      {
        href: "/classic/competitive",
        logo: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Anya-Melfissa_list_thumb.png",
        alt: "competitive classic logo",
        title: "Competitive Classic",
        label: "Competitive",
        description:
          "Test your knowledge against other players in time attack based game and reach the top in the leaderboard.",
      },
    ],
  },
  {
    id: "avatar",
    label: "Avatar",
    variants: [
      {
        href: "/avatar/daily",
        logo: "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Isaki-Riona_list_thumb.png",
        alt: "avatar logo",
        title: "Avatar",
        label: "Daily",
        description:
          "Guess the talent from a cropped avatar — each wrong guess reveals a bigger hint.",
      },
      {
        href: "/avatar/endless",
        logo: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Nanashi-Mumei_list_thumb.png",
        alt: "avatar endless logo",
        title: "Avatar Endless",
        label: "Endless",
        description:
          "Guess talents from cropped avatars, endlessly. How far can you keep the streak going?",
      },
    ],
  },
];

// Flat list for backwards compat / simple iteration. New code should use GAME_CATEGORIES.
export const GAMES: GameMode[] = GAME_CATEGORIES.flatMap((c) => c.variants);
