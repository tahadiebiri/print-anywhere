import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { CameraView } from '@/components/CameraView';
import { ImageEditor } from '@/components/ImageEditor';

export default function ImagePrint() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  if (!capturedImage) {
    return <CameraView onCapture={setCapturedImage} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-4 pt-4">
        <PageHeader title="Fotoğraf Baskısı" />
      </div>
      <ImageEditor
        imageSrc={capturedImage}
        onBack={() => setCapturedImage(null)}
      />
    </div>
  );
}
