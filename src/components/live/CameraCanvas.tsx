import React, { useRef, useEffect, useCallback } from 'react';
import { useDetection } from '../../context/DetectionContext';
import { detectorService } from '../../services/detector';
import { getClassColor } from '../../services/cocoClasses';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';
import type { DetectedObject } from '../../types/detection';

export const CameraCanvas: React.FC = () => {
  const {
    cameraStream,
    isCameraActive,
    isDetectionPaused,
    cameraError,
    startCamera,
    isModelLoaded,
    isModelLoading,
    modelError,
    loadModel,
    setActiveDetections,
    setFps,
    setLatencyMs,
    processDetections,
    settings,
  } = useDetection();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Loop control flags
  const isLoopRunningRef = useRef(false);
  const isInferringRef = useRef(false);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());
  const animationFrameIdRef = useRef<number | null>(null);

  // Sync camera stream to HTMLVideoElement
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (cameraStream && isCameraActive) {
      video.srcObject = cameraStream;
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        video.play().catch(err => {
          console.warn('Webcam video play on loadedmetadata:', err);
        });
      };

      video.play().catch(err => {
        console.warn('Initial webcam video play:', err);
      });
    } else {
      video.srcObject = null;
    }
  }, [cameraStream, isCameraActive]);

  // Draw bounding boxes on canvas
  const drawDetections = useCallback((
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    predictions: DetectedObject[]
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Adjust canvas resolution to match video display resolution
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!settings.showBoxes && !settings.showLabels) return;

    predictions.forEach(obj => {
      // Check confidence threshold
      if (obj.score < settings.minConfidence) return;

      // Check class filter
      if (settings.classFilters.length > 0 && !settings.classFilters.includes(obj.class)) {
        return;
      }

      const [x, y, width, height] = obj.bbox;
      const color = getClassColor(obj.class);

      if (settings.showBoxes) {
        // Draw bounding box
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 4;
        ctx.strokeRect(x, y, width, height);

        // Draw light tinted background fill
        ctx.fillStyle = `${color}18`; // ~10% opacity fill
        ctx.fillRect(x, y, width, height);
        ctx.restore();
      }

      if (settings.showLabels) {
        // Label badge
        const confidencePct = `${Math.round(obj.score * 100)}%`;
        const labelText = settings.showConfidence
          ? `${obj.class.toUpperCase()} ${confidencePct}`
          : obj.class.toUpperCase();

        ctx.font = '600 12px "Inter", sans-serif';
        const textMetrics = ctx.measureText(labelText);
        const textWidth = textMetrics.width;
        const tagHeight = 22;
        const tagWidth = textWidth + 14;

        // Ensure label doesn't render off-screen
        const labelY = Math.max(tagHeight, y);

        // Background pill
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, labelY - tagHeight, tagWidth, tagHeight, 4);
        ctx.fill();

        // Label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, x + 7, labelY - 6);
        ctx.restore();
      }
    });
  }, [settings]);

  // Main real-time detection loop
  const runDetectionLoop = useCallback(() => {
    if (!isLoopRunningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (
      video &&
      canvas &&
      video.videoWidth > 0 &&
      video.videoHeight > 0 &&
      video.readyState >= 2 &&
      !isDetectionPaused &&
      isModelLoaded &&
      !isInferringRef.current
    ) {
      isInferringRef.current = true;

      detectorService
        .detect(video, settings.maxObjects, settings.minConfidence)
        .then(({ objects, latencyMs }) => {
          isInferringRef.current = false;

          // Compute live FPS
          frameCountRef.current += 1;
          const now = performance.now();
          const elapsed = now - lastFpsTimeRef.current;
          if (elapsed >= 500) {
            const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
            setFps(currentFps);
            frameCountRef.current = 0;
            lastFpsTimeRef.current = now;
          }

          setLatencyMs(latencyMs);
          setActiveDetections(objects);
          drawDetections(canvas, video, objects);
          processDetections(objects, 'webcam');
        })
        .catch(err => {
          isInferringRef.current = false;
          console.error('Frame inference error:', err);
        });
    }

    if (isLoopRunningRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(runDetectionLoop);
    }
  }, [
    isDetectionPaused,
    isModelLoaded,
    settings.maxObjects,
    settings.minConfidence,
    setFps,
    setLatencyMs,
    setActiveDetections,
    drawDetections,
    processDetections,
  ]);

  // Start and stop loop based on camera activity & pause state
  useEffect(() => {
    if (isCameraActive && !isDetectionPaused && isModelLoaded) {
      isLoopRunningRef.current = true;
      animationFrameIdRef.current = requestAnimationFrame(runDetectionLoop);
    } else {
      isLoopRunningRef.current = false;
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    return () => {
      isLoopRunningRef.current = false;
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [isCameraActive, isDetectionPaused, isModelLoaded, runDetectionLoop]);

  return (
    <div className="video-container" style={{ position: 'relative' }}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className="video-element"
        playsInline
        muted
        autoPlay
        style={{ display: isCameraActive ? 'block' : 'none' }}
      />

      {/* Overlay Canvas for Bounding Boxes */}
      <canvas
        ref={canvasRef}
        className="overlay-canvas"
        style={{ display: isCameraActive ? 'block' : 'none' }}
      />

      {/* Idle / Camera Off Placeholder */}
      {!isCameraActive && (
        <div className="camera-placeholder animate-fade-in">
          <div className="camera-placeholder-icon">
            <Camera size={28} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Camera Inactive
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 420, marginTop: '0.35rem', marginBottom: '1.25rem' }}>
            Click the button below to grant permission and initiate edge computer vision inference through your device's webcam.
          </p>
          <button
            className="btn btn-primary"
            onClick={startCamera}
            disabled={isModelLoading}
          >
            <Camera size={16} />
            <span>{isModelLoading ? 'Loading Model First...' : 'Start Camera'}</span>
          </button>
        </div>
      )}

      {/* Camera Permission / Error Alert Modal / Banner */}
      {cameraError && (
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            right: '1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#991b1b',
            fontSize: '0.84rem',
            zIndex: 10,
          }}
        >
          <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 600 }}>Camera Access Problem: </span>
            <span>{cameraError}</span>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={startCamera}
            style={{ borderColor: '#fca5a5' }}
          >
            <RefreshCw size={13} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Model Loading / Error State Banner */}
      {modelError && (
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            right: '1rem',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#92400e',
            fontSize: '0.84rem',
            zIndex: 10,
          }}
        >
          <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>Detection Model Error: {modelError}</span>
          <button className="btn btn-secondary btn-sm" onClick={loadModel}>
            Reload Model
          </button>
        </div>
      )}
    </div>
  );
};
