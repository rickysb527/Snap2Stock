import type { Vehicle } from '../types';

interface AnalysisResult {
  vehicle?: Partial<Vehicle>;
  text?: string;
}

export async function analyzeImage(file: File, purpose: 'vehicle' | 'identify'): Promise<AnalysisResult> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
    throw new Error('JPEG・PNG・WebP形式の3MB以下の画像を選んでください。');
  }
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('画像を読み込めませんでした。'));
    reader.readAsDataURL(file);
  });
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ purpose, data, mimeType: file.type }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result) {
    throw new Error(result?.error || '画像解析APIに接続できませんでした。');
  }
  return result;
}
