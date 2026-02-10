import { CatPrinter } from '@opuu/cat-printer';

export interface AppPrinterState {
  connected: boolean;
  deviceName: string | null;
  connecting: boolean;
}

let printerInstance: CatPrinter | null = null;

export function getPrinter(): CatPrinter {
  if (!printerInstance) {
    printerInstance = new CatPrinter({ debug: true });
  }
  return printerInstance;
}

export async function connectPrinter(): Promise<string> {
  const printer = getPrinter();
  await printer.connect();
  return (printer as any).device?.name || 'Termal Yazıcı';
}

export async function disconnectPrinter(): Promise<void> {
  if (printerInstance) {
    await printerInstance.disconnect();
  }
}

export async function printCanvas(canvas: HTMLCanvasElement): Promise<void> {
  const printer = getPrinter();
  // Add blank feed lines at the bottom so the output doesn't stay inside the printer
  const feedCanvas = document.createElement('canvas');
  feedCanvas.width = canvas.width;
  feedCanvas.height = canvas.height + 80; // 80px extra blank feed
  const feedCtx = feedCanvas.getContext('2d')!;
  feedCtx.fillStyle = 'white';
  feedCtx.fillRect(0, 0, feedCanvas.width, feedCanvas.height);
  feedCtx.drawImage(canvas, 0, 0);
  const dataUrl = feedCanvas.toDataURL('image/png');
  await printer.printImage(dataUrl);
}

export async function printImageFromUrl(url: string): Promise<void> {
  const printer = getPrinter();
  await printer.printImage(url);
}

export async function printText(text: string, options?: {
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
}): Promise<void> {
  const printer = getPrinter();
  await printer.printText(text, {
    fontSize: options?.fontSize || 24,
    fontWeight: options?.fontWeight || 'normal',
    align: (options?.textAlign === 'center' ? 'center' : options?.textAlign === 'right' ? 'end' : 'start') as any,
  });
}

export function isWebBluetoothSupported(): boolean {
  return !!(navigator as any).bluetooth;
}
