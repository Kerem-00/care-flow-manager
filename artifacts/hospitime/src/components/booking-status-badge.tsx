import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "@workspace/api-client-react";

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  switch (status) {
    case BookingStatus.pending:
      return (
        <Badge variant="secondary" className={`bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 ${className}`} data-testid={`status-badge-${status}`}>
          Pending Review
        </Badge>
      );
    case BookingStatus.approved:
      return (
        <Badge variant="secondary" className={`bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 ${className}`} data-testid={`status-badge-${status}`}>
          Approved
        </Badge>
      );
    case BookingStatus.rejected:
      return (
        <Badge variant="destructive" className={`bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200 ${className}`} data-testid={`status-badge-${status}`}>
          Declined
        </Badge>
      );
    case BookingStatus.cancelled:
      return (
        <Badge variant="outline" className={`bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200 ${className}`} data-testid={`status-badge-${status}`}>
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline" className={className} data-testid={`status-badge-${status}`}>{status}</Badge>;
  }
}
