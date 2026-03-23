"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Tag, Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { useListingStore } from "@/lib/store";
import ZoomControl from "@/components/zoom-control";

type Phase = "tag" | "product";

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
      }
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

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
    } else {
      addProductImage(dataUrl);
    }
  };

  const images = phase === "tag" ? tagImages : productImages;
  const removeImage = phase === "tag" ? removeTagImage : removeProductImage;
  const canProceed = productImages.length > 0;

  const phaseConfig = {
    tag: {
      icon: Tag,
      title: "品質タグを撮影してください",
      subtitle: "ブランド名・素材・品番が記載されたタグ",
      count: tagImages.length,
    },
    product: {
      icon: Camera,
      title: "商品写真を撮影してください",
      subtitle: "全体・各アングル・傷や汚れのアップ",
      count: productImages.length,
    },
  };

  const current = phaseConfig[phase];

  return (
    <div className="h-[100dvh] flex flex-col bg-black overflow-hidden relative">
      {/* Header */}
      <div className="shrink-0 bg-black/90 px-4 pt-3 pb-2">
        {/* Phase indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium ${
            phase === "tag" ? "bg-teal-500 text-white" : "bg-gray-700 text-gray-400"
          }`}>
            <Tag className="w-3.5 h-3.5" />
            品質タグ {tagImages.length > 0 && `(${tagImages.length})`}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium ${
            phase === "product" ? "bg-teal-500 text-white" : "bg-gray-700 text-gray-400"
          }`}>
            <Camera className="w-3.5 h-3.5" />
            商品写真 {productImages.length > 0 && `(${productImages.length})`}
          </div>
        </div>

        {/* Phase instruction */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <div className="text-white text-base font-semibold">{current.title}</div>
            <div className="text-gray-400 text-xs">{current.subtitle}</div>
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
            <div className="text-white text-sm animate-pulse">カメラを起動中...</div>
          </div>
        )}

        {/* Zoom Control - iPhone style pinch + dial */}
        <ZoomControl
          streamRef={streamRef}
          videoRef={videoRef}
          cameraReady={cameraReady}
        />
      </div>

      {/* Footer */}
      <div className="shrink-0 bg-black/90">
        {/* Thumbnails */}
        {images.length > 0 && (
          <div className="flex gap-2 px-4 py-2 overflow-x-auto">
            <AnimatePresence>
              {images.map((img, i) => (
                <motion.div
                  key={`${phase}-${i}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-gray-600"
                >
                  <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between py-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {/* Left action */}
          <div className="w-24">
            {phase === "tag" ? (
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

          {/* Right action */}
          <div className="w-24 flex justify-end">
            {phase === "tag" ? (
              <button
                onClick={() => setPhase("product")}
                disabled={tagImages.length === 0}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  tagImages.length > 0
                    ? "bg-teal-500 text-white"
                    : "bg-gray-800 text-gray-500"
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
                  canProceed
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-400/25"
                    : "bg-gray-800 text-gray-500"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                AI解析
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
