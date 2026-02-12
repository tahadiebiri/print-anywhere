import { CatPrinter } from '@opuu/cat-printer';

export interface AppPrinterState {
  connected: boolean;
  deviceName: string | null;
  connecting: boolean;
}

let printerInstance: CatPrinter | null = null;
let devLogCallback: ((log: { type: string; message: string; hex?: string }) => void) | null = null;
let patched = false;

export function setDevLogCallback(cb: typeof devLogCallback) {
  devLogCallback = cb;
}

function devLog(type: 'send' | 'receive' | 'info' | 'error', message: string, hex?: string) {
  devLogCallback?.({ type, message, hex });
}

// Command name lookup from the library's enum values
const CMD_NAMES: Record<number, string> = {
  190: 'ApplyEnergy',
  163: 'GetDeviceState',
  168: 'GetDeviceInfo',
  169: 'UpdateDevice',
  164: 'SetDpi',
  166: 'Lattice',
  160: 'Retract',
  161: 'Feed',
  189: 'Speed',
  175: 'Energy',
  162: 'Bitmap',
};

function formatHex(data: Uint8Array): string {
  return Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' ');
}

function parseCommand(data: Uint8Array): string {
  if (data.length >= 3 && data[0] === 0x51 && data[1] === 0x78) {
    const cmd = data[2];
    const cmdName = CMD_NAMES[cmd] || `Unknown(0x${cmd.toString(16)})`;
    const payloadLen = data.length >= 6 ? data[4] | (data[5] << 8) : 0;
    return `CMD: ${cmdName} (0x${cmd.toString(16)}) | payload: ${payloadLen} bytes | total: ${data.length} bytes`;
  }
  return `RAW: ${data.length} bytes`;
}

function patchPrinter(printer: CatPrinter) {
  if (patched) return;
  patched = true;

  const proto = Object.getPrototypeOf(printer);
  const origWrite = proto.write;
  const origHandleNotification = proto.handleNotification;

  proto.write = async function (data: Uint8Array) {
    if (devLogCallback) {
      const desc = parseCommand(data);
      const hex = formatHex(data);
      // For bitmap commands, truncate hex display
      const isBitmap = data.length >= 3 && data[2] === 162;
      const displayHex = isBitmap && hex.length > 120 ? hex.slice(0, 120) + ` ... (${data.length} bytes total)` : hex;
      devLog('send', desc, displayHex);
    }
    return origWrite.call(this, data);
  };

  proto.handleNotification = function (event: any) {
    if (devLogCallback) {
      const value = event.target?.value;
      if (value) {
        const arr = new Uint8Array(value.buffer);
        const desc = parseCommand(arr);
        devLog('receive', desc, formatHex(arr));
      }
    }
    return origHandleNotification.call(this, event);
  };
}

export function getPrinter(): CatPrinter {
  if (!printerInstance) {
    printerInstance = new CatPrinter({ debug: true });
    patchPrinter(printerInstance);
  }
  return printerInstance;
}

export async function connectPrinter(): Promise<string> {
  const printer = getPrinter();
  devLog('info', 'BLE bağlantı başlatılıyor... Service UUID: 0xAE30 (44592)');
  await printer.connect();
  const name = (printer as any).device?.name || 'Termal Yazıcı';
  devLog('info', `Bağlandı: ${name} | TX: 0xAE01 | RX: 0xAE02`);
  return name;
}

export async function disconnectPrinter(): Promise<void> {
  if (printerInstance) {
    devLog('info', 'GATT bağlantısı kesiliyor...');
    await printerInstance.disconnect();
    devLog('info', 'Bağlantı kesildi');
  }
}

export async function feedPaper(lines: number = 40): Promise<void> {
  const printer = getPrinter();
  devLog('info', `Kağıt besleme: ${lines} satır`);
  if (lines > 0) {
    await (printer as any).feed(lines);
  } else {
    await (printer as any).retract(Math.abs(lines));
  }
}

export async function printCanvas(canvas: HTMLCanvasElement): Promise<void> {
  const printer = getPrinter();
  const topPad = 60;
  const bottomPad = 200;
  const feedCanvas = document.createElement('canvas');
  feedCanvas.width = canvas.width;
  feedCanvas.height = canvas.height + topPad + bottomPad;
  const feedCtx = feedCanvas.getContext('2d')!;
  feedCtx.fillStyle = 'white';
  feedCtx.fillRect(0, 0, feedCanvas.width, feedCanvas.height);
  feedCtx.drawImage(canvas, 0, topPad);
  const dataUrl = feedCanvas.toDataURL('image/png');

  devLog('info', `Baskı: ${feedCanvas.width}x${feedCanvas.height}px (pad: ${topPad}+${bottomPad})`);
  await printer.printImage(dataUrl);
  devLog('info', 'Baskı tamamlandı');
}

export async function printImageFromUrl(url: string): Promise<void> {
  const printer = getPrinter();
  devLog('info', `Görsel basılıyor: ${url.slice(0, 60)}...`);
  await printer.printImage(url);
  devLog('info', 'Görsel baskı tamamlandı');
}

export async function printText(text: string, options?: {
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
}): Promise<void> {
  const printer = getPrinter();
  devLog('info', `Metin: "${text.slice(0, 40)}..." font:${options?.fontSize || 24}`);
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
