import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { 
  useGetStaffStats, 
  useGetBookings, 
  useApproveBooking,
  useRejectBooking,
  useCancelBooking,
  getGetStaffStatsQueryKey, 
  getGetBookingsQueryKey,
  BookingStatus,
  Booking,
  GetBookingsStatus
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  XCircle, 
  Users, 
  Clock, 
  Calendar as CalendarIcon,
  ChevronDown,
  Search,
  Filter,
  AlertCircle
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

export default function StaffDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<GetBookingsStatus | "all">("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "staff")) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const { data: stats, isLoading: statsLoading } = useGetStaffStats({
    query: { enabled: !!user && user.role === "staff" }
  });

  const queryParams = statusFilter === "all" ? undefined : { status: statusFilter as GetBookingsStatus };
  const { data: bookings, isLoading: bookingsLoading } = useGetBookings(queryParams, {
    query: { enabled: !!user && user.role === "staff" }
  });

  const approveMutation = useApproveBooking();
  const rejectMutation = useRejectBooking();
  const cancelMutation = useCancelBooking();

  const handleApprove = (id: number) => {
    approveMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Booking approved", description: "The visitor has been notified." });
        queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStaffStatsQueryKey() });
      },
      onError: (error) => toast({ title: "Action failed", description: error.error, variant: "destructive" })
    });
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
      onError: (error) => toast({ title: "Action failed", description: error.error, variant: "destructive" })
    });
  };

  const handleCancel = (id: number) => {
    cancelMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Booking cancelled", description: "The booking was successfully cancelled." });
        queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStaffStatsQueryKey() });
      },
      onError: (error) => toast({ title: "Action failed", description: error.error, variant: "destructive" })
    });
  };

  const openRejectDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  if (authLoading || !user) return null;

  // Group bookings: pending first, then sort by visit date
  const sortedBookings = bookings ? [...bookings].sort((a, b) => {
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
              <div className="text-3xl font-bold">{statsLoading ? "-" : stats?.pendingRequests || 0}</div>
              <p className="text-xs text-white/80 mt-1">Pending requests</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-slate-600">Today's Visits</CardTitle>
              <CalendarIcon className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-slate-900">{statsLoading ? "-" : stats?.approvedToday || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-slate-600">Total Visitors</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-slate-900">{statsLoading ? "-" : stats?.totalVisitors || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-slate-600">Weekly Total</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-slate-900">{statsLoading ? "-" : stats?.approvedThisWeek || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-slate-500" />
              Visitor Requests
            </h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as GetBookingsStatus | "all")}>
                <SelectTrigger className="w-[160px] bg-white h-9" data-testid="select-filter-status">
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
          </div>

          {bookingsLoading ? (
            <div className="p-8 text-center text-slate-500">Loading requests...</div>
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
                          <div className="font-medium text-slate-900 whitespace-nowrap">
                            {format(new Date(booking.visitDate), "MMM dd, yyyy")}
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
                          {booking.notes && (
                            <div className="mt-1 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded inline-block max-w-[200px] truncate" title={booking.notes}>
                              Note: {booking.notes}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {booking.status === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                onClick={() => openRejectDialog(booking)}
                                disabled={rejectMutation.isPending || approveMutation.isPending}
                                data-testid={`button-reject-${booking.id}`}
                              >
                                Decline
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => handleApprove(booking.id)}
                                disabled={rejectMutation.isPending || approveMutation.isPending}
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
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Decline Visit Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this request for <strong>{selectedBooking?.visitorName}</strong>? They will be notified via email.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional but recommended)</Label>
              <Textarea 
                id="reason" 
                placeholder="e.g. Ward is currently restricted to essential medical staff only..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="resize-none"
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
