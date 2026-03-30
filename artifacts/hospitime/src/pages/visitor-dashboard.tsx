import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { 
  useGetVisitorStats, 
  useGetBookings, 
  useCreateBooking, 
  getGetVisitorStatsQueryKey, 
  getGetBookingsQueryKey,
  CreateBookingRequestDurationMinutes
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isBefore, startOfDay } from "date-fns";
import { CalendarIcon, Clock, Calendar as CalendarIconLucide, FileText, CheckCircle2, XCircle, AlertCircle, XOctagon, Plus } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
  "16:00", "16:30", "17:00", "17:30"
];

const requestSchema = z.object({
  patientName: z.string().min(2, { message: "Patient name is required" }),
  ward: z.string().optional(),
  visitDate: z.date({ required_error: "Date is required" }),
  visitTime: z.string({ required_error: "Time is required" }),
  durationMinutes: z.coerce.number(),
  notes: z.string().optional(),
});

export default function VisitorDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "visitor")) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const { data: stats, isLoading: statsLoading } = useGetVisitorStats({
    query: {
      enabled: !!user && user.role === "visitor",
    }
  });

  const { data: bookings, isLoading: bookingsLoading } = useGetBookings(undefined, {
    query: {
      enabled: !!user && user.role === "visitor",
    }
  });

  const createBookingMutation = useCreateBooking();

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      patientName: "",
      ward: "",
      visitTime: "10:00",
      durationMinutes: CreateBookingRequestDurationMinutes.NUMBER_60,
      notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof requestSchema>) => {
    const data = {
      patientName: values.patientName,
      ward: values.ward || null,
      notes: values.notes || null,
      visitDate: format(values.visitDate, "yyyy-MM-dd"),
      visitTime: values.visitTime,
      durationMinutes: values.durationMinutes as 30 | 60 | 90,
    };

    createBookingMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Request submitted", description: "Your visit request is pending approval." });
        queryClient.invalidateQueries({ queryKey: getGetVisitorStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetBookingsQueryKey() });
        setIsDialogOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast({ 
          title: "Failed to submit request", 
          description: error.error || "An error occurred", 
          variant: "destructive" 
        });
      }
    });
  };

  if (authLoading || !user) return null;

  return (
    <LayoutWrapper>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Visits</h1>
          <p className="text-slate-500 mt-1">Manage your ICU visit requests and schedule.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-slate-600">Upcoming</CardTitle>
              <CalendarIconLucide className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-slate-900">{statsLoading ? "-" : stats?.upcomingVisits || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-slate-900">{statsLoading ? "-" : stats?.pending || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-slate-600">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-slate-900">{statsLoading ? "-" : stats?.approved || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-slate-600">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-slate-900">{statsLoading ? "-" : stats?.total || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mt-8">
          <h2 className="text-xl font-semibold text-slate-900">Booking History</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-request">
                <Plus className="w-4 h-4 mr-2" />
                Request a Visit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Request a Visit</DialogTitle>
                <DialogDescription>
                  Please provide details for your visit. Ward staff will review your request.
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="max-h-[60vh] px-1 py-4">
                <form id="request-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-1">
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Patient Name</Label>
                    <Input id="patientName" placeholder="Full name of patient" {...form.register("patientName")} data-testid="input-patient-name" />
                    {form.formState.errors.patientName && <p className="text-sm text-destructive">{form.formState.errors.patientName.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ward">Ward / Bed Details (Optional)</Label>
                    <Input id="ward" placeholder="e.g. Ward 4, Bed 12" {...form.register("ward")} data-testid="input-ward" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Visit Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal ${!form.watch("visitDate") && "text-muted-foreground"}`}
                            data-testid="button-date-picker"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.watch("visitDate") ? format(form.watch("visitDate"), "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={form.watch("visitDate")}
                            onSelect={(date) => form.setValue("visitDate", date as Date)}
                            disabled={(date) => isBefore(date, startOfDay(new Date()))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {form.formState.errors.visitDate && <p className="text-sm text-destructive">{form.formState.errors.visitDate.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Select 
                        onValueChange={(val) => form.setValue("visitTime", val)} 
                        defaultValue={form.watch("visitTime")}
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
                      {form.formState.errors.visitTime && <p className="text-sm text-destructive">{form.formState.errors.visitTime.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select 
                      onValueChange={(val) => form.setValue("durationMinutes", Number(val))} 
                      defaultValue={form.watch("durationMinutes").toString()}
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
                      placeholder="e.g. I will be arriving with my brother..." 
                      {...form.register("notes")} 
                      className="resize-none"
                      data-testid="input-notes"
                    />
                  </div>
                </form>
              </ScrollArea>
              
              <DialogFooter className="mt-4 border-t pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={createBookingMutation.isPending}>Cancel</Button>
                <Button type="submit" form="request-form" disabled={createBookingMutation.isPending} data-testid="button-submit-request">
                  {createBookingMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {bookingsLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
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
            <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="mx-auto border-slate-200" data-testid="button-empty-request">
              Request your first visit
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow transition-shadow">
                  <div className={`h-1 w-full ${
                    booking.status === 'approved' ? 'bg-emerald-500' : 
                    booking.status === 'pending' ? 'bg-amber-400' : 
                    booking.status === 'rejected' ? 'bg-rose-500' : 'bg-slate-300'
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
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                            {booking.patientName}
                            <span className="text-sm font-normal text-slate-500">
                              {booking.ward && `• ${booking.ward}`}
                            </span>
                          </h4>
                          <div className="flex items-center text-slate-600 mt-1 gap-4 text-sm">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
                              {booking.visitTime} ({booking.durationMinutes} mins)
                            </span>
                          </div>
                          {booking.notes && (
                            <p className="text-sm text-slate-500 mt-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                              <span className="font-medium text-slate-700">Note:</span> {booking.notes}
                            </p>
                          )}
                          {booking.rejectionReason && booking.status === 'rejected' && (
                            <p className="text-sm text-rose-600 mt-2 bg-rose-50 p-2 rounded-md border border-rose-100 flex items-start gap-1.5">
                              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                              <span><span className="font-semibold">Reason:</span> {booking.rejectionReason}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                        <BookingStatusBadge status={booking.status} className="px-3 py-1" />
                        <span className="text-xs text-slate-400">
                          Requested {format(new Date(booking.requestedAt), "MMM dd, HH:mm")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
