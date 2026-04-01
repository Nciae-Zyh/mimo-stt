---
name: mimo-stt
version: 1.0.0
description: >
  MiMo-V2-Omni speech-to-text plugin for OpenClaw.
  Transcribes audio (wav/mp3/ogg/m4a) to text via Xiaomi MiMo API.
metadata:
  openclaw:
    requires:
      bins: [node]
      env:
        - MIMO_API_KEY
    plugin: true
    install:
      - id: mimo-stt
        kind: local
        dir: .
        entry: index.ts
---

# MiMo STT Plugin

Speech-to-text for OpenClaw using Xiaomi MiMo-V2-Omni.

## What it does

When a user sends a voice message, OpenClaw automatically calls this plugin to transcribe the audio to text.

**Supported formats:** wav, mp3, ogg, m4a, webm, flac

## Configuration

```json
{
  "plugins": {
    "entries": {
      "mimo-stt": {
        "enabled": true,
        "config": {
          "apiKey": "your-mimo-api-key"
        }
      }
    }
  }
}
```

Or via environment variable:

```bash
export MIMO_API_KEY="your-mimo-api-key"
```

## How it works

1. Reads the audio file
2. Encodes it and sends to Xiaomi MiMo-V2-Omni API
3. Returns the transcription text

No child_process, no shell commands, pure API calls.

## Security

- API key via config or env var, never hardcoded
- No external network calls except to Xiaomi official API
- No file system access beyond reading the input audio file

---

Made with for OpenClaw
