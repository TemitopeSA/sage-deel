// Renders the executive demo narration with Kokoro (open-source neural TTS, Apache-2.0),
// running locally. kokoro-js is intentionally not a project dependency; install it anywhere:
//   npm i --no-save kokoro-js    (or point KOKORO_JS at an existing install)
// Usage: npm run voice:neural            (default voice af_heart)
//        KOKORO_VOICE=af_bella npm run voice:neural
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const { KokoroTTS } = await import(process.env.KOKORO_JS ?? "kokoro-js");
const voice = process.env.KOKORO_VOICE ?? "af_heart";
const speed = Number(process.env.KOKORO_SPEED ?? "1");
const script = JSON.parse(readFileSync("data/demoScript.json", "utf8"));
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
const tmp = mkdtempSync(join(tmpdir(), "sage-voice-"));
const manifest = { voice: `kokoro:${voice}`, clips: {} };

for (const beat of script) {
  const wav = join(tmp, `${beat.id}.wav`);
  const out = `public/voice/${beat.id}.m4a`;
  const audio = await tts.generate(beat.speech ?? beat.caption, { voice, speed });
  await audio.save(wav);
  execFileSync("afconvert", ["-f", "m4af", "-d", "aac", wav, out]);
  const info = execFileSync("afinfo", [out], { encoding: "utf8" });
  const seconds = Number(info.match(/estimated duration: ([\d.]+)/)[1]);
  manifest.clips[beat.id] = Math.round(seconds * 1000);
  console.log(`${beat.id.padEnd(16)} ${seconds.toFixed(1)}s`);
}

writeFileSync("data/voiceManifest.json", JSON.stringify(manifest, null, 2) + "\n");
rmSync(tmp, { recursive: true, force: true });
