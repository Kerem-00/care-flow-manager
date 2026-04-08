import { useState, useEffect } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Info, ShieldAlert } from "lucide-react";
import { BlockedSlot, BlockedSlotType, BLOCK_LABELS, BLOCK_COLORS, timeToMin } from "@/lib/booking-utils";

const WARDS = ["ICU Ward A", "ICU Ward B", "ICU Ward C", "HDU"];

// Half-hour slots 08:00 – 18:00
const SLOTS: string[] = [];
for (let h = 8; h < 18; h++) {
  SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

function getBlockForSlot(slot: string, blocks: BlockedSlot[]): BlockedSlot | null {
  const slotMin = timeToMin(slot);
  for (const b of blocks) {
    if (slotMin >= timeToMin(b.startTime) && slotMin < timeToMin(b.endTime)) {
      return b;
    }
  }
  return null;
}

interface VisitorPlannerProps {
  onSelectSlot: (date: string, time: string) => void;
}

export function VisitorPlanner({ onSelectSlot }: VisitorPlannerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedWard, setSelectedWard] = useState<string>(WARDS[0]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setLoading(true);
    setSelectedSlot(null);
    fetch(`/api/blocked-slots?date=${dateStr}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setBlockedSlots)
      .catch(() => setBlockedSlots([]))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const wardBlocks = blockedSlots.filter(
    (b) => !selectedWard || b.ward === selectedWard
  );

  const handleSelectSlot = (time: string) => {
    if (!selectedDate) return;
    const block = getBlockForSlot(time, wardBlocks);
    if (block) return; // blocked — not selectable
    setSelectedSlot(time);
  };

  const handleRequestSlot = () => {
    if (!selectedDate || !selectedSlot) return;
    onSelectSlot(format(selectedDate, "yyyy-MM-dd"), selectedSlot);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
        <h2 className="font-semibold text-slate-900 text-base">Explore Availability</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Browse ward availability before submitting your request. All visits remain subject to staff review and approval.
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Date picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`justify-start text-left font-normal sm:w-52 ${!selectedDate && "text-muted-foreground"}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "EEE, MMM d, yyyy") : "Select a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => isBefore(date, startOfDay(new Date()))}
              />
            </PopoverContent>
          </Popover>

          {/* Ward selector */}
          <Select value={selectedWard} onValueChange={setSelectedWard}>
            <SelectTrigger className="sm:w-44">
              <SelectValue placeholder="Select ward" />
            </SelectTrigger>
            <SelectContent>
              {WARDS.map((w) => (
                <SelectItem key={w} value={w}>{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Slot grid */}
        {!selectedDate ? (
          <div className="py-8 text-center text-sm text-slate-400">
            <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Select a date to see availability
          </div>
        ) : loading ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {SLOTS.map((s) => (
              <div key={s} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {SLOTS.map((slot) => {
                const block = getBlockForSlot(slot, wardBlocks);
                const isSelected = selectedSlot === slot;

                if (block) {
                  return (
                    <div
                      key={slot}
                      className="rounded-lg px-2 py-2 text-center text-xs font-medium text-white cursor-not-allowed overflow-hidden"
                      style={{ backgroundColor: BLOCK_COLORS[block.type as BlockedSlotType], opacity: 0.85 }}
                      title={`${BLOCK_LABELS[block.type as BlockedSlotType]}${block.description ? ` — ${block.description}` : ""}`}
                    >
                      <div className="font-semibold">{slot}</div>
                      <div className="truncate text-white/80 text-[10px] leading-tight mt-0.5">
                        {BLOCK_LABELS[block.type as BlockedSlotType].split(" ")[0]}
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={slot}
                    onClick={() => handleSelectSlot(slot)}
                    className={`rounded-lg px-2 py-2 text-center text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                    }`}
                  >
                    <div className="font-semibold">{slot}</div>
                    <div className={`text-[10px] leading-tight mt-0.5 ${isSelected ? "text-white/80" : "text-emerald-600"}`}>
                      {isSelected ? "Selected" : "Available"}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-3 rounded bg-emerald-200 shrink-0" /> Available to request
              </span>
              {(Object.entries(BLOCK_LABELS) as [BlockedSlotType, string][]).map(([type, label]) => (
                <span key={type} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-3 rounded shrink-0" style={{ backgroundColor: BLOCK_COLORS[type] }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action row */}
        {selectedSlot && selectedDate && (
          <div className="flex items-center justify-between gap-4 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
            <div className="text-sm">
              <span className="font-semibold text-slate-900">{format(selectedDate, "EEE, MMM d")}</span>
              <span className="text-slate-500"> at </span>
              <span className="font-semibold text-primary">{selectedSlot}</span>
              <span className="text-slate-500"> — {selectedWard}</span>
            </div>
            <Button size="sm" onClick={handleRequestSlot} className="shrink-0">
              Request this slot
            </Button>
          </div>
        )}

        {/* Advisory notice */}
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
          <span>
            <strong>Advisory only.</strong> This view shows currently known restrictions and is not a real-time booking engine.
            All requests are subject to staff review. Availability may change at any time due to procedures, patient condition, or clinical need.
          </span>
        </div>
      </div>
    </div>
  );
}
