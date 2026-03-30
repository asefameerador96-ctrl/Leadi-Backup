import React, { useEffect, useMemo, useRef, useState } from "react";
import { sendMessageToN8N } from "@/lib/n8nClient";
import { useAuth } from "@/context/AuthContext";
import { useLeaderboard } from "@/context/LeaderboardContext";
import { TSOData } from "@/types/leaderboard";

const normalize = (value?: string) => String(value || "").trim().toLowerCase();

const buildTsoGuidanceMessage = (record: TSOData | null) => {
  if (!record) {
    return "Welcome. Your personalized performance guidance will appear as soon as your latest leaderboard data is available.";
  }

  const focusAreas = [
    {
      label: "Volume Size",
      score: record.volumeSizePercent,
      tip: "push higher-value orders and close the day with stronger volume from priority outlets",
    },
    {
      label: "Memo Size",
      score: record.memoSizePercent,
      tip: "increase lines per bill and upsell more products in each memo",
    },
    {
      label: "PMPD",
      score: record.pmpdPercent,
      tip: "improve daily productivity by tightening route execution and outlet coverage",
    },
    {
      label: "Sales per Memo",
      score: record.salesPerMemoPercent,
      tip: "focus on better conversion quality so each memo generates more value",
    },
    {
      label: "Outlet Reach",
      score: record.outletReachPercent,
      tip: "visit more active outlets consistently and reduce missed calls in your route",
    },
  ].sort((a, b) => a.score - b.score);

  const topFocusAreas = focusAreas.slice(0, 2);
  const tone =
    record.overallPercent >= 80
      ? "Great momentum—keep protecting your strong areas while polishing the weaker ones."
      : record.overallPercent >= 65
        ? "You are in a good position, and a little sharper execution can lift your rank quickly."
        : "There is clear room to improve, and focusing on the right two areas first should help most.";

  const focusText = topFocusAreas
    .map((area, index) => `${index + 1}. ${area.label} (${area.score.toFixed(1)}%) — ${area.tip}`)
    .join(" ");

  return `Assalamualaikum ${record.name}. Your current overall score is ${record.overallPercent.toFixed(1)}%. ${tone} Suggested focus areas: ${focusText}`;
};

const Chatbot: React.FC = () => {
  const { user } = useAuth();
  const { tsoData } = useLeaderboard();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ from: string; text: string }>>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [autoOpenedForUserId, setAutoOpenedForUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const currentTsoRecord = useMemo(() => {
    if (user?.role !== "tso") return null;

    return (
      tsoData.find((row) => {
        if (normalize(row.username) && normalize(user.username)) {
          return normalize(row.username) === normalize(user.username);
        }
        if (normalize(row.territory_code) && normalize(user.territory_code)) {
          return normalize(row.territory_code) === normalize(user.territory_code);
        }
        return normalize(row.territory) === normalize(user.territory);
      }) || null
    );
  }, [user, tsoData]);

  const isTsoGuidanceMode = user?.role === "tso";
  const tsoGuidanceMessage = useMemo(() => buildTsoGuidanceMessage(currentTsoRecord), [currentTsoRecord]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!user) {
      setOpen(false);
      setMessages([]);
      setAutoOpenedForUserId(null);
      return;
    }

    if (isTsoGuidanceMode && autoOpenedForUserId !== user.id) {
      setMessages([{ from: "bot", text: tsoGuidanceMessage }]);
      setOpen(true);
      setAutoOpenedForUserId(user.id);
    }
  }, [user, isTsoGuidanceMode, tsoGuidanceMessage, autoOpenedForUserId]);

  const handleSend = async () => {
    if (isTsoGuidanceMode) return;

    const text = input.trim();
    if (!text) return;

    const userMsg = { from: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await sendMessageToN8N({ text });
      const reply = res?.reply || res?.message || "(no reply)";
      setMessages((m) => [...m, { from: "bot", text: String(reply) }]);
    } catch {
      setMessages((m) => [...m, { from: "bot", text: "Error: failed to contact chatbot backend." }]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div>
      <div className="fixed right-4 bottom-4 z-50">
        {open ? (
          <div className="flex h-96 w-80 flex-col overflow-hidden rounded-lg bg-white shadow-lg dark:bg-slate-900">
            <div className="flex items-center justify-between border-b px-3 py-2 dark:border-slate-800">
              <div className="font-medium">{isTsoGuidanceMode ? "Performance Coach" : "Help Chat"}</div>
              <button onClick={() => setOpen(false)} className="text-sm text-slate-500">Close</button>
            </div>
            <div className="flex-1 space-y-2 overflow-auto bg-neutral-50 p-3 dark:bg-slate-800">
              {messages.length === 0 && (
                <div className="text-sm text-slate-500">
                  {isTsoGuidanceMode ? "Your personalized guidance will appear here." : "Ask me anything about the platform."}
                </div>
              )}
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      message.from === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-900 dark:bg-slate-700 dark:text-slate-100"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            {isTsoGuidanceMode ? (
              <div className="border-t bg-emerald-50 px-3 py-2 text-xs text-emerald-900 dark:border-slate-800 dark:bg-slate-900 dark:text-emerald-200">
                Guidance is based on your latest leaderboard breakdown and is shown automatically after TSO login.
              </div>
            ) : (
              <div className="border-t p-2 dark:border-slate-800">
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded border px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Type a message..."
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            aria-label="Open chat"
            className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg ${
              isTsoGuidanceMode ? "bg-emerald-600" : "bg-blue-600"
            }`}
          >
            💬
          </button>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
