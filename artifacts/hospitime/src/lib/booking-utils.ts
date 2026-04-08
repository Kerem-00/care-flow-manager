// Structured notes are stored as: "[Rel: Spouse | Visitors: 2]\nOptional user notes"
// Old bookings without this prefix are displayed as-is.

const BOOKING_META_RE = /^\[Rel: (.*?) \| Visitors: (\d+)\]\n?/;

export interface BookingMeta {
  relationship: string | null;
  visitorCount: number | null;
  userNotes: string | null;
}

export function parseBookingNotes(notes: string | null | undefined): BookingMeta {
  if (!notes) return { relationship: null, visitorCount: null, userNotes: null };
  const match = notes.match(BOOKING_META_RE);
  if (!match) return { relationship: null, visitorCount: null, userNotes: notes };
  return {
    relationship: match[1],
    visitorCount: parseInt(match[2], 10),
    userNotes: notes.replace(BOOKING_META_RE, "").trim() || null,
  };
}

export function buildBookingNotes(relationship: string, visitorCount: number, notes: string): string {
  const prefix = `[Rel: ${relationship} | Visitors: ${visitorCount}]`;
  const trimmed = notes.trim();
  return trimmed ? `${prefix}\n${trimmed}` : prefix;
}

export type BlockedSlotType = "procedure" | "family" | "rest" | "doctor_meeting" | "infection_control";

export interface BlockedSlot {
  id: number;
  ward: string;
  date: string;
  startTime: string;
  endTime: string;
  type: BlockedSlotType;
  description: string | null;
  createdBy: string | null;
  createdAt: string;
}

export const BLOCK_LABELS: Record<BlockedSlotType, string> = {
  procedure: "Procedure in Progress",
  family: "Family-Only Time",
  rest: "Patient Rest Period",
  doctor_meeting: "Doctor / Family Meeting",
  infection_control: "Infection Control",
};

export const BLOCK_COLORS: Record<BlockedSlotType, string> = {
  procedure: "#f87171",      // rose-400
  family: "#60a5fa",         // blue-400
  rest: "#94a3b8",           // slate-400
  doctor_meeting: "#a78bfa", // violet-400
  infection_control: "#fb923c", // orange-400
};

export const timeToMin = (t: string): number => {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const addMinutesToTime = (time: string, minutes: number): string => {
  const total = timeToMin(time) + minutes;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// Timeline: 08:00 – 18:00 (600 minutes)
const TIMELINE_START = 8 * 60;
const TIMELINE_END = 18 * 60;
const TIMELINE_SPAN = TIMELINE_END - TIMELINE_START;

export const getTimePercent = (time: string): number =>
  ((timeToMin(time) - TIMELINE_START) / TIMELINE_SPAN) * 100;

export const getDurationPercent = (startTime: string, endTime: string): number =>
  ((timeToMin(endTime) - timeToMin(startTime)) / TIMELINE_SPAN) * 100;

// Extended booking type to include server-returned staffInstructions
// (not yet in the generated API client types, but present in the JSON response)
export type BookingWithInstructions = {
  staffInstructions?: string | null;
};

export const QUICK_INSTRUCTIONS: string[] = [
  "Please arrive 10 minutes before your visit time.",
  "Check in at the ICU Reception Desk (Level 2) before proceeding to the ward.",
  "Wait in the Family Lounge B until a nurse escorts you.",
  "Use the Level 2 entrance via the main hospital lifts.",
  "Visitor Car Park C is on the ground level of the main building.",
  "PPE gowns are required — please collect one from the entrance station.",
  "Only one visitor may be at the bedside at a time.",
  "Please do not bring food, flowers, or additional visitors.",
  "A possible delay may occur if a clinical procedure is in progress — please wait patiently.",
  "Show this booking confirmation and a valid photo ID at the reception desk.",
];
