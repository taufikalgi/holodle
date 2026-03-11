export type HeightCategory = "smol" | "med" | "tall";
export type Branch = "JP" | "EN" | "ID" | "DEV_IS" | "Stars JP" | "Stars EN" | "Stars ID";

export interface Keypoint {
  label: string;
  x: number;
  y: number;
  zoom: number;
}

export interface Talent {
  name: string;
  branch: Branch;
  debutYear: number;
  loreArchetype: string;
  heightCategory: HeightCategory;
  hasSololive: boolean;
  zodiac?: string;
  image?: string; //
  altNames?: string[]; // alternative search names
  photoUrl?: string;
  keypoints?: Keypoint[];
}

export const TALENTS: Talent[] = [
  // === HOLOLIVE JP Gen 0 ===
  {
    name: "Tokino Sora",
    branch: "JP",
    debutYear: 2017,
    loreArchetype: "Human",
    heightCategory: "med",
    hasSololive: true,
    zodiac: "Taurus",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2021/05/tokino_sora_thumb.png",
    altNames: ["sora", "soda", "sofa"],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Tokino-Sora_pr-img_01.png",
    keypoints: [
      { label: "ribbon", x: 55.5, y: 58.1, zoom: 20 },
      { label: "upper skirt", x: 46.5, y: 39.7, zoom: 15 },
      { label: "skirt star", x: 22, y: 56, zoom: 10 },
      { label: "chest(?)", x: 56, y: 23, zoom: 30 },
      { label: "eye", x: 52, y: 14.7, zoom: 30 },
    ],
  },
  {
    name: "Roboco-san",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Robot",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Gemini",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Robocosan_list_thumb.png",
    altNames: ["roboco"],
    photoUrl: "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Robocosan_pr-img_01.png",
    keypoints: [
      { label: "hair pin", x: 62, y: 11, zoom: 10 },
      { label: "", x: 56, y: 23, zoom: 12 },
      { label: "arm", x: 59, y: 30, zoom: 15 },
      { label: "knee", x: 58, y: 69, zoom: 13 },
      { label: "eye", x: 44.5, y: 15.6, zoom: 15 },
    ],
  },
  {
    name: "AZKi",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Human",
    heightCategory: "med",
    hasSololive: true,
    zodiac: "Pisces",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/06/AZKi_list_thumb.png",
    altNames: ["azki"],
    // photoUrl:"",
    // keypoints: [
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    // ],
  },
  {
    name: "Sakura Miko",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Shrine Maiden/Human",
    heightCategory: "med",
    hasSololive: true,
    zodiac: "Pisces",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Sakura-Miko_list_thumb.png",
    altNames: ["miko"],
    // photoUrl:"",
    // keypoints: [
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    // ],
  },
  {
    name: "Hoshimachi Suisei",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Human",
    heightCategory: "med",
    hasSololive: true,
    zodiac: "Aries",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Hoshimachi-Suisei_list_thumb.png",
    altNames: ["suisei"],
    // photoUrl:"",
    // keypoints: [
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    // ],
  },
  // === HOLOLIVE JP Gen 1 ===
  {
    name: "Yozora Mel",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Vampire",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Scorpio",
    image:
      "https://static.wikia.nocookie.net/virtualyoutuber/images/c/cf/Yozora_Mel_Portrait.png/revision/latest?cb=20190215175632",
    altNames: ["mel"],
    // photoUrl:"",
    // keypoints: [
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    // ],
  },
  {
    name: "Aki Rosenthal",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Elf",
    heightCategory: "tall",
    hasSololive: false,
    zodiac: "Aquarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Aki-Rosenthal_list_thumb.png",
    altNames: ["aki"],
    // photoUrl:"",
    // keypoints: [
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    // ],
  },
  {
    name: "Akai Haato",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Demon",
    heightCategory: "med",
    hasSololive: true,
    zodiac: "Leo",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Akai-Haato_list_thumb.png",
    altNames: ["haachama"],
    // photoUrl:"",
    // keypoints: [
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    // ],
  },
  {
    name: "Shirakami Fubuki",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Animal",
    heightCategory: "med",
    hasSololive: true,
    zodiac: "Libra",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Shirakami-Fubuki_list_thumb.png",
    altNames: ["fubuki", "fbk"],
    // photoUrl:"",
    // keypoints: [
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    //   { label: "", x: , y: , zoom:  },
    // ],
  },
  {
    name: "Natsuiro Matsuri",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Human",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Cancer",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Natsuiro-Matsuri_list_thumb.png",
    altNames: ["matsuri"],
  },
  // === HOLOLIVE JP Gen 2 ===
  {
    name: "Nakiri Ayame",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Oni",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Sagittarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Nakiri-Ayame_list_thumb.png",
    altNames: ["ayame"],
  },
  {
    name: "Yuzuki Choco",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Succubus",
    heightCategory: "tall",
    hasSololive: false,
    zodiac: "Aquarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Yuzuki-Choco_list_thumb.png",
    altNames: ["choco"],
  },
  {
    name: "Oozora Subaru",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Human",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Cancer",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Oozora-Subaru_list_thumb.png",
    altNames: ["subaru"],
  },
  {
    name: "Minato Aqua",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Human",
    heightCategory: "smol",
    hasSololive: true,
    zodiac: "Sagittarius",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Minato-Aqua_list_thumb.png",
    altNames: ["aqua"],
  },
  {
    name: "Murasaki Shion",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Human",
    heightCategory: "smol",
    hasSololive: false,
    zodiac: "Sagittarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Murasaki-Shion_list_thumb.png",
    altNames: ["shion"],
  },
  // === HOLOLIVE GAMERS ===
  {
    name: "Ookami Mio",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Animal",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Leo",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Ookami-Mio_thumb.png",
    altNames: ["miosha"],
  },
  {
    name: "Nekomata Okayu",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Animal",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Pisces",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Nekomata-Okayu_list_thumb.png",
    altNames: ["ogayu"],
  },
  {
    name: "Inugami Korone",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Animal",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Libra",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Inugami-Korone_list_thumb.png",
    altNames: ["ogayu"],
  },
  // === HOLOLIVE JP Gen 3 ===
  {
    name: "Usada Pekora",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Animal",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Capricorn",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Usada-Pekora_list_thumb.png",
    altNames: ["pekora", "peko"],
  },
  {
    name: "Shiranui Flare",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Elf",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Aries",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Shiranui-Flare_list_thumb.png",
    altNames: ["flare"],
  },
  {
    name: "Shirogane Noel",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Human",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Sagittarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Shirogane-Noel_list_thumb.png",
    altNames: ["noel"],
  },
  {
    name: "Houshou Marine",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Human",
    heightCategory: "med",
    hasSololive: true,
    zodiac: "Leo",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Houshou-Marine_list_thumb.png",
    altNames: ["marine", "senchou"],
  },
  {
    name: "Uruha Rushia",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Human",
    heightCategory: "smol",
    hasSololive: false,
    zodiac: "Aquarius",
    image:
      "https://static.wikia.nocookie.net/virtualyoutuber/images/a/a2/Uruha_Rushia_-_Portrait.png/revision/latest?cb=20240201054019",
    altNames: [],
  },
  // === HOLOLIVE JP Gen 4 ===
  {
    name: "Amane Kanata",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Angel",
    heightCategory: "smol",
    hasSololive: false,
    zodiac: "Taurus",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Amane-Kanata_list_thumb.png",
    altNames: ["kanata"],
  },
  {
    name: "Tsunomaki Watame",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Animal",
    heightCategory: "med",
    hasSololive: true,
    zodiac: "Gemini",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Tsunomaki-Watame_list_thumb.png",
    altNames: ["watame"],
  },
  {
    name: "Tokoyami Towa",
    branch: "JP",
    debutYear: 2020,
    loreArchetype: "Devil",
    hasSololive: true,
    heightCategory: "med",
    zodiac: "Leo",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Tokoyami-Towa_list_thumb.png",
    altNames: ["towa"],
  },
  {
    name: "Himemori Luna",
    branch: "JP",
    debutYear: 2020,
    loreArchetype: "Human",
    heightCategory: "smol",
    hasSololive: false,
    zodiac: "Libra",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Himemori-Luna_list_thumb.png",
    altNames: ["luna"],
  },
  {
    name: "Kiryu Coco",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Animal",
    heightCategory: "tall",
    hasSololive: false,
    zodiac: "Gemini",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Kiryu-Coco_list_thumb.png",
    altNames: ["coco"],
  },
  // === HOLOLIVE JP Gen 5 (NePoLaBo) ===
  {
    name: "Yukihana Lamy",
    branch: "JP",
    debutYear: 2020,
    loreArchetype: "Elf",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Scorpio",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Yukihana-Lamy_list_thumb.png",
    altNames: ["lamy"],
  },
  {
    name: "Momosuzu Nene",
    branch: "JP",
    debutYear: 2020,
    loreArchetype: "Human",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Pisces",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Momosuzu-Nene_list_thumb.png",
    altNames: ["nene"],
  },
  {
    name: "Shishiro Botan",
    branch: "JP",
    debutYear: 2020,
    loreArchetype: "Animal",
    heightCategory: "tall",
    hasSololive: false,
    zodiac: "Virgo",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Shishiro-Botan_list_thumb.png",
    altNames: ["botan"],
  },
  {
    name: "Omaru Polka",
    branch: "JP",
    debutYear: 2020,
    loreArchetype: "Human",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Aquarius",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Omaru-Polka_list_thumb.png",
    altNames: ["polka"],
  },
  // === HOLOLIVE JP Gen 6 (holoX) ===
  {
    name: "La+ Darknesss",
    branch: "JP",
    debutYear: 2021,
    loreArchetype: "Alien",
    heightCategory: "smol",
    hasSololive: false,
    zodiac: "Gemini",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/La-Darknesss_list_thumb.png",
    altNames: ["laplus", "la+"],
  },
  {
    name: "Takane Lui",
    branch: "JP",
    debutYear: 2021,
    loreArchetype: "Animal",
    heightCategory: "tall",
    hasSololive: false,
    zodiac: "Gemini",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Takane-Lui_list_thumb.png",
    altNames: ["lui"],
  },
  {
    name: "Hakui Koyori",
    branch: "JP",
    debutYear: 2021,
    loreArchetype: "Human",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Pisces",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Hakui-Koyori_list_thumb.png",
    altNames: ["koyori"],
  },
  {
    name: "Sakamata Chloe",
    branch: "JP",
    debutYear: 2021,
    loreArchetype: "Animal",
    heightCategory: "smol",
    hasSololive: false,
    zodiac: "Taurus",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Sakamata-Chloe_list_thumb.png",
    altNames: ["chloe"],
  },
  {
    name: "Kazama Iroha",
    branch: "JP",
    debutYear: 2021,
    loreArchetype: "Human",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Gemini",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Sakamata-Chloe_list_thumb.png",
    altNames: ["iroha"],
  },
  // === HOLOLIVE ID Gen 1 ===
  {
    name: "Ayunda Risu",
    branch: "ID",
    debutYear: 2020,
    loreArchetype: "Animal",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Capricorn",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Ayunda-Risu_list_thumb.png",
    altNames: ["risu"],
  },
  {
    name: "Moona Hoshinova",
    branch: "ID",
    debutYear: 2020,
    loreArchetype: "Moon Goddess",
    heightCategory: "tall",
    hasSololive: false,
    zodiac: "Aquarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Moona-Hoshinova_list_thumb.png",
    altNames: ["moona"],
  },
  {
    name: "Airani Iofifteen",
    branch: "ID",
    debutYear: 2020,
    loreArchetype: "Alien",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Cancer",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Airani-Iofifteen_list_thumb.png",
    altNames: ["iofi"],
  },
  // === HOLOLIVE ID Gen 2 ===
  {
    name: "Kureiji Ollie",
    branch: "ID",
    debutYear: 2020,
    loreArchetype: "Zombie",
    heightCategory: "tall",
    hasSololive: false,
    zodiac: "Libra",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Kureiji-Ollie_list_thumb.png",
    altNames: ["ollie"],
  },
  {
    name: "Anya Melfissa",
    branch: "ID",
    debutYear: 2020,
    loreArchetype: "Weapon",
    heightCategory: "smol",
    hasSololive: false,
    zodiac: "Pisces",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Anya-Melfissa_list_thumb.png",
    altNames: ["anya"],
  },
  {
    name: "Pavolia Reine",
    branch: "ID",
    debutYear: 2020,
    loreArchetype: "Animal",
    heightCategory: "tall",
    hasSololive: false,
    zodiac: "Virgo",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Pavolia-Reine_list_thumb.png",
    altNames: ["reine"],
  },
  // === HOLOLIVE ID Gen 3 ===
  {
    name: "Vestia Zeta",
    branch: "ID",
    debutYear: 2022,
    loreArchetype: "Human",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Scorpio",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Vestia-Zeta_list_thumb.png",
    altNames: ["zeta"],
  },
  {
    name: "Kaela Kovalskia",
    branch: "ID",
    debutYear: 2022,
    loreArchetype: "Human",
    heightCategory: "tall",
    hasSololive: false,
    zodiac: "Virgo",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Kaela-Kovalskia_list_thumb.png",
    altNames: ["kaela"],
  },
  {
    name: "Kobo Kanaeru",
    branch: "ID",
    debutYear: 2022,
    loreArchetype: "Human",
    heightCategory: "med",
    hasSololive: false,
    zodiac: "Sagittarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Kobo-Kanaeru_list_thumb.png",
    altNames: ["kobo"],
  },
];

export const ALL_TALENTS = TALENTS.filter(
  (t, i, arr) => arr.findIndex((x) => x.name === t.name) === i
);

export function getTalentOfTheDay(): Talent {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const index = seed % ALL_TALENTS.length;
  return ALL_TALENTS[index];
}

export function searchTalents(query: string): Talent[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ALL_TALENTS.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      (t.altNames && t.altNames.some((alt) => alt.toLowerCase().includes(q)))
  ).slice(0, 8);
}

export type CompareResult = {
  branch: "correct" | "wrong";
  debutYear: "correct" | "higher" | "lower";
  loreArchetype: "correct" | "wrong";
  heightCategory: "correct" | "wrong";
  hasSololive: "correct" | "wrong";
};

export function compareTalents(guess: Talent, answer: Talent): CompareResult {
  return {
    branch: guess.branch === answer.branch ? "correct" : "wrong",
    debutYear:
      guess.debutYear === answer.debutYear
        ? "correct"
        : guess.debutYear > answer.debutYear
          ? "higher"
          : "lower",
    loreArchetype: guess.loreArchetype === answer.loreArchetype ? "correct" : "wrong",
    heightCategory: guess.heightCategory === answer.heightCategory ? "correct" : "wrong",
    hasSololive: guess.hasSololive === answer.hasSololive ? "correct" : "wrong",
  };
}
