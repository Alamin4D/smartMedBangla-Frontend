"use client";

import { Bot, Loader2, Mic, MicOff, SendHorizonal, Trash2, User, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ErrorState, ListSkeleton } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { speak } from "@/lib/voice";
import { useChatHistory, useClearChat, useSendChat } from "./api";
import { useT } from "@/hooks/use-t";

const SUGGESTIONS = {
  bn: ["নাপা কেন খাই?", "চায়ের সাথে কি ওষুধ খাওয়া যায়?", "ডায়াবেটিসে কী খাবার ভালো?", "ওষুধ খেতে ভুলে গেলে কী করব?"],
  en: ["What is Napa used for?", "Can I take my medicines with tea?", "Which foods are good for diabetes?", "What if I miss a dose?"],
};

type SpeechRecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: { 0: { transcript: string } }[] }) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
};

/** Minimal Markdown-ish rendering: paragraphs, bullet lists and **bold**. */
function MessageText({ text }: { text: string }) {
  return (
    <div className="space-y-2">
      {text.split(/\n{2,}/).map((block, i) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => /^\s*([-*•]|\d+\.)\s+/.test(l));
        const fmt = (s: string) =>
          s.split(/(\*\*[^*]+\*\*)/g).map((part, j) => (part.startsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part));
        return isList ? (
          <ul key={i} className="list-disc space-y-1 pl-5">
            {lines.map((l, j) => (
              <li key={j}>{fmt(l.replace(/^\s*([-*•]|\d+\.)\s+/, ""))}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="whitespace-pre-wrap">
            {fmt(block)}
          </p>
        );
      })}
    </div>
  );
}

export function ChatPanel() {
  const history = useChatHistory();
  const send = useSendChat();
  const clear = useClearChat();
  const [message, setMessage] = useState("");
  const { t, lang } = useT();
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history.data?.length, send.isPending]);

  const submit = (text = message) => {
    const trimmed = text.trim();
    if (!trimmed || send.isPending) return;
    setMessage("");
    send.mutate(trimmed, { onError: (e) => toast.error(errorMessage(e)) });
  };

  /** Voice input via the Web Speech API (Bangla). */
  const toggleMic = () => {
    const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return toast.error(t("Voice input is not supported in this browser", "এই ব্রাউজারে ভয়েস ইনপুট কাজ করে না"));
    if (listening) return recognitionRef.current?.stop();
    const rec = new Ctor();
    rec.lang = lang === "bn" ? "bn-BD" : "en-US";
    rec.interimResults = false;
    rec.onresult = (e) => setMessage((m) => `${m} ${e.results[0]?.[0].transcript ?? ""}`.trim());
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const messages = history.data ?? [];

  return (
    <Card className="flex h-[calc(100vh-13rem)] min-h-[480px] flex-col gap-0 overflow-hidden py-0">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="flex items-center gap-2 font-semibold">
          <Bot className="size-5 text-primary" /> {t("SmartMed Assistant", "স্মার্টমেড সহকারী")}
        </p>
        {messages.length > 0 && (
          <ConfirmDialog
            title={t("Clear this conversation?", "কথোপকথন মুছে ফেলবেন?")}
            confirmLabel={t("Clear", "মুছুন")}
            onConfirm={() => clear.mutate()}
            trigger={
              <Button variant="ghost" size="sm">
                <Trash2 /> {t("Clear", "মুছুন")}
              </Button>
            }
          />
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {history.isLoading && <ListSkeleton rows={3} />}
        {history.error && <ErrorState error={history.error} onRetry={history.refetch} />}
        {!history.isLoading && messages.length === 0 && (
          <div className="mx-auto max-w-md py-8 text-center">
            <Bot className="mx-auto size-12 text-primary" />
            <h2 className="mt-3 text-lg font-semibold">{t("Ask me anything about your medicines", "আপনার ওষুধ নিয়ে যা খুশি জিজ্ঞাসা করুন")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("I know your current medicine list. I am not a doctor — for emergencies call 999.", "আমি আপনার ওষুধের তালিকা জানি। আমি ডাক্তার নই — জরুরি প্রয়োজনে ৯৯৯ এ কল করুন।")}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS[lang].map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => submit(s)}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={cn("flex gap-3", m.role === "USER" && "flex-row-reverse")}>
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full",
                m.role === "USER" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground",
              )}
            >
              {m.role === "USER" ? <User className="size-4" /> : <Bot className="size-4" />}
            </span>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-[0.95rem]",
                m.role === "USER" ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-muted",
              )}
            >
              <MessageText text={m.content} />
              {m.role === "ASSISTANT" && (
                <button
                  type="button"
                  onClick={() => speak(m.content.replace(/[*#]/g, ""))}
                  className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Volume2 className="size-3.5" /> {t("Listen", "শুনুন")}
                </button>
              )}
            </div>
          </div>
        ))}
        {send.isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> {t("Thinking…", "ভাবছি…")}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex items-end gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Button type="button" variant={listening ? "destructive" : "outline"} size="icon" onClick={toggleMic} aria-label={listening ? t("Stop voice input", "ভয়েস ইনপুট বন্ধ") : t("Speak your question", "মুখে প্রশ্ন বলুন")}>
          {listening ? <MicOff /> : <Mic />}
        </Button>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          maxLength={1000}
          placeholder={t("Type your question in Bangla or English…", "বাংলা বা ইংরেজিতে প্রশ্ন লিখুন…")}
          className="max-h-32 min-h-10 flex-1 resize-none"
          aria-label={t("Message", "বার্তা")}
        />
        <Button type="submit" size="icon" disabled={!message.trim() || send.isPending} aria-label={t("Send", "পাঠান")}>
          <SendHorizonal />
        </Button>
      </form>
    </Card>
  );
}
