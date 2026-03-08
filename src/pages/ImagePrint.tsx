import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { CameraView } from '@/components/CameraView';
import { ImageEditor } from '@/components/ImageEditor';
import { useLanguage } from '@/hooks/use-language';

export default function ImagePrint() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { t } = useLanguage();

  if (!capturedImage) {
    return <CameraView onCapture={setCapturedImage} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-4 pt-4">
        <PageHeader title={t('photoPrint')} />
      </div>
      <ImageEditor
        imageSrc={capturedImage}
        onBack={() => setCapturedImage(null)}
      />
    </div>
  );
}
