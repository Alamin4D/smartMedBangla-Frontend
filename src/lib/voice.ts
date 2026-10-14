/**
 * Web Speech API helpers – reads reminders aloud in Bangla (or English).
 * Browsers load voices asynchronously, so we wait for them once.
 */
let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve([]);
  voicesReady ??= new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) return resolve(existing);
    const done = () => resolve(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 1500);
  });
  return voicesReady;
}

export const isSpeechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

const looksBangla = (text: string) => /[ঀ-৿]/.test(text);

export async function hasBanglaVoice() {
  const voices = await loadVoices();
  return voices.some((v) => v.lang.toLowerCase().startsWith("bn"));
}

export async function speak(text: string, opts: { rate?: number } = {}) {
  if (!isSpeechSupported() || !text) return false;
  const voices = await loadVoices();
  const bangla = looksBangla(text);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = bangla ? "bn-BD" : "en-US";
  utterance.voice =
    (bangla
      ? voices.find((v) => v.lang.toLowerCase().startsWith("bn"))
      : voices.find((v) => v.lang.toLowerCase().startsWith("en"))) ?? null;
  utterance.rate = opts.rate ?? 0.9; // a little slower for elderly listeners
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export const stopSpeaking = () => isSpeechSupported() && window.speechSynthesis.cancel();
