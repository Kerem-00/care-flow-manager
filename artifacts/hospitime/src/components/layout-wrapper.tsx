import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Activity, LogOut, ShieldCheck, CalendarDays, HeartPulse, Menu, X } from "lucide-react";
import { useLocation, Link } from "wouter";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getRoleColor(role: string): string {
  if (role === "staff") return "bg-blue-500 text-white";
  if (role === "family") return "bg-purple-500 text-white";
  return "bg-green-500 text-white";
}

function NavLink({
  href,
  icon,
  label,
  badge,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: boolean;
  onClick?: () => void;
}) {
  const [location] = useLocation();
  const active = location === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
      {badge && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" aria-label="Unread messages" />
      )}
    </Link>
  );
}

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const { user, logout, isLogoutPending } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Poll unread message count for family users every 60 seconds
  useEffect(() => {
    if (!user || (user.role as string) !== "family") return;

    const fetchUnread = () => {
      fetch("/api/messages/unread-count", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (typeof data?.count === "number") setUnreadCount(data.count);
        })
        .catch(() => {});
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);
    return () => clearInterval(interval);
  }, [user]);

  const hasUnread = unreadCount > 0;

  const navLinks = user ? (
    user.role === "staff" ? (
      <NavLink
        href="/staff-dashboard"
        icon={<ShieldCheck className="w-4 h-4" />}
        label="Staff Dashboard"
      />
    ) : (user.role as string) === "family" ? (
      <>
        <NavLink
          href="/visitor-dashboard"
          icon={<CalendarDays className="w-4 h-4" />}
          label="My Bookings"
        />
        <NavLink
          href="/patient-portal"
          icon={<HeartPulse className="w-4 h-4" />}
          label="Patient Portal"
          badge={hasUnread}
        />
      </>
    ) : (
      <NavLink
        href="/visitor-dashboard"
        icon={<CalendarDays className="w-4 h-4" />}
        label="My Bookings"
      />
    )
  ) : null;

  // Same links but with onClick to close mobile menu
  const mobileNavLinks = user ? (
    user.role === "staff" ? (
      <NavLink
        href="/staff-dashboard"
        icon={<ShieldCheck className="w-4 h-4" />}
        label="Staff Dashboard"
        onClick={() => setMobileMenuOpen(false)}
      />
    ) : (user.role as string) === "family" ? (
      <>
        <NavLink
          href="/visitor-dashboard"
          icon={<CalendarDays className="w-4 h-4" />}
          label="My Bookings"
          onClick={() => setMobileMenuOpen(false)}
        />
        <NavLink
          href="/patient-portal"
          icon={<HeartPulse className="w-4 h-4" />}
          label="Patient Portal"
          badge={hasUnread}
          onClick={() => setMobileMenuOpen(false)}
        />
      </>
    ) : (
      <NavLink
        href="/visitor-dashboard"
        icon={<CalendarDays className="w-4 h-4" />}
        label="My Bookings"
        onClick={() => setMobileMenuOpen(false)}
      />
    )
  ) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-semibold text-xl tracking-tight text-slate-900">HospiTime</span>
          </div>

          {/* Desktop nav */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks}
            </nav>
          )}

          {/* Right side: avatar + sign out + mobile hamburger */}
          {user && (
            <div className="flex items-center gap-3">
              {/* Avatar with initials */}
              <div className="hidden sm:flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${getRoleColor(user.role)}`}
                  title={user.name}
                >
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm leading-tight">{user.name}</p>
                  <p className="text-xs text-slate-500 leading-tight capitalize">
                    {(user.role as string) === "staff"
                      ? (user.jobTitle ?? "Ward Staff")
                      : (user.role as string) === "family"
                      ? "Family Member"
                      : "Visitor"}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                disabled={isLogoutPending}
                className="text-slate-600 border-slate-200 hover:bg-slate-50 ml-1"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sign out</span>
                <span className="sm:hidden">Out</span>
              </Button>

              {/* Hamburger button — visible only on small screens */}
              <button
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileMenuOpen((prev) => !prev)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile slide-down menu */}
        {user && mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-1">
            {mobileNavLinks}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
