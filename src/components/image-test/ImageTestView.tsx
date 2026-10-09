import React, { useState, useRef } from 'react';
import { useDetection } from '../../context/DetectionContext';
import { detectorService } from '../../services/detector';
import { SAMPLE_IMAGES, type SampleImage } from '../../services/sampleImages';
import { getClassColor } from '../../services/cocoClasses';
import type { DetectedObject } from '../../types/detection';
import {
  UploadCloud,
  ImageIcon,
  Sparkles,
  Zap,
} from 'lucide-react';

export const ImageTestView: React.FC = () => {
  const {
    isModelLoaded,
    settings,
    processDetections,
    showToast,
  } = useDetection();

  const [activeImageSrc, setActiveImageSrc] = useState<string>(SAMPLE_IMAGES[0].url);
  const [activeImageTitle, setActiveImageTitle] = useState<string>(SAMPLE_IMAGES[0].title);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState<DetectedObject[]>([]);
  const [latency, setLatency] = useState<number | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const drawBoxesOnCanvas = (
    img: HTMLImageElement,
    canvas: HTMLCanvasElement,
    objects: DetectedObject[]
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    objects.forEach(obj => {
      if (obj.score < settings.minConfidence) return;
      if (settings.classFilters.length > 0 && !settings.classFilters.includes(obj.class)) return;

      const [x, y, width, height] = obj.bbox;
      const color = getClassColor(obj.class);

      if (settings.showBoxes) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(3, Math.round(canvas.width / 350));
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 4;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = `${color}18`;
        ctx.fillRect(x, y, width, height);
        ctx.restore();
      }

      if (settings.showLabels) {
        const text = settings.showConfidence
          ? `${obj.class.toUpperCase()} ${Math.round(obj.score * 100)}%`
          : obj.class.toUpperCase();

        const fontSize = Math.max(12, Math.round(canvas.width / 45));
        ctx.font = `700 ${fontSize}px "Inter", sans-serif`;
        const textWidth = ctx.measureText(text).width;
        const tagHeight = fontSize + 10;
        const tagWidth = textWidth + 16;
        const tagY = Math.max(tagHeight, y);

        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, tagY - tagHeight, tagWidth, tagHeight, 4);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, x + 8, tagY - 7);
        ctx.restore();
      }
    });
  };

  const runDetectionOnCurrentImg = async (sourceType: 'sample' | 'upload' = 'sample') => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    try {
      setIsProcessing(true);
      const res = await detectorService.detect(img, settings.maxObjects, settings.minConfidence);
      setDetections(res.objects);
      setLatency(res.latencyMs);
      drawBoxesOnCanvas(img, canvas, res.objects);
      processDetections(res.objects, sourceType);
      showToast(`Detected ${res.objects.length} objects in ${res.latencyMs}ms`, 'success');
    } catch (err: unknown) {
      console.error('Image detection failed:', err);
      showToast('Object detection on image failed. Check console.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageLoad = () => {
    if (isModelLoaded) {
      runDetectionOnCurrentImg('sample');
    }
  };

  const handleSelectSample = (sample: SampleImage) => {
    setActiveImageSrc(sample.url);
    setActiveImageTitle(sample.title);
    setDetections([]);
    setLatency(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (PNG, JPG, WebP).', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      if (event.target?.result) {
        setActiveImageSrc(event.target.result as string);
        setActiveImageTitle(file.name);
        setDetections([]);
        setLatency(null);
        showToast(`Loaded ${file.name}. Running computer vision inference...`, 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-fade-in">
      <div className="view-heading">
        <div>
          <h2>Image Upload & Model Testing Lab</h2>
          <p>Verify computer vision object detection on static imagery without requiring a webcam</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={16} />
            <span>Upload Image</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <button
            className="btn btn-primary btn-sm"
            onClick={() => runDetectionOnCurrentImg('upload')}
            disabled={isProcessing || !isModelLoaded}
          >
            <Sparkles size={16} />
            <span>{isProcessing ? 'Analyzing...' : 'Run Detection'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
        {/* Main Display: Image + Canvas */}
        <div className="card-panel" style={{ marginBottom: 0 }}>
          <div className="card-panel-header">
            <h3 className="card-panel-title">
              <ImageIcon size={18} color="#2563eb" />
              <span>{activeImageTitle}</span>
            </h3>
            {latency !== null && (
              <span className="badge badge-green">
                <Zap size={12} />
                <span>{latency} ms inference</span>
              </span>
            )}
          </div>

          <div
            className="card-panel-body"
            style={{
              position: 'relative',
              backgroundColor: '#f1f5f9',
              minHeight: 460,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              overflow: 'hidden',
            }}
          >
            <img
              ref={imageRef}
              src={activeImageSrc}
              alt="Test subject"
              crossOrigin="anonymous"
              onLoad={handleImageLoad}
              style={{ maxWidth: '100%', maxHeight: 540, objectFit: 'contain', display: 'block' }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Right Sidebar: Sample Gallery & Detected Objects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Detected Objects in this image */}
          <div className="card-panel" style={{ marginBottom: 0 }}>
            <div className="card-panel-header">
              <h3 className="card-panel-title">
                <Sparkles size={16} color="#2563eb" />
                <span>Detected Classes</span>
              </h3>
              <span className="badge badge-blue">{detections.length} Total</span>
            </div>
            <div className="card-panel-body" style={{ padding: '1rem' }}>
              {detections.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  {isProcessing ? 'Analyzing image...' : 'Click "Run Detection" to inspect this image.'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: 200, overflowY: 'auto' }}>
                  {detections.map((d, i) => {
                    const color = getClassColor(d.class);
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.4rem 0.65rem',
                          backgroundColor: '#ffffff',
                          border: `1px solid ${color}40`,
                          borderLeft: `4px solid ${color}`,
                          borderRadius: '4px',
                          fontSize: '0.82rem',
                        }}
                      >
                        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{d.class}</span>
                        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color }}>
                          {Math.round(d.score * 100)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sample Images Picker */}
          <div className="card-panel" style={{ marginBottom: 0 }}>
            <div className="card-panel-header">
              <h3 className="card-panel-title">
                <ImageIcon size={16} color="#0d9488" />
                <span>Sample Gallery</span>
              </h3>
            </div>
            <div className="card-panel-body" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {SAMPLE_IMAGES.map(sample => {
                const isSelected = activeImageSrc === sample.url;
                return (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'center',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? '#eff6ff' : 'white',
                      border: isSelected ? '1px solid #bfdbfe' : '1px solid var(--border-light)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <img
                      src={sample.url}
                      alt={sample.title}
                      style={{ width: 52, height: 52, borderRadius: 6, objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sample.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {sample.category}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
