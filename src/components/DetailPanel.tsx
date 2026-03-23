import { useEffect, useMemo, useRef, useState } from "react";
import type { KanaEntry, KanaType } from "../data/kana";
import { getKanaChar, getKanaOrigin } from "../data/kana";

interface DetailPanelProps {
  kana: KanaEntry | null;
  activeType: KanaType;
  onClose: () => void;
}

type AudioState = "idle" | "playing" | "error";
type AudioSource = "local" | "tts" | null;

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function DetailPanel({ kana, activeType, onClose }: DetailPanelProps) {
  const [audioState, setAudioState] = useState<AudioState>("idle");
  const [audioSource, setAudioSource] = useState<AudioSource>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const primaryChar = useMemo(() => (kana ? getKanaChar(kana, activeType) : ""), [activeType, kana]);

  useEffect(() => {
    if (!kana) {
      return;
    }

    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    const previousLeft = document.body.style.left;
    const previousRight = document.body.style.right;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.left = previousLeft;
      document.body.style.right = previousRight;
      document.body.style.width = previousWidth;
      window.scrollTo({ top: scrollY, behavior: "auto" });
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
      audioRef.current = null;
      lastFocusedElementRef.current?.focus();
    };
  }, [kana, onClose]);

  useEffect(() => {
    setAudioState("idle");
    setAudioSource(null);
  }, [kana]);

  if (!kana) {
    return null;
  }

  const handlePlayLocalAudio = () => {
    if (!kana.audio) {
      return false;
    }

    const audio = new Audio(kana.audio);
    audioRef.current?.pause();
    audioRef.current = audio;
    setAudioSource("local");
    setAudioState("playing");
    audio.onended = () => setAudioState("idle");
    audio.onerror = () => {
      setAudioState("error");
      setAudioSource("local");
    };
    void audio.play().catch(() => {
      setAudioState("error");
      setAudioSource("local");
    });
    return true;
  };

  const handleSpeakWithTTS = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setAudioState("error");
      setAudioSource("tts");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(primaryChar);
    utterance.lang = "ja-JP";
    utterance.rate = 0.8;
    utterance.onstart = () => {
      setAudioState("playing");
      setAudioSource("tts");
    };
    utterance.onend = () => setAudioState("idle");
    utterance.onerror = () => setAudioState("error");
    window.speechSynthesis.speak(utterance);
  };

  const handlePlayAudio = () => {
    if (handlePlayLocalAudio()) {
      return;
    }

    handleSpeakWithTTS();
  };

  const audioSummary = kana.audio
    ? audioSource === "local"
      ? "正在优先播放本地音频资源。"
      : "当前字符已预留本地音频字段，必要时可回退到浏览器语音。"
    : "当前没有本地音频，使用浏览器语音作为兜底入口。";

  const audioErrorMessage =
    audioSource === "local"
      ? "本地音频当前不可用，建议检查资源路径或继续使用浏览器语音兜底。"
      : "当前浏览器不支持语音播放，可在后续接入本地音频资源。";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/35 px-4 py-6" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kana-detail-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-stone-300 bg-[#fbf8f1] shadow-[0_24px_80px_rgba(28,25,23,0.16)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-300 px-5 py-5 sm:px-7 sm:py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Detail</p>
            <h2 id="kana-detail-title" className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-900 sm:text-4xl">
              {kana.romaji}
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              {kana.row} · {activeType === "hiragana" ? "当前查看平假名" : "当前查看片假名"}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-600 transition hover:border-stone-500 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
          >
            关闭
          </button>
        </div>

        <div className="grid gap-6 px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`border p-4 ${activeType === "hiragana" ? "border-stone-900 bg-stone-100" : "border-stone-300 bg-white"}`}>
              <div className="text-xs uppercase tracking-[0.28em] text-stone-500">平假名</div>
              <div className="mt-4 text-6xl font-semibold leading-none text-stone-900">{kana.hiragana}</div>
              <div className="mt-4 text-sm text-stone-500">字源：{getKanaOrigin(kana, "hiragana") ?? "待补充"}</div>
            </div>
            <div className={`border p-4 ${activeType === "katakana" ? "border-stone-900 bg-stone-100" : "border-stone-300 bg-white"}`}>
              <div className="text-xs uppercase tracking-[0.28em] text-stone-500">片假名</div>
              <div className="mt-4 text-6xl font-semibold leading-none text-stone-900">{kana.katakana}</div>
              <div className="mt-4 text-sm text-stone-500">字源：{getKanaOrigin(kana, "katakana") ?? "待补充"}</div>
            </div>
          </div>

          <div className="border border-stone-300 bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-stone-500">发音</div>
                <div className="mt-2 max-w-lg text-sm leading-7 text-stone-600">{audioSummary}</div>
              </div>
              <button
                type="button"
                onClick={handlePlayAudio}
                className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400"
                aria-live="polite"
              >
                {audioState === "playing" ? "播放中…" : "播放发音"}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-stone-500">
              <span>优先级：本地音频 → TTS</span>
              <span>状态：{audioState}</span>
              {audioSource ? <span>来源：{audioSource}</span> : null}
            </div>
            {audioState === "error" ? <p className="mt-3 text-sm text-amber-700">{audioErrorMessage}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-stone-300 bg-white p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-stone-500">罗马音</div>
              <div className="mt-2 text-2xl font-semibold text-stone-900">{kana.romaji}</div>
            </div>
            <div className="border border-stone-300 bg-white p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-stone-500">所在列</div>
              <div className="mt-2 text-2xl font-semibold text-stone-900">{kana.column.toUpperCase()}</div>
            </div>
          </div>

          <div className="border border-stone-300 bg-white p-4">
            <div className="text-xs uppercase tracking-[0.28em] text-stone-500">学习备注</div>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              {kana.notes ?? "这一项还没有额外备注，后续可以继续补充记忆提示与常见读音场景。"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
