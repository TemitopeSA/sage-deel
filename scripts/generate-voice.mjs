// Renders the executive demo narration to /public/voice with macOS `say`, and records clip
// durations so demo beats stay in sync with the audio.
// Usage: npm run voice            (default voice)
//        VOICE="Ava (Premium)" npm run voice
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const voice = process.env.VOICE ?? "Samantha";
const rate = process.env.RATE ?? "178";
const script = JSON.parse(readFileSync("data/demoScript.json", "utf8"));
const tmp = mkdtempSync(join(tmpdir(), "sage-voice-"));
const manifest = { voice, clips: {} };

for (const beat of script) {
  const aiff = join(tmp, `${beat.id}.aiff`);
  const out = `public/voice/${beat.id}.m4a`;
  execFileSync("say", ["-v", voice, "-r", rate, "-o", aiff, beat.speech ?? beat.caption]);
  execFileSync("afconvert", ["-f", "m4af", "-d", "aac", aiff, out]);
  const info = execFileSync("afinfo", [out], { encoding: "utf8" });
  const seconds = Number(info.match(/estimated duration: ([\d.]+)/)[1]);
  manifest.clips[beat.id] = Math.round(seconds * 1000);
  console.log(`${beat.id.padEnd(16)} ${seconds.toFixed(1)}s`);
}

writeFileSync("data/voiceManifest.json", JSON.stringify(manifest, null, 2) + "\n");
rmSync(tmp, { recursive: true, force: true });
