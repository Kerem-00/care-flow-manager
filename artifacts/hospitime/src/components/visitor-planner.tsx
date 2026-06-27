import { useState, useEffect, useRef } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Search, ShieldAlert, CheckCircle2, User } from "lucide-react";
import { BlockedSlot, BlockedSlotType, BLOCK_LABELS, BLOCK_COLORS, timeToMin } from "@/lib/booking-utils";

// Half-hour slots 08:00 – 17:30
const SLOTS: string[] = [];
for (let h = 8; h < 18; h++) {
  SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

interface PatientOption { id: number; name: string; ward: string }

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
  onSelectSlot: (date: string, time: string, patientName: string, ward: string) => void;
}

export function VisitorPlanner({ onSelectSlot }: VisitorPlannerProps) {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/patients/search", { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(setPatients)
      .catch(() => {});
  }, []);

  const filteredPatients = patientQuery.trim().length === 0
    ? patients
    : patients.filter(p =>
        p.name.toLowerCase().includes(patientQuery.toLowerCase()) ||
        p.ward.toLowerCase().includes(patientQuery.toLowerCase())
      );

  useEffect(() => {
    if (!selectedDate || !selectedPatient) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setLoading(true);
    setSelectedSlot(null);
    fetch(`/api/blocked-slots?date=${dateStr}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then((slots: BlockedSlot[]) => setBlockedSlots(slots.filter(s => !s.ward || s.ward === selectedPatient.ward)))
      .catch(() => setBlockedSlots([]))
      .finally(() => setLoading(false));
  }, [selectedDate, selectedPatient]);

  const handleSelectSlot = (time: string) => {
    if (!selectedDate || !selectedPatient) return;
    if (getBlockForSlot(time, blockedSlots)) return;
    setSelectedSlot(time);
  };

  const handleRequest = () => {
    if (!selectedDate || !selectedSlot || !selectedPatient) return;
    onSelectSlot(format(selectedDate, "yyyy-MM-dd"), selectedSlot, selectedPatient.name, selectedPatient.ward);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
        <h2 className="font-semibold text-slate-900 text-base">Plan a Visit</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Search for your patient, pick a date, then choose an available time slot.
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Step 1: Patient Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold shrink-0">1</span>
            Search for the patient
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              ref={inputRef}
              placeholder="Type patient name…"
              value={patientQuery}
              autoComplete="off"
              className="pl-9"
              onChange={e => {
                setPatientQuery(e.target.value);
                setSelectedPatient(null);
                setSelectedDate(undefined);
                setSelectedSlot(null);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            />
            {showDropdown && filteredPatients.length > 0 && (
              <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden max-h-80 overflow-y-auto">
                {filteredPatients.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between gap-3 border-b border-slate-100 last:border-0"
                    onMouseDown={() => {
                      setSelectedPatient(p);
                      setPatientQuery(p.name);
                      setShowDropdown(false);
                      setSelectedDate(undefined);
                      setSelectedSlot(null);
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-medium text-slate-900 text-sm">{p.name}</span>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 bg-slate-100 px-2 py-0.5 rounded-full">{p.ward}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedPatient && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">{selectedPatient.name}</span>
              <span className="text-emerald-600">·</span>
              <span className="text-emerald-600">{selectedPatient.ward}</span>
            </div>
          )}
        </div>

        {/* Step 2: Date */}
        {selectedPatient && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold shrink-0">2</span>
              Choose a date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full sm:w-64 justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"}`}
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
          </div>
        )}

        {/* Step 3: Slot grid */}
        {selectedPatient && selectedDate && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold shrink-0">3</span>
              Pick a time slot
            </label>

            {loading ? (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {SLOTS.slice(0, 10).map(s => (
                  <div key={s} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {SLOTS.map(slot => {
                    const block = getBlockForSlot(slot, blockedSlots);
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
          </div>
        )}

        {/* Action row */}
        {selectedSlot && selectedDate && selectedPatient && (
          <div className="flex items-center justify-between gap-4 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
            <div className="text-sm min-w-0">
              <span className="font-semibold text-slate-900">{selectedPatient.name}</span>
              <span className="text-slate-400 mx-1.5">·</span>
              <span className="font-semibold text-slate-700">{format(selectedDate, "EEE, MMM d")}</span>
              <span className="text-slate-500"> at </span>
              <span className="font-semibold text-primary">{selectedSlot}</span>
            </div>
            <Button size="sm" onClick={handleRequest} className="shrink-0">
              Request this slot
            </Button>
          </div>
        )}

        {/* Advisory notice */}
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
          <span>
            <strong>Advisory only.</strong> All requests are subject to staff review and approval. Availability may change due to procedures, patient condition, or clinical need.
          </span>
        </div>
      </div>
    </div>
  );
}
