"""Fallback transcriber: openai-whisper with word timestamps -> transcript.json.
Usage: python scripts/transcribe_whisper.py <audio> <out.json> [small.en|medium.en]"""
import json, sys
import whisper  # pip install openai-whisper

audio, out = sys.argv[1], sys.argv[2]
model_name = sys.argv[3] if len(sys.argv) > 3 else "small.en"
model = whisper.load_model(model_name)
res = model.transcribe(audio, word_timestamps=True, language="en")
words = [
    {"text": w["word"].strip(), "start": round(w["start"], 3), "end": round(w["end"], 3)}
    for seg in res["segments"] for w in seg.get("words", []) if w["word"].strip()
]
with open(out, "w", encoding="utf-8") as f:
    json.dump({"engine": "openai-whisper", "model": model_name, "words": words}, f, indent=1)
print(f"Saved {len(words)} words -> {out}")
