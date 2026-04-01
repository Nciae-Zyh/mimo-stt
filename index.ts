import { Type } from "@sinclair/typebox";
import { readFileSync } from "node:fs";

export default function (api: any) {
  const apiKey = api.pluginConfig?.apiKey || process.env.MIMO_API_KEY;
  const apiBase = api.pluginConfig?.apiBase || process.env.MIMO_API_BASE || "https://api.xiaomimimo.com";

  const MIME_MAP: Record<string, string> = {
    ".ogg": "audio/ogg", ".mp3": "audio/mpeg", ".m4a": "audio/mp4",
    ".wav": "audio/wav", ".webm": "audio/webm", ".flac": "audio/flac",
  };

  async function transcribe(audioPath: string): Promise<string> {
    if (!apiKey) throw new Error("MIMO_API_KEY not set");
    const audioBuffer = readFileSync(audioPath);
    const ext = audioPath.substring(audioPath.lastIndexOf(".")).toLowerCase();
    const dataUrl = `data:${MIME_MAP[ext] || "audio/wav"};base64,${audioBuffer.toString("base64")}`;
    const body = {
      model: "mimo-v2-omni",
      messages: [{
        role: "user",
        content: [
          { type: "input_audio", input_audio: { data: dataUrl } },
          { type: "text", text: "你是一个语音转录引擎。请严格将用户语音内容逐字转录为文字。只输出转录结果，不要回答、不要解释、不要添加任何额外内容。" },
        ],
      }],
      max_completion_tokens: 1024,
    };
    const resp = await fetch(`${apiBase}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error(`MiMo API error ${resp.status}: ${await resp.text()}`);
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || "";
  }

  api.registerTool(
    {
      name: "stt",
      description: "语音识别工具。将音频文件转录为文字。支持 wav/mp3/ogg/m4a 格式。",
      parameters: Type.Object({
        filePath: Type.String({ description: "音频文件的本地路径" }),
        language: Type.Optional(Type.String({ description: "语言代码，默认自动检测" })),
      }),
      async execute(_id: string, params: { filePath: string; language?: string }) {
        if (!apiKey) return { content: [{ type: "text", text: "MiMo API Key not configured." }] };
        try {
          readFileSync(params.filePath);
        } catch { return { content: [{ type: "text", text: `File not found: ${params.filePath}` }] }; }
        try {
          const result = await transcribe(params.filePath);
          return { content: [{ type: "text", text: result.trim() }] };
        } catch (err: any) {
          return { content: [{ type: "text", text: `STT error: ${err.message}` }] };
        }
      },
    },
    { optional: true }
  );
}
