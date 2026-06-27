import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { MessageSquare, Send, Loader2, ChevronRight, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Thread {
  patientName: string;
  ward: string;
  content: string;
  senderName: string;
  senderRole: string;
  createdAt: string;
  total: string;
  unreadFromFamily: string;
}

interface Message {
  id: number;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

function fmtThreadTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "d MMM");
}

function fmtMsgTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true });
  return format(d, "d MMM, HH:mm");
}

export function StaffMessages() {
  const { toast } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const fetchThreads = async () => {
    try {
      const res = await fetch("/api/messages/threads", { credentials: "include" });
      const data = await res.json();
      setThreads(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Failed to load messages", variant: "destructive" });
    } finally {
      setThreadsLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    const fetchPromise = fetch("/api/messages/threads", { credentials: "include" });
    const minDelay = new Promise<void>(r => setTimeout(r, 900));
    try {
      const res = await fetchPromise;
      const data = await res.json();
      setThreads(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Failed to load messages", variant: "destructive" });
    }
    await minDelay;
    setRefreshing(false);
  };

  useEffect(() => {
    setThreadsLoading(true);
    fetchThreads();
    const id = setInterval(() => fetchThreads(), 60_000);
    return () => clearInterval(id);
  }, []);

  // Auto-refresh messages in open thread every 15s
  useEffect(() => {
    if (!selected) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/messages?patientName=${encodeURIComponent(selected.patientName)}&ward=${encodeURIComponent(selected.ward)}`,
          { credentials: "include" }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setMessages(data.reverse());
      } catch {}
    }, 15_000);
    return () => clearInterval(id);
  }, [selected]);

  const openThread = async (thread: Thread) => {
    setSelected(thread);
    setMsgLoading(true);
    setMessages([]);
    try {
      const res = await fetch(
        `/api/messages?patientName=${encodeURIComponent(thread.patientName)}&ward=${encodeURIComponent(thread.ward)}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setMessages(Array.isArray(data) ? data.reverse() : []);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

      // Mark family messages as read
      await fetch("/api/messages/read-thread", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientName: thread.patientName, ward: thread.ward }),
      });
      // Update thread unread count locally
      setThreads(prev => prev.map(t =>
        t.patientName === thread.patientName && t.ward === thread.ward
          ? { ...t, unreadFromFamily: "0" }
          : t
      ));
    } catch {
      toast({ title: "Failed to load thread", variant: "destructive" });
    } finally {
      setMsgLoading(false);
    }
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientName: selected.patientName, ward: selected.ward, content: reply.trim() }),
      });
      if (!res.ok) throw new Error();
      const msg = await res.json();
      setMessages(prev => [...prev, msg]);
      setReply("");
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      // Refresh threads to update latest message preview
      fetchThreads();
    } catch {
      toast({ title: "Failed to send reply", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (selected) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => { setSelected(null); fetchThreads(); }}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all messages
        </button>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-base">{selected.patientName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{selected.ward} · Family message thread</p>
            </div>
            <span className="text-xs text-slate-400 bg-white border border-slate-200 rounded-full px-2.5 py-1">
              {selected.total} message{parseInt(selected.total) !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="p-4 space-y-3 min-h-[300px] max-h-[500px] overflow-y-auto">
            {msgLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No messages yet.</div>
            ) : messages.map(m => {
              const isStaff = m.senderRole === "staff";
              return (
                <div key={m.id} className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    isStaff
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-800 rounded-bl-sm"
                  }`}>
                    {!isStaff && (
                      <p className="text-xs font-semibold text-slate-600 mb-1">{m.senderName} · Family</p>
                    )}
                    <p className="text-sm leading-relaxed">{m.content}</p>
                    <p className={`text-xs mt-1 ${isStaff ? "text-white/60" : "text-slate-400"}`}>
                      {isStaff ? `${m.senderName} · ` : ""}{fmtMsgTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>

          <div className="p-4 border-t border-slate-200 flex gap-2">
            <Textarea
              placeholder="Reply to family..."
              value={reply}
              onChange={e => setReply(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              className="resize-none h-10 min-h-[40px] text-sm py-2"
              rows={1}
            />
            <Button size="sm" onClick={sendReply} disabled={!reply.trim() || sending} className="shrink-0">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Family Messages</h2>
          <p className="text-sm text-slate-500 mt-0.5">All patient message threads from families.</p>
        </div>
        <button
          onClick={handleManualRefresh}
          className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 border transition-all ${
            refreshing
              ? "border-primary/30 bg-primary/5 text-primary cursor-default"
              : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary hover:bg-primary/5 cursor-pointer"
          }`}
        >
          <RefreshCw className={`w-4 h-4 transition-transform ${refreshing ? "animate-spin text-primary" : ""}`} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {threadsLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-3 w-48 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No messages yet</p>
          <p className="text-slate-400 text-sm mt-1">Messages from families will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {threads.map(thread => {
            const unread = parseInt(thread.unreadFromFamily ?? "0", 10);
            const lastFromFamily = thread.senderRole !== "staff";
            return (
              <button
                key={`${thread.patientName}-${thread.ward}`}
                onClick={() => openThread(thread)}
                className={`w-full overflow-hidden text-left bg-white border rounded-xl p-4 hover:border-primary hover:shadow-sm transition-all group flex items-center gap-4 ${unread > 0 ? "border-primary/30 bg-primary/[0.02]" : "border-slate-200"}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative ${unread > 0 ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                  <MessageSquare className="w-5 h-5" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-semibold transition-colors ${unread > 0 ? "text-primary" : "text-slate-900 group-hover:text-primary"}`}>
                      {thread.patientName}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0">{fmtThreadTime(thread.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{thread.ward} · {thread.total} message{parseInt(thread.total) !== 1 ? "s" : ""}</p>
                  <p className={`text-sm mt-1 truncate ${unread > 0 ? "font-medium text-slate-800" : "text-slate-500"}`}>
                    <span className={`${lastFromFamily ? "text-primary" : "text-slate-400"} shrink-0`}>
                      {lastFromFamily ? "Family: " : "You: "}
                    </span>
                    {thread.content}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
