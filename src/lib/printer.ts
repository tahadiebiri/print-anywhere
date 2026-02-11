import { CatPrinter } from '@opuu/cat-printer';

export interface AppPrinterState {
  connected: boolean;
  deviceName: string | null;
  connecting: boolean;
}

let printerInstance: CatPrinter | null = null;
let devLogCallback: ((log: { type: string; message: string; hex?: string }) => void) | null = null;

export function setDevLogCallback(cb: typeof devLogCallback) {
  devLogCallback = cb;
}

function devLog(type: 'send' | 'receive' | 'info' | 'error', message: string, hex?: string) {
  devLogCallback?.({ type, message, hex });
}

export function getPrinter(): CatPrinter {
  if (!printerInstance) {
    printerInstance = new CatPrinter({ debug: true });
  }
  return printerInstance;
}

export async function connectPrinter(): Promise<string> {
  const printer = getPrinter();
  devLog('info', 'BLE bağlantısı başlatılıyor...');
  await printer.connect();
  const name = (printer as any).device?.name || 'Termal Yazıcı';
  devLog('info', `Bağlandı: ${name}`);
  return name;
}

export async function disconnectPrinter(): Promise<void> {
  if (printerInstance) {
    devLog('info', 'Bağlantı kesiliyor...');
    await printerInstance.disconnect();
    devLog('info', 'Bağlantı kesildi');
  }
}

export async function feedPaper(lines: number = 40): Promise<void> {
  const printer = getPrinter();
  // Create a blank white canvas to feed paper
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = Math.abs(lines);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/png');
  devLog('send', `Kağıt besleme: ${lines}px`);
  await printer.printImage(dataUrl);
}

export async function printCanvas(canvas: HTMLCanvasElement): Promise<void> {
  const printer = getPrinter();
  // Add blank feed lines at top and bottom
  const topPad = 40;
  const bottomPad = 120;
  const feedCanvas = document.createElement('canvas');
  feedCanvas.width = canvas.width;
  feedCanvas.height = canvas.height + topPad + bottomPad;
  const feedCtx = feedCanvas.getContext('2d')!;
  feedCtx.fillStyle = 'white';
  feedCtx.fillRect(0, 0, feedCanvas.width, feedCanvas.height);
  feedCtx.drawImage(canvas, 0, topPad);
  const dataUrl = feedCanvas.toDataURL('image/png');

  // Dev log hex preview
  const hexPreview = dataUrl.slice(0, 80) + '...';
  devLog('send', `Baskı gönderiliyor: ${feedCanvas.width}x${feedCanvas.height}px (${topPad}px üst + ${bottomPad}px alt boşluk)`, `DATA: ${hexPreview}`);
  
  await printer.printImage(dataUrl);
  devLog('info', 'Baskı tamamlandı');
}

export async function printImageFromUrl(url: string): Promise<void> {
  const printer = getPrinter();
  devLog('send', `Görsel basılıyor: ${url.slice(0, 60)}...`);
  await printer.printImage(url);
  devLog('info', 'Görsel baskı tamamlandı');
}

export async function printText(text: string, options?: {
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
}): Promise<void> {
  const printer = getPrinter();
  devLog('send', `Metin basılıyor: "${text.slice(0, 50)}..." font:${options?.fontSize || 24}`);
  await printer.printText(text, {
    fontSize: options?.fontSize || 24,
    fontWeight: options?.fontWeight || 'normal',
    align: (options?.textAlign === 'center' ? 'center' : options?.textAlign === 'right' ? 'end' : 'start') as any,
  });
  devLog('info', 'Metin baskı tamamlandı');
}

export function isWebBluetoothSupported(): boolean {
  return !!(navigator as any).bluetooth;
}
