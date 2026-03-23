"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ZoomControlProps {
  streamRef: React.RefObject<MediaStream | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraReady: boolean;
}

const YELLOW = "#FFCC33";

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// Logarithmic mapping for zoom <-> angle
function zoomToNormalized(zoom: number, min: number, max: number): number {
  const logMin = Math.log2(Math.max(min, 0.5));
  const logMax = Math.log2(max);
  const logZoom = Math.log2(clamp(zoom, min, max));
  return (logZoom - logMin) / (logMax - logMin);
}

function normalizedToZoom(n: number, min: number, max: number): number {
  const logMin = Math.log2(Math.max(min, 0.5));
  const logMax = Math.log2(max);
  return Math.pow(2, logMin + clamp(n, 0, 1) * (logMax - logMin));
}

export default function ZoomControl({
  streamRef,
  videoRef,
  cameraReady,
}: ZoomControlProps) {
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(10);
  const [supportsNativeZoom, setSupportsNativeZoom] = useState(false);
  const [showDial, setShowDial] = useState(false);

  const zoomRef = useRef(1);
  const basePinchDistRef = useRef(0);
  const baseZoomRef = useRef(1);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialDragStartXRef = useRef(0);
  const dialDragStartNormRef = useRef(0);

  // Detect capabilities
  useEffect(() => {
    if (!cameraReady || !streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const caps = track.getCapabilities() as MediaTrackCapabilities & {
        zoom?: { min: number; max: number };
      };
      if (caps.zoom) {
        setSupportsNativeZoom(true);
        setMinZoom(caps.zoom.min);
        setMaxZoom(Math.min(caps.zoom.max, 10));
      }
    } catch {}
  }, [cameraReady, streamRef]);

  const applyZoom = useCallback(
    (value: number) => {
      const clamped = clamp(Math.round(value * 10) / 10, minZoom, maxZoom);
      zoomRef.current = clamped;
      setZoom(clamped);

      if (supportsNativeZoom && streamRef.current) {
        const track = streamRef.current.getVideoTracks()[0];
        track
          ?.applyConstraints({ advanced: [{ zoom: clamped } as MediaTrackConstraintSet] })
          .catch(() => {});
      } else if (videoRef.current) {
        videoRef.current.style.transform = `scale(${clamped})`;
        videoRef.current.style.transformOrigin = "center center";
      }
    },
    [minZoom, maxZoom, supportsNativeZoom, streamRef, videoRef]
  );

  const showDialWithTimer = useCallback(() => {
    setShowDial(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  const scheduleHideDial = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowDial(false), 800);
  }, []);

  // Pinch zoom on camera view
  useEffect(() => {
    const el = videoRef.current?.parentElement;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        basePinchDistRef.current = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        baseZoomRef.current = zoomRef.current;
        showDialWithTimer();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && basePinchDistRef.current > 0) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        applyZoom(baseZoomRef.current * (dist / basePinchDistRef.current));
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        basePinchDistRef.current = 0;
        scheduleHideDial();
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [applyZoom, videoRef, showDialWithTimer, scheduleHideDial]);

  if (!cameraReady) return null;

  // Dynamic presets
  const presets: number[] = [];
  if (minZoom <= 0.5) presets.push(0.5);
  presets.push(1);
  if (maxZoom >= 2) presets.push(2);
  if (maxZoom >= 5) presets.push(5);

  const closestPreset = presets.reduce((prev, curr) =>
    Math.abs(curr - zoom) < Math.abs(prev - zoom) ? curr : prev
  );

  const formatZoom = (z: number) => {
    if (z < 1) return `.${Math.round(z * 10)}`;
    if (z === Math.floor(z)) return `${z}`;
    return z.toFixed(1);
  };

  // Dial rendering
  const DIAL_W = 260;
  const DIAL_H = 140;
  const CX = DIAL_W / 2;
  const CY = DIAL_H - 10;
  const R = 110;
  const TICK_COUNT = 80;

  const normalized = zoomToNormalized(zoom, minZoom, maxZoom);
  // Rotation: dial rotates so current zoom is at top center
  const dialRotation = -normalized * 180 + 90;

  const ticks = [];
  for (let i = 0; i <= TICK_COUNT; i++) {
    const frac = i / TICK_COUNT;
    const ang = frac * 180 - 90;
    const isMajor = i % 10 === 0;
    const r1 = isMajor ? R - 18 : R - 10;
    const r2 = R;
    const rad = (ang * Math.PI) / 180;
    ticks.push({
      x1: CX + r1 * Math.cos(rad),
      y1: CY + r1 * Math.sin(rad),
      x2: CX + r2 * Math.cos(rad),
      y2: CY + r2 * Math.sin(rad),
      isMajor,
    });
  }

  // Preset positions on dial
  const presetLabels = presets.map((p) => {
    const n = zoomToNormalized(p, minZoom, maxZoom);
    const ang = (n * 180 - 90 + dialRotation) * (Math.PI / 180);
    return {
      value: p,
      x: CX + (R - 30) * Math.cos(ang),
      y: CY + (R - 30) * Math.sin(ang),
      visible:
        CX + (R - 30) * Math.cos(ang) > 15 &&
        CX + (R - 30) * Math.cos(ang) < DIAL_W - 15 &&
        CY + (R - 30) * Math.sin(ang) < CY,
    };
  });

  // Dial drag handlers
  const onDialTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    dialDragStartXRef.current = e.touches[0].clientX;
    dialDragStartNormRef.current = normalized;
    showDialWithTimer();
  };

  const onDialTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    const dx = e.touches[0].clientX - dialDragStartXRef.current;
    // 250px drag = full zoom range
    const newNorm = dialDragStartNormRef.current + dx / 250;
    applyZoom(normalizedToZoom(newNorm, minZoom, maxZoom));
  };

  const onDialTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    scheduleHideDial();
  };

  // Long press on preset button
  const onPresetTouchStart = (preset: number) => {
    longPressTimerRef.current = setTimeout(() => {
      showDialWithTimer();
    }, 300);
  };

  const onPresetTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <div className="absolute bottom-2 left-0 right-0 flex justify-center z-10">
      <AnimatePresence mode="wait">
        {showDial ? (
          <motion.div
            key="dial"
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.85 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative select-none"
            style={{ width: DIAL_W, height: DIAL_H, touchAction: "none" }}
            onTouchStart={onDialTouchStart}
            onTouchMove={onDialTouchMove}
            onTouchEnd={onDialTouchEnd}
          >
            <svg width={DIAL_W} height={DIAL_H} viewBox={`0 0 ${DIAL_W} ${DIAL_H}`}>
              {/* Background arc */}
              <path
                d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
                fill="rgba(30,30,30,0.88)"
                stroke="none"
              />
              {/* Rotating tick group */}
              <g transform={`rotate(${dialRotation}, ${CX}, ${CY})`}>
                {ticks.map((t, i) => (
                  <line
                    key={i}
                    x1={t.x1}
                    y1={t.y1}
                    x2={t.x2}
                    y2={t.y2}
                    stroke={t.isMajor ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)"}
                    strokeWidth={t.isMajor ? 1.5 : 0.8}
                  />
                ))}
              </g>
              {/* Preset labels on dial */}
              {presetLabels
                .filter((p) => p.visible)
                .map((p) => (
                  <text
                    key={p.value}
                    x={p.x}
                    y={p.y}
                    fill="rgba(255,255,255,0.7)"
                    fontSize="11"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {formatZoom(p.value)}
                  </text>
                ))}
              {/* Center marker ▼ (fixed at top) */}
              <polygon
                points={`${CX},${CY - R - 2} ${CX - 4},${CY - R - 9} ${CX + 4},${CY - R - 9}`}
                fill={YELLOW}
              />
            </svg>
            {/* Current zoom display */}
            <div
              className="absolute left-1/2 -translate-x-1/2 font-bold text-lg"
              style={{ color: YELLOW, bottom: 12 }}
            >
              {formatZoom(zoom)}x
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="presets"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-0.5"
          >
            {presets.map((p) => {
              const isActive = closestPreset === p;
              return (
                <button
                  key={p}
                  onClick={() => applyZoom(p)}
                  onTouchStart={() => onPresetTouchStart(p)}
                  onTouchEnd={onPresetTouchEnd}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all ${
                    isActive ? "bg-[rgba(80,80,80,0.7)]" : ""
                  }`}
                  style={{
                    color: isActive ? YELLOW : "rgba(255,255,255,0.85)",
                  }}
                >
                  {formatZoom(p)}
                  {isActive && "x"}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
