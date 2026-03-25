import { useEffect, useMemo, useRef, useState } from "react";
import type { KanaEntry, KanaType } from "../data/kana";
import { getKanaChar, getKanaOrigin } from "../data/kana";

interface DetailPanelProps {
  kana: KanaEntry | null;
  activeType: KanaType;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  previousKana?: KanaEntry | null;
  nextKana?: KanaEntry | null;
  currentIndex?: number;
  totalCount?: number;
}

type AudioState = "idle" | "playing" | "error";
type AudioSource = "local" | "tts" | null;

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
const EXIT_DURATION_MS = 180;

export default function DetailPanel({
  kana,
  activeType,
  onClose,
  onPrevious,
  onNext,
  previousKana,
  nextKana,
  currentIndex = -1,
  totalCount = 0,
}: DetailPanelProps) {
  const [audioState, setAudioState] = useState<AudioState>("idle");
  const [audioSource, setAudioSource] = useState<AudioSource>(null);
  const [displayKana, setDisplayKana] = useState<KanaEntry | null>(kana);
  const [isVisible, setIsVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const openFrameRef = useRef<number | null>(null);
  const openFrameNestedRef = useRef<number | null>(null);

  const primaryChar = useMemo(
    () => (displayKana ? getKanaChar(displayKana, activeType) : ""),
    [activeType, displayKana]
  );
  const activeLabel = activeType === "hiragana" ? "平假名" : "片假名";
  const inactiveLabel = activeType === "hiragana" ? "片假名" : "平假名";
  const progressLabel = currentIndex >= 0 && totalCount > 0 ? `${currentIndex + 1} / ${totalCount}` : null;

  useEffect(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (openFrameRef.current) {
      window.cancelAnimationFrame(openFrameRef.current);
      openFrameRef.current = null;
    }

    if (openFrameNestedRef.current) {
      window.cancelAnimationFrame(openFrameNestedRef.current);
      openFrameNestedRef.current = null;
    }

    if (kana) {
      setDisplayKana(kana);

      if (!displayKana) {
        setIsVisible(false);
        openFrameRef.current = window.requestAnimationFrame(() => {
          openFrameNestedRef.current = window.requestAnimationFrame(() => {
            setIsVisible(true);
            openFrameRef.current = null;
            openFrameNestedRef.current = null;
          });
        });
      } else {
        setIsVisible(true);
      }

      return;
    }

    if (displayKana) {
      setIsVisible(false);
      closeTimerRef.current = window.setTimeout(() => {
        setDisplayKana(null);
        closeTimerRef.current = null;
      }, EXIT_DURATION_MS);
    }
  }, [kana, displayKana]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
      if (openFrameRef.current) {
        window.cancelAnimationFrame(openFrameRef.current);
      }
      if (openFrameNestedRef.current) {
        window.cancelAnimationFrame(openFrameNestedRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!displayKana) {
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
      panelRef.current?.focus();
    }, 40);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowLeft" && onPrevious) {
        event.preventDefault();
        onPrevious();
        return;
      }

      if (event.key === "ArrowRight" && onNext) {
        event.preventDefault();
        onNext();
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
  }, [displayKana, onClose, onNext, onPrevious]);

  useEffect(() => {
    setAudioState("idle");
    setAudioSource(null);
  }, [displayKana, activeType]);

  if (!displayKana) {
    return null;
  }

  const handlePlayLocalAudio = () => {
    if (!displayKana.audio) {
      return false;
    }

    const audio = new Audio(displayKana.audio);
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

  const audioSummary = displayKana.audio
    ? audioSource === "local"
      ? "正在优先播放本地音频资源。"
      : "可以播放录音；如果录音暂时不可用，会改用浏览器朗读。"
    : "暂时没有录音，可以先用浏览器朗读听一遍。";

  const audioErrorMessage =
    audioSource === "local"
      ? "录音暂时不可用，可以先用浏览器朗读。"
      : "当前浏览器暂时无法朗读。";

  const audioStatusLabel =
    audioState === "playing" ? "播放中" : audioState === "error" ? "播放异常" : "待播放";
  const audioSourceLabel =
    audioSource === "local" ? "录音" : audioSource === "tts" ? "浏览器朗读" : null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 transition duration-200 ease-out ${
        isVisible ? "bg-stone-900/35 opacity-100" : "bg-stone-900/0 opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
      aria-hidden={!isVisible}
    >
      <div
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby="kana-detail-title"
        className={`max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-stone-300 bg-[#fbf8f1] shadow-[0_24px_80px_rgba(28,25,23,0.16)] will-change-transform transition duration-300 ease-out ${
          isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.985] opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-stone-300 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Detail</p>
              <h2 id="kana-detail-title" className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-stone-900 sm:text-4xl">
                {displayKana.romaji}
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                {displayKana.row} · 当前主视图：{activeLabel}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {progressLabel ? (
                <span className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs text-stone-500">
                  {progressLabel}
                </span>
              ) : null}
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-600 transition hover:border-stone-500 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
              >
                关闭
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-stone-200 pt-5 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-end">
            <div>
              <div className="inline-flex rounded-full border border-stone-300 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.28em] text-stone-500">
                {activeLabel}
              </div>
              <div lang="ja-JP" className="mt-4 text-[88px] font-semibold leading-none tracking-[-0.06em] text-stone-900 sm:text-[112px]">
                {primaryChar}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-500">
                <span className="rounded-full border border-stone-300 bg-white px-3 py-1">罗马音：{displayKana.romaji}</span>
                <span className="rounded-full border border-stone-300 bg-white px-3 py-1">所在列：{displayKana.column.toUpperCase()}</span>
                <span className="rounded-full border border-stone-300 bg-white px-3 py-1">对照：{inactiveLabel}</span>
              </div>
            </div>
            <div className="border border-stone-300 bg-white p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-stone-500">学习提示</div>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                先记当前主视图字符，再用右侧对照确认另一套写法，最后播放发音把字形和声音绑在一起。
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 border-t border-stone-200 pt-5 sm:grid-cols-2">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!onPrevious}
              className="flex items-center justify-between border border-stone-300 bg-white px-4 py-3 text-left transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>
                <span className="block text-xs uppercase tracking-[0.28em] text-stone-400">上一个</span>
                <span className="mt-2 block text-sm text-stone-700">{previousKana ? previousKana.romaji : "已经是第一个"}</span>
              </span>
              <span lang="ja-JP" className="text-2xl text-stone-900">{previousKana ? getKanaChar(previousKana, activeType) : "—"}</span>
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!onNext}
              className="flex items-center justify-between border border-stone-300 bg-white px-4 py-3 text-left transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>
                <span className="block text-xs uppercase tracking-[0.28em] text-stone-400">下一个</span>
                <span className="mt-2 block text-sm text-stone-700">{nextKana ? nextKana.romaji : "已经是最后一个"}</span>
              </span>
              <span lang="ja-JP" className="text-2xl text-stone-900">{nextKana ? getKanaChar(nextKana, activeType) : "—"}</span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`border p-4 transition duration-200 ${activeType === "hiragana" ? "border-stone-900 bg-stone-100" : "border-stone-300 bg-white"}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.28em] text-stone-500">平假名</div>
                {activeType === "hiragana" ? <span className="text-xs text-stone-500">当前焦点</span> : null}
              </div>
              <div lang="ja-JP" className="mt-4 text-6xl font-semibold leading-none text-stone-900">{displayKana.hiragana}</div>
              <div className="mt-4 text-sm text-stone-500">字源：{getKanaOrigin(displayKana, "hiragana") ?? "待补充"}</div>
            </div>
            <div className={`border p-4 transition duration-200 ${activeType === "katakana" ? "border-stone-900 bg-stone-100" : "border-stone-300 bg-white"}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.28em] text-stone-500">片假名</div>
                {activeType === "katakana" ? <span className="text-xs text-stone-500">当前焦点</span> : null}
              </div>
              <div lang="ja-JP" className="mt-4 text-6xl font-semibold leading-none text-stone-900">{displayKana.katakana}</div>
              <div className="mt-4 text-sm text-stone-500">字源：{getKanaOrigin(displayKana, "katakana") ?? "待补充"}</div>
            </div>
          </div>

          <div className="border border-stone-300 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-stone-500">发音</div>
                <div className="mt-2 max-w-lg text-sm leading-7 text-stone-600">{audioSummary}</div>
              </div>
              <button
                type="button"
                onClick={handlePlayAudio}
                className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-stone-50 transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
                aria-live="polite"
              >
                {audioState === "playing" ? "播放中…" : `播放 ${primaryChar}`}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-500">
              <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1">播放方式：录音优先</span>
              <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1">状态：{audioStatusLabel}</span>
              {audioSource ? <span className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1">来源：{audioSourceLabel}</span> : null}
            </div>
            {audioState === "error" ? <p className="mt-3 text-sm text-amber-700">{audioErrorMessage}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-stone-300 bg-white p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-stone-500">罗马音</div>
              <div className="mt-2 text-2xl font-semibold text-stone-900">{displayKana.romaji}</div>
            </div>
            <div className="border border-stone-300 bg-white p-4">
              <div className="text-xs uppercase tracking-[0.28em] text-stone-500">所在列</div>
              <div className="mt-2 text-2xl font-semibold text-stone-900">{displayKana.column.toUpperCase()}</div>
            </div>
          </div>

          <div className="border border-stone-300 bg-white p-4">
            <div className="text-xs uppercase tracking-[0.28em] text-stone-500">学习备注</div>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              {displayKana.notes ?? "这一项暂时还没有补充说明。"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
