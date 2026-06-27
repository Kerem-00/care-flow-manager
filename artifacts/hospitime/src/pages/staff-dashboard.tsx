import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutWrapper } from "@/components/layout-wrapper";
import {
  useRejectBooking,
  useCancelBooking,
  getGetStaffStatsQueryKey,
  getGetBookingsQueryKey,
  getGetStaffStatsQueryOptions,
  getGetBookingsQueryOptions,
  getGetRecentActivityQueryOptions,
  Booking,
  GetBookingsStatus
} from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isTomorrow, formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Users,
  Clock,
  Calendar as CalendarIcon,
  Filter,
  AlertCircle,
  AlertTriangle,
  Activity,
  TrendingDown,
  TrendingUp,
  Download,
  RefreshCw,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WardSchedule } from "@/components/ward-schedule";
import { StaffPatients } from "@/components/staff-patients";
import { StaffMessages } from "@/components/staff-messages";
import { parseBookingNotes, QUICK_INSTRUCTIONS } from "@/lib/booking-utils";
import { Checkbox } from "@/components/ui/checkbox";

export default function StaffDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<GetBookingsStatus | "all">("all");
  const [bookingSearch, setBookingSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [bookingToApprove, setBookingToApprove] = useState<Booking | null>(null);
  const [approveInstructions, setApproveInstructions] = useState<string[]>([]);
  const [approveCustomNote, setApproveCustomNote] = useState("");
  const [approvePending, setApprovePending] = useState(false);
  const [conflictData, setConflictData] = useState<{
    totalVisitors: number;
    incoming: number;
    alreadyApproved: number;
    overlapping: Booking[];
  } | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "staff")) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const { data: stats, isLoading: statsLoading } = useQuery({ ...getGetStaffStatsQueryOptions(), refetchInterval: 60_000 });

  const queryParams = statusFilter === "all" ? undefined : { status: statusFilter as GetBookingsStatus };
  const { data: bookings, isLoading: bookingsLoading } = useQuery({ ...getGetBookingsQueryOptions(queryParams), refetchInterval: 30_000 });
  // Always fetch approved bookings separately for the today's schedule panel
  const { data: approvedBookings } = useQuery({ ...getGetBookingsQueryOptions({ status: "approved" as GetBookingsStatus }), refetchInterval: 60_000 });
  const { data: recentActivity, isLoading: activityLoading } = useQuery({ ...getGetRecentActivityQueryOptions(), refetchInterval: 60_000 });

  // Unread family message count for Messages tab badge
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  useEffect(() => {
    const fetch_ = () =>
      fetch("/api/messages/unread-count", { credentials: "include" })
        .then(r => r.json())
        .then(d => { if (typeof d?.count === "number") setUnreadMsgCount(d.count); })
        .catch(() => {});
    fetch_();
    const id = setInterval(fetch_, 60_000);
    return () => clearInterval(id);
  }, []);

  const rejectMutation = useRejectBooking();
  const cancelMutation = useCancelBooking();

  // Notify staff when new pending bookings arrive during the session
  const prevPendingCountRef = useRef<number | null>(null);
  useEffect(() => {
    const count = stats?.pendingRequests ?? 0;
    if (prevPendingCountRef.current !== null && count > prevPendingCountRef.current) {
      const diff = count - prevPendingCountRef.current;
      toast({
        title: `${diff} new booking request${diff > 1 ? "s" : ""}`,
        description: "A visitor has submitted a new visit request for your review.",
      });
    }
    prevPendingCountRef.current = count;
  }, [stats?.pendingRequests]);

  const handleQuickApprove = async (booking: Booking) => {
    try {
      const res = await fetch(`/api/bookings/${booking.id}/approve`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions: null, force: false }),
      });
      if (res.status === 409) {
        openApproveDialog(booking);
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to approve");
      }
      toast({ title: "Visit approved", description: `${booking.visitorName}'s visit has been confirmed.` });
      queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetStaffStatsQueryKey() });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "An error occurred";
      toast({ title: "Action failed", description: msg, variant: "destructive" });
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getGetStaffStatsQueryKey() }),
      new Promise(r => setTimeout(r, 600)),
    ]);
    setLastRefreshed(new Date());
    setRefreshing(false);
  };

  const openApproveDialog = (booking: Booking) => {
    setBookingToApprove(booking);
    setApproveInstructions([]);
    setApproveCustomNote("");
    setConflictData(null);
    setApproveDialogOpen(true);
  };

  const handleApprove = async (force = false) => {
    if (!bookingToApprove) return;
    setApprovePending(true);
    const parts = [...approveInstructions];
    if (approveCustomNote.trim()) parts.push(approveCustomNote.trim());
    const instructions = parts.length > 0 ? parts.join("\n") : null;
    try {
      const res = await fetch(`/api/bookings/${bookingToApprove.id}/approve`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions, force }),
      });
      if (res.status === 409) {
        const data = await res.json();
        setConflictData(data);
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to approve");
      }
      toast({ title: "Booking approved", description: "The visitor has been notified." });
      queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetStaffStatsQueryKey() });
      setApproveDialogOpen(false);
      setBookingToApprove(null);
      setConflictData(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "An error occurred";
      toast({ title: "Action failed", description: msg, variant: "destructive" });
    } finally {
      setApprovePending(false);
    }
  };

  const handleReject = () => {
    if (!selectedBooking) return;
    rejectMutation.mutate({ 
      id: selectedBooking.id, 
      data: { reason: rejectionReason || null }
    }, {
      onSuccess: () => {
        toast({ title: "Booking rejected", description: "The visitor has been notified." });
        queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStaffStatsQueryKey() });
        setRejectDialogOpen(false);
        setRejectionReason("");
        setSelectedBooking(null);
      },
      onError: (error: unknown) => {
        const e = error as { data?: { error?: string }; message?: string };
        toast({ title: "Action failed", description: e.data?.error || e.message || "An error occurred", variant: "destructive" });
      }
    });
  };

  const handleCancel = (id: number) => {
    cancelMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Booking cancelled", description: "The booking was successfully cancelled." });
        queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStaffStatsQueryKey() });
      },
      onError: (error: unknown) => {
        const e = error as { data?: { error?: string }; message?: string };
        toast({ title: "Action failed", description: e.data?.error || e.message || "An error occurred", variant: "destructive" });
      }
    });
  };

  const openRejectDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  if (authLoading || !user) return null;

  const formatRelativeDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    return format(d, "MMM dd, yyyy");
  };

  // CSV export for current booking view
  const exportCSV = () => {
    const rows = [
      ["Status", "Patient", "Ward", "Visitor", "Email", "Date", "Time", "Duration", "Requested At"],
      ...(bookings ?? []).map(b => [
        b.status,
        b.patientName ?? "",
        b.ward ?? "",
        b.visitorName ?? "",
        b.visitorEmail ?? "",
        b.visitDate,
        b.visitTime,
        `${b.durationMinutes} min`,
        format(new Date(b.requestedAt), "d MMM yyyy HH:mm"),
      ]),
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = `bookings-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // Today's approved visits (uses dedicated approved-only query so the panel works regardless of status filter)
  const todaysVisits = (approvedBookings ?? [])
    .filter(b => isToday(new Date(b.visitDate)))
    .sort((a, b) => a.visitTime.localeCompare(b.visitTime));

  // Group bookings: pending first, then sort by visit date, with search filter
  const sortedBookings = bookings ? [...bookings]
    .filter(b => {
      if (!bookingSearch.trim()) return true;
      const q = bookingSearch.toLowerCase();
      return (
        b.patientName?.toLowerCase().includes(q) ||
        b.visitorName?.toLowerCase().includes(q) ||
        b.visitorEmail?.toLowerCase().includes(q) ||
        b.ward?.toLowerCase().includes(q) ||
        b.status?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime();
    }) : [];

  return (
    <LayoutWrapper>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ward Overview</h1>
          <p className="text-slate-500 mt-1">Manage visitor access and review pending requests.</p>
        </div>

        {/* Stats always visible */}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-primary text-white border-none shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 p-4">
              <AlertCircle className="w-24 h-24" />
            </div>
            <CardHeader className="pb-2 pt-4 px-4 relative z-10">
              <CardTitle className="text-sm font-medium text-white/80">Action Required</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 relative z-10">
              {statsLoading
                ? <div className="h-9 w-12 bg-white/20 animate-pulse rounded" />
                : <div className="text-3xl font-bold">{stats?.pendingRequests ?? 0}</div>
              }
              <p className="text-xs text-white/80 mt-1">Pending requests</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-slate-600">Today's Visits</CardTitle>
              <CalendarIcon className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {statsLoading
                ? <div className="h-8 w-12 bg-slate-200 animate-pulse rounded" />
                : <div className="text-2xl font-bold text-slate-900">{stats?.approvedToday ?? 0}</div>
              }
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-slate-600">Total Visitors</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {statsLoading
                ? <div className="h-8 w-12 bg-slate-200 animate-pulse rounded" />
                : <div className="text-2xl font-bold text-slate-900">{stats?.totalVisitors ?? 0}</div>
              }
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-slate-600">This Week</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-1">
              {statsLoading ? (
                <div className="h-8 w-12 bg-slate-200 animate-pulse rounded" />
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <TrendingUp className="w-3.5 h-3.5" /> Approved
                    </span>
                    <span className="font-bold text-slate-900">{stats?.approvedThisWeek ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-rose-500">
                      <TrendingDown className="w-3.5 h-3.5" /> Declined
                    </span>
                    <span className="font-bold text-slate-900">{stats?.rejectedThisWeek ?? 0}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList className="h-10 flex-wrap">
            <TabsTrigger value="today" className="text-sm">
              Today's Schedule
              {todaysVisits.length > 0 && (
                <span className="ml-2 bg-emerald-500 text-white text-xs rounded-full px-1.5 h-5 min-w-[20px] flex items-center justify-center font-bold">
                  {todaysVisits.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="text-sm">
              Visitor Requests
              {stats && stats.pendingRequests > 0 && (
                <span className="ml-2 bg-primary text-white text-xs rounded-full px-1.5 h-5 min-w-[20px] flex items-center justify-center font-bold">
                  {stats.pendingRequests}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-sm">Ward Schedule</TabsTrigger>
            <TabsTrigger value="patients" className="text-sm">Patient Records</TabsTrigger>
            <TabsTrigger value="messages" className="text-sm" onClick={() => setUnreadMsgCount(0)}>
              Family Messages
              {unreadMsgCount > 0 && (
                <span className="ml-2 bg-rose-500 text-white text-xs rounded-full px-1.5 h-5 min-w-[20px] flex items-center justify-center font-bold">
                  {unreadMsgCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-sm">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-0">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Today's Schedule — {todaysVisits.length} approved visit{todaysVisits.length !== 1 ? "s" : ""}
                </h3>
              </div>
              {todaysVisits.length === 0 ? (
                <div className="px-4 py-10 text-center text-slate-400 text-sm">No approved visits scheduled for today.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {todaysVisits.map(b => {
                    const meta = parseBookingNotes(b.notes);
                    return (
                      <div key={b.id} className="px-4 py-3 flex items-center gap-4 text-sm hover:bg-slate-50 transition-colors">
                        <span className="font-mono font-semibold text-primary w-14 shrink-0">{b.visitTime}</span>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-slate-900">{b.patientName}</span>
                          {b.ward && <span className="text-slate-400 text-xs ml-2">{b.ward}</span>}
                        </div>
                        <div className="text-right min-w-0 shrink-0">
                          <span className="text-slate-700 text-sm">{b.visitorName}</span>
                          {meta.relationship && (
                            <span className="block text-[10px] text-slate-400">{meta.relationship}{meta.visitorCount && meta.visitorCount > 1 ? ` · ${meta.visitorCount} visitors` : ""}</span>
                          )}
                        </div>
                        <span className="text-slate-400 text-xs shrink-0 w-12 text-right">{b.durationMinutes} min</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-0">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-slate-500" />
                Visitor Requests
              </h2>
              <span className="text-xs text-slate-400 hidden sm:block">
                Updated {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patient, visitor…"
                  value={bookingSearch}
                  onChange={e => setBookingSearch(e.target.value)}
                  className="pl-8 pr-3 h-9 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-48"
                />
              </div>
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as GetBookingsStatus | "all")}>
                <SelectTrigger className="w-[140px] bg-white h-9" data-testid="select-filter-status">
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
              <Button variant="outline" size="sm" onClick={exportCSV} className="h-9 gap-1.5 text-slate-600 border-slate-200">
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="h-9 gap-1.5 text-slate-600 border-slate-200"
                title="Refresh bookings"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {bookingsLoading ? (
            <div className="divide-y divide-slate-100">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                  <div className="h-5 w-20 bg-slate-200 rounded-full" />
                  <div className="h-4 w-28 bg-slate-200 rounded" />
                  <div className="h-4 w-36 bg-slate-200 rounded" />
                  <div className="h-4 w-28 bg-slate-200 rounded ml-auto" />
                </div>
              ))}
            </div>
          ) : sortedBookings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">All caught up</h3>
              <p className="text-slate-500">No requests matching your current filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Visitor Details</TableHead>
                    <TableHead>Patient & Ward</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {sortedBookings.map((booking) => (
                      <motion.tr 
                        key={booking.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`group ${booking.status === 'pending' ? 'bg-amber-50/30' : ''}`}
                        data-testid={`row-booking-${booking.id}`}
                      >
                        <TableCell>
                          <BookingStatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium whitespace-nowrap ${isToday(new Date(booking.visitDate)) ? "text-primary" : "text-slate-900"}`}>
                            {formatRelativeDate(booking.visitDate)}
                          </div>
                          <div className="text-sm text-slate-500 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {booking.visitTime} <span className="mx-1">•</span> {booking.durationMinutes}m
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{booking.visitorName}</div>
                          <div className="text-sm text-slate-500 truncate max-w-[200px]" title={booking.visitorEmail}>
                            {booking.visitorEmail}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{booking.patientName}</div>
                          <div className="text-sm text-slate-500">
                            {booking.ward || "Unspecified ward"}
                          </div>
                          {booking.notes && (() => {
                            const meta = parseBookingNotes(booking.notes);
                            return (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {meta.relationship && (
                                  <span className="text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100 px-1.5 py-0.5 rounded-full">
                                    {meta.relationship}
                                  </span>
                                )}
                                {meta.visitorCount != null && (
                                  <span className="text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-full">
                                    {meta.visitorCount} visitor{meta.visitorCount !== 1 ? "s" : ""}
                                  </span>
                                )}
                                {meta.userNotes && (
                                  <span className="text-[10px] text-slate-500 max-w-[160px] truncate" title={meta.userNotes}>
                                    {meta.userNotes}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-right">
                          {booking.status === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => openRejectDialog(booking)}
                                disabled={rejectMutation.isPending || approvePending}
                                data-testid={`button-reject-${booking.id}`}
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                onClick={() => handleQuickApprove(booking)}
                                disabled={rejectMutation.isPending || approvePending}
                                title="Quick approve (no instructions)"
                              >
                                <Zap className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => openApproveDialog(booking)}
                                disabled={rejectMutation.isPending || approvePending}
                                data-testid={`button-approve-${booking.id}`}
                              >
                                Approve
                              </Button>
                            </div>
                          ) : booking.status === "approved" ? (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-slate-500 hover:text-rose-600"
                              onClick={() => handleCancel(booking.id)}
                              disabled={cancelMutation.isPending}
                              data-testid={`button-cancel-${booking.id}`}
                            >
                              Cancel Booking
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Reviewed by {booking.reviewedBy || 'System'}
                            </span>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
          </TabsContent>

          <TabsContent value="schedule">
            <WardSchedule bookings={approvedBookings ?? []} />
          </TabsContent>

          <TabsContent value="patients">
            <StaffPatients staffName={user.name} />
          </TabsContent>

          <TabsContent value="messages">
            <StaffMessages />
          </TabsContent>

          <TabsContent value="activity">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-500" />
                <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
              </div>
              {activityLoading ? (
                <div className="divide-y divide-slate-100">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-slate-200 shrink-0" />
                      <div className="h-4 w-48 bg-slate-200 rounded" />
                      <div className="h-3 w-20 bg-slate-100 rounded ml-auto" />
                    </div>
                  ))}
                </div>
              ) : !recentActivity || recentActivity.length === 0 ? (
                <p className="text-sm text-slate-500 p-4 text-center">No recent activity.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentActivity.slice(0, 20).map((item) => (
                    <li key={item.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        item.status === "approved" ? "bg-emerald-500" :
                        item.status === "rejected" ? "bg-rose-500" :
                        item.status === "cancelled" ? "bg-slate-400" : "bg-amber-400"
                      }`} />
                      <span className="text-slate-700 flex-1">
                        <span className="font-medium">{item.visitorName}</span>
                        <span className="text-slate-500"> — {item.action}</span>
                        <span className="text-slate-400 text-xs ml-2">{item.visitDate}</span>
                      </span>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {format(new Date(item.timestamp), "MMM d, HH:mm")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve Visit Request</DialogTitle>
            <DialogDescription>
              Optionally attach arrival instructions for <strong>{bookingToApprove?.visitorName}</strong>. These will be shown on their booking confirmation.
            </DialogDescription>
          </DialogHeader>
          {bookingToApprove && (
            <div className="py-2 space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
              {/* Booking summary */}
              <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient</span>
                  <span className="font-medium text-slate-900">{bookingToApprove.patientName}</span>
                </div>
                {bookingToApprove.ward && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ward</span>
                    <span className="font-medium text-slate-900">{bookingToApprove.ward}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Date &amp; Time</span>
                  <span className="font-medium text-slate-900">{format(new Date(bookingToApprove.visitDate), "MMM dd, yyyy")} · {bookingToApprove.visitTime} ({bookingToApprove.durationMinutes} min)</span>
                </div>
                {(() => {
                  const meta = parseBookingNotes(bookingToApprove.notes);
                  return meta.relationship ? (
                    <div className="flex justify-between pt-1 border-t border-slate-200 mt-1">
                      <span className="text-slate-500">Visitor</span>
                      <span className="font-medium text-slate-900">
                        {meta.relationship}{meta.visitorCount ? ` · ${meta.visitorCount} person${meta.visitorCount > 1 ? "s" : ""}` : ""}
                      </span>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Quick instruction chips */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Arrival Instructions (optional)</Label>
                <div className="space-y-1.5">
                  {QUICK_INSTRUCTIONS.map((instr) => {
                    const checked = approveInstructions.includes(instr);
                    return (
                      <div
                        key={instr}
                        className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${checked ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                        onClick={() => setApproveInstructions(prev =>
                          checked ? prev.filter(i => i !== instr) : [...prev, instr]
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => setApproveInstructions(prev =>
                            v ? [...prev, instr] : prev.filter(i => i !== instr)
                          )}
                          className="mt-0.5 shrink-0"
                        />
                        <span className="text-sm text-slate-700 leading-snug">{instr}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Free-text note */}
              <div className="space-y-1.5">
                <Label htmlFor="custom-note" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Additional Note (optional)</Label>
                <Textarea
                  id="custom-note"
                  placeholder="e.g. Please call the ward desk when you arrive at Level 3."
                  value={approveCustomNote}
                  onChange={(e) => setApproveCustomNote(e.target.value)}
                  className="resize-none h-20 text-sm"
                />
              </div>
            </div>
          )}

          {/* Visitor overlap warning */}
          {conflictData && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-2 text-sm mx-1">
              <div className="flex items-center gap-2 font-semibold text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Visitor limit exceeded — {conflictData.totalVisitors} visitors at this time slot
              </div>
              <p className="text-amber-700 text-xs">
                {conflictData.alreadyApproved} visitor{conflictData.alreadyApproved !== 1 ? "s" : ""} already approved for{" "}
                <strong>{bookingToApprove?.patientName}</strong> in this window.
                Adding {conflictData.incoming} more exceeds the ICU limit of 2.
              </p>
              <div className="border-t border-amber-200 pt-2 space-y-1">
                {conflictData.overlapping.map(b => {
                  const count = parseBookingNotes(b.notes).visitorCount ?? 1;
                  return (
                    <div key={b.id} className="text-xs text-amber-700 flex justify-between">
                      <span className="font-medium">{b.visitorName}</span>
                      <span>{b.visitTime} · {b.durationMinutes} min · {count} visitor{count !== 1 ? "s" : ""}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setApproveDialogOpen(false); setConflictData(null); }} disabled={approvePending}>
              Cancel
            </Button>
            {conflictData ? (
              <Button
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => handleApprove(true)}
                disabled={approvePending}
              >
                {approvePending ? "Approving..." : "Approve anyway"}
              </Button>
            ) : (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprove()} disabled={approvePending} data-testid="button-confirm-approve">
                {approvePending ? "Approving..." : "Approve Visit"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Decline Visit Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this request for <strong>{selectedBooking?.visitorName}</strong>? They will be notified via email.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedBooking && (
              <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-sm border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient</span>
                  <span className="font-medium text-slate-900">{selectedBooking.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium text-slate-900">{formatRelativeDate(selectedBooking.visitDate)} · {selectedBooking.visitTime}</span>
                </div>
                {(() => {
                  const meta = parseBookingNotes(selectedBooking.notes);
                  return (
                    <>
                      {meta.relationship && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Relationship</span>
                          <span className="font-medium text-slate-900">
                            {meta.relationship}{meta.visitorCount ? ` · ${meta.visitorCount} visitor${meta.visitorCount > 1 ? "s" : ""}` : ""}
                          </span>
                        </div>
                      )}
                      {meta.userNotes && (
                        <div className="pt-1 border-t border-slate-200 text-slate-600">
                          <span className="text-slate-500 block mb-0.5">Visitor note:</span>
                          <span className="italic">"{meta.userNotes}"</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Quick Reasons</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Ward is on restricted access.",
                  "Patient is currently too unwell to receive visitors.",
                  "A medical procedure is scheduled during this time.",
                  "Visitor limit already reached for this slot.",
                ].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRejectionReason(r)}
                    className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${rejectionReason === r ? "bg-rose-100 text-rose-700 border-rose-300" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <Textarea
                id="reason"
                placeholder="Or write a custom reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="resize-none h-20"
                data-testid="input-reject-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={rejectMutation.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending} data-testid="button-confirm-reject">
              {rejectMutation.isPending ? "Declining..." : "Decline Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LayoutWrapper>
  );
}
