import { Injectable } from '@angular/core';
import * as faceapi from 'face-api.js';

export interface AlertEvent {
  type: AlertType;
  message: string;
  severity: 'warning' | 'danger' | 'critical';
  timestamp: Date;
}

export type AlertType =
  | 'NO_FACE'
  | 'OUT_OF_FRAME'
  | 'GAZE_LEFT'
  | 'GAZE_RIGHT'
  | 'GAZE_DOWN'
  | 'EYES_CLOSED'
  | 'MULTIPLE_FACES'
  | 'PHONE_DETECTED';

@Injectable({ providedIn: 'root' })
export class AttentionGuardService {

  private isInitialized = false;
  private intervalId: any = null;
  private outOfFrameCount = 0;
  private noFaceCount = 0;
  private eyesClosedCount = 0;

  private stats = {
    totalAlerts: 0,
    gazeAlerts: 0,
    eyesClosedAlerts: 0,
    outOfFrameAlerts: 0,
    noFaceAlerts: 0,
    multipleFaceAlerts: 0,
    startTime: new Date()
  };

  async initialize(): Promise<void> {
  if (this.isInitialized) return;

  try {
    // ✅ Charger depuis CDN — pas besoin de fichiers locaux
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);

    this.isInitialized = true;
    console.log('✅ face-api.js initialisé via CDN');

  } catch (err) {
    console.error('❌ Erreur initialisation face-api:', err);
  }
}
  startMonitoring(
    videoElement: HTMLVideoElement,
    onAlert: (event: AlertEvent) => void
  ): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      await this.analyze(videoElement, onAlert);
    }, 1500);

    console.log('✅ Monitoring démarré');
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.outOfFrameCount = 0;
    this.noFaceCount = 0;
    this.eyesClosedCount = 0;
  }

  getStats() { return { ...this.stats }; }

  private emit(
    type: AlertType,
    message: string,
    severity: AlertEvent['severity'],
    onAlert: (event: AlertEvent) => void
  ): void {
    this.stats.totalAlerts++;
    if (type === 'EYES_CLOSED')    this.stats.eyesClosedAlerts++;
    if (type === 'OUT_OF_FRAME')   this.stats.outOfFrameAlerts++;
    if (type === 'NO_FACE')        this.stats.noFaceAlerts++;
    if (type === 'MULTIPLE_FACES') this.stats.multipleFaceAlerts++;
    if (['GAZE_LEFT','GAZE_RIGHT','GAZE_DOWN'].includes(type)) this.stats.gazeAlerts++;

    onAlert({ type, message, severity, timestamp: new Date() });
  }

  private async analyze(
    video: HTMLVideoElement,
    onAlert: (event: AlertEvent) => void
  ): Promise<void> {
    if (!video || video.readyState < 2) return;

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      // ── Aucun visage ──
      if (detections.length === 0) {
        this.noFaceCount++;
        if (this.noFaceCount >= 2) {
          this.emit('NO_FACE', 'Visage non détecté', 'danger', onAlert);
        }
        return;
      }

      this.noFaceCount = 0;

      // ── Plusieurs visages ──
      if (detections.length > 1) {
        this.emit('MULTIPLE_FACES', 'Plusieurs visages détectés', 'critical', onAlert);
        return;
      }

      const detection = detections[0];
      const landmarks = detection.landmarks;
      const box       = detection.detection.box;

      // ── Hors cadre ──
      const outOfFrame = this.isFaceOutOfFrame(box, video.videoWidth, video.videoHeight);
      if (outOfFrame.isOut) {
        this.outOfFrameCount++;
        if (this.outOfFrameCount >= 2) {
          this.emit('OUT_OF_FRAME', `Candidat sort du cadre ${outOfFrame.direction}`, 'critical', onAlert);
        }
        return;
      }
      this.outOfFrameCount = 0;

      // ── Détection yeux fermés ──
      const eyeStatus = this.detectEyes(landmarks);
      if (eyeStatus === 'CLOSED') {
        this.eyesClosedCount++;
        if (this.eyesClosedCount >= 2) {
          this.emit('EYES_CLOSED', '👁️ EYES NOT DETECTED — yeux fermés', 'danger', onAlert);
        }
      } else {
        this.eyesClosedCount = 0;

        // ── Détection regard ──
        const gaze = this.estimateGaze(landmarks, box);
        if (gaze === 'LEFT')  this.emit('GAZE_LEFT',  '👁️ EYES NOT DETECTED — regarde à gauche', 'warning', onAlert);
        if (gaze === 'RIGHT') this.emit('GAZE_RIGHT', '👁️ EYES NOT DETECTED — regarde à droite', 'warning', onAlert);
        if (gaze === 'DOWN')  this.emit('GAZE_DOWN',  '👁️ EYES NOT DETECTED — regarde en bas',   'warning', onAlert);
      }

      // ── ✅ Détection téléphone ── ← ICI
      if (detection.expressions.surprised > 0.7) {
        // fallback expressions — remplacé par détection mains ci-dessous
      }

    } catch (err) {
      console.warn('⚠️ Erreur analyse:', err);
    }
  }

  // ── Détection yeux ouverts/fermés ──
  private detectEyes(landmarks: faceapi.FaceLandmarks68): string {
    const leftEye  = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const leftEAR  = this.eyeAspectRatio(leftEye);
    const rightEAR = this.eyeAspectRatio(rightEye);
    const avgEAR   = (leftEAR + rightEAR) / 2;

    // Seuil EAR — en dessous = yeux fermés
    return avgEAR < 0.2 ? 'CLOSED' : 'OPEN';
  }

  // Eye Aspect Ratio (EAR) — formule standard
  private eyeAspectRatio(eye: faceapi.Point[]): number {
    if (eye.length < 6) return 1;

    const A = this.distance(eye[1], eye[5]);
    const B = this.distance(eye[2], eye[4]);
    const C = this.distance(eye[0], eye[3]);

    return (A + B) / (2.0 * C);
  }

  private distance(p1: faceapi.Point, p2: faceapi.Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  }

  // ── Estimation regard via landmarks ──
  private estimateGaze(
    landmarks: faceapi.FaceLandmarks68,
    box: faceapi.Box
  ): string {
    const nose     = landmarks.getNose();
    const leftEye  = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();

    const noseTip = nose[3];
    const eyeCenterX = (
      leftEye.reduce((s, p) => s + p.x, 0) / leftEye.length +
      rightEye.reduce((s, p) => s + p.x, 0) / rightEye.length
    ) / 2;

    const eyeCenterY = (
      leftEye.reduce((s, p) => s + p.y, 0) / leftEye.length +
      rightEye.reduce((s, p) => s + p.y, 0) / rightEye.length
    ) / 2;

    const deltaX = noseTip.x - eyeCenterX;
    const deltaY = eyeCenterY - noseTip.y;

    const threshold = box.width * 0.08;

    if (deltaX >  threshold) return 'RIGHT';
    if (deltaX < -threshold) return 'LEFT';
    if (deltaY < -threshold) return 'DOWN';

    return 'CENTER';
  }

  // ── Hors cadre ──
  private isFaceOutOfFrame(
    box: faceapi.Box,
    videoWidth: number,
    videoHeight: number
  ): { isOut: boolean; direction: string } {
    const margin = 20;

    if (box.x < margin)                          return { isOut: true, direction: '⬅️ gauche' };
    if (box.x + box.width  > videoWidth  - margin) return { isOut: true, direction: '➡️ droite' };
    if (box.y < margin)                          return { isOut: true, direction: '⬆️ haut' };
    if (box.y + box.height > videoHeight - margin) return { isOut: true, direction: '⬇️ bas' };

    return { isOut: false, direction: '' };
  }
  private detectPhoneByMotion(video: HTMLVideoElement): boolean {
  const canvas = document.createElement('canvas');
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;

  // ✅ Ajouter willReadFrequently = true
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return false;

  ctx.drawImage(video, 0, 0);

  const imageData = ctx.getImageData(
    canvas.width * 0.3,
    canvas.height * 0.6,
    canvas.width * 0.4,
    canvas.height * 0.3
  );

  let brightness = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    brightness += (imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) / 3;
  }
  brightness /= (imageData.data.length / 4);

  return brightness > 180;
}
}
