import { GoogleGenAI, Type } from '@google/genai';

const MAX_BASE64_LENGTH = 4 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const fields = ['Automaker', 'ModelOfCar', 'Color', 'Year', 'NumberPlate'];

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return json({ error: 'POSTで画像を送信してください。' }, 405, { Allow: 'POST' });
    }
    if (!request.headers.get('content-type')?.startsWith('application/json')) {
      return json({ error: 'JSON形式で送信してください。' }, 415);
    }
    const raw = await request.text();
    if (raw.length > MAX_BASE64_LENGTH + 1024) {
      return json({ error: '画像が大きすぎます。3MB以下の画像を選んでください。' }, 413);
    }
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
      body = parsed as Record<string, unknown>;
    } catch {
      return json({ error: 'リクエストのJSONが不正です。' }, 400);
    }
    const { purpose, data, mimeType } = body;
    if ((purpose !== 'vehicle' && purpose !== 'identify') ||
        typeof mimeType !== 'string' || !IMAGE_TYPES.has(mimeType) ||
        typeof data !== 'string' || !data.length || data.length > MAX_BASE64_LENGTH ||
        data.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
      return json({ error: 'JPEG・PNG・WebP形式の3MB以下の画像を送信してください。' }, 400);
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return json({ error: '画像解析は未設定です。サーバー側のGEMINI_API_KEYを設定してください。' }, 503);
    }
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
        contents: { parts: [
          { text: purpose === 'vehicle'
            ? 'Extract car details: Automaker, ModelOfCar, Color, Year, NumberPlate. Return ONLY valid JSON with string values.'
            : "Identify the vehicle in this image. Primary: extract the ID or VIN from a QR code containing 'yard-edit-ID' or 'yard-v2:ID|VIN|MAKER|MODEL'. Secondary: read a VIN plate. Return ONLY the ID or full VIN. If unreadable, return NOT_FOUND. No extra text." },
          { inlineData: { data, mimeType } },
        ] },
        config: {
          httpOptions: { timeout: 45_000 },
          ...(purpose === 'vehicle' ? {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: Object.fromEntries(fields.map(field => [field, { type: Type.STRING }])),
            },
          } : {}),
        },
      });
      if (purpose === 'identify') return json({ text: response.text || 'NOT_FOUND' });
      const result = JSON.parse(response.text || '{}');
      if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error();
      return json({ vehicle: Object.fromEntries(fields.filter(field => typeof result[field] === 'string').map(field => [field, result[field]])) });
    } catch {
      // Do not return provider errors: they may include request data or credentials.
      return json({ error: '画像解析に失敗しました。画像を確認して再度お試しください。' }, 502);
    }
  },
};
