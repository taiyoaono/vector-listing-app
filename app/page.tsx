"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, ScanBarcode, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col items-center justify-center px-6 mx-auto max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 w-full"
      >
        {/* Logo */}
        <div className="space-y-2">
          <div className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg shadow-teal-500/25">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            ベクトル出品アプリ
          </h1>
          <p className="text-sm text-muted-foreground">
            撮るだけでAIが自動入力
          </p>
        </div>

        {/* Steps Preview */}
        <div className="space-y-3">
          {[
            {
              icon: ScanBarcode,
              step: "1",
              title: "スキャン",
              desc: "バーコードで商品を特定",
            },
            {
              icon: Camera,
              step: "2",
              title: "撮影",
              desc: "商品写真＋品質タグを撮影",
            },
            {
              icon: Sparkles,
              step: "3",
              title: "AI解析",
              desc: "全項目を自動入力・タイトル生成",
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-50 text-teal-600 shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-teal-600">
                  STEP {item.step}
                </div>
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Link
            href="/scan"
            className="inline-flex items-center justify-center w-full h-14 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold text-base shadow-lg shadow-teal-500/25 active:scale-[0.98] transition-transform"
          >
            出品する
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
