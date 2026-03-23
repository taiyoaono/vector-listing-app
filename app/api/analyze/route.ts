import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { productImages, tagImages, scannedCode } = await request.json();

    const imageContents: Anthropic.Messages.ContentBlockParam[] = [];

    // Add product images
    for (let i = 0; i < productImages.length; i++) {
      const base64 = productImages[i].replace(/^data:image\/\w+;base64,/, "");
      imageContents.push({
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: base64,
        },
      });
      imageContents.push({
        type: "text",
        text: `[商品写真 ${i + 1}]`,
      });
    }

    // Add tag images
    for (let i = 0; i < tagImages.length; i++) {
      const base64 = tagImages[i].replace(/^data:image\/\w+;base64,/, "");
      imageContents.push({
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: base64,
        },
      });
      imageContents.push({
        type: "text",
        text: `[品質タグ写真 ${i + 1}]`,
      });
    }

    const systemPrompt = `あなたは中古品リユース企業「ベクトル」の出品アシスタントAIです。
商品写真と品質タグの写真を解析し、出品に必要な全情報を構造化JSONで返してください。

## 出力形式（JSON）
{
  "gender": "メンズ" | "レディース" | "ユニセックス",
  "category": ["第1階層", "第2階層", "第3階層"],  // 第3階層は該当がなければ省略可
  "brand": "ブランド名",
  "productNumber": "品番（不明なら空文字）",
  "color": ["カラー名"],  // ブラック,グレー,ネイビー,ブラウン,ベージュ,ホワイト,レッド,ピンク,ブルー,グリーン,イエロー,オレンジ,パープル,ゴールド,シルバーから選択
  "pattern": ["柄名"],  // 無地,ストライプ,ボーダー,チェック,ドット,カモフラ,アニマル,花柄,その他から選択
  "material": "素材（品質タグから。不明なら推定）",
  "labelSize": "ラベル記載サイズ（不明なら空文字）",
  "conditionRank": "N" | "S" | "A" | "AB" | "B" | "C" | "D",
  "conditionDetails": [{"location": "箇所", "type": "状態の種類"}],
  "titles": ["タイトル候補1", "タイトル候補2", "タイトル候補3"],
  "description": "商品説明文"
}

## カテゴリ第1階層
トップス / アウター / ボトムス / ワンピース / バッグ / シューズ / 小物 / アクセサリー / 時計 / 財布

## 状態ランク基準
N=新品未使用, S=非常に良好, A=良好, AB=やや使用感, B=傷汚れあり, C=目立つ傷汚れ, D=著しい傷汚れ

## タイトル形式
「ブランド名 商品種別 カラー/詳細」の形式で3候補生成。

## 商品説明文
状態詳細・素材・特徴を含む、出品サイトに掲載する自然な文章。150〜300文字程度。

必ず有効なJSONのみを出力してください。説明文やマークダウンは不要です。`;

    let userPrompt = "以下の商品写真と品質タグ写真を解析し、出品情報をJSON形式で返してください。";
    if (scannedCode) {
      userPrompt += `\n\n管理番号: ${scannedCode}`;
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            ...imageContents,
            { type: "text", text: userPrompt },
          ],
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return Response.json({ error: "No response" }, { status: 500 });
    }

    // Extract JSON from response
    let jsonStr = textBlock.text.trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const analysis = JSON.parse(jsonStr);
    return Response.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);
    return Response.json(
      { error: "Analysis failed", details: String(error) },
      { status: 500 }
    );
  }
}
