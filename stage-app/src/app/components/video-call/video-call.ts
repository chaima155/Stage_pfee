import { Component, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Client, IMessage } from '@stomp/stompjs';
import { AttentionGuardService, AlertEvent } from '../../services/attention-guard.service';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './video-call.html',
  styleUrls: ['./video-call.css']
})
export class VideoCall implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('localVideo') localVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('localVideoVisible') localVideoVisibleRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideoRef!: ElementRef<HTMLVideoElement>;

  // ── WebRTC ──
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private stompClient: Client | null = null;
  private cameraReady: boolean = false;

  // ── État appel ──
  roomName: string = '';
  isLoading: boolean = true;
  isCallActive: boolean = false;
  isConnected: boolean = false;
  showDecision: boolean = false;
  isMuted: boolean = false;
  isCameraOff: boolean = false;

  // ── Durée ──
  private callStartTime: Date | null = null;
  callDuration: string = '';
  private timerInterval: any = null;
  callDurationDisplay: string = '00:00';

  // ── IA & Analyse ──
  actions: string[] = [];
  aiAnalysis: string = '';
  isAnalyzing: boolean = false;

  // ── Attention Guard ──
  alertMessage: string = '';
  alertType: string = '';
  alertSeverity: string = '';
  private alertCooldown: Map<string, number> = new Map();

  // ── Entretien ──
  entretienId: number = 0;
  candidateEmail: string = '';
  candidateName: string = '';
  decision: string = '';
  isSending: boolean = false;
  resultSent: boolean = false;
  isResponsable: boolean = false;

  private iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  constructor(
    public router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private attentionGuard: AttentionGuardService
  ) {}

  // ══════════════════════════════════════
  // LIFECYCLE
  // ══════════════════════════════════════

  ngOnInit(): void {
    this.roomName      = localStorage.getItem('entretienRoom')    || 'room-default';
    this.entretienId   = Number(localStorage.getItem('entretienId') || 0);
    this.candidateEmail = localStorage.getItem('candidateEmail')  || '';
    this.candidateName  = localStorage.getItem('candidateName')   || 'Candidat';

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.isResponsable = currentUser.role === 'responsable_stage';

    this.connectWebSocket();
  }

  ngAfterViewInit(): void {
    if (this.localStream && this.localVideoRef?.nativeElement) {
      this.assignLocalStream();
    }
  }

  ngOnDestroy(): void {
    this.attentionGuard.stopMonitoring();
    this.stopTimer();
    if (this.localStream)    this.localStream.getTracks().forEach(t => t.stop());
    if (this.peerConnection) this.peerConnection.close();
    if (this.stompClient)    this.stompClient.deactivate();
  }

  // ══════════════════════════════════════
  // WEBSOCKET
  // ══════════════════════════════════════

  connectWebSocket(): void {
    this.stompClient = new Client({
      brokerURL: undefined,
      webSocketFactory: () => {
        const SockJSClient = (window as any).SockJS;
        return SockJSClient
          ? new SockJSClient('http://localhost:8081/ws')
          : new WebSocket('ws://localhost:8081/ws');
      },
      onConnect: () => {
        console.log('✅ WebSocket connecté');
        this.subscribeToRoom();
        this.startCamera();
      },
      onDisconnect: () => console.log('❌ WebSocket déconnecté'),
      reconnectDelay: 5000,
    });
    this.stompClient.activate();
  }

  subscribeToRoom(): void {
    if (!this.stompClient) return;

    this.stompClient.subscribe(
      `/topic/signal/${this.roomName}/offer`,
      async (msg: IMessage) => {
        const data = JSON.parse(msg.body);
        if (!this.isResponsable) await this.handleOffer(data.sdp);
      }
    );

    this.stompClient.subscribe(
      `/topic/signal/${this.roomName}/answer`,
      async (msg: IMessage) => {
        const data = JSON.parse(msg.body);
        if (this.isResponsable) await this.handleAnswer(data.sdp);
      }
    );

    this.stompClient.subscribe(
      `/topic/signal/${this.roomName}/ice`,
      async (msg: IMessage) => {
        const data = JSON.parse(msg.body);
        await this.handleIceCandidate(data.candidate);
      }
    );

    this.stompClient.subscribe(
      `/topic/signal/${this.roomName}/action`,
      (msg: IMessage) => {
        const data = JSON.parse(msg.body);
        if (this.isResponsable) this.addAction(data.action);
      }
    );

    this.stompClient.subscribe(
      `/topic/signal/${this.roomName}/join`,
      async (msg: IMessage) => {
        const data = JSON.parse(msg.body);
        if (this.isResponsable && data.role === 'candidate') {
          this.addAction('👤 Candidat a rejoint');
          await this.createOffer();
        }
      }
    );

    this.sendSignal('join', {
      role: this.isResponsable ? 'responsable' : 'candidate',
      name: this.candidateName
    });
  }

  sendSignal(type: string, data: any): void {
    if (!this.stompClient?.connected) return;
    this.stompClient.publish({
      destination: `/app/signal/${this.roomName}/${type}`,
      body: JSON.stringify(data)
    });
  }

  // ══════════════════════════════════════
  // CAMERA & STREAM
  // ══════════════════════════════════════

  async startCamera(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });
      console.log('✅ Stream obtenu');
    } catch (err: any) {
      console.warn('⚠️ Erreur caméra:', err.name);
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: false, audio: true
        });
        console.log('✅ Audio seulement');
      } catch {
        this.localStream = null;
        console.warn('⚠️ Aucun périphérique');
      }
    }

    this.isLoading = false;
    this.isCallActive = true;
    this.callStartTime = new Date();
    this.startTimer();
    this.cdr.detectChanges();

    setTimeout(async () => {
      this.assignLocalStream();

      // Démarrer AttentionGuard uniquement pour le candidat
      if (!this.isResponsable && this.localVideoRef?.nativeElement) {
        await this.attentionGuard.initialize();
        this.attentionGuard.startMonitoring(
          this.localVideoRef.nativeElement,
          (event: AlertEvent) => this.handleAlert(event)
        );
      }

      this.cdr.detectChanges();
    }, 800);
  }

  assignLocalStream(): void {
    if (!this.localStream) return;

    if (this.localVideoRef?.nativeElement) {
      this.localVideoRef.nativeElement.srcObject = this.localStream;
      this.localVideoRef.nativeElement.play().catch(() => {});
    }

    if (this.localVideoVisibleRef?.nativeElement) {
      this.localVideoVisibleRef.nativeElement.srcObject = this.localStream;
      this.localVideoVisibleRef.nativeElement.play().catch(() => {});
    }

    this.cameraReady = true;
  }

  // ══════════════════════════════════════
  // WEBRTC
  // ══════════════════════════════════════

  createPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection(this.iceServers);

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    this.peerConnection.ontrack = (event) => {
      setTimeout(() => {
        if (this.remoteVideoRef?.nativeElement) {
          this.remoteVideoRef.nativeElement.srcObject = event.streams[0];
          this.remoteVideoRef.nativeElement.play().catch(() => {});
          this.isConnected = true;
          this.cdr.detectChanges();
        }
      }, 300);
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal('ice', { candidate: event.candidate });
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log('🔗 State:', this.peerConnection?.connectionState);
      this.cdr.detectChanges();
    };
  }

  async createOffer(): Promise<void> {
    this.createPeerConnection();
    const offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);
    this.sendSignal('offer', { sdp: offer });
  }

  async handleOffer(sdp: RTCSessionDescriptionInit): Promise<void> {
    this.createPeerConnection();
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    this.sendSignal('answer', { sdp: answer });
  }

  async handleAnswer(sdp: RTCSessionDescriptionInit): Promise<void> {
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      await this.peerConnection!.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('ICE error:', err);
    }
  }

  // ══════════════════════════════════════
  // CONTROLES
  // ══════════════════════════════════════

  toggleMute(): void {
    if (!this.localStream) return;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.isMuted = !audioTrack.enabled;
      const action = this.isMuted ? '🔇 Micro coupé' : '🎙️ Micro activé';
      this.addAction(action);
      this.sendSignal('action', { action });
      this.cdr.detectChanges();
    }
  }

  toggleCamera(): void {
    if (!this.localStream) return;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.isCameraOff = !videoTrack.enabled;
      const action = this.isCameraOff ? '📷 Caméra coupée' : '📹 Caméra activée';
      this.addAction(action);
      this.sendSignal('action', { action });
      this.cdr.detectChanges();
    }
  }

  endCall(): void {
    // Calculer durée finale
    if (this.callStartTime) {
      const diff = Math.floor((new Date().getTime() - this.callStartTime.getTime()) / 1000);
      this.callDuration = `${Math.floor(diff / 60)} min ${diff % 60} sec`;
    }

    this.attentionGuard.stopMonitoring();
    this.stopTimer();

    if (this.localStream)    this.localStream.getTracks().forEach(t => t.stop());
    if (this.peerConnection) this.peerConnection.close();
    if (this.stompClient)    this.stompClient.deactivate();

    this.isCallActive = false;
    this.isConnected  = false;

    if (this.isResponsable) {
      this.showDecision = true;
      this.analyzeWithAI();
    } else {
      this.router.navigate(['/my-space']);
    }
    this.cdr.detectChanges();
  }

  // ══════════════════════════════════════
  // TIMER
  // ══════════════════════════════════════

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (!this.callStartTime) return;
      const diff = Math.floor((new Date().getTime() - this.callStartTime.getTime()) / 1000);
      const min = Math.floor(diff / 60).toString().padStart(2, '0');
      const sec = (diff % 60).toString().padStart(2, '0');
      this.callDurationDisplay = `${min}:${sec}`;
      this.cdr.detectChanges();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ══════════════════════════════════════
  // ATTENTION GUARD
  // ══════════════════════════════════════

  handleAlert(event: AlertEvent): void {
    const now = Date.now();
    const lastAlert = this.alertCooldown.get(event.type) || 0;
    if (now - lastAlert < 5000) return;
    this.alertCooldown.set(event.type, now);

    this.alertMessage  = event.message;
    this.alertType     = event.type;
    this.alertSeverity = event.severity;

    this.addAction(event.message);
    this.sendSignal('action', { action: event.message });
    this.cdr.detectChanges();

    setTimeout(() => {
      this.alertMessage  = '';
      this.alertSeverity = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  // ══════════════════════════════════════
  // ACTIONS & IA
  // ══════════════════════════════════════

  addAction(action: string): void {
    const time = new Date().toLocaleTimeString('fr-FR');
    this.actions.push(`[${time}] ${action}`);
    this.cdr.detectChanges();
  }

  analyzeWithAI(): void {
    this.isAnalyzing = true;

    const actionsText = this.actions.length > 0
      ? this.actions.join('\n')
      : 'Aucune action enregistrée';

    this.http.post<any>('http://localhost:8081/api/entretien-ai/analyze', {
      actions: actionsText,
      candidateName: this.candidateName,
      duree: this.callDuration
    }).subscribe({
      next: (res) => {
        this.aiAnalysis  = res.analysis || 'Analyse non disponible';
        this.isAnalyzing = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.aiAnalysis  = 'Analyse IA non disponible — décision manuelle requise.';
        this.isAnalyzing = false;
        this.cdr.detectChanges();
      }
    });
  }

  sendDecision(resultat: string): void {
    this.isSending = true;
    this.decision  = resultat;

    this.http.put(`http://localhost:8081/api/entretien/${this.entretienId}/terminer`, {
      resultat,
      notes: this.aiAnalysis,
      candidateEmail: this.candidateEmail,
      candidateName: this.candidateName
    }).subscribe({
      next: () => {
        this.isSending  = false;
        this.resultSent = true;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/dashbord/list']), 3000);
      },
      error: (err) => {
        console.error('Erreur envoi décision:', err);
        this.isSending = false;
        this.cdr.detectChanges();
      }
    });
  }
}