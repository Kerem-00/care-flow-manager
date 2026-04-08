import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Activity, LogOut, User as UserIcon, ShieldCheck } from "lucide-react";

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const { user, logout, isLogoutPending } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-semibold text-xl tracking-tight text-slate-900">HospiTime</span>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 shrink-0">
                  {user.role === "staff"
                    ? <ShieldCheck className="w-4 h-4 text-primary" />
                    : <UserIcon className="w-4 h-4 text-slate-500" />
                  }
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm leading-tight">{user.name}</p>
                  <p className="text-xs text-slate-500 leading-tight capitalize">
                    {user.role === "staff" ? "Ward Staff" : "Visitor"}
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
            </div>
          )}
        </div>
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
