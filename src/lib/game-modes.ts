export interface GameMode {
  href: string;
  logo: string;
  alt: string;
  title: string;
  description: string;
}

export const GAMES = [
  {
    href: "/classic",
    logo: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Airani-Iofifteen_list_thumb.png",
    alt: "classic logo",
    title: "Classic",
    description:
      "Guess the talent by their attributes — branch, debut year, lore archetype and more.",
  },
  {
    href: "/endless-classic",
    logo: "https://hololive.hololivepro.com/wp-content/uploads/2023/07/Cecilia-Immergreen_list_thumb.png",
    alt: "endless classic logo",
    title: "Endless Classic",
    description:
      "Guess the talent by their attributes. Keep guessing as long as you want. How long can you streak?",
  },
  {
    href: "/avatar",
    logo: "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Isaki-Riona_list_thumb.png",
    alt: "avatar logo",
    title: "Avatar",
    description: "Guess the talent from a cropped zoomed avatar — hints reveal more each try.",
  },
  {
    href: "/giveaway-vsi",
    logo: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Anya-Melfissa_list_thumb.png",
    alt: "giveaway vsi logo",
    title: "Giveaway VSI",
    description: "Participate in exclusive giveaways and challenges.",
  },
];
