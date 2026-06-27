import { Link } from "wouter";
import { Activity, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Activity className="w-5 h-5" />
          </div>
          <span className="font-semibold text-xl tracking-tight text-slate-900">HospiTime</span>
        </div>

        <div className="text-8xl font-bold text-slate-200 leading-none mb-2">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
        <p className="text-slate-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            Return to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
