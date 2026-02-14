export type FilterType = 'none' | 'highContrast' | 'invert' | 'threshold' | 'halftone' | 'edge';

export const filters: { label: string; value: FilterType }[] = [
  { label: 'Normal (Dithering)', value: 'none' },
  { label: 'Yüksek Kontrast', value: 'highContrast' },
  { label: 'Negatif', value: 'invert' },
  { label: 'Sert Eşik', value: 'threshold' },
  { label: 'Halftone (Nokta)', value: 'halftone' },
  { label: 'Kenar Algılama', value: 'edge' },
];

export const photoFrames = [
  { label: 'Çerçevesiz', value: 'none' },
  { label: 'Düz Çerçeve', value: 'solid' },
  { label: 'Polaroid', value: 'polaroid' },
  { label: 'Yuvarlak Köşe', value: 'rounded' },
  { label: 'Pul', value: 'stamp' },
  { label: 'Film Şeridi', value: 'filmstrip' },
];

function clamp(v: number) { return v < 0 ? 0 : v > 255 ? 255 : v; }

export function applyFilter(ctx: CanvasRenderingContext2D, w: number, h: number, filter: FilterType, pad: number, imgW: number, imgH: number) {
  if (filter === 'none') {
    const imageData = ctx.getImageData(pad, pad, imgW, imgH);
    const data = imageData.data;
    const gray = new Float32Array(imgW * imgH);
    for (let i = 0; i < gray.length; i++) {
      const idx = i * 4;
      gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }
    for (let y = 0; y < imgH; y++) {
      for (let x = 0; x < imgW; x++) {
        const i = y * imgW + x;
        const old = clamp(gray[i]);
        const nw = old > 127 ? 255 : 0;
        const err = old - nw;
        gray[i] = nw;
        if (x + 1 < imgW) gray[i + 1] += err * 7 / 16;
        if (y + 1 < imgH) {
          if (x > 0) gray[i + imgW - 1] += err * 3 / 16;
          gray[i + imgW] += err * 5 / 16;
          if (x + 1 < imgW) gray[i + imgW + 1] += err * 1 / 16;
        }
      }
    }
    for (let i = 0; i < gray.length; i++) {
      const idx = i * 4;
      data[idx] = data[idx + 1] = data[idx + 2] = gray[i];
    }
    ctx.putImageData(imageData, pad, pad);
    return;
  }

  const imageData = ctx.getImageData(pad, pad, imgW, imgH);
  const data = imageData.data;

  switch (filter) {
    case 'highContrast':
      for (let i = 0; i < data.length; i += 4) {
        const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const v = g > 100 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = v;
      }
      break;
    case 'invert':
      for (let i = 0; i < data.length; i += 4) {
        const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const inv = 255 - g;
        const v = inv > 127 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = v;
      }
      break;
    case 'threshold':
      for (let i = 0; i < data.length; i += 4) {
        const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const v = g > 140 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = v;
      }
      break;
    case 'halftone':
      for (let y = 0; y < imgH; y += 4) {
        for (let x = 0; x < imgW; x += 4) {
          let sum = 0, count = 0;
          for (let dy = 0; dy < 4 && y + dy < imgH; dy++) {
            for (let dx = 0; dx < 4 && x + dx < imgW; dx++) {
              const idx = ((y + dy) * imgW + (x + dx)) * 4;
              sum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
              count++;
            }
          }
          const avg = sum / count;
          const dotSize = Math.round((1 - avg / 255) * 4);
          for (let dy = 0; dy < 4 && y + dy < imgH; dy++) {
            for (let dx = 0; dx < 4 && x + dx < imgW; dx++) {
              const idx = ((y + dy) * imgW + (x + dx)) * 4;
              const dist = Math.max(Math.abs(dy - 1.5), Math.abs(dx - 1.5));
              data[idx] = data[idx + 1] = data[idx + 2] = dist < dotSize ? 0 : 255;
            }
          }
        }
      }
      break;
    case 'edge': {
      const gray = new Float32Array(imgW * imgH);
      for (let i = 0; i < gray.length; i++) {
        const idx = i * 4;
        gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      }
      for (let y = 1; y < imgH - 1; y++) {
        for (let x = 1; x < imgW - 1; x++) {
          const gx = -gray[(y - 1) * imgW + (x - 1)] + gray[(y - 1) * imgW + (x + 1)]
            - 2 * gray[y * imgW + (x - 1)] + 2 * gray[y * imgW + (x + 1)]
            - gray[(y + 1) * imgW + (x - 1)] + gray[(y + 1) * imgW + (x + 1)];
          const gy = -gray[(y - 1) * imgW + (x - 1)] - 2 * gray[(y - 1) * imgW + x] - gray[(y - 1) * imgW + (x + 1)]
            + gray[(y + 1) * imgW + (x - 1)] + 2 * gray[(y + 1) * imgW + x] + gray[(y + 1) * imgW + (x + 1)];
          const mag = Math.sqrt(gx * gx + gy * gy);
          const idx = (y * imgW + x) * 4;
          const v = mag > 50 ? 0 : 255;
          data[idx] = data[idx + 1] = data[idx + 2] = v;
        }
      }
      break;
    }
  }
  ctx.putImageData(imageData, pad, pad);
}

export function drawPhotoFrame(ctx: CanvasRenderingContext2D, frame: string, w: number, h: number, pad: number) {
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';

  switch (frame) {
    case 'solid':
      ctx.lineWidth = 3;
      ctx.strokeRect(pad / 2, pad / 2, w - pad, h - pad);
      break;
    case 'polaroid':
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, w - 8, h - 8);
      break;
    case 'rounded': {
      ctx.lineWidth = 3;
      const r = 20;
      ctx.beginPath();
      ctx.moveTo(pad / 2 + r, pad / 2);
      ctx.lineTo(w - pad / 2 - r, pad / 2);
      ctx.quadraticCurveTo(w - pad / 2, pad / 2, w - pad / 2, pad / 2 + r);
      ctx.lineTo(w - pad / 2, h - pad / 2 - r);
      ctx.quadraticCurveTo(w - pad / 2, h - pad / 2, w - pad / 2 - r, h - pad / 2);
      ctx.lineTo(pad / 2 + r, h - pad / 2);
      ctx.quadraticCurveTo(pad / 2, h - pad / 2, pad / 2, h - pad / 2 - r);
      ctx.lineTo(pad / 2, pad / 2 + r);
      ctx.quadraticCurveTo(pad / 2, pad / 2, pad / 2 + r, pad / 2);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'stamp': {
      ctx.lineWidth = 2;
      const step = 12;
      const radius = 4;
      ctx.beginPath();
      for (let x = pad / 2; x < w - pad / 2; x += step) {
        ctx.arc(x + step / 2, pad / 2, radius, 0, Math.PI, true);
      }
      for (let y = pad / 2; y < h - pad / 2; y += step) {
        ctx.arc(w - pad / 2, y + step / 2, radius, -Math.PI / 2, Math.PI / 2, true);
      }
      for (let x = w - pad / 2; x > pad / 2; x -= step) {
        ctx.arc(x - step / 2, h - pad / 2, radius, 0, Math.PI, false);
      }
      for (let y = h - pad / 2; y > pad / 2; y -= step) {
        ctx.arc(pad / 2, y - step / 2, radius, Math.PI / 2, -Math.PI / 2, false);
      }
      ctx.stroke();
      break;
    }
    case 'filmstrip': {
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, w, h);
      const holeSize = 8;
      const holeGap = 18;
      ctx.fillStyle = 'white';
      for (let y = 10; y < h - 10; y += holeGap) {
        ctx.fillRect(3, y, holeSize, holeSize);
        ctx.strokeRect(3, y, holeSize, holeSize);
        ctx.fillRect(w - 3 - holeSize, y, holeSize, holeSize);
        ctx.strokeRect(w - 3 - holeSize, y, holeSize, holeSize);
      }
      ctx.fillStyle = 'black';
      break;
    }
  }
}
