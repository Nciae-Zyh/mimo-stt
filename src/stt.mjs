#!/usr/bin/env node
// Standalone CLI for MiMo-V2-Omni STT
import { readFileSync } from "node:fs";
const KEY = process.env.MIMO_API_KEY;
const BASE = process.env.MIMO_API_BASE || "https://api.xiaomimimo.com";
const MIME = {".ogg":"audio/ogg",".mp3":"audio/mpeg",".m4a":"audio/mp4",".wav":"audio/wav",".webm":"audio/webm",".flac":"audio/flac"};
async function run(p) {
  if (!KEY) throw new Error("MIMO_API_KEY not set");
  const b = readFileSync(p);
  const ext = p.substring(p.lastIndexOf(".")).toLowerCase();
  const url = `data:${MIME[ext]||"audio/wav"};base64,${b.toString("base64")}`;
  const r = await fetch(`${BASE}/v1/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json","api-key":KEY},body:JSON.stringify({model:"mimo-v2-omni",messages:[{role:"user",content:[{type:"input_audio",input_audio:{data:url}},{type:"text",text:"你是一个语音转录引擎。只输出转录结果。"}]}],max_completion_tokens:1024})});
  if (!r.ok) throw new Error(`API error ${r.status}`);
  const d = await r.json();
  return d.choices?.[0]?.message?.content || "";
}
const f = process.argv[2];
if (!f) { console.error("Usage: node stt.mjs <audio>"); process.exit(1); }
run(f).then(t=>process.stdout.write(t)).catch(e=>{console.error(e.message);process.exit(1)});
