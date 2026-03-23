"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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

function Slide({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 md:px-10 py-6">
      {children}
    </div>
  );
}

function Badge({ children, color = "teal" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    teal: "bg-teal-100 text-teal-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

const slides = [
  // 1. 表紙
  () => (
    <Slide>
      <div className="text-center space-y-8">
        <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-xl">
          <Camera className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">ベクトル出品アプリ</h1>
          <p className="text-xl text-gray-500 mt-3">スマホで撮るだけ。AIが全部やる。</p>
        </div>
        <div className="flex items-center justify-center gap-4 text-lg text-gray-400">
          <span className="font-semibold text-gray-700">2WINS</span>
          <span>×</span>
          <span className="font-semibold text-gray-700">株式会社ベクトル</span>
        </div>
        <p className="text-sm text-gray-400">2026.03.24</p>
      </div>
    </Slide>
  ),

  // 2. クライアント要望の整理
  () => (
    <Slide>
      <div className="w-full max-w-5xl space-y-6">
        <h2 className="text-4xl font-bold">ご要望の整理</h2>
        <p className="text-lg text-gray-500">Excel要望書で頂いた6つの機能</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { num: "1", title: "スマホ撮影→画像一括取込", desc: "POSバーコードスキャン、連続撮影、ZIP→FTP→GRECS反映" },
            { num: "2", title: "カテゴリ→実寸サイズ入力", desc: "カテゴリ選択後にサイズ入力。GRECS連携が必要" },
            { num: "3", title: "状態テンプレート入力", desc: "種類→箇所→テンプレート文生成" },
            { num: "4", title: "品質タグOCR", desc: "品質タグ撮影→文字起こし→代理店名・品番抽出" },
            { num: "5", title: "商品タイトル生成", desc: "PSSの商品タイトル自動生成" },
            { num: "6", title: "複数PF出品", desc: "メルカリ・ヤフオク等への同時出品" },
          ].map((item) => (
            <div key={item.num} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-full bg-teal-500 text-white text-base font-bold flex items-center justify-center">{item.num}</span>
                <span className="text-base font-bold">{item.title}</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  ),

  // 3. 現状の課題
  () => (
    <Slide>
      <div className="w-full max-w-5xl space-y-8">
        <h2 className="text-4xl font-bold">現状の課題</h2>

        <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
          <div className="flex items-center gap-3 mb-5">
            <AlertTriangle className="w-7 h-7 text-red-500" />
            <span className="text-lg font-bold text-red-700">従来の出品フロー（7ステップ）</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {["バーコード\nスキャン", "1枚ずつ\n撮影", "画像\n加工待ち", "カテゴリ\n手動入力", "状態\n手動入力", "OCR\n別操作", "タイトル\n手動入力"].map((s, i) => (
              <div key={i} className="flex items-center">
                {i > 0 && <ArrowRight className="w-5 h-5 text-red-300 mx-1 shrink-0" />}
                <div className="bg-white rounded-xl px-4 py-3 text-center whitespace-pre-line border border-red-200 text-sm font-medium shrink-0">{s}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
            <div className="text-5xl font-bold text-red-500">7</div>
            <div className="text-base text-gray-500 mt-2">ステップ</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
            <div className="text-5xl font-bold text-red-500">手動</div>
            <div className="text-base text-gray-500 mt-2">入力だらけ</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
            <div className="text-5xl font-bold text-red-500">遅い</div>
            <div className="text-base text-gray-500 mt-2">1枚ずつ加工</div>
          </div>
        </div>
      </div>
    </Slide>
  ),

  // 4. 2WINSの提案
  () => (
    <Slide>
      <div className="w-full max-w-3xl space-y-8 text-center">
        <Badge>2WINSの提案</Badge>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          「撮るだけで<br />
          <span style={{ color: TEAL }}>AIが全部やる</span>」
        </h2>
        <p className="text-lg text-gray-500">7ステップ → 3ステップ＋確認</p>

        <div className="bg-teal-50 rounded-2xl p-8 border border-teal-100">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[
              { icon: ScanBarcode, label: "スキャン", ai: false },
              { icon: Camera, label: "撮影", ai: false },
              { icon: Sparkles, label: "AI解析", ai: true },
              { icon: Eye, label: "確認", ai: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center">
                {i > 0 && <ArrowRight className="w-5 h-5 text-teal-300 mx-3 shrink-0" />}
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${s.ai ? "bg-teal-500 text-white shadow-lg" : "bg-white text-teal-600 border-2 border-teal-200"}`}>
                    <s.icon className="w-7 h-7" />
                  </div>
                  <div className="text-sm font-semibold text-teal-700">{s.label}</div>
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
      <div className="w-full max-w-4xl space-y-5">
        <h2 className="text-3xl font-bold">アプリフロー</h2>
        <div className="space-y-3">
          {[
            { step: "STEP 1", icon: ScanBarcode, title: "バーコードスキャン", desc: "商品のバーコードを読み取り、管理番号で商品を特定", ai: false },
            { step: "STEP 2", icon: Camera, title: "品質タグ＋商品写真を撮影", desc: "品質タグ → 確認 → 商品写真を連続撮影。ガイド付きで迷わない", ai: false },
            { step: "STEP 3", icon: Sparkles, title: "AI一括解析", desc: "全写真をClaude Vision APIに送信。カテゴリ・ブランド・品番・状態・タイトル・説明文を一括生成", ai: true },
            { step: "確認", icon: Eye, title: "確認＆微調整", desc: "全項目がAI入力済み。間違いがあればタップで修正するだけ", ai: false },
            { step: "完了", icon: CheckCircle, title: "出品プレビュー → 出品", desc: "vector-park.jp風のプレビューで最終確認 → 出品完了", ai: false },
          ].map((item) => (
            <div key={item.step} className={`flex items-start gap-4 p-4 rounded-2xl ${item.ai ? "bg-teal-50 border-2 border-teal-200" : "bg-gray-50 border border-gray-100"}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.ai ? "bg-teal-500 text-white" : "bg-white text-gray-600 border border-gray-200"}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-600">{item.step}</span>
                  <span className="text-base font-bold">{item.title}</span>
                  {item.ai && <Badge>AI</Badge>}
                </div>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
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
      <div className="w-full max-w-4xl space-y-8">
        <h2 className="text-3xl font-bold">AIの活用ポイント</h2>
        <p className="text-base text-gray-500">Claude Vision API — 1回のAPIコールで全解析</p>

        <div className="space-y-4">
          {[
            { num: "①", title: "写真からカテゴリ・状態を推定", desc: "商品写真を見て、カテゴリ（3階層）、色、柄、状態ランク（N〜D）、傷・汚れの詳細を自動判定", icon: Eye },
            { num: "②", title: "品質タグOCR", desc: "品質タグの写真からブランド名、品番、素材、サイズを文字起こし＋構造化抽出", icon: ScanBarcode },
            { num: "③", title: "タイトル・説明文を自動生成", desc: "全情報を組み合わせて、出品タイトル候補3つと商品説明文を自動生成", icon: Sparkles },
          ].map((item) => (
            <div key={item.num} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-bold">{item.num} {item.title}</div>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-teal-50 rounded-2xl p-4 text-center border border-teal-100">
          <span className="text-sm text-teal-700">全てを</span>
          <span className="text-lg font-bold text-teal-600 mx-2">1回のAPIコール</span>
          <span className="text-sm text-teal-700">で実行（数秒で完了）</span>
        </div>
      </div>
    </Slide>
  ),

  // 7. メルカリUXの参考
  () => (
    <Slide>
      <div className="w-full max-w-4xl space-y-8">
        <h2 className="text-3xl font-bold">メルカリUXを参考に</h2>
        <p className="text-base text-gray-500">誰でも使えるシンプルさを追求</p>

        <div className="grid grid-cols-3 gap-5">
          {[
            { icon: Smartphone, title: "モバイル\nファースト", desc: "スマホで全操作が完結。PC不要" },
            { icon: Zap, title: "ステップ\n形式", desc: "今何をすべきかが一目で分かるガイド付きUI" },
            { icon: Palette, title: "シンプル\nデザイン", desc: "余計な要素を排除。直感的に操作" },
          ].map((item) => (
            <div key={item.title} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-7 h-7" />
              </div>
              <div className="text-sm font-bold whitespace-pre-line">{item.title}</div>
              <p className="text-xs text-gray-500 mt-2">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </Slide>
  ),

  // 8. デモスライド
  () => (
    <Slide>
      <div className="text-center space-y-8 w-full max-w-5xl">
        <h2 className="text-5xl font-bold">デモ</h2>
        <p className="text-xl text-gray-500">実際にアプリを触ってみましょう</p>

        <div className="flex flex-col md:flex-row items-center gap-10 justify-center">
          {/* QR Code */}
          <div className="shrink-0">
            <Image
              src="/demo/app-qr.png"
              alt="App QR Code"
              width={280}
              height={280}
              className="rounded-2xl"
            />
            <p className="text-base text-gray-400 mt-3">スマホでスキャン</p>
          </div>

          {/* Demo flow */}
          <div className="bg-gray-50 rounded-2xl p-8 text-left space-y-4 flex-1 max-w-md">
            <div className="text-base font-bold text-gray-700 mb-4">デモの流れ</div>
            {[
              "バーコードをスキャン",
              "品質タグを撮影 → 確認",
              "商品写真を撮影",
              "AI解析 → 全項目が自動入力",
              "プレビュー → 出品完了",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-teal-500 text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-lg">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  ),

  // 9. 今後の実用化に向けて
  () => (
    <Slide>
      <div className="w-full max-w-5xl space-y-8">
        <h2 className="text-4xl font-bold">今後の実用化に向けて</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              icon: Database,
              title: "GRECS連携パイプライン",
              items: [
                "画像のZIP圧縮・命名規則対応",
                "FTPサーバーへの自動アップロード",
                "GRECSバッチ取込との接続",
                "商品メタデータのAPI連携",
              ],
              priority: "Phase 1",
            },
            {
              icon: Palette,
              title: "画像加工・WASABI連携",
              items: [
                "背景白抜き・リサイズ・色補正",
                "軽量/重量加工の切り替え",
              ],
              priority: "Phase 2",
            },
            {
              icon: Globe,
              title: "複数プラットフォーム出品",
              items: [
                "メルカリ・ヤフオク等のAPI連携",
                "各PFのフォーマットに自動変換",
                "在庫連動・価格管理",
              ],
              priority: "Phase 3",
            },
            {
              icon: Smartphone,
              title: "現場導入・改善サイクル",
              items: [
                "実店舗でのパイロットテスト",
                "現場フィードバックの反映",
                "AI精度の継続改善",
              ],
              priority: "並行",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-bold">{item.title}</div>
                  <Badge color="yellow">{item.priority}</Badge>
                </div>
              </div>
              <ul className="space-y-2">
                {item.items.map((li, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-base text-gray-600">
                    <CheckCircle className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    {li}
                  </li>
                ))}
              </ul>
            </div>
          ))}
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

  // Touch swipe
  useEffect(() => {
    let startX = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (dx < -50) next();
      if (dx > 50) prev();
    };
    window.addEventListener("touchstart", onStart);
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [next, prev]);

  const SlideContent = slides[current];

  return (
    <div className="h-[100dvh] bg-white text-[#1A1A2E] flex flex-col overflow-hidden select-none">
      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 overflow-y-auto"
          >
            <SlideContent />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="shrink-0 flex items-center justify-between px-6 py-2 border-t border-gray-100">
        <button onClick={prev} disabled={current === 0} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{current + 1} / {total}</span>
        </div>
        <button onClick={next} disabled={current === total - 1} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
