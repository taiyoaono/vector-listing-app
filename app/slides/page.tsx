"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  ScanBarcode,
  Sparkles,
  Eye,
  CheckCircle,
  ArrowRight,
  Zap,
  AlertTriangle,
  Smartphone,
  Globe,
  Database,
  Palette,
  Play,
} from "lucide-react";

const TEAL = "#14b8a6";

function Slide({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`h-full flex flex-col items-center justify-center px-12 py-8 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children, color = "teal" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    teal: "bg-teal-100 text-teal-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-600",
    yellow: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

function FlowStep({ icon: Icon, label, active = false, ai = false }: { icon: typeof Camera; label: string; active?: boolean; ai?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${active ? "opacity-100" : "opacity-60"}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${ai ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600"}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-medium text-center">{label}</span>
    </div>
  );
}

const slides = [
  // 1. 表紙
  () => (
    <Slide>
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
          <Camera className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">ベクトル出品アプリ</h1>
          <p className="text-lg text-gray-500 mt-2">スマホで撮るだけ。AIが全部やる。</p>
        </div>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-400">
          <span className="font-semibold text-gray-700">2WINS</span>
          <span>×</span>
          <span className="font-semibold text-gray-700">株式会社ベクトル</span>
        </div>
        <p className="text-xs text-gray-400">2026.03.24 合宿プレゼン</p>
      </div>
    </Slide>
  ),

  // 2. クライアント要望の整理
  () => (
    <Slide>
      <div className="w-full max-w-2xl space-y-6">
        <h2 className="text-2xl font-bold">ご要望の整理</h2>
        <p className="text-sm text-gray-500">Excel要望書で頂いた6つの機能</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { num: "1", title: "スマホ撮影→画像一括取込", desc: "POSバーコードスキャン、連続撮影、ZIP圧縮→FTPアップロード→GRECS反映" },
            { num: "2", title: "カテゴリ→実寸サイズ入力", desc: "カテゴリ選択後にサイズ入力。GRECS連携（新規開発必要）" },
            { num: "3", title: "状態テンプレート入力", desc: "種類→箇所→テンプレート文生成。商材による絞り込み" },
            { num: "4", title: "品質タグOCR", desc: "品質タグ撮影→文字起こし→代理店名・品番抽出" },
            { num: "5", title: "商品タイトル生成", desc: "PSSの商品タイトル自動生成機能" },
            { num: "6", title: "複数プラットフォーム出品", desc: "メルカリ・ヤフオク等への同時出品" },
          ].map((item) => (
            <div key={item.num} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center">{item.num}</span>
                <span className="text-sm font-semibold">{item.title}</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  ),

  // 3. 現状の課題
  () => (
    <Slide>
      <div className="w-full max-w-2xl space-y-6">
        <h2 className="text-2xl font-bold">現状の課題</h2>
        <p className="text-sm text-gray-500">従来フローの非効率さ</p>

        {/* Old flow */}
        <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-semibold text-red-700">従来の出品フロー（7ステップ）</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
            {["バーコード\nスキャン", "1枚ずつ\n撮影", "画像\n加工待ち", "カテゴリ\n手動入力", "状態\n手動入力", "OCR\n別操作", "タイトル\n手動入力"].map((s, i) => (
              <div key={i} className="flex items-center">
                {i > 0 && <ArrowRight className="w-3 h-3 text-red-300 mx-0.5 shrink-0" />}
                <div className="bg-white rounded-lg px-2 py-2 text-center whitespace-pre-line border border-red-200 shrink-0">{s}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-red-500">7</div>
            <div className="text-xs text-gray-500">ステップ</div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-red-500">手動</div>
            <div className="text-xs text-gray-500">入力だらけ</div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
            <div className="text-2xl font-bold text-red-500">遅い</div>
            <div className="text-xs text-gray-500">WASABI 1枚ずつ加工</div>
          </div>
        </div>
      </div>
    </Slide>
  ),

  // 4. 2WINSの提案
  () => (
    <Slide>
      <div className="w-full max-w-2xl space-y-6 text-center">
        <Badge>2WINSの提案</Badge>
        <h2 className="text-3xl font-bold tracking-tight">
          「撮るだけで<br />
          <span style={{ color: TEAL }}>AIが全部やる</span>」
        </h2>
        <p className="text-gray-500">7ステップの手動入力フローを<br />3ステップ＋確認に凝縮</p>

        <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100">
          <div className="flex items-center justify-center gap-2 overflow-x-auto">
            {[
              { icon: ScanBarcode, label: "スキャン", step: "1" },
              { icon: Camera, label: "撮影", step: "2" },
              { icon: Sparkles, label: "AI解析", step: "3", ai: true },
              { icon: Eye, label: "確認", step: "✓" },
            ].map((s, i) => (
              <div key={i} className="flex items-center">
                {i > 0 && <ArrowRight className="w-4 h-4 text-teal-300 mx-2 shrink-0" />}
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.ai ? "bg-teal-500 text-white" : "bg-white text-teal-600 border border-teal-200"}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div className="text-[11px] font-medium text-teal-700">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  ),

  // 5. アプリフロー図解
  () => (
    <Slide>
      <div className="w-full max-w-2xl space-y-5">
        <h2 className="text-2xl font-bold">アプリフロー</h2>
        <div className="space-y-3">
          {[
            { step: "STEP 1", icon: ScanBarcode, title: "バーコードスキャン", desc: "商品のバーコードを読み取り、管理番号で商品を特定", ai: false },
            { step: "STEP 2", icon: Camera, title: "品質タグ＋商品写真を撮影", desc: "品質タグ → 確認 → 商品写真を連続撮影。ガイド付きで迷わない", ai: false },
            { step: "STEP 3", icon: Sparkles, title: "AI一括解析", desc: "全写真をClaude Vision APIに送信。カテゴリ・ブランド・品番・状態・タイトル・説明文を一括生成", ai: true },
            { step: "確認", icon: Eye, title: "確認＆微調整", desc: "全項目がAI入力済み。間違いがあればタップで修正するだけ", ai: false },
            { step: "完了", icon: CheckCircle, title: "出品プレビュー → 出品", desc: "vector-park.jp風のプレビューで最終確認 → 出品完了", ai: false },
          ].map((item) => (
            <div key={item.step} className={`flex items-start gap-4 p-3 rounded-xl ${item.ai ? "bg-teal-50 border border-teal-200" : "bg-gray-50 border border-gray-100"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.ai ? "bg-teal-500 text-white" : "bg-white text-gray-600 border border-gray-200"}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-teal-600">{item.step}</span>
                  <span className="text-sm font-semibold">{item.title}</span>
                  {item.ai && <Badge>AI</Badge>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  ),

  // 6. AI活用ポイント
  () => (
    <Slide>
      <div className="w-full max-w-2xl space-y-6">
        <h2 className="text-2xl font-bold">AIの活用ポイント</h2>
        <p className="text-sm text-gray-500">Claude Vision API — 1回のAPIコールで全解析</p>

        <div className="grid grid-cols-1 gap-3">
          {[
            { num: "①", title: "写真からカテゴリ・状態を推定", desc: "商品写真を見て、カテゴリ（3階層）、色、柄、状態ランク（N〜D）、傷・汚れの詳細を自動判定", icon: Eye },
            { num: "②", title: "品質タグOCR", desc: "品質タグの写真からブランド名、品番、素材、サイズを文字起こし＋構造化抽出", icon: ScanBarcode },
            { num: "③", title: "タイトル・説明文を自動生成", desc: "全情報を組み合わせて、出品タイトル候補3つと商品説明文を自動生成", icon: Sparkles },
          ].map((item) => (
            <div key={item.num} className="bg-white rounded-xl p-4 border border-gray-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{item.num} {item.title}</div>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <span className="text-xs text-gray-500">全てを</span>
          <span className="text-sm font-bold text-teal-600 mx-1">1回のAPIコール</span>
          <span className="text-xs text-gray-500">で実行（数秒で完了）</span>
        </div>
      </div>
    </Slide>
  ),

  // 7. メルカリUXの参考
  () => (
    <Slide>
      <div className="w-full max-w-2xl space-y-6">
        <h2 className="text-2xl font-bold">メルカリUXを参考に</h2>
        <p className="text-sm text-gray-500">誰でも使えるシンプルさを追求</p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Smartphone, title: "モバイル\nファースト", desc: "スマホで全操作が完結。PC不要" },
            { icon: Zap, title: "ステップ\n形式", desc: "今何をすべきかが一目で分かるガイド付きUI" },
            { icon: Palette, title: "シンプル\nデザイン", desc: "余計な要素を排除。直感的に操作できる" },
          ].map((item) => (
            <div key={item.title} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-2">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold whitespace-pre-line">{item.title}</div>
              <p className="text-[10px] text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
          <p className="text-xs text-teal-700 text-center">
            <span className="font-semibold">iPhone風ズーム機能</span>も実装 — ピンチズーム＋ダイヤルゲージで<br />品質タグの細かい文字もしっかり撮影可能
          </p>
        </div>
      </div>
    </Slide>
  ),

  // 8. デモスライド
  () => (
    <Slide>
      <div className="text-center space-y-8">
        <div className="mx-auto w-24 h-24 rounded-full bg-teal-50 flex items-center justify-center">
          <Play className="w-12 h-12 text-teal-500 ml-1" />
        </div>
        <div>
          <h2 className="text-3xl font-bold">デモ</h2>
          <p className="text-gray-500 mt-2">実際にアプリを触ってみましょう</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 max-w-md mx-auto text-left space-y-2">
          <div className="text-xs font-semibold text-gray-700 mb-3">デモの流れ</div>
          {[
            "バーコードをスキャン",
            "品質タグを撮影 → 確認",
            "商品写真を撮影",
            "AI解析 → 全項目が自動入力",
            "プレビュー → 出品完了",
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="text-sm">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  ),

  // 9. 今後の実用化に向けて
  () => (
    <Slide>
      <div className="w-full max-w-2xl space-y-6">
        <h2 className="text-2xl font-bold">今後の実用化に向けて</h2>
        <div className="grid grid-cols-1 gap-3">
          {[
            { icon: Database, title: "GRECS連携", desc: "既存FTPバッチを活用した画像・メタデータの自動取込。基本情報連携APIの段階的開発", priority: "最優先" },
            { icon: Palette, title: "WASABI画像加工連携", desc: "撮影画像の背景白抜き・リサイズ・色補正をWASABIと連携して自動化", priority: "高" },
            { icon: Globe, title: "複数プラットフォーム出品", desc: "メルカリ・ヤフオク等への同時出品機能。各プラットフォームのAPI連携", priority: "中" },
            { icon: Sparkles, title: "AI精度向上", desc: "品質タグOCRの精度改善、状態判定の学習データ蓄積、カテゴリ推定の精度向上", priority: "継続" },
            { icon: Smartphone, title: "現場テスト・フィードバック", desc: "実店舗での実地テスト → フィードバック反映 → 改善サイクルの確立", priority: "次フェーズ" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{item.title}</span>
                  <Badge color="yellow">{item.priority}</Badge>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  ),

  // 10. まとめ
  () => (
    <Slide>
      <div className="text-center space-y-8 max-w-lg">
        <h2 className="text-3xl font-bold tracking-tight">
          2WINSは<br />
          <span style={{ color: TEAL }}>「作って見せる」</span>ができます
        </h2>
        <div className="space-y-3 text-left">
          {[
            "要望を聞いた翌日に動くプロトタイプを構築",
            "最新AI（Claude Vision）を活用した実用的な機能",
            "メルカリ級のモバイルUXをスピード実装",
            "ベクトル様の業務フローに合わせた設計",
          ].map((point, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
              <CheckCircle className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
              <span className="text-sm">{point}</span>
            </div>
          ))}
        </div>
        <div className="pt-4">
          <p className="text-sm text-gray-500">次のステップとして</p>
          <p className="text-lg font-bold mt-1">GRECS連携の要件定義からスタートしませんか？</p>
        </div>
      </div>
    </Slide>
  ),
];

export default function SlidesPage() {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  const next = useCallback(() => setCurrent((c) => Math.min(c + 1, total - 1)), [total]);
  const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  const SlideContent = slides[current];

  return (
    <div className="h-[100dvh] bg-white text-[#1A1A2E] flex flex-col overflow-hidden select-none">
      {/* Slide content */}
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <SlideContent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-gray-100">
        <button
          onClick={prev}
          disabled={current === 0}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-teal-500" : "bg-gray-200"}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          disabled={current === total - 1}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
