export type HeightCategory = "smol" | "med" | "tall";
export type Branch = "JP" | "EN" | "ID" | "DEV_IS" | "Stars JP" | "Stars EN";

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
  height: number;
  heightCategory: HeightCategory;
  birthMonth: string;
  zodiac: string;
  image: string;
  altNames: string[]; // alternative search names
  photoUrl: string;
  keypoints?: Keypoint[];
}

export const TALENTS: Talent[] = [
  // === HOLOLIVE JP Gen 0 ===
  {
    name: "Tokino Sora",
    branch: "JP",
    debutYear: 2017,
    loreArchetype: "Human",
    height: 160,
    heightCategory: "med",
    birthMonth: "May",
    zodiac: "Taurus",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2021/05/tokino_sora_thumb.png",
    altNames: ["Soda", "Sofa"],
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
    height: 154,
    heightCategory: "med",
    birthMonth: "May",
    zodiac: "Gemini",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Robocosan_list_thumb.png",
    altNames: [],
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
    height: 158,
    heightCategory: "med",
    birthMonth: "Jul",
    zodiac: "Cancer",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/06/AZKi_list_thumb.png",
    altNames: [],
    photoUrl: "https://hololive.hololivepro.com/wp-content/uploads/2024/12/AZKi_pr-img_01.png",
    keypoints: [
      { label: "hair pin", x: 58, y: 10, zoom: 12 },
      { label: "bracelet", x: 25, y: 28, zoom: 12 },
      { label: "tie pin(?)", x: 49, y: 20.5, zoom: 15 },
      { label: "shoes", x: 62, y: 81, zoom: 11 },
      { label: "", x: 47.5, y: 40, zoom: 15 },
    ],
  },
  {
    name: "Sakura Miko",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Shrine Maiden",
    height: 152,
    heightCategory: "med",
    birthMonth: "Mar",
    zodiac: "Pisces",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Sakura-Miko_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Sakura-Miko_pr-img_01.png",
    keypoints: [
      { label: "hair pin", x: 66, y: 9.8, zoom: 15 },
      { label: "thigh", x: 45, y: 60.6, zoom: 11 },
      { label: "thigh", x: 57, y: 56.5, zoom: 13 },
      { label: "belt", x: 50.5, y: 38, zoom: 12 },
      { label: "slipper", x: 54, y: 96, zoom: 12 },
    ],
  },
  {
    name: "Hoshimachi Suisei",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Human",
    height: 160,
    heightCategory: "med",
    birthMonth: "Mar",
    zodiac: "Aries",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Hoshimachi-Suisei_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Hoshimachi-Suisei_pr-img_01.png",
    keypoints: [
      { label: "hair tie", x: 42, y: 5.5, zoom: 25 },
      { label: "mic", x: 61, y: 23.3, zoom: 20 },
      { label: "thigh", x: 61.5, y: 56.5, zoom: 13 },
      { label: "belt ribbon star", x: 49.6, y: 34.5, zoom: 12 },
      { label: "shoe", x: 28, y: 89, zoom: 10 },
    ],
  },
  // === HOLOLIVE JP Gen 1 ===
  {
    name: "Yozora Mel",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Vampire",
    height: 154,
    heightCategory: "med",
    birthMonth: "October",
    zodiac: "Scorpio",
    image:
      "https://static.wikia.nocookie.net/virtualyoutuber/images/c/cf/Yozora_Mel_Portrait.png/revision/latest?cb=20190215175632",
    altNames: [],
    photoUrl:
      "https://static.wikia.nocookie.net/virtualyoutuber/images/e/e8/Yozora_Mel_Full_Body.png/revision/latest?cb=20230610065837",
  },
  {
    name: "Shirakami Fubuki",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Animal",
    height: 155,
    heightCategory: "med",
    birthMonth: "October",
    zodiac: "Libra",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Shirakami-Fubuki_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Shirakami-Fubuki_pr-img_01.webp",
  },
  {
    name: "Natsuiro Matsuri",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Human",
    height: 152,
    heightCategory: "med",
    birthMonth: "July",
    zodiac: "Cancer",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Natsuiro-Matsuri_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Natsuiro-Matsuri_pr-img_01.png",
  },
  {
    name: "Aki Rosenthal",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Elf",
    height: 162,
    heightCategory: "tall",
    birthMonth: "February",
    zodiac: "Aquarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Aki-Rosenthal_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Aki-Rosenthal_pr-img_01.png",
  },
  {
    name: "Akai Haato",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Human",
    height: 153,
    heightCategory: "med",
    birthMonth: "August",
    zodiac: "Leo",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Akai-Haato_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Akai-Haato_pr-img_01.png",
  },
  {
    name: "Minato Aqua",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Human",
    height: 148,
    heightCategory: "smol",
    birthMonth: "December",
    zodiac: "Sagittarius",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Minato-Aqua_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Minato-Aqua_pr-img_01.png",
  },
  {
    name: "Murasaki Shion",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Magician",
    height: 145,
    heightCategory: "smol",
    birthMonth: "December",
    zodiac: "Sagittarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Murasaki-Shion_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Murasaki-Shion_pr-img_01.png",
  },
  {
    name: "Nakiri Ayame",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Oni",
    height: 152,
    heightCategory: "med",
    birthMonth: "December",
    zodiac: "Sagittarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Nakiri-Ayame_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Nakiri-Ayame_pr-img_01.webp",
  },
  {
    name: "Yuzuki Choco",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Demon",
    height: 165,
    heightCategory: "tall",
    birthMonth: "February",
    zodiac: "Aquarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Yuzuki-Choco_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Yuzuki-Choco_pr-img_01.png",
  },
  {
    name: "Oozora Subaru",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Human",
    height: 154,
    heightCategory: "med",
    birthMonth: "July",
    zodiac: "Cancer",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Oozora-Subaru_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Oozora-Subaru_pr-img_01.webp",
  },
  {
    name: "Ookami Mio",
    branch: "JP",
    debutYear: 2018,
    loreArchetype: "Animal",
    height: 160,
    heightCategory: "med",
    birthMonth: "August",
    zodiac: "Leo",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Ookami-Mio_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Ookami-Mio_pr-img_01.png",
  },
  {
    name: "Nekomata Okayu",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Animal",
    height: 152,
    heightCategory: "med",
    birthMonth: "February",
    zodiac: "Pisces",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Nekomata-Okayu_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Nekomata-Okayu_pr-img_01.png",
  },
  {
    name: "Inugami Korone",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Animal",
    height: 156,
    heightCategory: "med",
    birthMonth: "October",
    zodiac: "Libra",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Inugami-Korone_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Inugami-Korone_pr-img_01.png",
  },
  {
    name: "Usada Pekora",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Animal",
    height: 153,
    heightCategory: "med",
    birthMonth: "January",
    zodiac: "Capricorn",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Usada-Pekora_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Usada-Pekora_pr-img_01.png",
  },
  {
    name: "Shiranui Flare",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Elf",
    height: 158,
    heightCategory: "med",
    birthMonth: "April",
    zodiac: "Aries",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Shiranui-Flare_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Shiranui-Flare_pr-img_01.png",
  },
  {
    name: "Shirogane Noel",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Human",
    height: 158,
    heightCategory: "med",
    birthMonth: "November",
    zodiac: "Sagittarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Shirogane-Noel_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Shirogane-Noel_pr-img_01.webp",
  },
  {
    name: "Houshou Marine",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Human",
    height: 150,
    heightCategory: "med",
    birthMonth: "July",
    zodiac: "Leo",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Houshou-Marine_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Houshou-Marine_pr-img_01.png",
  },
  {
    name: "Amane Kanata",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Angel",
    height: 149,
    heightCategory: "smol",
    birthMonth: "April",
    zodiac: "Taurus",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Amane-Kanata_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2024/07/Amane-Kanata_pr-img_01.png",
  },
  {
    name: "Tsunomaki Watame",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Animal",
    height: 151,
    heightCategory: "med",
    birthMonth: "June",
    zodiac: "Gemini",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Tsunomaki-Watame_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Tsunomaki-Watame_pr-img_01.png",
  },
  {
    name: "Tokoyami Towa",
    branch: "JP",
    debutYear: 2020,
    loreArchetype: "Devil",
    height: 150,
    heightCategory: "med",
    birthMonth: "August",
    zodiac: "Leo",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Tokoyami-Towa_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Tokoyami-Towa_pr-img_01.png",
  },
  {
    name: "Himemori Luna",
    branch: "JP",
    debutYear: 2020,
    loreArchetype: "Human",
    height: 140,
    heightCategory: "smol",
    birthMonth: "October",
    zodiac: "Libra",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Himemori-Luna_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Himemori-Luna_pr-img_01.png",
  },
  {
    name: "Kiryu Coco",
    branch: "JP",
    debutYear: 2019,
    loreArchetype: "Animal",
    height: 180,
    heightCategory: "tall",
    birthMonth: "June",
    zodiac: "Gemini",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Kiryu-Coco_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Kiryu-Coco_pr-img_01.png",
  },
  {
    name: "Yukihana Lamy",
    branch: "JP",
    debutYear: 2020,
    loreArchetype: "Elf",
    height: 158,
    heightCategory: "med",
    birthMonth: "November",
    zodiac: "Scorpio",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Yukihana-Lamy_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Yukihana-Lamy_pr-img_01.png",
  },
  {
    name: "Momosuzu Nene",
    branch: "JP",
    debutYear: 2020,
    loreArchetype: "Human",
    height: 159,
    heightCategory: "med",
    birthMonth: "March",
    zodiac: "Pisces",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Momosuzu-Nene_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/06/Momosuzu-Nene_pr-img_01.png",
  },
  {
    name: "Shishiro Botan",
    branch: "JP",
    debutYear: 2020,
    loreArchetype: "Animal",
    height: 166,
    heightCategory: "tall",
    birthMonth: "September",
    zodiac: "Virgo",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Shishiro-Botan_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2024/05/Shishiro-Botan_pr-img_01.png",
  },
  {
    name: "Omaru Polka",
    branch: "JP",
    debutYear: 2020,
    loreArchetype: "Animal",
    height: 153,
    heightCategory: "med",
    birthMonth: "January",
    zodiac: "Aquarius",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Omaru-Polka_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2024/12/Omaru-Polka_pr-img_01.png",
  },
  {
    name: "La+ Darknesss",
    branch: "JP",
    debutYear: 2021,
    loreArchetype: "Alien",
    height: 139,
    heightCategory: "smol",
    birthMonth: "May",
    zodiac: "Gemini",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/La-Darknesss_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/La-Darknesss_pr-img_01.png",
  },
  {
    name: "Takane Lui",
    branch: "JP",
    debutYear: 2021,
    loreArchetype: "Animal",
    height: 161,
    heightCategory: "tall",
    birthMonth: "June",
    zodiac: "Gemini",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Takane-Lui_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2024/08/Takane-Lui_pr-img_01.png",
  },
  {
    name: "Hakui Koyori",
    branch: "JP",
    debutYear: 2021,
    loreArchetype: "Animal",
    height: 153,
    heightCategory: "med",
    birthMonth: "March",
    zodiac: "Pisces",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Hakui-Koyori_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Hakui-Koyori_pr-img_01.png",
  },
  {
    name: "Sakamata Chloe",
    branch: "JP",
    debutYear: 2021,
    loreArchetype: "Animal",
    height: 148,
    heightCategory: "smol",
    birthMonth: "May",
    zodiac: "Taurus",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Sakamata-Chloe_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2024/09/Sakamata-Chloe_pr-img_01.png",
  },
  {
    name: "Kazama Iroha",
    branch: "JP",
    debutYear: 2021,
    loreArchetype: "Human",
    height: 156,
    heightCategory: "med",
    birthMonth: "June",
    zodiac: "Gemini",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Kazama-Iroha_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Kazama-Iroha_pr-img_01.png",
  },
  {
    name: "Hiodoshi Ao",
    branch: "DEV_IS",
    debutYear: 2023,
    loreArchetype: "Human",
    height: 171,
    heightCategory: "tall",
    birthMonth: "February",
    zodiac: "Pisces",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Hiodoshi-Ao_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Hiodoshi-Ao_pr-img_01_a.png",
  },
  {
    name: "Otonose Kanade",
    branch: "DEV_IS",
    debutYear: 2023,
    loreArchetype: "Human",
    height: 153,
    heightCategory: "med",
    birthMonth: "April",
    zodiac: "Taurus",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Otonose-Kanade_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Otonose-Kanade_pr-img_01_a.png",
  },
  {
    name: "Ichijou Ririka",
    branch: "DEV_IS",
    debutYear: 2023,
    loreArchetype: "Human",
    height: 162,
    heightCategory: "tall",
    birthMonth: "May",
    zodiac: "Taurus",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Ichijou-Ririka_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Ichijou-Ririka_pr-img_01_a.png",
  },
  {
    name: "Juufuutei Raden",
    branch: "DEV_IS",
    debutYear: 2023,
    loreArchetype: "Human",
    height: 159,
    heightCategory: "med",
    birthMonth: "February",
    zodiac: "Aquarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Juufuutei-Raden_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Juufuutei-Raden_pr-img_01_a.png",
  },
  {
    name: "Todoroki Hajime",
    branch: "DEV_IS",
    debutYear: 2023,
    loreArchetype: "Human",
    height: 155,
    heightCategory: "med",
    birthMonth: "June",
    zodiac: "Gemini",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Todoroki-Hajime_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Todoroki-Hajime_pr-img_01_a.png",
  },
  {
    name: "Isaki Riona",
    branch: "DEV_IS",
    debutYear: 2024,
    loreArchetype: "Human",
    height: 160,
    heightCategory: "med",
    birthMonth: "May",
    zodiac: "Gemini",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Isaki-Riona_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Isaki-Riona_pr-img_01_a.png",
  },
  {
    name: "Koganei Niko",
    branch: "DEV_IS",
    debutYear: 2024,
    loreArchetype: "Human",
    height: 172,
    heightCategory: "tall",
    birthMonth: "July",
    zodiac: "Leo",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Koganei-Niko_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Koganei-Niko_pr-img_01_a.png",
  },
  {
    name: "Mizumiya Su",
    branch: "DEV_IS",
    debutYear: 2024,
    loreArchetype: "Human",
    height: 145,
    heightCategory: "smol",
    birthMonth: "June",
    zodiac: "Gemini",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Mizumiya-Su_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Mizumiya-Su_pr-img_01_a.png",
  },
  {
    name: "Rindo Chihaya",
    branch: "DEV_IS",
    debutYear: 2024,
    loreArchetype: "Human",
    height: 168,
    heightCategory: "tall",
    birthMonth: "July",
    zodiac: "Cancer",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Rindo-Chihaya_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Rindo-Chihaya_pr-img_01_a.png",
  },
  {
    name: "Kikirara Vivi",
    branch: "DEV_IS",
    debutYear: 2024,
    loreArchetype: "Human",
    height: 161,
    heightCategory: "tall",
    birthMonth: "August",
    zodiac: "Virgo",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Kikirara-Vivi_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Kikirara-Vivi_pr-img_01_a.png",
  },
  {
    name: "Ayunda Risu",
    branch: "ID",
    debutYear: 2020,
    loreArchetype: "Animal",
    height: 153,
    heightCategory: "med",
    birthMonth: "January",
    zodiac: "Capricorn",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Ayunda-Risu_list_thumb.png",
    altNames: ["Risdu", "Riau", "Ridu"],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Ayunda-Risu_pr-img_01.png",
  },
  {
    name: "Moona Hoshinova",
    branch: "ID",
    debutYear: 2020,
    loreArchetype: "Moon Goddess",
    height: 165,
    heightCategory: "tall",
    birthMonth: "February",
    zodiac: "Aquarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Moona-Hoshinova_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Moona-Hoshinova_pr-img_01.png",
  },
  {
    name: "Airani Iofifteen",
    branch: "ID",
    debutYear: 2020,
    loreArchetype: "Alien",
    height: 150,
    heightCategory: "med",
    birthMonth: "July",
    zodiac: "Cancer",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Airani-Iofifteen_list_thumb.png",
    altNames: ["Yopi"],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Airani-Iofifteen_pr-img_01.png",
  },
  {
    name: "Kureiji Ollie",
    branch: "ID",
    debutYear: 2020,
    loreArchetype: "Zombie",
    height: 162,
    heightCategory: "tall",
    birthMonth: "October",
    zodiac: "Libra",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Kureiji-Ollie_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Kureiji-Ollie_pr-img_01.png",
  },
  {
    name: "Anya Melfissa",
    branch: "ID",
    debutYear: 2020,
    loreArchetype: "Weapon",
    height: 147,
    heightCategory: "smol",
    birthMonth: "March",
    zodiac: "Pisces",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Anya-Melfissa_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Anya-Melfissa_pr-img_01.png",
  },
  {
    name: "Pavolia Reine",
    branch: "ID",
    debutYear: 2020,
    loreArchetype: "Animal",
    height: 172,
    heightCategory: "tall",
    birthMonth: "September",
    zodiac: "Virgo",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Pavolia-Reine_list_thumb.png",
    altNames: ["Weine"],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Pavolia-Reine_pr-img_01.png",
  },
  {
    name: "Vestia Zeta",
    branch: "ID",
    debutYear: 2022,
    loreArchetype: "Human",
    height: 155,
    heightCategory: "med",
    birthMonth: "November",
    zodiac: "Scorpio",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Vestia-Zeta_list_thumb.png",
    altNames: ["Jeje"],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Vestia-Zeta_pr-img_01.png",
  },
  {
    name: "Kaela Kovalskia",
    branch: "ID",
    debutYear: 2022,
    loreArchetype: "Human",
    height: 173,
    heightCategory: "tall",
    birthMonth: "August",
    zodiac: "Virgo",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Kaela-Kovalskia_list_thumb.png",
    altNames: ["Ela"],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Kaela-Kovalskia_pr-img_02.png",
  },
  {
    name: "Kobo Kanaeru",
    branch: "ID",
    debutYear: 2022,
    loreArchetype: "Human",
    height: 150,
    heightCategory: "med",
    birthMonth: "December",
    zodiac: "Sagittarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Kobo-Kanaeru_list_thumb.png",
    altNames: ["Kono", "Kobokan"],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Kobo-Kanaeru_pr-img_01.png",
  },
  {
    name: "Mori Calliope",
    branch: "EN",
    debutYear: 2020,
    loreArchetype: "Shinigami",
    height: 167,
    heightCategory: "tall",
    birthMonth: "April",
    zodiac: "Aries",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Mori-Calliope_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Mori-Calliope_pr-img_01.png",
  },
  {
    name: "Takanashi Kiara",
    branch: "EN",
    debutYear: 2020,
    loreArchetype: "Animal",
    height: 165,
    heightCategory: "tall",
    birthMonth: "July",
    zodiac: "Cancer",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Takanashi-Kiara_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Takanashi-Kiara_pr-img_01.png",
  },
  {
    name: "Ninomae Ina'nis",
    branch: "EN",
    debutYear: 2020,
    loreArchetype: "Priestess",
    height: 157,
    heightCategory: "med",
    birthMonth: "May",
    zodiac: "Taurus",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Ninomae-Inanis_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Ninomae-Inanis_pr-img_01.png",
  },
  {
    name: "Gawr Gura",
    branch: "EN",
    debutYear: 2020,
    loreArchetype: "Animal",
    height: 141,
    heightCategory: "smol",
    birthMonth: "June",
    zodiac: "Gemini",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Gawr-Gura_list_thumb.png",
    altNames: [],
    photoUrl: "https://hololive.hololivepro.com/wp-content/uploads/2024/05/Gawr-Gura_pr-img_01.png",
  },
  {
    name: "Watson Amelia",
    branch: "EN",
    debutYear: 2020,
    loreArchetype: "Human",
    height: 150,
    heightCategory: "med",
    birthMonth: "January",
    zodiac: "Capricorn",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Watson-Amelia_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Watson-Amelia_pr-img_01.png",
  },
  {
    name: "IRyS",
    branch: "EN",
    debutYear: 2021,
    loreArchetype: "Nephilim",
    height: 166,
    heightCategory: "tall",
    birthMonth: "March",
    zodiac: "Pisces",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/IRyS_list_thumb.png",
    altNames: [],
    photoUrl: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/IRyS_pr-img_01.png",
  },
  {
    name: "Ceres Fauna",
    branch: "EN",
    debutYear: 2021,
    loreArchetype: "Animal",
    height: 164,
    heightCategory: "tall",
    birthMonth: "March",
    zodiac: "Aries",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Ceres-Fauna_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/10/Ceres-Fauna_pr-img_01.png",
  },
  {
    name: "Ouro Kronii",
    branch: "EN",
    debutYear: 2021,
    loreArchetype: "Animal",
    height: 168,
    heightCategory: "tall",
    birthMonth: "March",
    zodiac: "Pisces",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Ouro-Kronii_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Ouro-Kronii_pr-img_01.webp",
  },
  {
    name: "Nanashi Mumei",
    branch: "EN",
    debutYear: 2021,
    loreArchetype: "Animal",
    height: 156,
    heightCategory: "med",
    birthMonth: "August",
    zodiac: "Leo",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Nanashi-Mumei_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/10/Nanashi-Mumei_pr-img_01.png",
  },
  {
    name: "Hakos Baelz",
    branch: "EN",
    debutYear: 2021,
    loreArchetype: "Animal",
    height: 149,
    heightCategory: "smol",
    birthMonth: "February",
    zodiac: "Pisces",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Hakos-Baelz_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2020/07/Hakos-Baelz_pr-img_01.png",
  },
  {
    name: "Tsukumo Sana",
    branch: "EN",
    debutYear: 2021,
    loreArchetype: "Space",
    height: 169,
    heightCategory: "tall",
    birthMonth: "June",
    zodiac: "Gemini",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Tsukumo-Sana_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/09/Tsukumo-Sana_pr-img_01.png",
  },
  {
    name: "Shiori Novella",
    branch: "EN",
    debutYear: 2023,
    loreArchetype: "Human",
    height: 163,
    heightCategory: "tall",
    birthMonth: "May",
    zodiac: "Taurus",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2021/07/Shiori-Novella_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2021/07/Shiori-Novella_pr-img_01.webp",
  },
  {
    name: "Koseki Bijou",
    branch: "EN",
    debutYear: 2023,
    loreArchetype: "Jewel",
    height: 140,
    heightCategory: "smol",
    birthMonth: "April",
    zodiac: "Aries",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2021/07/Koseki-Bijou_list_thumb.png",
    altNames: ["biboo"],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2021/07/Koseki-Bijou_pr-img_01.png",
  },
  {
    name: "Nerissa Ravencroft",
    branch: "EN",
    debutYear: 2023,
    loreArchetype: "Animal",
    height: 175,
    heightCategory: "tall",
    birthMonth: "November",
    zodiac: "Scorpio",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2021/07/Nerissa-Ravencroft_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2021/07/Nerissa-Ravencroft_pr-img_01.webp",
  },
  {
    name: "Fuwawa Abyssgard",
    branch: "EN",
    debutYear: 2023,
    loreArchetype: "Animal",
    height: 155,
    heightCategory: "med",
    birthMonth: "February",
    zodiac: "Aquarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2021/07/Fuwawa-Abyssgard_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2021/07/Fuwawa-Abyssgard_pr-img_01.png",
  },
  {
    name: "Mococo Abyssgard",
    branch: "EN",
    debutYear: 2023,
    loreArchetype: "Animal",
    height: 155,
    heightCategory: "med",
    birthMonth: "February",
    zodiac: "Aquarius",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2021/07/Mococo-Abyssgard_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2021/07/Mococo-Abyssgard_pr-img_01.png",
  },
  {
    name: "Elizabeth Rose Bloodflame",
    branch: "EN",
    debutYear: 2024,
    loreArchetype: "Human",
    height: 171,
    heightCategory: "tall",
    birthMonth: "April",
    zodiac: "Taurus",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/07/Elizabeth-Rose-Bloodflame_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/07/Elizabeth-Rose-Bloodflame_pr-img_01.webp",
  },
  {
    name: "Gigi Murin",
    branch: "EN",
    debutYear: 2024,
    loreArchetype: "Gremlin",
    height: 153,
    heightCategory: "med",
    birthMonth: "October",
    zodiac: "Libra",
    image: "https://hololive.hololivepro.com/wp-content/uploads/2023/07/Gigi-Murin_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/07/Gigi-Murin_pr-img_01.webp",
  },
  {
    name: "Cecilia Immergreen",
    branch: "EN",
    debutYear: 2024,
    loreArchetype: "Automaton",
    height: 162,
    heightCategory: "tall",
    birthMonth: "November",
    zodiac: "Scorpio",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/07/Cecilia-Immergreen_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/07/Cecilia-Immergreen_pr-img_01.png",
  },
  {
    name: "Raora Panthera",
    branch: "EN",
    debutYear: 2024,
    loreArchetype: "Animal",
    height: 155,
    heightCategory: "med",
    birthMonth: "May",
    zodiac: "Taurus",
    image:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/07/Raora-Panthera_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://hololive.hololivepro.com/wp-content/uploads/2023/07/Raora-Panthera_pr-img_01.png",
  },
  {
    name: "Hanasaki Miyabi",
    branch: "Stars JP",
    debutYear: 2019,
    loreArchetype: "Human",
    height: 174,
    heightCategory: "tall",
    birthMonth: "March",
    zodiac: "Pisces",
    image:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Hanasaki-Miyabi_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Hanasaki-Miyabi_pr-img_01.png",
  },
  {
    name: "Kanade Izuru",
    branch: "Stars JP",
    debutYear: 2019,
    loreArchetype: "Human",
    height: 156,
    heightCategory: "med",
    birthMonth: "August",
    zodiac: "Leo",
    image:
      "https://holostars.hololivepro.com/wp-content/uploads/2024/08/Kanade-Izuru_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Kanade-Izuru_pr-img_01.png",
  },
  {
    name: "Kagami Kira",
    branch: "Stars JP",
    debutYear: 2019,
    loreArchetype: "Human",
    height: 163,
    heightCategory: "tall",
    birthMonth: "October",
    zodiac: "Scorpio",
    image:
      "https://static.wikia.nocookie.net/virtualyoutuber/images/b/b7/Kagami_Kira_-_Portrait.png/revision/latest/scale-to-width-down/1000?cb=20200622085153",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2023/11/Kagami-Kira_pr-img_01.png",
  },
  {
    name: "Yakushiji Suzaku",
    branch: "Stars JP",
    debutYear: 2019,
    loreArchetype: "Human",
    height: 180,
    heightCategory: "tall",
    birthMonth: "March",
    zodiac: "Aries",
    image:
      "https://static.wikia.nocookie.net/virtualyoutuber/images/9/95/Yakushiji_Suzaku_-_Portrait.png/revision/latest?cb=20201003163931",
    altNames: [],
    photoUrl:
      "https://static.wikia.nocookie.net/hololivevtuber/images/e/e8/Yakushiji_Suzaku_-_Full_Illustration.png/revision/latest?cb=20201030060616",
  },
  {
    name: "Arurandeisu",
    branch: "Stars JP",
    debutYear: 2019,
    loreArchetype: "Human",
    height: 186,
    heightCategory: "tall",
    birthMonth: "November",
    zodiac: "Scorpio",
    image:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Arurandeisu_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Arurandeisu_pr-img_01.png",
  },
  {
    name: "Rikka",
    branch: "Stars JP",
    debutYear: 2019,
    loreArchetype: "Android",
    height: 179,
    heightCategory: "tall",
    birthMonth: "April",
    zodiac: "Aries",
    image: "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Rikka_list_thumb.png",
    altNames: [],
    photoUrl: "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Rikka_pr-img_01.png",
  },
  {
    name: "Astel Leda",
    branch: "Stars JP",
    debutYear: 2019,
    loreArchetype: "Alien",
    height: 158,
    heightCategory: "med",
    birthMonth: "June",
    zodiac: "Gemini",
    image: "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Astel-Leda_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Astel-Leda_pr-img_01.png",
  },
  {
    name: "Kishido Temma",
    branch: "Stars JP",
    debutYear: 2019,
    loreArchetype: "Human",
    height: 179,
    heightCategory: "tall",
    birthMonth: "April",
    zodiac: "Aries",
    image:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Kishido-Temma_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Kishido-Temma_pr-img_01.png",
  },
  {
    name: "Yukoku Roberu",
    branch: "Stars JP",
    debutYear: 2019,
    loreArchetype: "Human",
    height: 181,
    heightCategory: "tall",
    birthMonth: "September",
    zodiac: "Libra",
    image:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Yukoku-Roberu_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Yukoku-Roberu_pr-img_01.png",
  },
  {
    name: "Kageyama Shien",
    branch: "Stars JP",
    debutYear: 2020,
    loreArchetype: "Animal",
    height: 176,
    heightCategory: "tall",
    birthMonth: "February",
    zodiac: "Pisces",
    image:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Kageyama-Shien_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Kageyama-Shien_pr-img_01.png",
  },
  {
    name: "Aragami Oga",
    branch: "Stars JP",
    debutYear: 2020,
    loreArchetype: "Demon",
    height: 192,
    heightCategory: "tall",
    birthMonth: "January",
    zodiac: "Capricorn",
    image:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Aragami-Oga_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Aragami-Oga_pr-img_01.png",
  },
  {
    name: "Yatogami Fuma",
    branch: "Stars JP",
    debutYear: 2022,
    loreArchetype: "Human",
    height: 168,
    heightCategory: "tall",
    birthMonth: "July",
    zodiac: "Cancer",
    image:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Yatogami-Fuma_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Yatogami-Fuma_pr-img_01.png",
  },
  {
    name: "Hizaki Gamma",
    branch: "Stars JP",
    debutYear: 2022,
    loreArchetype: "Human",
    height: 178,
    heightCategory: "tall",
    birthMonth: "February",
    zodiac: "Aquarius",
    image:
      "https://static.wikia.nocookie.net/virtualyoutuber/images/5/5d/Hizaki_Gamma_-_Portrait.png/revision/latest?cb=20220324163522",
    altNames: [],
    photoUrl:
      "https://static.wikia.nocookie.net/virtualyoutuber/images/9/9d/Hizaki_Gamma_Full_Body.png/revision/latest?cb=20220322065802",
  },
  {
    name: "Utsugi Uyu",
    branch: "Stars JP",
    debutYear: 2022,
    loreArchetype: "Human",
    height: 177,
    heightCategory: "tall",
    birthMonth: "May",
    zodiac: "Taurus",
    image: "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Utsugi-Uyu_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Utsugi-Uyu_pr-img_01.png",
  },
  {
    name: "Minase Rio",
    branch: "Stars JP",
    debutYear: 2022,
    loreArchetype: "Ghost",
    height: 170,
    heightCategory: "tall",
    birthMonth: "July",
    zodiac: "Leo",
    image: "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Minase-Rio_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Minase-Rio_pr-img_01.png",
  },
  {
    name: "Regis Altare",
    branch: "Stars EN",
    debutYear: 2022,
    loreArchetype: "Human",
    height: 176,
    heightCategory: "tall",
    birthMonth: "January",
    zodiac: "Aquarius",
    image:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Regis-Altare_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Regis-Altare_pr-img_01.png",
  },
  {
    name: "Magni Desmond",
    branch: "Stars EN",
    debutYear: 2022,
    loreArchetype: "Human",
    height: 184,
    heightCategory: "tall",
    birthMonth: "October",
    zodiac: "Scorpio",
    image:
      "https://static.wikia.nocookie.net/virtualyoutuber/images/7/74/Magni_Dezmond_1.5_Portrait.png/revision/latest?cb=20230612163623",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Magni-Dezmond_pr-img_01.png",
  },
  {
    name: "Axel Syrios",
    branch: "Stars EN",
    debutYear: 2022,
    loreArchetype: "Human",
    height: 184,
    heightCategory: "tall",
    birthMonth: "November",
    zodiac: "Scorpio",
    image:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Axel-Syrios_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Axel-Syrios_pr-img_01.png",
  },
  {
    name: "Noir Vesper",
    branch: "Stars EN",
    debutYear: 2022,
    loreArchetype: "Vampire",
    height: 189,
    heightCategory: "tall",
    birthMonth: "February",
    zodiac: "Aquarius",
    image:
      "https://static.wikia.nocookie.net/virtualyoutuber/images/c/c8/Noir_Vesper_2.0_Portrait.png/revision/latest?cb=20230703071228",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2021/12/Noir-Vesper_pr-img_01.png",
  },
  {
    name: "Gavis Bettel",
    branch: "Stars EN",
    debutYear: 2023,
    loreArchetype: "Human",
    height: 180,
    heightCategory: "tall",
    birthMonth: "May",
    zodiac: "Taurus",
    image:
      "https://holostars.hololivepro.com/wp-content/uploads/2023/01/Gavis-Bettel_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2024/06/Gavis-Bettel_pr-img_01.png",
  },
  {
    name: "Machina X Flayon",
    branch: "Stars EN",
    debutYear: 2023,
    loreArchetype: "Human",
    height: 163,
    heightCategory: "tall",
    birthMonth: "June",
    zodiac: "Gemini",
    image:
      "https://holostars.hololivepro.com/wp-content/uploads/2023/01/Machina-X-Flayon_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2023/01/Machina-X-Flayon_pr-img_01.png",
  },
  {
    name: "Banzoin Hakka",
    branch: "Stars EN",
    debutYear: 2023,
    loreArchetype: "Human",
    height: 160,
    heightCategory: "med",
    birthMonth: "April",
    zodiac: "Taurus",
    image:
      "https://holostars.hololivepro.com/wp-content/uploads/2023/01/Banzoin-Hakka_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2023/01/Banzoin-Hakka_pr-img_01.png",
  },
  {
    name: "Josuiji Shinri",
    branch: "Stars EN",
    debutYear: 2023,
    loreArchetype: "Human",
    height: 183,
    heightCategory: "tall",
    birthMonth: "June",
    zodiac: "Cancer",
    image:
      "https://holostars.hololivepro.com/wp-content/uploads/2023/01/Josuiji-Shinri_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2024/06/Josuiji-Shinri_pr-img_01.png",
  },
  {
    name: "Jurard T Rexford",
    branch: "Stars EN",
    debutYear: 2023,
    loreArchetype: "Animal",
    height: 178,
    heightCategory: "tall",
    birthMonth: "February",
    zodiac: "Aquarius",
    image:
      "https://holostars.hololivepro.com/wp-content/uploads/2023/01/Jurard-T-Rexford_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2023/01/Jurard-T-Rexford_pr-img_01.png",
  },
  {
    name: "Goldbullet",
    branch: "Stars EN",
    debutYear: 2023,
    loreArchetype: "Human",
    height: 188,
    heightCategory: "tall",
    birthMonth: "June",
    zodiac: "Cancer",
    image: "https://holostars.hololivepro.com/wp-content/uploads/2023/01/Goldbullet_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2023/01/Goldbullet_pr-img_01.webp",
  },
  {
    name: "Octavio",
    branch: "Stars EN",
    debutYear: 2023,
    loreArchetype: "Human",
    height: 171,
    heightCategory: "tall",
    birthMonth: "April",
    zodiac: "Aries",
    image: "https://holostars.hololivepro.com/wp-content/uploads/2023/01/Octavio_list_thumb.png",
    altNames: [],
    photoUrl: "https://holostars.hololivepro.com/wp-content/uploads/2023/01/Octavio_pr-img_01.png",
  },
  {
    name: "Crimzon Ruze",
    branch: "Stars EN",
    debutYear: 2023,
    loreArchetype: "Human",
    height: 179,
    heightCategory: "tall",
    birthMonth: "September",
    zodiac: "Libra",
    image:
      "https://holostars.hololivepro.com/wp-content/uploads/2023/01/Crimzon-Ruze_list_thumb.png",
    altNames: [],
    photoUrl:
      "https://holostars.hololivepro.com/wp-content/uploads/2023/01/Crimzon-Ruze_pr-img_01.png",
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
  birthMonth: "correct" | "wrong";
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
    birthMonth: guess.birthMonth === answer.birthMonth ? "correct" : "wrong",
  };
}
