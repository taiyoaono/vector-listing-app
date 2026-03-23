"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, PartyPopper, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { useListingStore } from "@/lib/store";
import { CONDITION_RANK_COLORS, CONDITION_RANKS } from "@/lib/types";
import { getMeasurementFields } from "@/lib/categories";

export default function PreviewPage() {
  const router = useRouter();
  const {
    productImages,
    analysis,
    selectedTitleIndex,
    measurements,
    accessories,
    reset,
  } = useListingStore();

  const [currentImage, setCurrentImage] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (!analysis) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-400">データがありません</p>
      </div>
    );
  }

  const title = analysis.titles[selectedTitleIndex] || analysis.titles[0];
  const rankInfo = CONDITION_RANKS.find(
    (r) => r.rank === analysis.conditionRank
  );
  const measurementFields = getMeasurementFields(analysis.category);

  const handleSubmit = () => {
    setCompleted(true);
    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#0DBAB0", "#0D9B93", "#5CD6CE", "#C6F7F4"],
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#0DBAB0", "#0D9B93", "#5CD6CE"],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#0DBAB0", "#0D9B93", "#5CD6CE"],
      });
    }, 200);
  };

  // Completed screen
  if (completed) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg shadow-teal-500/25 flex items-center justify-center">
            <PartyPopper className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">出品完了！</h2>
            <p className="text-sm text-muted-foreground">
              商品が正常に出品されました
            </p>
          </div>
          <button
            onClick={() => {
              reset();
              router.push("/");
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold text-sm shadow-lg shadow-teal-500/25 active:scale-[0.98] transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
            次の商品を出品
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pb-24">
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-teal-600"
        >
          <ChevronLeft className="w-4 h-4" />
          編集に戻る
        </button>
        <span className="text-xs text-gray-400">プレビュー</span>
      </div>

      <div className="overflow-y-auto flex-1">
        {/* Image Carousel */}
        {productImages.length > 0 && (
          <div className="relative bg-white">
            <div className="aspect-square overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={productImages[currentImage]}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>
            {productImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImage((i) =>
                      i > 0 ? i - 1 : productImages.length - 1
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setCurrentImage((i) =>
                      i < productImages.length - 1 ? i + 1 : 0
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {productImages.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i === currentImage ? "bg-white" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Product Info */}
        <div className="px-5 py-4 space-y-4">
          {/* Title & Rank */}
          <div>
            <div className="flex items-start gap-2 mb-2">
              <span
                className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${CONDITION_RANK_COLORS[analysis.conditionRank]}`}
              >
                {analysis.conditionRank}
              </span>
              <h1 className="text-lg font-bold leading-tight">{title}</h1>
            </div>
            <div className="text-xl font-bold text-teal-600">¥ —</div>
          </div>

          {/* Info Table */}
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            <InfoRow label="ブランド" value={analysis.brand} />
            <InfoRow label="カテゴリ" value={analysis.category.join(" ＞ ")} />
            <InfoRow label="性別" value={analysis.gender} />
            <InfoRow label="色" value={analysis.color.join(", ")} />
            {analysis.pattern.length > 0 && (
              <InfoRow label="柄" value={analysis.pattern.join(", ")} />
            )}
            <InfoRow label="素材" value={analysis.material || "—"} />
            <InfoRow
              label="参考サイズ"
              value={analysis.labelSize || "—"}
            />
            <InfoRow
              label="状態"
              value={`${analysis.conditionRank} - ${rankInfo?.label || ""}`}
            />
            {accessories && <InfoRow label="付属品" value={accessories} />}
          </div>

          {/* Measurements */}
          {measurementFields.some((f) => measurements[f]) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="text-xs font-medium text-gray-400 mb-3">
                実寸サイズ（cm）
              </div>
              <div className="grid grid-cols-2 gap-2">
                {measurementFields.map(
                  (field) =>
                    measurements[field] && (
                      <div
                        key={field}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-500">{field}</span>
                        <span className="font-medium">
                          {measurements[field]}
                        </span>
                      </div>
                    )
                )}
              </div>
            </div>
          )}

          {/* Condition Details */}
          {analysis.conditionDetails.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="text-xs font-medium text-gray-400 mb-3">
                状態詳細
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.conditionDetails.map((d, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-[11px] font-medium"
                  >
                    {d.location}: {d.type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="text-xs font-medium text-gray-400 mb-3">
              商品説明
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {analysis.description}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSubmit}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold text-sm shadow-lg shadow-teal-500/25 active:scale-[0.98] transition-transform"
          >
            出品する
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex px-4 py-3">
      <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
