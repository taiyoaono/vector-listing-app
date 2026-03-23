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

type SlideType = "qr" | "tag" | "image";

export default function DemoPage() {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [slideType, setSlideType] = useState<SlideType>("qr");
  const [imageIndex, setImageIndex] = useState(0);

  const slideTypes: SlideType[] = ["qr", "tag", "image"];
  const slideLabels: Record<SlideType, string> = {
    qr: "バーコード",
    tag: "品質タグ",
    image: "商品写真",
  };

  const currentSlideIndex = slideTypes.indexOf(slideType);

  const goNext = () => {
    if (currentSlideIndex < slideTypes.length - 1) {
      setSlideType(slideTypes[currentSlideIndex + 1]);
      setImageIndex(0);
    }
  };

  const goPrev = () => {
    if (currentSlideIndex > 0) {
      setSlideType(slideTypes[currentSlideIndex - 1]);
      setImageIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-5xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold mb-1">デモ用素材</h1>
        <p className="text-xs text-gray-500">
          商品をタップ → バーコード・品質タグ・商品写真を表示
        </p>
      </div>

      {/* Product Cards - Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory">
        {DEMO_PRODUCTS.map((product, i) => (
          <button
            key={product.id}
            onClick={() => {
              setSelectedProduct(i);
              setSlideType("qr");
              setImageIndex(0);
            }}
            className="shrink-0 w-[140px] snap-start bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-gray-100 relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${CONDITION_RANK_COLORS[product.conditionRank]}`}
              >
                {product.conditionRank}
              </span>
            </div>
            <div className="p-2.5">
              <div className="text-[10px] font-semibold text-teal-500">
                {product.brand}
              </div>
              <div className="text-[10px] text-gray-700 truncate">
                {product.name}
              </div>
              <div className="text-[10px] font-bold mt-0.5">{product.price}</div>
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
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
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
            <div className="flex gap-1 px-4 py-2 bg-gray-50 shrink-0">
              {slideTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => { setSlideType(type); setImageIndex(0); }}
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
            <div className="flex-1 flex items-center justify-center p-4 relative min-h-0">
              {/* Prev / Next type arrows */}
              {currentSlideIndex > 0 && (
                <button
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {currentSlideIndex < slideTypes.length - 1 && (
                <button
                  onClick={goNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${slideType}-${imageIndex}`}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.15 }}
                  className="w-full max-w-lg flex flex-col items-center justify-center"
                >
                  {slideType === "qr" && (
                    <div className="text-center">
                      <Image
                        src={`/demo/barcode-${String(selectedProduct + 1).padStart(3, "0")}.png`}
                        alt="Barcode"
                        width={280}
                        height={280}
                        className="mx-auto"
                      />
                      <div className="mt-3 font-mono text-sm text-gray-500">
                        {DEMO_PRODUCTS[selectedProduct].managementCode}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        スマホでこのバーコードをスキャン
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
                        <div className="bg-[#FFFEF5] border-2 border-gray-300 rounded-xl p-6 font-mono text-sm leading-relaxed space-y-2">
                          <div className="text-xs text-gray-400 text-center mb-3">
                            ────── 品質表示 ──────
                          </div>
                          <div className="font-bold text-base">{tag.company}</div>
                          <div>{tag.productNumber}</div>
                          {tag.material && <div>素材: {tag.material}</div>}
                          {tag.size && <div>{tag.size}</div>}
                          <div className="pt-2 text-gray-500">{tag.origin}</div>
                        </div>
                        <div className="text-center mt-3 text-xs text-gray-400">
                          この品質タグをスマホで撮影 → AIが自動読み取り
                        </div>
                      </div>
                    );
                  })()}

                  {slideType === "image" && (() => {
                    const urls = DEMO_PRODUCTS[selectedProduct].imageUrls;
                    return (
                      <div className="w-full">
                        <img
                          src={urls[imageIndex]}
                          alt={`Product photo ${imageIndex + 1}`}
                          className="w-full max-h-[55vh] object-contain rounded-2xl mx-auto"
                        />
                        {/* Image dots + nav */}
                        <div className="flex items-center justify-center gap-3 mt-3">
                          <button
                            onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
                            disabled={imageIndex === 0}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <div className="flex gap-1.5">
                            {urls.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setImageIndex(i)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  i === imageIndex ? "bg-teal-500" : "bg-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => setImageIndex((i) => Math.min(urls.length - 1, i + 1))}
                            disabled={imageIndex === urls.length - 1}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-center mt-2 text-xs text-gray-400">
                          {imageIndex + 1} / {urls.length}枚 — この画像をスマホで撮影
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Product Navigation */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
              <div className="flex gap-2 overflow-x-auto">
                {DEMO_PRODUCTS.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProduct(i);
                      setSlideType("qr");
                      setImageIndex(0);
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
