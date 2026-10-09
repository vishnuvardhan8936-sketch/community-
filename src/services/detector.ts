import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import type { DetectedObject } from '../types/detection';

class ObjectDetectorService {
  private model: cocoSsd.ObjectDetection | null = null;
  private isLoading = false;
  private loadPromise: Promise<cocoSsd.ObjectDetection> | null = null;
  private loadError: string | null = null;

  public async loadModel(): Promise<cocoSsd.ObjectDetection> {
    if (this.model) {
      return this.model;
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadError = null;

    this.loadPromise = (async () => {
      try {
        console.log('[VisionEngine] Initializing TensorFlow backend and loading COCO-SSD model...');
        // Load mobilenet_v2 for balanced accuracy and speed
        const loadedModel = await cocoSsd.load({
          base: 'mobilenet_v2'
        });
        this.model = loadedModel;
        this.isLoading = false;
        console.log('[VisionEngine] Model successfully loaded and ready for real-time inference.');
        return loadedModel;
      } catch (err: unknown) {
        this.isLoading = false;
        const msg = err instanceof Error ? err.message : 'Failed to initialize object detector model';
        this.loadError = msg;
        this.loadPromise = null;
        console.error('[VisionEngine] Error loading COCO-SSD model:', err);
        throw new Error(msg);
      }
    })();

    return this.loadPromise;
  }

  public isReady(): boolean {
    return this.model !== null;
  }

  public getIsLoading(): boolean {
    return this.isLoading;
  }

  public getLoadError(): string | null {
    return this.loadError;
  }

  public async detect(
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    maxObjects: number = 20,
    minConfidence: number = 0.4
  ): Promise<{ objects: DetectedObject[]; latencyMs: number }> {
    if (!this.model) {
      await this.loadModel();
    }
    if (!this.model) {
      throw new Error('Detection model is not available.');
    }

    const startTime = performance.now();
    const rawPredictions = await this.model.detect(input, maxObjects, minConfidence);
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    const objects: DetectedObject[] = rawPredictions.map((pred, index) => ({
      id: `${pred.class}-${index}-${Date.now()}`,
      class: pred.class,
      score: pred.score,
      bbox: pred.bbox, // [x, y, width, height]
    }));

    return { objects, latencyMs };
  }
}

export const detectorService = new ObjectDetectorService();
