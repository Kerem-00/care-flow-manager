import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  BlockedSlot,
  BlockedSlotType,
  BLOCK_LABELS,
  BLOCK_COLORS,
  addMinutesToTime,
  timeToMin,
  parseBookingNotes,
} from "@/lib/booking-utils";
import { Booking } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  AlertCircle,
  X,
  Users,
  FileText,
} from "lucide-react";

// Every 2h label; every hour gets a minor gridline
const HOUR_LABELS = ["00:00","02:00","04:00","06:00","08:00","10:00","12:00","14:00","16:00","18:00","20:00","22:00"];
const HOUR_GRIDLINES = Array.from({ length: 25 }, (_, i) => `${String(i).padStart(2,"0")}:00`);
const HOUR_PX = 96; // pixels per hour → 24 × 96 = 2304px total timeline width
const TIMELINE_PX = HOUR_PX * 24; // 2304
const LABEL_COL_W = 176; // w-44 = 11rem = 176px
const SCROLL_STEP = HOUR_PX * 3; // scroll 3 hours per arrow click

function timeToPx(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return ((h * 60 + m) / (24 * 60)) * TIMELINE_PX;
}
const WARDS = ["ICU Ward A", "ICU Ward B", "ICU Ward C", "HDU"];

const PATIENT_AVATAR_COLORS = [
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-sky-100 text-sky-700 border-sky-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-teal-100 text-teal-700 border-teal-200",
  "bg-orange-100 text-orange-700 border-orange-200",
];

const VISIT_BAR_COLORS = [
  "bg-emerald-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-blue-500",
  "bg-green-600",
];

function initials(name: string): string {
  return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

type BlockFormState = {
  ward: string;
  startTime: string;
  endTime: string;
  type: BlockedSlotType;
  description: string;
};

export function WardSchedule({ bookings }: { bookings: Booking[] }) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedWard, setSelectedWard] = useState<string>(WARDS[0]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scrollBy_ = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };
  const [form, setForm] = useState<BlockFormState>({
    ward: WARDS[0],
    startTime: "10:00",
    endTime: "11:00",
    type: "procedure",
    description: "",
  });

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const fetchBlocks = () => {
    setLoading(true);
    fetch(`/api/blocked-slots?date=${dateStr}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setBlockedSlots)
      .catch(() => setBlockedSlots([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBlocks(); }, [dateStr]);

  // Auto-scroll to 07:00 so the active visit window (10:00–15:00) is visible
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = timeToPx("07:00");
      updateArrows();
    }
  }, [dateStr, selectedWard, updateArrows]);

  const openBlockDialog = () => {
    setForm(f => ({ ...f, ward: selectedWard }));
    setDialogOpen(true);
  };

  const handleAddBlock = async () => {
    if (timeToMin(form.endTime) <= timeToMin(form.startTime)) {
      toast({ title: "Invalid time range", description: "End time must be after start time.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/blocked-slots", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, date: dateStr }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create block");
      }
      toast({ title: "Block added", description: `${BLOCK_LABELS[form.type]} added to ${form.ward}.` });
      setDialogOpen(false);
      fetchBlocks();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "An error occurred";
      toast({ title: "Failed", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlock = async (id: number) => {
    try {
      await fetch(`/api/blocked-slots/${id}`, { method: "DELETE", credentials: "include" });
      setBlockedSlots((prev) => prev.filter((b) => b.id !== id));
      toast({ title: "Block removed" });
    } catch {
      toast({ title: "Failed to remove block", variant: "destructive" });
    }
  };

  const shiftDate = (n: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + n);
    setSelectedDate(d);
  };

  // All approved bookings for the selected day (parent passes approvedBookings)
  const dayBookings = bookings.filter(b => b.visitDate === dateStr);

  // Per-ward counts for tab badges
  const wardCounts = Object.fromEntries(WARDS.map(w => [w, dayBookings.filter(b => b.ward === w).length]));

  // Data for selected ward
  const wardBookings = dayBookings.filter(b => b.ward === selectedWard);
  const wardBlocks = blockedSlots.filter(b => b.ward === selectedWard);

  // Unique sorted patient names in this ward today
  const patients = [...new Set(wardBookings.map(b => b.patientName))].sort();

  const hasAnything = wardBookings.length > 0 || wardBlocks.length > 0;

  return (
    <div className="space-y-4">
      {/* Explainer */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Ward Visit Schedule</p>
          <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
            Select a ward tab to see each patient's individual visit timeline.
            Use <strong>Block Time Window</strong> to restrict the entire ward during procedures or rounds —
            blocks apply ward-wide, not to a single patient.
            Patient-specific notes live in the <strong>Patient Records</strong> tab.
          </p>
        </div>
      </div>

      {/* Date nav + action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => shiftDate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="w-64 flex items-center justify-center gap-1.5 text-sm font-medium text-slate-800">
            <CalendarDays className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="whitespace-nowrap">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
            {dateStr === format(new Date(), "yyyy-MM-dd") && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium shrink-0">Today</span>
            )}
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => shiftDate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          {dateStr !== format(new Date(), "yyyy-MM-dd") && (
            <Button variant="outline" size="sm" className="h-8 text-xs shrink-0" onClick={() => setSelectedDate(new Date())}>
              Today
            </Button>
          )}
        </div>
        <Button size="sm" onClick={openBlockDialog}>
          <Plus className="w-4 h-4 mr-1" /> Block Time Window
        </Button>
      </div>

      {/* Ward tabs */}
      <div className="flex gap-0 border-b border-slate-200">
        {WARDS.map(ward => {
          const count = wardCounts[ward] ?? 0;
          const active = ward === selectedWard;
          return (
            <button
              key={ward}
              onClick={() => setSelectedWard(ward)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              {ward}
              {count > 0 && (
                <span className={`ml-2 text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                  active ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Timeline panel */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Scroll arrows + scrollable timeline */}
        <div className="relative">
          {/* Left scroll arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scrollBy_(-SCROLL_STEP)}
              className="absolute left-[176px] top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:shadow-lg transition-all"
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {/* Right scroll arrow */}
          {canScrollRight && (
            <button
              onClick={() => scrollBy_(SCROLL_STEP)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:shadow-lg transition-all"
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Horizontally scrollable container */}
          <div
            ref={scrollRef}
            className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
            onScroll={updateArrows}
          >
            {/* Inner grid — fixed pixel width so each hour is HOUR_PX wide */}
            <div style={{ minWidth: LABEL_COL_W + TIMELINE_PX }}>

              {/* Hour ruler */}
              <div className="flex border-b border-slate-100 bg-slate-50 h-8">
                <div className="shrink-0 border-r border-slate-100" style={{ width: LABEL_COL_W }} />
                <div className="relative" style={{ width: TIMELINE_PX }}>
                  {HOUR_LABELS.map((h) => (
                    <span
                      key={h}
                      className="absolute -translate-x-1/2 text-[11px] font-medium text-slate-400 top-2"
                      style={{ left: timeToPx(h) }}
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="p-10 text-center text-sm text-slate-400 animate-pulse">Loading schedule…</div>
              ) : !hasAnything ? (
                <div className="p-10 text-center">
                  <p className="text-sm text-slate-400 italic">No approved visits or restrictions for {selectedWard} on this day.</p>
                  <p className="text-xs text-slate-300 mt-1">Approved bookings for this ward will appear here once confirmed.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {/* Ward-wide blocks row */}
                  {wardBlocks.length > 0 && (
                    <div className="flex min-h-[44px] bg-slate-50/60">
                      <div className="shrink-0 px-3 py-2 border-r border-slate-100 flex items-center sticky left-0 z-10 bg-slate-50/90 backdrop-blur-sm" style={{ width: LABEL_COL_W }}>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Ward Restrictions</span>
                      </div>
                      <div className="relative" style={{ width: TIMELINE_PX }}>
                        {HOUR_GRIDLINES.map((h) => (
                          <div key={h} className="absolute top-0 bottom-0 border-l border-slate-100" style={{ left: timeToPx(h) }} />
                        ))}
                        {wardBlocks.map((block) => {
                          const left = timeToPx(block.startTime);
                          const width = timeToPx(block.endTime) - left;
                          return (
                            <div
                              key={block.id}
                              className="absolute top-1.5 bottom-1.5 rounded-lg flex items-center px-2.5 overflow-hidden text-white text-xs font-medium group cursor-default"
                              style={{ left, width, backgroundColor: BLOCK_COLORS[block.type], opacity: 0.9 }}
                              title={`${BLOCK_LABELS[block.type]}: ${block.startTime}–${block.endTime}${block.description ? ` — ${block.description}` : ""}`}
                            >
                              <span className="truncate">{BLOCK_LABELS[block.type]}</span>
                              <button
                                className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pl-1"
                                onClick={() => handleDeleteBlock(block.id)}
                                title="Remove block"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* One row per patient */}
                  {patients.map((patientName, idx) => {
                    const patientBookings = wardBookings.filter(b => b.patientName === patientName);
                    const avatarColor = PATIENT_AVATAR_COLORS[idx % PATIENT_AVATAR_COLORS.length];
                    return (
                      <div key={patientName} className="flex min-h-[68px]">
                        {/* Patient label — sticky so it doesn't scroll away */}
                        <div
                          className="shrink-0 px-3 py-2.5 bg-white border-r border-slate-100 flex flex-col justify-center gap-1.5 sticky left-0 z-10"
                          style={{ width: LABEL_COL_W }}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold border shrink-0 ${avatarColor}`}>
                              {initials(patientName)}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 leading-tight truncate" title={patientName}>
                              {patientName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 pl-8">
                            {patientBookings.length} visit{patientBookings.length !== 1 ? "s" : ""} today
                          </span>
                        </div>

                        {/* Timeline lane — fixed pixel width */}
                        <div className="relative bg-white" style={{ width: TIMELINE_PX }}>
                          {/* Hour grid lines — every hour */}
                          {HOUR_GRIDLINES.map((h) => (
                            <div key={h} className="absolute top-0 bottom-0 border-l border-slate-100" style={{ left: timeToPx(h) }} />
                          ))}

                          {/* Faint block tint */}
                          {wardBlocks.map((block) => (
                            <div
                              key={block.id}
                              className="absolute top-0 bottom-0 pointer-events-none"
                              style={{
                                left: timeToPx(block.startTime),
                                width: timeToPx(block.endTime) - timeToPx(block.startTime),
                                backgroundColor: BLOCK_COLORS[block.type],
                                opacity: 0.06,
                              }}
                            />
                          ))}

                          {/* Visit bars */}
                          {patientBookings.map((b, bIdx) => {
                            const endTime = addMinutesToTime(b.visitTime, b.durationMinutes);
                            const left = timeToPx(b.visitTime);
                            const width = timeToPx(endTime) - left;
                            const barColor = VISIT_BAR_COLORS[bIdx % VISIT_BAR_COLORS.length];
                            return (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => setDetailBooking(b)}
                                className={`absolute top-3 bottom-3 rounded-lg ${barColor} flex items-center px-3 overflow-hidden text-white text-xs font-medium shadow-sm cursor-pointer hover:opacity-90 hover:shadow-md transition-all ring-0 hover:ring-2 ring-white/50`}
                                style={{ left, width }}
                                title={`Click for details — ${b.visitorName} · ${b.visitTime}–${endTime}`}
                              >
                                <span className="truncate">{b.visitorName}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 flex flex-wrap gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 shrink-0" /> Approved visit
          </span>
          {(Object.entries(BLOCK_LABELS) as [BlockedSlotType, string][]).map(([type, label]) => (
            <span key={type} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: BLOCK_COLORS[type] }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Active restrictions list for selected ward */}
      {wardBlocks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">
            {selectedWard} Restrictions — {format(selectedDate, "MMM d")}
          </h3>
          <div className="space-y-2">
            {wardBlocks.map((block) => (
              <div key={block.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: BLOCK_COLORS[block.type] }} />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-slate-800">{BLOCK_LABELS[block.type]}</span>
                  <span className="text-slate-400 ml-2 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {block.startTime}–{block.endTime}
                  </span>
                  {block.description && (
                    <span className="text-slate-500 ml-2 italic">"{block.description}"</span>
                  )}
                </div>
                {block.createdBy && (
                  <span className="text-xs text-slate-400 shrink-0">by {block.createdBy}</span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-rose-500 shrink-0"
                  onClick={() => handleDeleteBlock(block.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visit detail dialog */}
      <Dialog open={!!detailBooking} onOpenChange={(open) => { if (!open) setDetailBooking(null); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              Visit Details
            </DialogTitle>
            <DialogDescription>
              Approved visit for{" "}
              <strong>{detailBooking?.patientName}</strong> — {detailBooking ? format(new Date(detailBooking.visitDate), "EEEE, d MMM yyyy") : ""}
            </DialogDescription>
          </DialogHeader>
          {detailBooking && (() => {
            const meta = parseBookingNotes(detailBooking.notes);
            const endTime = addMinutesToTime(detailBooking.visitTime, detailBooking.durationMinutes);
            return (
              <div className="space-y-3 py-1 text-sm">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Visitor</span>
                    <span className="font-semibold text-slate-900">{detailBooking.visitorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email</span>
                    <span className="text-slate-700 text-xs">{detailBooking.visitorEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time</span>
                    <span className="font-medium text-slate-900 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {detailBooking.visitTime} – {endTime} ({detailBooking.durationMinutes} min)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ward</span>
                    <span className="font-medium text-slate-900">{detailBooking.ward}</span>
                  </div>
                  {meta.relationship && (
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Relationship</span>
                      <span className="font-medium text-slate-900 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {meta.relationship}
                        {meta.visitorCount && meta.visitorCount > 1 ? ` · ${meta.visitorCount} visitors` : ""}
                      </span>
                    </div>
                  )}
                  {meta.userNotes && (
                    <div className="pt-1 border-t border-slate-200">
                      <span className="text-slate-500 block mb-0.5 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Visitor note
                      </span>
                      <span className="italic text-slate-600">"{meta.userNotes}"</span>
                    </div>
                  )}
                </div>
                {detailBooking.reviewedBy && (
                  <p className="text-xs text-slate-400">
                    Approved by <span className="font-medium text-slate-500">{detailBooking.reviewedBy}</span>
                    {detailBooking.reviewedAt && <span> · {format(new Date(detailBooking.reviewedAt), "d MMM, HH:mm")}</span>}
                  </p>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailBooking(null)}>
              <X className="w-3.5 h-3.5 mr-1.5" /> Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add block dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Block a Visit Window</DialogTitle>
            <DialogDescription>
              Prevent new visitor requests for <strong>{format(selectedDate, "MMMM d, yyyy")}</strong> during the chosen time.
              This affects the whole ward, not a single patient.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Ward</Label>
              <Select value={form.ward} onValueChange={(v) => setForm((f) => ({ ...f, ward: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WARDS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Block Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as BlockedSlotType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(BLOCK_LABELS) as [BlockedSlotType, string][]).map(([type, label]) => (
                    <SelectItem key={type} value={type}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="e.g. Weekly consultant round, family briefing at bedside"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="resize-none h-20"
              />
            </div>
          </div>

          {/* Live conflict warning */}
          {(() => {
            const blockStart = timeToMin(form.startTime);
            const blockEnd = timeToMin(form.endTime);
            if (blockEnd <= blockStart) return null;
            const conflicts = dayBookings.filter(b => {
              if (b.ward !== form.ward) return false;
              const bStart = timeToMin(b.visitTime);
              const bEnd = bStart + b.durationMinutes;
              return blockStart < bEnd && bStart < blockEnd;
            });
            if (conflicts.length === 0) return null;
            return (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-2 text-xs text-amber-800 -mt-2">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {conflicts.length} already-approved visit{conflicts.length !== 1 ? "s" : ""} overlap this window
                </div>
                <div className="space-y-1">
                  {conflicts.map(b => (
                    <div key={b.id} className="flex justify-between text-amber-700">
                      <span className="font-medium">{b.visitorName}</span>
                      <span className="text-amber-600">{b.visitTime} · {b.durationMinutes} min · {b.patientName}</span>
                    </div>
                  ))}
                </div>
                <p className="text-amber-600 border-t border-amber-200 pt-2">
                  These visitors won't be automatically notified — review affected bookings in <strong>Visitor Requests</strong> if needed.
                </p>
              </div>
            );
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleAddBlock} disabled={submitting}>
              {submitting ? "Adding…" : "Add Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
