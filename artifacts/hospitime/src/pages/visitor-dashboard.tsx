import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutWrapper } from "@/components/layout-wrapper";
import {
  useGetVisitorStats,
  useGetBookings,
  useCreateBooking,
  useCancelBooking,
  getGetVisitorStatsQueryKey,
  getGetBookingsQueryKey,
  CreateBookingRequestDurationMinutes,
  Booking
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isBefore, isToday, isTomorrow, startOfDay } from "date-fns";
import {
  CalendarIcon, Clock, Calendar as CalendarIconLucide,
  FileText, CheckCircle2, AlertCircle, Plus, Filter, Users, Info, ShieldAlert
} from "lucide-react";
import { parseBookingNotes, buildBookingNotes, BlockedSlot, BLOCK_LABELS, timeToMin, BookingWithInstructions } from "@/lib/booking-utils";
import { VisitorPlanner } from "@/components/visitor-planner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30"
];

const requestSchema = z.object({
  patientName: z.string().min(2, { message: "Patient name is required" }),
  ward: z.string().optional(),
  relationship: z.string().min(1, { message: "Please select your relationship to the patient" }),
  visitorCount: z.coerce.number().min(1).max(4),
  visitDate: z.date({ required_error: "Date is required" }),
  visitTime: z.string({ required_error: "Time is required" }),
  durationMinutes: z.coerce.number(),
  notes: z.string().optional(),
  guidelinesAgreed: z.boolean().refine(v => v === true, { message: "You must acknowledge the ICU visiting guidelines" }),
});

// ─── Shell: handles auth guard + redirect ────────────────────────────────────
export default function VisitorDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "visitor")) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  if (authLoading || !user || user.role !== "visitor") return null;
  return <VisitorDashboardContent />;
}

// ─── Main content: all data hooks live here ──────────────────────────────────
function VisitorDashboardContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [plannerPrefill, setPlannerPrefill] = useState<{ date?: string; time?: string }>({});
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [historyFilter, setHistoryFilter] = useState<string>("all");

  const { data: stats, isLoading: statsLoading } = useGetVisitorStats();

  const { data: bookings, isLoading: bookingsLoading } = useGetBookings();

  const cancelBookingMutation = useCancelBooking();

  const handlePlannerSelect = (date: string, time: string) => {
    setPlannerPrefill({ date, time });
    setIsDialogOpen(true);
  };

  const openCancelDialog = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const handleCancel = () => {
    if (!bookingToCancel) return;
    cancelBookingMutation.mutate({ id: bookingToCancel.id }, {
      onSuccess: () => {
        toast({ title: "Visit cancelled", description: "Your visit request has been cancelled." });
        queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetVisitorStatsQueryKey() });
        setCancelDialogOpen(false);
        setBookingToCancel(null);
      },
      onError: (error: unknown) => {
        const e = error as { data?: { error?: string }; message?: string };
        toast({
          title: "Cancellation failed",
          description: e.data?.error || e.message || "An error occurred",
          variant: "destructive",
        });
      },
    });
  };

  const today = startOfDay(new Date());

  const nextVisit = bookings
    ? [...bookings]
        .filter(b => b.status === "approved" && !isBefore(new Date(b.visitDate), today))
        .sort((a, b) => {
          const dateDiff = new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime();
          if (dateDiff !== 0) return dateDiff;
          return a.visitTime.localeCompare(b.visitTime);
        })[0] ?? null
    : null;

  const filteredBookings = bookings
    ? historyFilter === "all"
      ? bookings
      : bookings.filter(b => b.status === historyFilter)
    : [];

  return (
    <LayoutWrapper>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Visits</h1>
          <p className="text-slate-500 mt-1">Manage your ICU visit requests and schedule.</p>
        </div>

        {/* Next Upcoming Visit */}
        {!bookingsLoading && (
          nextVisit ? (
            <div className="bg-primary rounded-xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-5 translate-x-4 -translate-y-4">
                <CalendarIconLucide className="w-40 h-40" />
              </div>
              <p className="text-sm font-medium text-white/70 uppercase tracking-wider mb-3">Next Upcoming Visit</p>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
                <div>
                  <h2 className="text-2xl font-bold leading-tight">{nextVisit.patientName}</h2>
                  {nextVisit.ward && (
                    <p className="text-white/70 text-sm mt-0.5">{nextVisit.ward}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-white/90 text-sm">
                    <span className="flex items-center gap-1.5">
                      <CalendarIconLucide className="w-4 h-4 text-white/60" />
                      {format(new Date(nextVisit.visitDate), "EEEE, MMMM d")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-white/60" />
                      {nextVisit.visitTime} · {nextVisit.durationMinutes} mins
                    </span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-center shrink-0 border border-white/20">
                  <span className="block text-3xl font-bold leading-none">
                    {format(new Date(nextVisit.visitDate), "dd")}
                  </span>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-white/70 mt-1">
                    {format(new Date(nextVisit.visitDate), "MMM yyyy")}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl px-6 py-5 flex items-center gap-4 text-slate-500">
              <div className="bg-slate-100 rounded-lg p-2.5 shrink-0">
                <CalendarIconLucide className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-slate-700 text-sm">No upcoming visits</p>
                <p className="text-xs mt-0.5">You have no approved visits scheduled. Submit a request to get started.</p>
              </div>
            </div>
          )
        )}

        {/* Before Your Visit — Arrival Guidance */}
        <details className="group bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none list-none">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 rounded-lg p-1.5 text-primary">
                <Info className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-800 text-sm">Before Your Visit — Arrival Guide</span>
            </div>
            <span className="text-xs text-slate-400 group-open:hidden">Tap to expand</span>
            <span className="text-xs text-slate-400 hidden group-open:inline">Tap to collapse</span>
          </summary>
          <div className="border-t border-slate-100 px-5 py-4 grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm text-slate-700">
            <div>
              <p className="font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" /> On Arrival
              </p>
              <ul className="space-y-1 text-slate-600">
                <li>• Check in at the <strong>ICU Reception Desk</strong> on Level 2 before proceeding to the ward.</li>
                <li>• Bring a <strong>valid photo ID</strong> and your booking confirmation.</li>
                <li>• Wait in the <strong>Family Lounge B</strong> — a nurse will escort you when the ward is ready.</li>
                <li>• Use the <strong>main hospital lifts</strong> to reach Level 2. Do not use the staff-only corridor.</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" /> Infection &amp; Safety
              </p>
              <ul className="space-y-1 text-slate-600">
                <li>• <strong>Wash hands</strong> at the entrance station before and after your visit.</li>
                <li>• Do not visit if you have a cold, cough, fever, or any infection symptoms.</li>
                <li>• PPE gowns may be required — collect from the entrance station when directed.</li>
                <li>• Maximum <strong>2 visitors at the bedside</strong> at any one time.</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" /> Timing &amp; Delays
              </p>
              <ul className="space-y-1 text-slate-600">
                <li>• Please arrive <strong>5–10 minutes early</strong> to allow time for check-in.</li>
                <li>• Visits may be briefly paused if a procedure or clinical emergency is in progress.</li>
                <li>• Staff may protect certain periods for family-only time or medical meetings.</li>
                <li>• Your booking time is a guideline — clinical care always takes priority.</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" /> What to Bring &amp; Avoid
              </p>
              <ul className="space-y-1 text-slate-600">
                <li>• <strong>Do not bring</strong> fresh flowers, food, or balloons to the ICU.</li>
                <li>• Mobile phones should be on silent and kept away from medical equipment.</li>
                <li>• Children under 12 require prior approval from the ward sister.</li>
                <li>• <strong>Visitor Car Park C</strong> is on the ground level of the main building.</li>
              </ul>
            </div>
          </div>
        </details>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-slate-600">Upcoming</CardTitle>
              <CalendarIconLucide className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {statsLoading
                ? <div className="h-8 w-12 bg-slate-200 animate-pulse rounded" />
                : <div className="text-2xl font-bold text-slate-900">{stats?.upcomingVisits ?? 0}</div>
              }
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {statsLoading
                ? <div className="h-8 w-12 bg-slate-200 animate-pulse rounded" />
                : <div className="text-2xl font-bold text-slate-900">{stats?.pending ?? 0}</div>
              }
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-slate-600">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {statsLoading
                ? <div className="h-8 w-12 bg-slate-200 animate-pulse rounded" />
                : <div className="text-2xl font-bold text-slate-900">{stats?.approved ?? 0}</div>
              }
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-slate-600">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {statsLoading
                ? <div className="h-8 w-12 bg-slate-200 animate-pulse rounded" />
                : <div className="text-2xl font-bold text-slate-900">{stats?.total ?? 0}</div>
              }
            </CardContent>
          </Card>
        </div>

        {/* Plan a Visit */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Plan a Visit</h2>
          <VisitorPlanner onSelectSlot={handlePlannerSelect} />
        </div>

        {/* Booking History Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">Booking History</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <Select value={historyFilter} onValueChange={setHistoryFilter}>
                <SelectTrigger className="w-[160px] h-9 bg-white" data-testid="select-history-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Declined</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-new-request">
              <Plus className="w-4 h-4 mr-2" />
              Request a Visit
            </Button>
          </div>
        </div>

        {/* Booking List */}
        {bookingsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse bg-slate-100/50 border-slate-200">
                <CardContent className="h-24" />
              </Card>
            ))}
          </div>
        ) : !bookings || bookings.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <CalendarIconLucide className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No visits booked yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              You haven't requested any visits. Use the button above to schedule your first visit with your loved one.
            </p>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              className="mx-auto border-slate-200"
              data-testid="button-empty-request"
            >
              Request your first visit
            </Button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
            <p className="font-medium text-slate-700 text-sm">No matching visits</p>
            <p className="text-xs mt-1">No requests with that status. Try a different filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow transition-shadow">
                  <div className={`h-1 w-full ${
                    booking.status === "approved" ? "bg-emerald-500" :
                    booking.status === "pending" ? "bg-amber-400" :
                    booking.status === "rejected" ? "bg-rose-500" : "bg-slate-300"
                  }`} />
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center min-w-[80px]">
                          <span className="block text-xs font-semibold text-primary uppercase tracking-wider">
                            {format(new Date(booking.visitDate), "MMM")}
                          </span>
                          <span className="block text-2xl font-bold text-slate-900 leading-none my-1">
                            {format(new Date(booking.visitDate), "dd")}
                          </span>
                          {isToday(new Date(booking.visitDate)) && (
                            <span className="block text-xs font-semibold text-primary">Today</span>
                          )}
                          {isTomorrow(new Date(booking.visitDate)) && (
                            <span className="block text-xs font-semibold text-amber-500">Tomorrow</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                            {booking.patientName}
                            {booking.ward && (
                              <span className="text-sm font-normal text-slate-500">• {booking.ward}</span>
                            )}
                          </h4>
                          <div className="flex flex-wrap items-center text-slate-600 mt-1 gap-x-4 gap-y-1 text-sm">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
                              {booking.visitTime} ({booking.durationMinutes} mins)
                            </span>
                            {(() => {
                              const meta = parseBookingNotes(booking.notes);
                              return meta.relationship ? (
                                <span className="flex items-center gap-1 text-slate-500">
                                  <Users className="w-3.5 h-3.5 text-slate-400" />
                                  {meta.relationship}
                                  {meta.visitorCount && meta.visitorCount > 1 && (
                                    <span className="text-slate-400">· {meta.visitorCount} visitors</span>
                                  )}
                                </span>
                              ) : null;
                            })()}
                          </div>
                          {(() => {
                            const meta = parseBookingNotes(booking.notes);
                            return meta.userNotes ? (
                              <p className="text-sm text-slate-500 mt-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                                <span className="font-medium text-slate-700">Note:</span> {meta.userNotes}
                              </p>
                            ) : null;
                          })()}
                          {booking.rejectionReason && booking.status === "rejected" && (
                            <p className="text-sm text-rose-600 mt-2 bg-rose-50 p-2 rounded-md border border-rose-100 flex items-start gap-1.5">
                              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                              <span><span className="font-semibold">Reason:</span> {booking.rejectionReason}</span>
                            </p>
                          )}
                          {(booking.status === "approved" || booking.status === "rejected") && booking.reviewedBy && (
                            <p className="text-xs text-slate-400 mt-2">
                              Reviewed by <span className="font-medium text-slate-500">{booking.reviewedBy}</span>
                              {booking.reviewedAt && <span> · {format(new Date(booking.reviewedAt), "MMM d, HH:mm")}</span>}
                            </p>
                          )}
                          {booking.status === "approved" && (booking as unknown as BookingWithInstructions).staffInstructions && (
                            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Arrival Instructions</span>
                              </div>
                              <ul className="space-y-1">
                                {((booking as unknown as BookingWithInstructions).staffInstructions ?? "").split("\n").filter(Boolean).map((line, i) => (
                                  <li key={i} className="flex items-start gap-1.5 text-sm text-emerald-800">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    {line}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                        <BookingStatusBadge status={booking.status} className="px-3 py-1" />
                        <span className="text-xs text-slate-400">
                          Requested {format(new Date(booking.requestedAt), "MMM dd, HH:mm")}
                        </span>
                        {(booking.status === "pending" || booking.status === "approved") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 h-7 px-2 text-xs"
                            onClick={() => openCancelDialog(booking)}
                            disabled={cancelBookingMutation.isPending}
                            data-testid={`button-cancel-${booking.id}`}
                          >
                            Cancel visit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Cancel visit request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your{" "}
              {bookingToCancel?.status === "approved" ? "approved" : "pending"} visit to{" "}
              <strong>{bookingToCancel?.patientName}</strong> on{" "}
              {bookingToCancel ? format(new Date(bookingToCancel.visitDate), "MMMM d") : ""}?{" "}
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelBookingMutation.isPending}
            >
              Keep visit
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelBookingMutation.isPending}
              data-testid="button-confirm-cancel"
            >
              {cancelBookingMutation.isPending ? "Cancelling..." : "Yes, cancel visit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Visit Dialog — mounted separately to isolate form hooks */}
      {isDialogOpen && (
        <RequestVisitDialog
          isOpen={isDialogOpen}
          setIsOpen={(open) => {
            setIsDialogOpen(open);
            if (!open) setPlannerPrefill({});
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetVisitorStatsQueryKey() });
          }}
          prefillDate={plannerPrefill.date}
          prefillTime={plannerPrefill.time}
        />
      )}
    </LayoutWrapper>
  );
}

// ─── Request Visit Dialog — isolated component so form hooks are clean ────────
function RequestVisitDialog({
  isOpen,
  setIsOpen,
  onSuccess,
  prefillDate,
  prefillTime,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess: () => void;
  prefillDate?: string;
  prefillTime?: string;
}) {
  const { toast } = useToast();
  const createBookingMutation = useCreateBooking();
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      patientName: "",
      ward: "",
      relationship: "",
      visitorCount: 1,
      visitDate: prefillDate ? new Date(prefillDate + "T00:00:00") : undefined,
      visitTime: prefillTime ?? "10:00",
      durationMinutes: CreateBookingRequestDurationMinutes.NUMBER_60,
      notes: "",
      guidelinesAgreed: false,
    },
  });

  const visitDate = useWatch({ control: form.control, name: "visitDate" });
  const visitTime = useWatch({ control: form.control, name: "visitTime" });
  const durationMinutes = useWatch({ control: form.control, name: "durationMinutes" });
  const ward = useWatch({ control: form.control, name: "ward" });
  const guidelinesAgreed = useWatch({ control: form.control, name: "guidelinesAgreed" });

  // Fetch blocked slots when date changes
  useEffect(() => {
    if (!visitDate) return;
    const dateStr = format(visitDate, "yyyy-MM-dd");
    fetch(`/api/blocked-slots?date=${dateStr}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(setBlockedSlots)
      .catch(() => setBlockedSlots([]));
  }, [visitDate]);

  // Detect if selected time overlaps any block
  const activeConflicts = blockedSlots.filter(b => {
    if (ward && b.ward && b.ward !== ward) return false;
    if (!visitTime || !durationMinutes) return false;
    const reqStart = timeToMin(visitTime);
    const reqEnd = reqStart + Number(durationMinutes);
    const blockStart = timeToMin(b.startTime);
    const blockEnd = timeToMin(b.endTime);
    return reqStart < blockEnd && reqEnd > blockStart;
  });

  const onSubmit = (values: z.infer<typeof requestSchema>) => {
    const structuredNotes = buildBookingNotes(
      values.relationship,
      values.visitorCount,
      values.notes || ""
    );

    createBookingMutation.mutate(
      {
        data: {
          patientName: values.patientName,
          ward: values.ward || null,
          notes: structuredNotes,
          visitDate: format(values.visitDate, "yyyy-MM-dd"),
          visitTime: values.visitTime,
          durationMinutes: values.durationMinutes as 30 | 60 | 90,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Request submitted", description: "Your visit request is pending approval." });
          onSuccess();
          setIsOpen(false);
          form.reset();
        },
        onError: (error: unknown) => {
          const e = error as { data?: { error?: string }; message?: string };
          toast({
            title: "Failed to submit request",
            description: e.data?.error || e.message || "An error occurred",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Request a Visit</DialogTitle>
          <DialogDescription>
            All requests are reviewed by ward staff before confirmation.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-1 py-2">
          <form id="request-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-1 pb-2">

            {/* ICU Visiting Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1.5 text-xs text-blue-800">
              <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                <Info className="w-3.5 h-3.5 shrink-0" />
                ICU Visiting Guidelines
              </div>
              <ul className="space-y-1 pl-5 list-disc text-blue-700">
                <li>Maximum <strong>2 visitors</strong> at the bedside at any time</li>
                <li>All visitors must wash hands before entering and leaving</li>
                <li>Visits may be paused during procedures or clinical emergencies</li>
                <li>Staff may protect certain periods for family-only or medical meetings</li>
                <li>Children under 12 require prior approval from the ward sister</li>
                <li>Do not visit if you have symptoms of infection or illness</li>
              </ul>
            </div>

            {/* Conflict warning */}
            {activeConflicts.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-start gap-2 text-sm text-amber-800">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">Potential scheduling conflict</p>
                  {activeConflicts.map(b => (
                    <p key={b.id} className="text-xs mt-0.5">
                      {BLOCK_LABELS[b.type]}: {b.startTime}–{b.endTime}
                      {b.description ? ` — ${b.description}` : ""}
                    </p>
                  ))}
                  <p className="text-xs mt-1 text-amber-700">You may still submit, but staff may decline or reschedule this visit.</p>
                </div>
              </div>
            )}

            {/* Patient info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  placeholder="Full name of patient"
                  {...form.register("patientName")}
                  data-testid="input-patient-name"
                />
                {form.formState.errors.patientName && (
                  <p className="text-sm text-destructive">{form.formState.errors.patientName.message}</p>
                )}
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="ward">Ward (Optional)</Label>
                <Input
                  id="ward"
                  placeholder="e.g. ICU Ward A"
                  {...form.register("ward")}
                  data-testid="input-ward"
                />
              </div>
            </div>

            {/* Relationship + visitor count */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Your Relationship</Label>
                <Select
                  value={form.watch("relationship")}
                  onValueChange={(val) => form.setValue("relationship", val, { shouldValidate: true })}
                >
                  <SelectTrigger data-testid="select-relationship">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spouse / Partner">Spouse / Partner</SelectItem>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Child (adult)">Child (adult)</SelectItem>
                    <SelectItem value="Sibling">Sibling</SelectItem>
                    <SelectItem value="Grandparent">Grandparent</SelectItem>
                    <SelectItem value="Close Friend">Close Friend</SelectItem>
                    <SelectItem value="Other family">Other family</SelectItem>
                    <SelectItem value="Carer">Carer</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.relationship && (
                  <p className="text-sm text-destructive">{form.formState.errors.relationship.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Number of Visitors</Label>
                <Select
                  value={String(form.watch("visitorCount"))}
                  onValueChange={(val) => form.setValue("visitorCount", Number(val))}
                >
                  <SelectTrigger data-testid="select-visitor-count">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 visitor</SelectItem>
                    <SelectItem value="2">2 visitors (max at bedside)</SelectItem>
                    <SelectItem value="3">3 (requires staff approval)</SelectItem>
                    <SelectItem value="4">4 (requires staff approval)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date + time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Visit Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!visitDate && "text-muted-foreground"}`}
                      data-testid="button-date-picker"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {visitDate ? format(visitDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={visitDate}
                      onSelect={(date) => form.setValue("visitDate", date as Date, { shouldValidate: true })}
                      disabled={(date) => isBefore(date, startOfDay(new Date()))}
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.visitDate && (
                  <p className="text-sm text-destructive">{form.formState.errors.visitDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select
                  value={visitTime}
                  onValueChange={(val) => form.setValue("visitTime", val)}
                >
                  <SelectTrigger data-testid="select-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.visitTime && (
                  <p className="text-sm text-destructive">{form.formState.errors.visitTime.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Select
                value={durationMinutes?.toString()}
                onValueChange={(val) => form.setValue("durationMinutes", Number(val))}
              >
                <SelectTrigger data-testid="select-duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1 hour 30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes for Staff (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="e.g. I will be arriving with my brother. My mother may need extra time to greet us."
                {...form.register("notes")}
                className="resize-none"
                data-testid="input-notes"
              />
            </div>

            {/* Guidelines acknowledgement */}
            <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <Checkbox
                id="guidelines-agreed"
                checked={guidelinesAgreed}
                onCheckedChange={(v) => form.setValue("guidelinesAgreed", v === true, { shouldValidate: true })}
                data-testid="checkbox-guidelines"
              />
              <div>
                <label htmlFor="guidelines-agreed" className="text-sm font-medium text-slate-700 cursor-pointer leading-snug">
                  I have read and agree to the ICU visiting guidelines
                </label>
                <p className="text-xs text-slate-500 mt-0.5">I understand visits may be paused or rescheduled at the discretion of clinical staff.</p>
                {form.formState.errors.guidelinesAgreed && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.guidelinesAgreed.message}</p>
                )}
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="mt-4 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={createBookingMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="request-form"
            disabled={createBookingMutation.isPending}
            data-testid="button-submit-request"
          >
            {createBookingMutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
