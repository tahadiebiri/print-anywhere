import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, ImageIcon, SwitchCamera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraViewProps {
  onCapture: (dataUrl: string) => void;
}

export function CameraView({ onCapture }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const startCamera = useCallback(async (facing: 'user' | 'environment') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
    try {
      const constraints: MediaStreamConstraints = {
        video: facing === 'environment'
          ? { facingMode: { exact: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (facing === 'environment') {
        const track = stream.getVideoTracks()[0];
        const caps = track.getCapabilities?.() as any;
        if (caps?.zoom) {
          await track.applyConstraints({ advanced: [{ zoom: caps.zoom.min > 1 ? caps.zoom.min : 1 } as any] });
        }
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
      setCameraError(null);
    } catch {
      setCameraError('cameraError');
    }
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [facingMode, startCamera]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !cameraReady) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL('image/jpeg', 0.92));
  };

  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onCapture(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleCamera = () => {
    setFacingMode(f => f === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black">
      {/* Camera preview - fills all available space */}
      <div className="flex-1 relative overflow-hidden">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 p-6 text-center gap-3">
            <Camera className="h-12 w-12 opacity-50" />
            <p className="text-sm">{cameraError}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={facingMode === 'user' ? { transform: 'scaleX(-1)' } : undefined}
          />
        )}
      </div>

      {/* Controls - fixed at bottom */}
      <div className="flex items-center justify-between px-8 py-5 bg-black/80 backdrop-blur-sm safe-area-bottom">
        {/* Gallery */}
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full text-white hover:bg-white/20"
          onClick={() => galleryRef.current?.click()}
        >
          <ImageIcon className="h-6 w-6" />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleGallery}
          />
        </Button>

        {/* Shutter */}
        <button
          onClick={handleCapture}
          disabled={!cameraReady && !cameraError}
          className="h-18 w-18 rounded-full border-4 border-white bg-white/20 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
          style={{ width: 72, height: 72 }}
        >
          <div className="rounded-full bg-white" style={{ width: 56, height: 56 }} />
        </button>

        {/* Switch camera */}
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full text-white hover:bg-white/20"
          onClick={toggleCamera}
          disabled={!!cameraError}
        >
          <SwitchCamera className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
