"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  Pencil,
  Check,
  Plus,
  X,
  Eye,
} from "lucide-react";
import { useListingStore } from "@/lib/store";
import { getMeasurementFields } from "@/lib/categories";
import {
  COLORS,
  PATTERNS,
  CONDITION_RANKS,
  CONDITION_RANK_COLORS,
  type AnalysisResult,
  type ConditionRank,
} from "@/lib/types";

const LOADING_STEPS = [
  "写真を解析中...",
  "カテゴリを推定中...",
  "品質タグを読み取り中...",
  "状態を判定中...",
  "タイトルを生成中...",
];

export default function ResultPage() {
  const router = useRouter();
  const {
    productImages,
    tagImages,
    scannedCode,
    analysis,
    setAnalysis,
    updateAnalysis,
    selectedTitleIndex,
    setSelectedTitleIndex,
    measurements,
    setMeasurement,
    accessories,
    setAccessories,
  } = useListingStore();

  const [loading, setLoading] = useState(!analysis);
  const [loadingStep, setLoadingStep] = useState(0);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  useEffect(() => {
    if (analysis) return;
    if (productImages.length === 0) {
      router.push("/photos");
      return;
    }

    // Loading animation
    const interval = setInterval(() => {
      setLoadingStep((prev) =>
        prev < LOADING_STEPS.length - 1 ? prev + 1 : prev
      );
    }, 1500);

    // API call
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productImages, tagImages, scannedCode }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setAnalysis(data as AnalysisResult);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        // Fallback demo data
        setAnalysis({
          gender: "レディース",
          category: ["アウター", "コート", "チェスターコート"],
          brand: "不明",
          productNumber: "",
          color: ["ベージュ"],
          pattern: ["無地"],
          material: "",
          labelSize: "",
          conditionRank: "B",
          conditionDetails: [],
          titles: ["商品タイトル候補1", "商品タイトル候補2", "商品タイトル候補3"],
          description: "商品の詳細情報をAIが解析できませんでした。手動で入力してください。",
        });
        setLoading(false);
      })
      .finally(() => clearInterval(interval));

    return () => clearInterval(interval);
  }, [analysis, productImages, tagImages, scannedCode, setAnalysis, router]);

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  const confirmEdit = (field: string) => {
    if (analysis) {
      updateAnalysis({ [field]: tempValue } as Partial<AnalysisResult>);
    }
    setEditingField(null);
  };

  const measurementFields = analysis
    ? getMeasurementFields(analysis.category)
    : [];

  // Loading screen
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
        {productImages[0] && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10 blur-xl"
            style={{ backgroundImage: `url(${productImages[0]})` }}
          />
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center space-y-6"
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-400/25 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">AIが商品を解析しています</h2>
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-muted-foreground"
              >
                {LOADING_STEPS[loadingStep]}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="flex justify-center gap-1">
            {LOADING_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  i <= loadingStep ? "bg-teal-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="flex-1 flex flex-col">
      {/* Step Indicator */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/30 text-teal-300 text-[10px] font-bold">
            1
          </span>
          <div className="flex-1 h-px bg-teal-200" />
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/30 text-teal-300 text-[10px] font-bold">
            2
          </span>
          <div className="flex-1 h-px bg-teal-200" />
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] font-bold">
            3
          </span>
          <span className="font-medium text-teal-500">確認・編集</span>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 overflow-y-auto px-5 pb-32 space-y-4"
      >
        {/* Images */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {productImages.map((img, i) => (
            <div
              key={i}
              className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-100"
            >
              <img
                src={img}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Gender */}
        <Section title="性別">
          <div className="flex gap-2">
            {(["メンズ", "レディース", "ユニセックス"] as const).map((g) => (
              <button
                key={g}
                onClick={() => updateAnalysis({ gender: g })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  analysis.gender === g
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </Section>

        {/* Category */}
        <Section title="カテゴリ">
          <div className="flex items-center gap-1 text-sm">
            {analysis.category.map((cat, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                )}
                <span className="text-teal-500 font-medium">{cat}</span>
              </span>
            ))}
            <button
              onClick={() => startEdit("category", analysis.category.join(" ＞ "))}
              className="ml-2 text-gray-400 hover:text-teal-500"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        </Section>

        {/* Brand & Product Number */}
        <div className="grid grid-cols-2 gap-3">
          <EditableSection
            title="ブランド"
            value={analysis.brand}
            editing={editingField === "brand"}
            tempValue={tempValue}
            onEdit={() => startEdit("brand", analysis.brand)}
            onConfirm={() => confirmEdit("brand")}
            onChange={setTempValue}
          />
          <EditableSection
            title="品番"
            value={analysis.productNumber || "—"}
            editing={editingField === "productNumber"}
            tempValue={tempValue}
            onEdit={() =>
              startEdit("productNumber", analysis.productNumber)
            }
            onConfirm={() => confirmEdit("productNumber")}
            onChange={setTempValue}
          />
        </div>

        {/* Color */}
        <Section title="色">
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  const colors = analysis.color.includes(c)
                    ? analysis.color.filter((x) => x !== c)
                    : [...analysis.color, c];
                  updateAnalysis({ color: colors });
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  analysis.color.includes(c)
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Section>

        {/* Pattern */}
        <Section title="柄">
          <div className="flex flex-wrap gap-1.5">
            {PATTERNS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  const patterns = analysis.pattern.includes(p)
                    ? analysis.pattern.filter((x) => x !== p)
                    : [...analysis.pattern, p];
                  updateAnalysis({ pattern: patterns });
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  analysis.pattern.includes(p)
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </Section>

        {/* Material */}
        <EditableSection
          title="素材"
          value={analysis.material || "—"}
          editing={editingField === "material"}
          tempValue={tempValue}
          onEdit={() => startEdit("material", analysis.material)}
          onConfirm={() => confirmEdit("material")}
          onChange={setTempValue}
        />

        {/* Condition Rank */}
        <Section title="状態ランク">
          <div className="flex flex-wrap gap-1.5">
            {CONDITION_RANKS.map(({ rank, label }) => (
              <button
                key={rank}
                onClick={() =>
                  updateAnalysis({ conditionRank: rank as ConditionRank })
                }
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  analysis.conditionRank === rank
                    ? CONDITION_RANK_COLORS[rank]
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {rank}
                <span className="ml-1 text-[10px] opacity-70">{label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Condition Details */}
        <Section title="状態詳細">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {analysis.conditionDetails.map((d, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 text-[11px] font-medium"
              >
                {d.location} - {d.type}
                <button
                  onClick={() => {
                    const details = analysis.conditionDetails.filter(
                      (_, j) => j !== i
                    );
                    updateAnalysis({ conditionDetails: details });
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                const loc = prompt("箇所を入力（例: 袖口）");
                const type = prompt("状態を入力（例: 毛玉）");
                if (loc && type) {
                  updateAnalysis({
                    conditionDetails: [
                      ...analysis.conditionDetails,
                      { location: loc, type },
                    ],
                  });
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[11px] font-medium hover:bg-gray-200"
            >
              <Plus className="w-3 h-3" /> 追加
            </button>
          </div>
        </Section>

        {/* Label Size */}
        <EditableSection
          title="参考表示サイズ"
          value={analysis.labelSize || "—"}
          editing={editingField === "labelSize"}
          tempValue={tempValue}
          onEdit={() => startEdit("labelSize", analysis.labelSize)}
          onConfirm={() => confirmEdit("labelSize")}
          onChange={setTempValue}
        />

        {/* Measurements */}
        {measurementFields.length > 0 && (
          <Section title="実寸サイズ（平置き計測・cm）">
            <div className="grid grid-cols-2 gap-2">
              {measurementFields.map((field) => (
                <div key={field}>
                  <label className="text-[11px] text-gray-500 mb-1 block">
                    {field}
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="—"
                    value={measurements[field] || ""}
                    onChange={(e) => setMeasurement(field, e.target.value)}
                    className="w-full h-9 rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 outline-none"
                  />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Accessories */}
        <Section title="付属品">
          <input
            type="text"
            placeholder="箱、保存袋、タグ等"
            value={accessories}
            onChange={(e) => setAccessories(e.target.value)}
            className="w-full h-9 rounded-xl border border-gray-200 px-3 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 outline-none"
          />
        </Section>

        {/* Title */}
        <Section title="タイトル">
          <div className="space-y-2">
            {analysis.titles.map((title, i) => (
              <button
                key={i}
                onClick={() => setSelectedTitleIndex(i)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  selectedTitleIndex === i
                    ? "bg-teal-50 border-2 border-teal-500 text-teal-900"
                    : "bg-gray-50 border border-gray-200 text-gray-700"
                }`}
              >
                {title}
              </button>
            ))}
            {/* Custom title option */}
            <button
              onClick={() => setSelectedTitleIndex(-1)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                selectedTitleIndex === -1
                  ? "bg-teal-50 border-2 border-teal-500 text-teal-900"
                  : "bg-gray-50 border border-gray-200 text-gray-700"
              }`}
            >
              自分で入力する
            </button>
            {selectedTitleIndex === -1 && (
              <input
                autoFocus
                type="text"
                placeholder="タイトルを入力..."
                value={analysis.titles[3] || ""}
                onChange={(e) => {
                  const newTitles = [...analysis.titles];
                  newTitles[3] = e.target.value;
                  updateAnalysis({ titles: newTitles });
                }}
                className="w-full h-10 rounded-xl border border-teal-300 px-3 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 outline-none"
              />
            )}
          </div>
        </Section>

        {/* Description */}
        <Section title="商品説明文">
          <textarea
            value={analysis.description}
            onChange={(e) => updateAnalysis({ description: e.target.value })}
            rows={6}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 outline-none resize-none"
          />
        </Section>
      </motion.div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => router.push("/preview")}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-teal-400/25 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            プレビューを確認
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="text-xs font-medium text-gray-400 mb-2.5">{title}</div>
      {children}
    </div>
  );
}

function EditableSection({
  title,
  value,
  editing,
  tempValue,
  onEdit,
  onConfirm,
  onChange,
}: {
  title: string;
  value: string;
  editing: boolean;
  tempValue: string;
  onEdit: () => void;
  onConfirm: () => void;
  onChange: (v: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="text-xs font-medium text-gray-400 mb-2">{title}</div>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={tempValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onConfirm()}
            className="flex-1 h-8 rounded-lg border border-teal-300 px-2 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
          />
          <button
            onClick={onConfirm}
            className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{value}</span>
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-teal-500"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
