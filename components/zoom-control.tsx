"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ZoomControlProps {
  streamRef: React.RefObject<MediaStream | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraReady: boolean;
  onZoomChange?: (zoom: number) => void;
}

// Convert zoom to angle on the dial (logarithmic scale)
function zoomToAngle(zoom: number, min: number, max: number): number {
  const logMin = Math.log2(Math.max(min, 0.5));
  const logMax = Math.log2(max);
  const logZoom = Math.log2(zoom);
  return ((logZoom - logMin) / (logMax - logMin)) * 180 - 90; // -90 to 90
}

function angleToZoom(angle: number, min: number, max: number): number {
  const logMin = Math.log2(Math.max(min, 0.5));
  const logMax = Math.log2(max);
  const normalized = (angle + 90) / 180;
  return Math.pow(2, logMin + normalized * (logMax - logMin));
}

export default function ZoomControl({
  streamRef,
  videoRef,
  cameraReady,
  onZoomChange,
}: ZoomControlProps) {
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(10);
  const [supportsNativeZoom, setSupportsNativeZoom] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [showDial, setShowDial] = useState(false);

  const baseZoomRef = useRef(1);
  const basePinchDistRef = useRef(0);
  const zoomRef = useRef(1);
  const hideDialTimer = useRef<NodeJS.Timeout | null>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const isDraggingDialRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartZoomRef = useRef(1);

  // Detect zoom capabilities
  useEffect(() => {
    if (!cameraReady || !streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const caps = track.getCapabilities() as MediaTrackCapabilities & {
        zoom?: { min: number; max: number; step: number };
      };
      if (caps.zoom) {
        setSupportsNativeZoom(true);
        setMinZoom(caps.zoom.min);
        setMaxZoom(Math.min(caps.zoom.max, 10));
      }
    } catch {
      // no zoom support
    }
  }, [cameraReady, streamRef]);

  const applyZoom = useCallback(
    (value: number) => {
      const clamped = Math.max(minZoom, Math.min(maxZoom, value));
      const rounded = Math.round(clamped * 10) / 10;
      zoomRef.current = rounded;
      setZoom(rounded);
      onZoomChange?.(rounded);

      if (supportsNativeZoom && streamRef.current) {
        const track = streamRef.current.getVideoTracks()[0];
        if (track) {
          track
            .applyConstraints({
              advanced: [{ zoom: rounded } as MediaTrackConstraintSet],
            })
            .catch(() => {});
        }
      } else if (videoRef.current) {
        // CSS fallback
        videoRef.current.style.transform = `scale(${rounded})`;
        videoRef.current.style.transformOrigin = "center center";
      }
    },
    [minZoom, maxZoom, supportsNativeZoom, streamRef, videoRef, onZoomChange]
  );

  // Touch event handlers for pinch zoom on camera area
  useEffect(() => {
    const cameraEl = videoRef.current?.parentElement;
    if (!cameraEl) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        basePinchDistRef.current = dist;
        baseZoomRef.current = zoomRef.current;
        setIsPinching(true);
        setShowDial(true);
        if (hideDialTimer.current) clearTimeout(hideDialTimer.current);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && basePinchDistRef.current > 0) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        const scale = dist / basePinchDistRef.current;
        const newZoom = baseZoomRef.current * scale;
        applyZoom(newZoom);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        basePinchDistRef.current = 0;
        setIsPinching(false);
        hideDialTimer.current = setTimeout(() => setShowDial(false), 800);
      }
    };

    cameraEl.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    cameraEl.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    cameraEl.addEventListener("touchend", handleTouchEnd);

    return () => {
      cameraEl.removeEventListener("touchstart", handleTouchStart);
      cameraEl.removeEventListener("touchmove", handleTouchMove);
      cameraEl.removeEventListener("touchend", handleTouchEnd);
    };
  }, [applyZoom, videoRef]);

  // Dial drag handler
  const handleDialTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    isDraggingDialRef.current = true;
    dragStartXRef.current = e.touches[0].clientX;
    dragStartZoomRef.current = zoomRef.current;
    setShowDial(true);
    if (hideDialTimer.current) clearTimeout(hideDialTimer.current);
  };

  const handleDialTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingDialRef.current) return;
    e.stopPropagation();
    const deltaX = e.touches[0].clientX - dragStartXRef.current;
    // Map horizontal drag to zoom: 200px = full range
    const zoomRange = Math.log2(maxZoom) - Math.log2(Math.max(minZoom, 0.5));
    const deltaZoomLog = (deltaX / 200) * zoomRange;
    const newZoom = Math.pow(
      2,
      Math.log2(dragStartZoomRef.current) + deltaZoomLog
    );
    applyZoom(newZoom);
  };

  const handleDialTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    isDraggingDialRef.current = false;
    hideDialTimer.current = setTimeout(() => setShowDial(false), 800);
  };

  if (!cameraReady) return null;

  // Generate presets based on device capabilities
  const presets: number[] = [];
  if (minZoom <= 0.5) presets.push(0.5);
  presets.push(1);
  if (maxZoom >= 2) presets.push(2);
  if (maxZoom >= 5) presets.push(5);

  // Find closest preset
  const closestPreset = presets.reduce((prev, curr) =>
    Math.abs(curr - zoom) < Math.abs(prev - zoom) ? curr : prev
  );

  // Dial tick marks
  const dialTicks = [];
  const totalTicks = 60;
  for (let i = 0; i <= totalTicks; i++) {
    const angle = (i / totalTicks) * 180 - 90;
    const isMajor = i % 10 === 0;
    dialTicks.push({ angle, isMajor });
  }

  // Dial preset labels
  const dialPresetAngles = presets.map((p) => ({
    value: p,
    angle: zoomToAngle(p, minZoom, maxZoom),
  }));

  const currentAngle = zoomToAngle(zoom, minZoom, maxZoom);

  return (
    <div className="absolute bottom-3 left-0 right-0 flex justify-center z-10">
      <AnimatePresence mode="wait">
        {showDial ? (
          // Half-circle dial
          <motion.div
            key="dial"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            ref={dialRef}
            onTouchStart={handleDialTouchStart}
            onTouchMove={handleDialTouchMove}
            onTouchEnd={handleDialTouchEnd}
            className="relative select-none"
            style={{ width: 240, height: 130, touchAction: "none" }}
          >
            {/* Dial background */}
            <svg
              width="240"
              height="130"
              viewBox="0 0 240 130"
              className="absolute inset-0"
            >
              {/* Semi-circle background */}
              <path
                d="M 10 125 A 110 110 0 0 1 230 125"
                fill="rgba(30,30,30,0.85)"
                stroke="none"
              />
              {/* Tick marks */}
              {dialTicks.map((tick, i) => {
                const rad = ((tick.angle - 90) * Math.PI) / 180;
                const r1 = tick.isMajor ? 88 : 95;
                const r2 = 105;
                const cx = 120;
                const cy = 125;
                return (
                  <line
                    key={i}
                    x1={cx + r1 * Math.cos(rad)}
                    y1={cy + r1 * Math.sin(rad)}
                    x2={cx + r2 * Math.cos(rad)}
                    y2={cy + r2 * Math.sin(rad)}
                    stroke={tick.isMajor ? "white" : "rgba(255,255,255,0.3)"}
                    strokeWidth={tick.isMajor ? 2 : 1}
                  />
                );
              })}
              {/* Preset labels */}
              {dialPresetAngles.map(({ value, angle }) => {
                const rad = ((angle - 90) * Math.PI) / 180;
                const r = 75;
                const cx = 120;
                const cy = 125;
                return (
                  <text
                    key={value}
                    x={cx + r * Math.cos(rad)}
                    y={cy + r * Math.sin(rad)}
                    fill="white"
                    fontSize="11"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {value < 1 ? `.${value * 10}` : value}
                  </text>
                );
              })}
              {/* Current position marker (▼) */}
              {(() => {
                const rad = ((currentAngle - 90) * Math.PI) / 180;
                const r = 108;
                const cx = 120;
                const cy = 125;
                const mx = cx + r * Math.cos(rad);
                const my = cy + r * Math.sin(rad);
                return (
                  <polygon
                    points={`${mx},${my} ${mx - 4},${my - 7} ${mx + 4},${my - 7}`}
                    fill="#FFD60A"
                  />
                );
              })()}
            </svg>
            {/* Current zoom value */}
            <div className="absolute inset-x-0 bottom-4 text-center">
              <span
                className="text-lg font-bold"
                style={{ color: "#FFD60A" }}
              >
                {zoom < 1
                  ? `0.${Math.round(zoom * 10)}`
                  : zoom.toFixed(1)}
                x
              </span>
            </div>
          </motion.div>
        ) : (
          // Preset buttons (iPhone default state)
          <motion.div
            key="presets"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-1 py-0.5"
          >
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => applyZoom(p)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  closestPreset === p
                    ? "bg-gray-700/80"
                    : ""
                }`}
                style={{
                  color: closestPreset === p ? "#FFD60A" : "rgba(255,255,255,0.8)",
                }}
              >
                {p < 1 ? `.${p * 10}` : `${p}${closestPreset === p ? "x" : ""}`}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
