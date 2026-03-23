"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import { ScanBarcode, CheckCircle } from "lucide-react";
import { useListingStore } from "@/lib/store";
import { findProductByCode } from "@/lib/demo-products";

export default function ScanPage() {
  const setScannedCode = useListingStore((s) => s.setScannedCode);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<{
    brand: string;
    name: string;
    code: string;
  } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;

          const product = findProductByCode(decodedText);
          if (product) {
            setScannedCode(decodedText);
            try {
              await scanner.stop();
            } catch {
              // ignore
            }
            setScannedProduct({
              brand: product.brand,
              name: product.name,
              code: decodedText,
            });
            setTimeout(() => {
              window.location.href = "/photos";
            }, 1200);
          } else {
            hasScannedRef.current = false;
          }
        },
        () => {}
      )
      .then(() => setIsScanning(true))
      .catch(() => {});

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [setScannedCode]);

  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col mx-auto max-w-md">
      {/* Step Indicator */}
      <div className="px-5 py-4 shrink-0">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold">
            1
          </span>
          <span className="font-medium text-teal-600">スキャン</span>
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
      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6 relative min-h-0">
        <div className="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden bg-black">
          <div id="qr-reader" className="w-full h-full [&_video]:object-cover [&_img]:hidden [&>div:last-child]:hidden" />
          {!isScanning && !scannedProduct && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-white text-sm animate-pulse">
                カメラを起動中...
              </div>
            </div>
          )}
          {!scannedProduct && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[180px] h-[180px] border-2 border-teal-400/50 rounded-xl" />
              </div>
            </div>
          )}
        </div>

        {/* Success Overlay */}
        <AnimatePresence>
          {scannedProduct && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-white/95 backdrop-blur-sm"
            >
              <div className="text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-teal-600 mx-auto" />
                <div>
                  <div className="text-lg font-bold">{scannedProduct.brand}</div>
                  <div className="text-sm text-gray-600">{scannedProduct.name}</div>
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  {scannedProduct.code}
                </div>
                <div className="text-xs text-teal-600 animate-pulse">
                  撮影画面に移動します...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!scannedProduct && (
          <>
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <ScanBarcode className="w-4 h-4 text-teal-600" />
                QRコードをスキャン
              </div>
              <p className="text-xs text-muted-foreground">
                商品のバーコードまたはQRコードをかざしてください
              </p>
            </div>

            <button
              onClick={() => {
                scannerRef.current?.stop().catch(() => {});
                window.location.href = "/photos";
              }}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              スキップして手動入力
            </button>
          </>
        )}
      </div>
    </div>
  );
}
