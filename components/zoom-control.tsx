"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ZoomControlProps {
  streamRef: React.RefObject<MediaStream | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraReady: boolean;
}

const YELLOW = "#FFCC33";

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
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
  const dialDragBaseZoomRef = useRef(1);

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

  const openDial = useCallback(() => {
    setShowDial(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  const scheduleDismiss = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowDial(false), 1000);
  }, []);

  // Pinch zoom
  useEffect(() => {
    const el = videoRef.current?.parentElement;
    if (!el) return;
    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        basePinchDistRef.current = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        baseZoomRef.current = zoomRef.current;
        openDial();
      }
    };
    const onMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && basePinchDistRef.current > 0) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[1].clientX - e.touches[0].clientX,
          e.touches[1].clientY - e.touches[0].clientY
        );
        applyZoom(baseZoomRef.current * (dist / basePinchDistRef.current));
      }
    };
    const onEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        basePinchDistRef.current = 0;
        scheduleDismiss();
      }
    };
    el.addEventListener("touchstart", onStart, { passive: false });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [applyZoom, videoRef, openDial, scheduleDismiss]);

  if (!cameraReady) return null;

  // Presets
  const presets: number[] = [];
  if (minZoom <= 0.5) presets.push(0.5);
  presets.push(1);
  if (maxZoom >= 2) presets.push(2);
  if (maxZoom >= 5) presets.push(5);

  const closestPreset = presets.reduce((prev, curr) =>
    Math.abs(curr - zoom) < Math.abs(prev - zoom) ? curr : prev
  );

  const fmt = (z: number) => {
    if (z < 1) return `.${Math.round(z * 10)}`;
    if (z === Math.floor(z)) return `${z}`;
    return z.toFixed(1);
  };

  // --- Dial SVG ---
  const W = 280, H = 100;
  const CX = W / 2, CY = H + 30; // center of full circle (below visible area)
  const R = 120;

  // Map zoom to angle: log scale across the full arc
  const logMin = Math.log2(Math.max(minZoom, 0.5));
  const logMax = Math.log2(maxZoom);
  const logCur = Math.log2(clamp(zoom, minZoom, maxZoom));
  const logRange = logMax - logMin;

  // Current zoom position as fraction 0..1
  const curFrac = (logCur - logMin) / logRange;

  // The dial shows a "window" around the current zoom.
  // We generate ticks at fixed log-scale intervals, offset by current position.
  // The center of the arc (angle = -PI/2, i.e. straight up) = current zoom.
  const arcStart = -Math.PI; // left edge
  const arcEnd = 0; // right edge
  const arcSpan = arcEnd - arcStart; // PI

  // Visible zoom range in log2 space: show ±1.5 octaves around current
  const visibleLogHalf = logRange * 0.5;

  // Tick marks
  const svgTicks: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = [];
  const tickStep = 0.02; // in log2 space
  for (let logVal = logMin; logVal <= logMax; logVal += tickStep) {
    const offset = logVal - logCur; // offset from current in log2
    const normalizedOffset = offset / visibleLogHalf; // -1..1 maps to arc edges
    if (normalizedOffset < -1 || normalizedOffset > 1) continue;
    const angle = arcStart + (normalizedOffset + 1) * 0.5 * arcSpan;
    const isMajor = Math.abs(logVal - Math.round(logVal * 5) / 5) < tickStep * 0.6;
    const r1 = isMajor ? R - 14 : R - 8;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    // Fade edges
    const edgeFade = 1 - Math.pow(Math.abs(normalizedOffset), 3);
    svgTicks.push({
      x1: CX + r1 * cos, y1: CY + r1 * sin,
      x2: CX + R * cos, y2: CY + R * sin,
      opacity: edgeFade,
    });
  }

  // Preset labels on dial
  const svgLabels: { x: number; y: number; text: string; opacity: number }[] = [];
  for (const p of [0.5, 1, 2, 5, 10].filter(v => v >= minZoom && v <= maxZoom)) {
    const logP = Math.log2(p);
    const offset = logP - logCur;
    const normalizedOffset = offset / visibleLogHalf;
    if (normalizedOffset < -0.9 || normalizedOffset > 0.9) continue;
    const angle = arcStart + (normalizedOffset + 1) * 0.5 * arcSpan;
    const lr = R - 28;
    svgLabels.push({
      x: CX + lr * Math.cos(angle),
      y: CY + lr * Math.sin(angle),
      text: fmt(p),
      opacity: 1 - Math.pow(Math.abs(normalizedOffset), 2),
    });
  }

  // Dial drag
  const onDialTouch = (e: React.TouchEvent) => {
    e.stopPropagation();
    dialDragStartXRef.current = e.touches[0].clientX;
    dialDragBaseZoomRef.current = zoomRef.current;
    openDial();
  };
  const onDialMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    const dx = e.touches[0].clientX - dialDragStartXRef.current;
    const logBase = Math.log2(dialDragBaseZoomRef.current);
    const newLog = logBase - (dx / 150) * visibleLogHalf;
    applyZoom(Math.pow(2, newLog));
  };
  const onDialEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    scheduleDismiss();
  };

  const isExactPreset = presets.some((p) => Math.abs(p - zoom) < 0.05);

  const longPressHandlers = {
    onTouchStart: () => { longPressTimerRef.current = setTimeout(openDial, 300); },
    onTouchEnd: () => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); },
  };

  let content: React.ReactNode;

  if (showDial) {
    content = (
      <motion.div
        key="dial"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        className="pointer-events-auto select-none"
        style={{ width: W, height: H, touchAction: "none", overflow: "hidden" }}
        onTouchStart={onDialTouch}
        onTouchMove={onDialMove}
        onTouchEnd={onDialEnd}
      >
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <path
            d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY} L ${CX + R - 5} ${CY} A ${R - 5} ${R - 5} 0 0 0 ${CX - R + 5} ${CY} Z`}
            fill="rgba(25,25,25,0.9)"
          />
          {svgTicks.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke="white" strokeWidth={0.8} opacity={t.opacity * 0.5} />
          ))}
          {svgLabels.map((l, i) => (
            <text key={i} x={l.x} y={l.y} fill="white" fontSize="11" fontWeight="600"
              textAnchor="middle" dominantBaseline="middle" opacity={l.opacity * 0.8}>
              {l.text}
            </text>
          ))}
          <polygon
            points={`${CX},${CY - R + 2} ${CX - 4},${CY - R - 5} ${CX + 4},${CY - R - 5}`}
            fill={YELLOW}
          />
        </svg>
        <div className="absolute inset-x-0 text-center font-bold" style={{ color: YELLOW, bottom: 8, fontSize: 17 }}>
          {fmt(zoom)}x
        </div>
      </motion.div>
    );
  } else if (isExactPreset) {
    content = (
      <motion.div key="presets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }} className="pointer-events-auto flex items-center gap-0.5">
        {presets.map((p) => {
          const active = closestPreset === p;
          return (
            <button key={p} onClick={() => applyZoom(p)} {...longPressHandlers}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all ${active ? "bg-[rgba(70,70,70,0.75)]" : ""}`}
              style={{ color: active ? YELLOW : "rgba(255,255,255,0.8)" }}>
              {fmt(p)}{active && "x"}
            </button>
          );
        })}
      </motion.div>
    );
  } else {
    content = (
      <motion.div key="single" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }} className="pointer-events-auto">
        <button onClick={() => applyZoom(1)} {...longPressHandlers}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold bg-[rgba(70,70,70,0.75)]"
          style={{ color: YELLOW }}>
          {fmt(zoom)}x
        </button>
      </motion.div>
    );
  }

  return (
    <div className="absolute bottom-2 left-0 right-0 flex justify-center z-10 pointer-events-none">
      <AnimatePresence mode="wait">
        {content}
      </AnimatePresence>
    </div>
  );
}
