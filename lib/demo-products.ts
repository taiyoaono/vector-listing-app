import type { DemoProduct } from "./types";

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: "1",
    name: "ウールチェスターコート",
    brand: "BURBERRY",
    gender: "レディース",
    category: ["アウター", "コート", "チェスターコート"],
    color: "ベージュ",
    material: "ウール100%",
    conditionRank: "AB",
    conditionDetails: "袖口に毛玉、裏地に薄い汚れ",
    managementCode: "VEC-20260301-001",
  },
  {
    id: "2",
    name: "デニムジャケット Gジャン",
    brand: "Levi's",
    gender: "メンズ",
    category: ["アウター", "ジャケット", "デニムジャケット"],
    color: "ブルー",
    material: "綿100%",
    conditionRank: "B",
    conditionDetails: "襟元に色褪せ、全体的な使用感",
    managementCode: "VEC-20260301-002",
  },
  {
    id: "3",
    name: "レザートートバッグ",
    brand: "COACH",
    gender: "レディース",
    category: ["バッグ", "トートバッグ"],
    color: "ブラウン",
    material: "牛革",
    conditionRank: "A",
    conditionDetails: "角に軽いスレ、持ち手に薄い使用感",
    managementCode: "VEC-20260301-003",
  },
  {
    id: "4",
    name: "カシミヤマフラー",
    brand: "Loro Piana",
    gender: "メンズ",
    category: ["小物", "マフラー・ストール"],
    color: "グレー",
    material: "カシミヤ100%",
    conditionRank: "AB",
    conditionDetails: "毛玉あり、フリンジに軽いほつれ",
    managementCode: "VEC-20260301-004",
  },
  {
    id: "5",
    name: "スウェードローファー",
    brand: "Gucci",
    gender: "メンズ",
    category: ["シューズ", "ローファー"],
    color: "ブラック",
    material: "スウェード",
    conditionRank: "B",
    conditionDetails: "つま先にスレ、ソール減りあり",
    managementCode: "VEC-20260301-005",
  },
];

export function findProductByCode(code: string): DemoProduct | undefined {
  return DEMO_PRODUCTS.find((p) => p.managementCode === code);
}
