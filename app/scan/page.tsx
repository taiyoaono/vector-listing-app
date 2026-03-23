"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import { ScanBarcode } from "lucide-react";
import { toast } from "sonner";
import { useListingStore } from "@/lib/store";
import { findProductByCode } from "@/lib/demo-products";

export default function ScanPage() {
  const router = useRouter();
  const setScannedCode = useListingStore((s) => s.setScannedCode);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;

          const product = findProductByCode(decodedText);
          if (product) {
            setScannedCode(decodedText);
            toast.success(`${product.brand} ${product.name}`, {
              description: decodedText,
            });
            scanner.stop().catch(() => {});
            setTimeout(() => router.push("/photos"), 1000);
          } else {
            toast.error("商品が見つかりません", {
              description: decodedText,
            });
            hasScannedRef.current = false;
          }
        },
        () => {}
      )
      .then(() => setIsScanning(true))
      .catch(() => {
        toast.error("カメラを起動できません");
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [router, setScannedCode]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Step Indicator */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
            1
          </span>
          <span className="font-medium text-blue-600">スキャン</span>
          <div className="flex-1 h-px bg-gray-200" />
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-400 text-[10px] font-bold">
            2
          </span>
          <div className="flex-1 h-px bg-gray-200" />
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-400 text-[10px] font-bold">
            3
          </span>
        </div>
      </div>

      {/* Scanner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center px-5 gap-6"
      >
        <div className="relative w-full aspect-square max-w-[300px] rounded-2xl overflow-hidden bg-black">
          <div id="qr-reader" className="w-full h-full" />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-white text-sm animate-pulse">
                カメラを起動中...
              </div>
            </div>
          )}
          {/* Scan overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[200px] h-[200px] border-2 border-blue-400/50 rounded-xl" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <ScanBarcode className="w-4 h-4 text-blue-600" />
            QRコードをスキャン
          </div>
          <p className="text-xs text-muted-foreground">
            商品のバーコードまたはQRコードをかざしてください
          </p>
        </div>

        <button
          onClick={() => {
            scannerRef.current?.stop().catch(() => {});
            router.push("/photos");
          }}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
        >
          スキップして手動入力
        </button>
      </motion.div>
    </div>
  );
}
