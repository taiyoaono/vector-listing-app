"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Sparkles, HelpCircle, Tag, Image as ImageIcon } from "lucide-react";
import { useListingStore } from "@/lib/store";

type Tab = "product" | "tag";

export default function PhotosPage() {
  const router = useRouter();
  const {
    productImages,
    tagImages,
    addProductImage,
    addTagImage,
    removeProductImage,
    removeTagImage,
  } = useListingStore();

  const [activeTab, setActiveTab] = useState<Tab>("product");
  const [showHelp, setShowHelp] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 960 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
    } catch {
      // Fallback for desktop: try any camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setCameraReady(true);
        }
      } catch {
        setCameraReady(false);
      }
    }
  }, []);

  // Start camera on mount
  useState(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  });

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    if (activeTab === "product") {
      addProductImage(dataUrl);
    } else {
      addTagImage(dataUrl);
    }
  };

  const images = activeTab === "product" ? productImages : tagImages;
  const removeImage =
    activeTab === "product" ? removeProductImage : removeTagImage;

  const canProceed = productImages.length > 0;

  return (
    <div className="flex-1 flex flex-col bg-black relative">
      {/* Step Indicator */}
      <div className="px-5 py-3 bg-black/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] font-bold">
            1
          </span>
          <div className="flex-1 h-px bg-gray-700" />
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
            2
          </span>
          <span className="font-medium text-blue-400">撮影</span>
          <div className="flex-1 h-px bg-gray-700" />
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-700 text-gray-500 text-[10px] font-bold">
            3
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-black/80 backdrop-blur-sm px-5 pb-2 z-10">
        <button
          onClick={() => setActiveTab("product")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-colors ${
            activeTab === "product"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          商品写真
          {productImages.length > 0 && (
            <span className="bg-white/20 rounded-full px-1.5 text-[10px]">
              {productImages.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("tag")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-colors ml-2 ${
            activeTab === "tag"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          品質タグ
          {tagImages.length > 0 && (
            <span className="bg-white/20 rounded-full px-1.5 text-[10px]">
              {tagImages.length}
            </span>
          )}
        </button>
        {activeTab === "tag" && (
          <button
            onClick={() => setShowHelp(true)}
            className="ml-auto text-gray-400 hover:text-white"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-white text-sm animate-pulse">
              カメラを起動中...
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      <div className="bg-black/90 backdrop-blur-sm">
        {images.length > 0 && (
          <div className="flex gap-2 px-4 py-2 overflow-x-auto">
            <AnimatePresence>
              {images.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-gray-600"
                >
                  <img
                    src={img}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 py-4 px-5">
          <div className="text-xs text-gray-400 text-center">
            商品 {productImages.length}枚 / タグ {tagImages.length}枚
          </div>

          {/* Shutter */}
          <button
            onClick={capture}
            disabled={!cameraReady}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-full bg-white" />
          </button>

          {/* Next */}
          <button
            onClick={() => {
              streamRef.current?.getTracks().forEach((t) => t.stop());
              router.push("/result");
            }}
            disabled={!canProceed}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              canProceed
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-gray-800 text-gray-500"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI解析
          </button>
        </div>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Tag className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold mb-2">品質タグとは？</h3>
              <p className="text-xs text-gray-600 mb-4">
                衣類の内側についているタグで、ブランド名・素材・品番・サイズなどが記載されています。
                AIが自動で読み取り、商品情報を入力します。
              </p>
              <div className="bg-[#FFFEF5] border border-gray-200 rounded-xl p-4 font-mono text-xs text-left space-y-1">
                <div className="text-[10px] text-gray-400 text-center mb-2">
                  ── 品質表示 ──
                </div>
                <div className="font-bold">株式会社バーバリー・ジャパン</div>
                <div>品番: 8045678</div>
                <div>素材: 毛 100%</div>
                <div>サイズ: 38</div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="mt-4 px-6 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium"
              >
                閉じる
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
