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
    // Stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
      setCameraError(null);
    } catch {
      setCameraError('Kamera erişimi reddedildi. Galeri ile devam edebilirsiniz.');
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
    // Mirror for front camera
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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Camera preview */}
      <div className="flex-1 relative bg-black rounded-xl overflow-hidden mx-2 mt-2">
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

      {/* Controls */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Gallery */}
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full"
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
          className="h-16 w-16 rounded-full border-4 border-primary bg-primary/20 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
        >
          <div className="h-12 w-12 rounded-full bg-primary" />
        </button>

        {/* Switch camera */}
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={toggleCamera}
          disabled={!!cameraError}
        >
          <SwitchCamera className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
