export type Gender = "メンズ" | "レディース" | "ユニセックス";

export type ConditionRank = "N" | "S" | "A" | "AB" | "B" | "C" | "D";

export interface ConditionDetail {
  location: string;
  type: string;
}

export interface AnalysisResult {
  gender: Gender;
  category: string[];
  brand: string;
  productNumber: string;
  color: string[];
  pattern: string[];
  material: string;
  labelSize: string;
  conditionRank: ConditionRank;
  conditionDetails: ConditionDetail[];
  titles: string[];
  description: string;
}

export interface DemoProduct {
  id: string;
  name: string;
  brand: string;
  gender: Gender;
  category: string[];
  color: string;
  material: string;
  conditionRank: ConditionRank;
  conditionDetails: string;
  managementCode: string;
  imageUrl: string;
  imageUrls: string[];
  price: string;
}

export interface ListingData {
  scannedCode: string | null;
  productImages: string[];
  tagImages: string[];
  analysis: AnalysisResult | null;
  selectedTitleIndex: number;
  measurements: Record<string, string>;
  accessories: string;
}

export const COLORS = [
  "ブラック", "グレー", "ネイビー", "ブラウン", "ベージュ",
  "ホワイト", "レッド", "ピンク", "ブルー", "グリーン",
  "イエロー", "オレンジ", "パープル", "ゴールド", "シルバー",
] as const;

export const PATTERNS = [
  "無地", "ストライプ", "ボーダー", "チェック", "ドット",
  "カモフラ", "アニマル", "花柄", "その他",
] as const;

export const CONDITION_RANKS: { rank: ConditionRank; label: string }[] = [
  { rank: "N", label: "新品未使用" },
  { rank: "S", label: "非常に良好" },
  { rank: "A", label: "良好" },
  { rank: "AB", label: "やや使用感" },
  { rank: "B", label: "傷・汚れあり" },
  { rank: "C", label: "目立つ傷・汚れ" },
  { rank: "D", label: "著しい傷・汚れ" },
];

export const CONDITION_RANK_COLORS: Record<ConditionRank, string> = {
  N: "bg-emerald-100 text-emerald-800",
  S: "bg-green-100 text-green-800",
  A: "bg-blue-100 text-blue-800",
  AB: "bg-slate-100 text-slate-700",
  B: "bg-yellow-100 text-yellow-800",
  C: "bg-orange-100 text-orange-800",
  D: "bg-red-100 text-red-800",
};
