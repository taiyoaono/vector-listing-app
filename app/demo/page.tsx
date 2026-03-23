"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { CONDITION_RANK_COLORS } from "@/lib/types";

const QUALITY_TAGS = [
  {
    productId: "1",
    company: "株式会社ジーユー",
    productNumber: "品番: 347521",
    material: "綿 100%",
    size: "サイズ: XL",
    origin: "MADE IN CHINA",
  },
  {
    productId: "2",
    company: "クリスチャン ディオール",
    productNumber: "品番: 113P1240",
    material: "毛 70% / ポリエステル 30%",
    size: "サイズ: 48",
    origin: "MADE IN ITALY",
  },
  {
    productId: "3",
    company: "MICHAEL KORS (USA) INC.",
    productNumber: "品番: 35S3GM9L3L",
    material: "牛革",
    size: "",
    origin: "MADE IN CHINA",
  },
  {
    productId: "4",
    company: "株式会社ナイキジャパン",
    productNumber: "品番: FZ5608-100",
    material: "合成繊維 / 合成樹脂",
    size: "サイズ: 25.0cm",
    origin: "MADE IN VIETNAM",
  },
  {
    productId: "5",
    company: "株式会社ヨウジヤマモト",
    productNumber: "品番: HY-W02-700",
    material: "牛革",
    size: "",
    origin: "MADE IN JAPAN",
  },
];

type SlideType = "image" | "qr" | "tag";

export default function DemoPage() {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [slideType, setSlideType] = useState<SlideType>("qr");

  const slideTypes: SlideType[] = ["qr", "tag", "image"];
  const slideLabels: Record<SlideType, string> = {
    image: "商品写真",
    qr: "QRコード",
    tag: "品質タグ",
  };

  const currentSlideIndex = slideTypes.indexOf(slideType);

  const goNext = () => {
    if (currentSlideIndex < slideTypes.length - 1) {
      setSlideType(slideTypes[currentSlideIndex + 1]);
    }
  };

  const goPrev = () => {
    if (currentSlideIndex > 0) {
      setSlideType(slideTypes[currentSlideIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">デモ用素材</h1>
        <p className="text-sm text-gray-500">
          商品をタップして、QRコード・品質タグを大きく表示
        </p>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {DEMO_PRODUCTS.map((product, i) => (
          <button
            key={product.id}
            onClick={() => {
              setSelectedProduct(i);
              setSlideType("qr");
            }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-gray-100 relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${CONDITION_RANK_COLORS[product.conditionRank]}`}
              >
                {product.conditionRank}
              </span>
            </div>
            <div className="p-3">
              <div className="text-xs font-semibold text-teal-500">
                {product.brand}
              </div>
              <div className="text-xs text-gray-700 truncate">
                {product.name}
              </div>
              <div className="text-xs font-bold mt-1">{product.price}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Fullscreen Slide View */}
      <AnimatePresence>
        {selectedProduct !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <div className="text-sm font-bold">
                  {DEMO_PRODUCTS[selectedProduct].brand}
                </div>
                <div className="text-xs text-gray-500">
                  {DEMO_PRODUCTS[selectedProduct].name}
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slide Tabs */}
            <div className="flex gap-1 px-4 py-2 bg-gray-50">
              {slideTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSlideType(type)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                    slideType === type
                      ? "bg-teal-500 text-white"
                      : "bg-white text-gray-500 border border-gray-200"
                  }`}
                >
                  {slideLabels[type]}
                </button>
              ))}
            </div>

            {/* Slide Content */}
            <div className="flex-1 flex items-center justify-center p-6 relative">
              {/* Prev / Next arrows */}
              {currentSlideIndex > 0 && (
                <button
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center z-10 hover:bg-gray-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {currentSlideIndex < slideTypes.length - 1 && (
                <button
                  onClick={goNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center z-10 hover:bg-gray-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={slideType}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-md flex items-center justify-center"
                >
                  {slideType === "image" && (
                    <div className="w-full">
                      <img
                        src={DEMO_PRODUCTS[selectedProduct].imageUrl}
                        alt="Product"
                        className="w-full max-h-[60vh] object-contain rounded-2xl"
                      />
                      <div className="text-center mt-3 text-xs text-gray-400">
                        この画像をスマホで撮影してください
                      </div>
                    </div>
                  )}

                  {slideType === "qr" && (
                    <div className="text-center">
                      <Image
                        src={`/demo/qr-${String(selectedProduct + 1).padStart(3, "0")}.png`}
                        alt="QR Code"
                        width={300}
                        height={300}
                        className="mx-auto"
                      />
                      <div className="mt-4 font-mono text-sm text-gray-500">
                        {DEMO_PRODUCTS[selectedProduct].managementCode}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        スマホでこのQRコードをスキャン
                      </div>
                    </div>
                  )}

                  {slideType === "tag" && (() => {
                    const tag = QUALITY_TAGS.find(
                      (t) => t.productId === DEMO_PRODUCTS[selectedProduct].id
                    );
                    if (!tag) return <div className="text-gray-400">品質タグなし</div>;
                    return (
                      <div className="w-full max-w-sm">
                        <div className="bg-[#FFFEF5] border-2 border-gray-300 rounded-xl p-8 font-mono text-sm leading-relaxed space-y-2">
                          <div className="text-xs text-gray-400 text-center mb-4">
                            ────── 品質表示 ──────
                          </div>
                          <div className="font-bold text-base">
                            {tag.company}
                          </div>
                          <div>{tag.productNumber}</div>
                          {tag.material && (
                            <div>素材: {tag.material}</div>
                          )}
                          {tag.size && <div>{tag.size}</div>}
                          <div className="pt-2 text-gray-500">
                            {tag.origin}
                          </div>
                        </div>
                        <div className="text-center mt-3 text-xs text-gray-400">
                          この品質タグをスマホで撮影 → AIが自動読み取り
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Product Navigation */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex gap-2 overflow-x-auto">
                {DEMO_PRODUCTS.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(i);
                      setSlideType("qr");
                    }}
                    className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === selectedProduct
                        ? "border-teal-500"
                        : "border-transparent opacity-50"
                    }`}
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
