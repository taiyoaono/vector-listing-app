"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Tag, Camera, ChevronLeft, ChevronRight, RotateCcw, Trash2 } from "lucide-react";
import { useListingStore } from "@/lib/store";
import ZoomControl from "@/components/zoom-control";

type Phase = "tag" | "tag-preview" | "product";

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

  const [phase, setPhase] = useState<Phase>("tag");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 960 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setCameraReady(true);
        }
      } catch {
        setCameraReady(false);
        setCameraError(true);
      }
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  // Re-attach stream to video when returning from tag-preview
  useEffect(() => {
    if ((phase === "tag" || phase === "product") && streamRef.current && videoRef.current) {
      if (!videoRef.current.srcObject) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [phase]);

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
    if (phase === "tag") {
      addTagImage(dataUrl);
      setPhase("tag-preview");
    } else {
      addProductImage(dataUrl);
    }
  };

  const canProceed = productImages.length > 0;

  // --- Tag Preview Phase ---
  if (phase === "tag-preview" && tagImages.length > 0) {
    return (
      <div className="h-[100dvh] flex flex-col bg-black overflow-hidden">
        {/* Header */}
        <div className="shrink-0 bg-black/90 px-4 pt-3 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-teal-500 text-white">
              <Tag className="w-3.5 h-3.5" />
              品質タグ確認
            </div>
          </div>
          <div className="text-center">
            <div className="text-white text-base font-semibold">撮影した品質タグを確認</div>
            <div className="text-gray-400 text-xs">問題なければ次へ進んでください</div>
          </div>
        </div>

        {/* Full preview */}
        <div className="flex-1 min-h-0 relative flex items-center justify-center p-4">
          <img
            src={tagImages[0]}
            alt="品質タグ"
            className="max-w-full max-h-full object-contain rounded-2xl"
          />
        </div>

        {/* Actions */}
        <div className="shrink-0 bg-black/90 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-3">
            <button
              onClick={() => {
                removeTagImage(0);
                setPhase("tag");
              }}
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-gray-800 text-white text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              撮り直す
            </button>
            <button
              onClick={() => setPhase("product")}
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-teal-500 text-white text-sm font-medium"
            >
              次へ進む
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Camera Phases (tag capture + product capture) ---
  const isTagPhase = phase === "tag";

  return (
    <div className="h-[100dvh] flex flex-col bg-black overflow-hidden relative">
      {/* Header */}
      <div className="shrink-0 bg-black/90 px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium ${
            isTagPhase ? "bg-teal-500 text-white" : "bg-gray-700 text-gray-400"
          }`}>
            <Tag className="w-3.5 h-3.5" />
            品質タグ {tagImages.length > 0 && "✓"}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium ${
            !isTagPhase ? "bg-teal-500 text-white" : "bg-gray-700 text-gray-400"
          }`}>
            <Camera className="w-3.5 h-3.5" />
            商品写真 {productImages.length > 0 && `(${productImages.length})`}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            {isTagPhase ? (
              <>
                <div className="text-white text-base font-semibold">品質タグを撮影してください</div>
                <div className="text-gray-400 text-xs">ブランド名・素材・品番が記載されたタグ</div>
              </>
            ) : (
              <>
                <div className="text-white text-base font-semibold">商品写真を撮影してください</div>
                <div className="text-gray-400 text-xs">全体・各アングル・傷や汚れのアップ</div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Camera View */}
      <div className="flex-1 min-h-0 relative" style={{ touchAction: "none" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ touchAction: "none" }}
        />
        <canvas ref={canvasRef} className="hidden" />
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            {cameraError ? (
              <div className="text-center space-y-3">
                <div className="text-white text-sm">カメラを起動できません</div>
                <button
                  onClick={() => { setCameraError(false); startCamera(); }}
                  className="px-4 py-2 rounded-xl bg-teal-500 text-white text-sm font-medium"
                >
                  リトライ
                </button>
              </div>
            ) : (
              <div className="text-white text-sm animate-pulse">カメラを起動中...</div>
            )}
          </div>
        )}

        <ZoomControl
          streamRef={streamRef}
          videoRef={videoRef}
          cameraReady={cameraReady}
        />
      </div>

      {/* Footer */}
      <div className="shrink-0 bg-black/90">
        {/* Thumbnails (product phase only) */}
        {!isTagPhase && productImages.length > 0 && (
          <div className="flex gap-1 px-3 py-2 overflow-x-auto">
            {productImages.map((img, i) => (
              <div key={i} className="relative shrink-0 p-0.5">
                <button
                  onClick={() => setPreviewIndex(i)}
                  className="w-13 h-13 rounded-lg overflow-hidden border border-gray-600 block"
                >
                  <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" style={{ width: 52, height: 52 }} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeProductImage(i); }}
                  className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between py-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="w-24">
            {isTagPhase ? (
              <button
                onClick={() => setPhase("product")}
                className="text-sm text-gray-500 underline underline-offset-2"
              >
                スキップ
              </button>
            ) : (
              <button
                onClick={() => setPhase("tag")}
                className="flex items-center gap-1 text-sm text-gray-400"
              >
                <ChevronLeft className="w-4 h-4" />
                タグに戻る
              </button>
            )}
          </div>

          {/* Shutter */}
          <button
            onClick={capture}
            disabled={!cameraReady}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-full bg-white" />
          </button>

          <div className="w-24 flex justify-end">
            {isTagPhase ? (
              <button
                onClick={() => {
                  if (tagImages.length > 0) setPhase("tag-preview");
                  else setPhase("product");
                }}
                disabled={tagImages.length === 0}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  tagImages.length > 0 ? "bg-teal-500 text-white" : "bg-gray-800 text-gray-500"
                }`}
              >
                次へ
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  streamRef.current?.getTracks().forEach((t) => t.stop());
                  router.push("/result");
                }}
                disabled={!canProceed}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  canProceed ? "bg-teal-500 text-white shadow-lg shadow-teal-400/25" : "bg-gray-800 text-gray-500"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                AI解析
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Photo Preview Modal */}
      <AnimatePresence>
        {previewIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/95 flex flex-col"
          >
            {/* Close */}
            <div className="shrink-0 flex justify-end p-4">
              <button
                onClick={() => setPreviewIndex(null)}
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 min-h-0 flex items-center justify-center px-4">
              <img
                src={productImages[previewIndex]}
                alt={`Photo ${previewIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            </div>

            {/* Info + Delete */}
            <div className="shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex items-center justify-between">
              <span className="text-gray-400 text-sm">
                {previewIndex + 1} / {productImages.length}枚
              </span>
              <button
                onClick={() => {
                  removeProductImage(previewIndex);
                  setPreviewIndex(null);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                削除
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
