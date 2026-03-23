"use client";

import Image from "next/image";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { CONDITION_RANK_COLORS } from "@/lib/types";

const QUALITY_TAGS = [
  {
    productId: "1",
    company: "株式会社バーバリー・ジャパン",
    productNumber: "品番: 8045678",
    material: "毛 100%",
    size: "サイズ: 38",
    origin: "MADE IN ENGLAND",
  },
  {
    productId: "3",
    company: "コーチ・ジャパン合同会社",
    productNumber: "品番: F29208",
    material: "牛革",
    size: "",
    origin: "MADE IN VIETNAM",
  },
  {
    productId: "5",
    company: "Gucci Japan 合同会社",
    productNumber: "品番: 658822",
    material: "スウェード (山羊革)",
    size: "サイズ: 8 1/2",
    origin: "MADE IN ITALY",
  },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">デモ用素材</h1>
        <p className="text-sm text-gray-500">
          PCまたは別デバイスでこのページを表示し、デモ用スマホでスキャン・撮影してください
        </p>
      </div>

      {/* QR Codes */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4 text-blue-700">
          QRコード（スマホでスキャン）
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {DEMO_PRODUCTS.map((product, i) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center"
            >
              <Image
                src={`/demo/qr-${String(i + 1).padStart(3, "0")}.png`}
                alt={product.managementCode}
                width={200}
                height={200}
                className="mx-auto mb-3"
              />
              <div className="text-xs font-mono text-gray-400 mb-1">
                {product.managementCode}
              </div>
              <div className="text-sm font-semibold">{product.brand}</div>
              <div className="text-xs text-gray-600">{product.name}</div>
              <span
                className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${CONDITION_RANK_COLORS[product.conditionRank]}`}
              >
                {product.conditionRank}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Quality Tags */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">
          品質タグ（スマホで撮影 → OCR）
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {QUALITY_TAGS.map((tag) => {
            const product = DEMO_PRODUCTS.find((p) => p.id === tag.productId);
            return (
              <div
                key={tag.productId}
                className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100"
              >
                <div className="text-xs text-gray-400 px-3 pt-2 mb-1">
                  ▼ {product?.brand} {product?.name} の品質タグ
                </div>
                <div className="bg-[#FFFEF5] border border-gray-200 rounded-xl p-4 mx-2 mb-2 font-mono text-xs leading-relaxed space-y-1">
                  <div className="text-[10px] text-gray-400 text-center mb-2">
                    ── 品質表示 ──
                  </div>
                  <div className="font-bold text-sm">{tag.company}</div>
                  <div>{tag.productNumber}</div>
                  {tag.material && <div>素材: {tag.material}</div>}
                  {tag.size && <div>{tag.size}</div>}
                  <div className="pt-1 text-gray-500">{tag.origin}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
