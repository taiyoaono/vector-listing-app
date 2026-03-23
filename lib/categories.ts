export interface CategoryNode {
  label: string;
  children?: CategoryNode[];
}

export const CATEGORY_TREE: CategoryNode[] = [
  {
    label: "トップス",
    children: [
      {
        label: "Tシャツ・カットソー",
        children: [
          { label: "半袖" },
          { label: "長袖" },
          { label: "ノースリーブ" },
        ],
      },
      {
        label: "シャツ・ブラウス",
        children: [
          { label: "ドレスシャツ" },
          { label: "カジュアルシャツ" },
        ],
      },
      {
        label: "ニット・セーター",
        children: [
          { label: "クルーネック" },
          { label: "Vネック" },
          { label: "タートルネック" },
        ],
      },
      { label: "パーカー" },
      { label: "スウェット" },
      { label: "カーディガン" },
      { label: "ベスト" },
    ],
  },
  {
    label: "アウター",
    children: [
      {
        label: "ジャケット",
        children: [
          { label: "テーラードジャケット" },
          { label: "デニムジャケット" },
          { label: "ライダースジャケット" },
          { label: "ブルゾン" },
        ],
      },
      {
        label: "コート",
        children: [
          { label: "チェスターコート" },
          { label: "トレンチコート" },
          { label: "ステンカラーコート" },
          { label: "ダウンコート" },
          { label: "ピーコート" },
        ],
      },
      { label: "ダウンジャケット" },
      { label: "ベスト" },
    ],
  },
  {
    label: "ボトムス",
    children: [
      { label: "デニムパンツ" },
      { label: "スラックス" },
      { label: "チノパン" },
      { label: "ショートパンツ" },
      { label: "スカート" },
    ],
  },
  { label: "ワンピース" },
  {
    label: "バッグ",
    children: [
      { label: "トートバッグ" },
      { label: "ショルダーバッグ" },
      { label: "ハンドバッグ" },
      { label: "リュック・バックパック" },
      { label: "クラッチバッグ" },
      { label: "ボストンバッグ" },
    ],
  },
  {
    label: "シューズ",
    children: [
      { label: "スニーカー" },
      { label: "ブーツ" },
      { label: "ローファー" },
      { label: "サンダル" },
      { label: "パンプス" },
      { label: "ドレスシューズ" },
    ],
  },
  {
    label: "小物",
    children: [
      { label: "マフラー・ストール" },
      { label: "帽子" },
      { label: "ベルト" },
      { label: "手袋" },
      { label: "サングラス" },
    ],
  },
  {
    label: "アクセサリー",
    children: [
      { label: "ネックレス" },
      { label: "リング" },
      { label: "ブレスレット" },
      { label: "ピアス・イヤリング" },
    ],
  },
  { label: "時計" },
  {
    label: "財布",
    children: [
      { label: "長財布" },
      { label: "二つ折り財布" },
      { label: "コインケース" },
      { label: "カードケース" },
    ],
  },
];

export function getMeasurementFields(category: string[]): string[] {
  const top = category[0];
  switch (top) {
    case "トップス":
    case "アウター":
      return ["着丈", "身幅", "袖丈", "肩幅"];
    case "ボトムス":
      return ["ウエスト", "ヒップ", "股上", "股下", "裾幅"];
    case "ワンピース":
      return ["着丈", "身幅", "袖丈", "肩幅", "ウエスト"];
    case "シューズ":
      return ["ソール長", "ヒール高"];
    case "バッグ":
      return ["横幅", "高さ", "マチ", "持ち手"];
    case "小物":
      if (category[1] === "マフラー・ストール") return ["長さ", "幅"];
      if (category[1] === "ベルト") return ["全長", "幅"];
      return [];
    default:
      return [];
  }
}
