import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  BlockedSlot,
  BlockedSlotType,
  BLOCK_LABELS,
  BLOCK_COLORS,
  getTimePercent,
  getDurationPercent,
  addMinutesToTime,
  timeToMin,
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
} from "lucide-react";

const HOUR_LABELS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const WARDS = ["ICU Ward A", "ICU Ward B", "ICU Ward C", "HDU"];

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
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    fetchBlocks();
  }, [dateStr]);

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

  // Bookings for the selected date
  const dayBookings = bookings.filter((b) => b.visitDate === dateStr && b.status === "approved");

  const shiftDate = (n: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + n);
    setSelectedDate(d);
  };

  return (
    <div className="space-y-4">
      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => shiftDate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
            {dateStr === format(new Date(), "yyyy-MM-dd") && (
              <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Today</span>
            )}
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => shiftDate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Block
        </Button>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Hour ruler */}
        <div className="relative border-b border-slate-100 bg-slate-50 h-7">
          {HOUR_LABELS.map((h) => (
            <span
              key={h}
              className="absolute -translate-x-1/2 text-xs text-slate-400 top-1.5"
              style={{ left: `${getTimePercent(h)}%` }}
            >
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400 animate-pulse">Loading schedule…</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {WARDS.map((ward) => {
              const wardBookings = dayBookings.filter((b) => b.ward === ward);
              const wardBlocks = blockedSlots.filter((b) => b.ward === ward);
              const hasActivity = wardBookings.length > 0 || wardBlocks.length > 0;

              return (
                <div key={ward} className="flex min-h-[52px]">
                  {/* Ward label */}
                  <div className="w-28 shrink-0 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border-r border-slate-100 flex items-start pt-3">
                    {ward}
                  </div>

                  {/* Lane */}
                  <div className="relative flex-1 bg-white">
                    {/* Hour grid lines */}
                    {HOUR_LABELS.map((h) => (
                      <div
                        key={h}
                        className="absolute top-0 bottom-0 border-l border-slate-100"
                        style={{ left: `${getTimePercent(h)}%` }}
                      />
                    ))}

                    {!hasActivity && (
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs text-slate-300 italic">No visits scheduled</span>
                      </div>
                    )}

                    {/* Blocked slots */}
                    {wardBlocks.map((block) => {
                      const left = getTimePercent(block.startTime);
                      const width = getDurationPercent(block.startTime, block.endTime);
                      const color = BLOCK_COLORS[block.type];
                      return (
                        <div
                          key={block.id}
                          className="absolute top-1 bottom-1 rounded flex items-center px-1.5 overflow-hidden text-white text-xs font-medium group"
                          style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color, opacity: 0.85 }}
                          title={`${BLOCK_LABELS[block.type]}: ${block.startTime}–${block.endTime}${block.description ? ` — ${block.description}` : ""}`}
                        >
                          <span className="truncate">{BLOCK_LABELS[block.type]}</span>
                          <button
                            className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteBlock(block.id)}
                            title="Remove block"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Approved bookings */}
                    {wardBookings.map((b) => {
                      const endTime = addMinutesToTime(b.visitTime, b.durationMinutes);
                      const left = getTimePercent(b.visitTime);
                      const width = getDurationPercent(b.visitTime, endTime);
                      return (
                        <div
                          key={b.id}
                          className="absolute top-1 bottom-1 rounded bg-emerald-500 flex items-center px-1.5 overflow-hidden text-white text-xs font-medium"
                          style={{ left: `${left}%`, width: `${width}%` }}
                          title={`${b.visitorName} → ${b.patientName} (${b.visitTime}–${endTime})`}
                        >
                          <span className="truncate">{b.visitorName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

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

      {/* Active blocks list */}
      {blockedSlots.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">Active Restrictions — {format(selectedDate, "MMM d")}</h3>
          <div className="space-y-2">
            {blockedSlots.map((block) => (
              <div key={block.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: BLOCK_COLORS[block.type] }} />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-slate-800">{BLOCK_LABELS[block.type]}</span>
                  <span className="text-slate-500 ml-2">{block.ward}</span>
                  <span className="text-slate-400 ml-2 flex items-center gap-1 inline-flex">
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

      {/* Add block dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Add Restriction Block</DialogTitle>
            <DialogDescription>
              Block a time period for {format(selectedDate, "MMMM d, yyyy")}. Visitors will see a conflict warning when requesting this slot.
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
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                />
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
