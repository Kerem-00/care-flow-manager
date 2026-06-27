import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useLogin, useRegister, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Clock,
  ShieldCheck,
  HeartPulse,
  CalendarDays,
  ChevronDown,
  Users,
  Stethoscope,
  UserCheck,
  MessageSquare,
  BadgeCheck,
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(["visitor", "family", "staff"]),
  staffCode: z.string().optional(),
}).refine(data => {
  if (data.role === "staff" && (!data.staffCode || data.staffCode.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Staff code is required for hospital staff",
  path: ["staffCode"],
});

const DEMO_ACCOUNTS = [
  {
    label: "Staff",
    email: "staff@hospitime.demo",
    password: "demo1234",
    description: "Ward manager view",
    icon: <Stethoscope className="w-4 h-4" />,
    color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    label: "Family",
    email: "familymember@hospitime.demo",
    password: "demo1234",
    description: "Patient family portal",
    icon: <HeartPulse className="w-4 h-4" />,
    color: "text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100",
  },
  {
    label: "Visitor",
    email: "visitor@hospitime.demo",
    password: "demo1234",
    description: "Book visit slots",
    icon: <CalendarDays className="w-4 h-4" />,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
  },
] as const;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isDemoPanelOpen, setIsDemoPanelOpen] = useState(false);

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "visitor", staffCode: "" },
  });

  const roleOptions = [
    {
      value: "visitor",
      label: "Visitor",
      icon: <CalendarDays className="mb-2 h-5 w-5" />,
      description: "Book and manage timed ICU visit appointments",
    },
    {
      value: "family",
      label: "Family",
      icon: <HeartPulse className="mb-2 h-5 w-5" />,
      description: "View patient records, vitals and message the care team",
    },
    {
      value: "staff",
      label: "Staff",
      icon: <ShieldCheck className="mb-2 h-5 w-5" />,
      description: "Manage ward visits, approve requests and update patient records",
    },
  ];

  const selectedRole = useWatch({ control: registerForm.control, name: "role" });

  useEffect(() => {
    if (user && !isLoading) {
      if (user.role === "staff") setLocation("/staff-dashboard");
      else if ((user.role as string) === "family") setLocation("/patient-portal");
      else setLocation("/visitor-dashboard");
    }
  }, [user, isLoading, setLocation]);

  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === "object") {
      const e = error as { data?: { error?: string }; message?: string };
      return e.data?.error || e.message || "An unexpected error occurred";
    }
    return "An unexpected error occurred";
  };

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({ data: values }, {
      onSuccess: (response) => {
        toast({ title: "Welcome back", description: response.message });
        queryClient.setQueryData(getGetCurrentUserQueryKey(), response.user);
      },
      onError: (error) => {
        toast({
          title: "Sign in failed",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      },
    });
  };

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate({ data: { ...values, role: values.role as "visitor" | "staff" } }, {
      onSuccess: (response) => {
        toast({ title: "Account created", description: response.message });
        queryClient.setQueryData(getGetCurrentUserQueryKey(), response.user);
      },
      onError: (error) => {
        toast({
          title: "Registration failed",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      },
    });
  };

  const fillDemoAccount = (email: string, password: string) => {
    loginForm.setValue("email", email, { shouldValidate: true });
    loginForm.setValue("password", password, { shouldValidate: true });
    setIsDemoPanelOpen(false);
  };

  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Activity className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50">

      {/* ── Left: Brand Hero Panel ── */}
      <div className="hidden lg:flex flex-col justify-between bg-primary relative overflow-hidden text-white p-12 xl:p-16">
        {/* Background texture */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/80 z-10" />
          <img
            src="/auth-bg.png"
            alt="Hospital environment"
            className="w-full h-full object-cover opacity-30 grayscale"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 z-20 opacity-5"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-20">
          <div className="flex items-center gap-3 mb-14">
            <div className="bg-white/15 p-2.5 rounded-xl backdrop-blur-sm border border-white/20">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight">HospiTime</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-5 tracking-tight">
            Structured ICU visiting<br />for every family.
          </h1>
          <p className="text-base text-white/75 leading-relaxed max-w-sm">
            Critical care communication doesn't have to be chaotic. A calm, fair, evidence-based platform for scheduling visits — reducing stress for families and burden for clinical staff.
          </p>
        </div>

        {/* Feature bullets */}
        <div className="relative z-20 space-y-6">
          {[
            {
              icon: <CalendarDays className="w-5 h-5 text-white/90" />,
              title: "Managed Visit Scheduling",
              body: "Book 30, 60, or 90-minute ICU slots with instant status updates.",
            },
            {
              icon: <HeartPulse className="w-5 h-5 text-white/90" />,
              title: "Real-time Patient Vitals",
              body: "Authorised family members can view live patient data from the portal.",
            },
            {
              icon: <MessageSquare className="w-5 h-5 text-white/90" />,
              title: "Secure Ward Communication",
              body: "Direct messaging between families and clinical care teams.",
            },
            {
              icon: <BadgeCheck className="w-5 h-5 text-white/90" />,
              title: "Staff-Controlled Approvals",
              body: "Ward managers review every request based on clinical capacity.",
            },
          ].map((feature) => (
            <div key={feature.title} className="flex items-start gap-4">
              <div className="bg-white/10 p-2 rounded-lg border border-white/15 shrink-0 mt-0.5">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-snug">{feature.title}</h3>
                <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{feature.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative z-20 pt-8 border-t border-white/10">
          <p className="text-xs text-white/40">© 2026 HospiTime. Secure healthcare visitor management.</p>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-white">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center gap-1 mb-10 text-center">
            <div className="bg-primary/10 p-3 rounded-xl text-primary mb-2">
              <Activity className="w-7 h-7" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">HospiTime</span>
            <span className="text-sm text-slate-500">ICU Visitor Coordination</span>
          </div>

          {/* Desktop heading (changes with tab) */}
          <div className="hidden lg:block mb-7">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeTab === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              {activeTab === "login"
                ? "Sign in to manage your ICU visit requests."
                : "Register to start scheduling structured visits."}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-11 bg-slate-100 rounded-xl p-1">
              <TabsTrigger
                value="login"
                className="text-sm font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                data-testid="tab-login"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="text-sm font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                data-testid="tab-register"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === "login" ? -12 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === "login" ? 12 : -12 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {/* ──────────── LOGIN TAB ──────────── */}
                {activeTab === "login" ? (
                  <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
                    <CardHeader className="space-y-1 pb-4 pt-6 px-6 lg:hidden">
                      <CardTitle className="text-xl font-bold tracking-tight">Welcome back</CardTitle>
                      <CardDescription className="text-slate-500">
                        Sign in to manage your visits and requests.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 pb-6 pt-4 lg:pt-6">
                      {/* Demo accounts collapsible */}
                      <div className="mb-5 rounded-xl border border-dashed border-slate-300 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setIsDemoPanelOpen((prev) => !prev)}
                          className="flex w-full items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-semibold text-slate-600">Demo Accounts</span>
                            <span className="text-xs text-slate-400 font-normal">&mdash; click to prefill</span>
                          </div>
                          <motion.div
                            animate={{ rotate: isDemoPanelOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                          {isDemoPanelOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-3 gap-2 p-3 bg-white">
                                {DEMO_ACCOUNTS.map((account) => (
                                  <button
                                    key={account.label}
                                    type="button"
                                    onClick={() => fillDemoAccount(account.email, account.password)}
                                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-colors cursor-pointer ${account.color}`}
                                  >
                                    {account.icon}
                                    <span className="text-xs font-bold leading-none">{account.label}</span>
                                    <span className="text-[10px] leading-tight opacity-70">{account.description}</span>
                                  </button>
                                ))}
                              </div>
                              <p className="px-3 pb-3 text-[10px] text-slate-400 text-center">
                                Password for all demo accounts: <span className="font-mono font-semibold text-slate-500">demo1234</span>
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="login-email" className="text-sm font-medium text-slate-700">Email address</Label>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="name@example.com"
                            className="h-10 rounded-lg text-sm"
                            {...loginForm.register("email")}
                            data-testid="input-login-email"
                          />
                          {loginForm.formState.errors.email && (
                            <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="login-password" className="text-sm font-medium text-slate-700">Password</Label>
                          <Input
                            id="login-password"
                            type="password"
                            className="h-10 rounded-lg text-sm"
                            {...loginForm.register("password")}
                            data-testid="input-login-password"
                          />
                          {loginForm.formState.errors.password && (
                            <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                          )}
                        </div>
                        <Button
                          type="submit"
                          className="w-full h-10 mt-2 font-semibold rounded-lg"
                          disabled={loginMutation.isPending}
                          data-testid="button-login-submit"
                        >
                          {loginMutation.isPending ? "Signing in..." : "Sign in"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  /* ──────────── REGISTER TAB ──────────── */
                  <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
                    <CardHeader className="space-y-1 pb-4 pt-6 px-6 lg:hidden">
                      <CardTitle className="text-xl font-bold tracking-tight">Create an account</CardTitle>
                      <CardDescription className="text-slate-500">
                        Join HospiTime to schedule structured visits.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 pb-6 pt-4 lg:pt-6">
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">

                        {/* Role selector */}
                        <div className="space-y-2.5">
                          <Label className="text-sm font-medium text-slate-700">I am registering as a&hellip;</Label>
                          <RadioGroup
                            value={selectedRole}
                            onValueChange={(v) => registerForm.setValue("role", v as "visitor" | "family" | "staff")}
                            className="grid grid-cols-3 gap-2"
                            data-testid="radio-role"
                          >
                            {roleOptions.map((opt) => (
                              <div key={opt.value}>
                                <RadioGroupItem value={opt.value} id={`role-${opt.value}`} className="peer sr-only" />
                                <Label
                                  htmlFor={`role-${opt.value}`}
                                  className="flex flex-col items-center rounded-xl border-2 border-slate-200 bg-transparent p-3 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-center transition-colors"
                                >
                                  <span className="text-slate-500 peer-data-[state=checked]:text-primary">
                                    {opt.icon}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-700 mt-0.5">{opt.label}</span>
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>

                          <AnimatePresence mode="wait">
                            {selectedRole && (
                              <motion.div
                                key={selectedRole}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/15 px-3 py-2.5"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                <p className="text-xs text-primary/80 leading-snug">
                                  {roleOptions.find((r) => r.value === selectedRole)?.description}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Fields */}
                        <div className="space-y-1.5">
                          <Label htmlFor="register-name" className="text-sm font-medium text-slate-700">Full name</Label>
                          <Input
                            id="register-name"
                            placeholder="Jane Smith"
                            className="h-10 rounded-lg text-sm"
                            {...registerForm.register("name")}
                            data-testid="input-register-name"
                          />
                          {registerForm.formState.errors.name && (
                            <p className="text-xs text-destructive">{registerForm.formState.errors.name.message}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="register-email" className="text-sm font-medium text-slate-700">Email address</Label>
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="name@example.com"
                            className="h-10 rounded-lg text-sm"
                            {...registerForm.register("email")}
                            data-testid="input-register-email"
                          />
                          {registerForm.formState.errors.email && (
                            <p className="text-xs text-destructive">{registerForm.formState.errors.email.message}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="register-password" className="text-sm font-medium text-slate-700">Password</Label>
                          <Input
                            id="register-password"
                            type="password"
                            placeholder="Minimum 8 characters"
                            className="h-10 rounded-lg text-sm"
                            {...registerForm.register("password")}
                            data-testid="input-register-password"
                          />
                          {registerForm.formState.errors.password && (
                            <p className="text-xs text-destructive">{registerForm.formState.errors.password.message}</p>
                          )}
                        </div>

                        <AnimatePresence>
                          {selectedRole === "staff" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              className="space-y-1.5 overflow-hidden"
                            >
                              <Label htmlFor="register-staffcode" className="text-sm font-medium text-slate-700">
                                Staff authorisation code
                              </Label>
                              <Input
                                id="register-staffcode"
                                type="password"
                                placeholder="Provided by your ward manager"
                                className="h-10 rounded-lg text-sm"
                                {...registerForm.register("staffCode")}
                                data-testid="input-register-staffcode"
                              />
                              {registerForm.formState.errors.staffCode && (
                                <p className="text-xs text-destructive">{registerForm.formState.errors.staffCode.message}</p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <Button
                          type="submit"
                          className="w-full h-10 mt-2 font-semibold rounded-lg"
                          disabled={registerMutation.isPending}
                          data-testid="button-register-submit"
                        >
                          {registerMutation.isPending ? "Creating account..." : "Create account"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </Tabs>

          {/* Tab switcher hint */}
          <p className="mt-5 text-center text-sm text-slate-500">
            {activeTab === "login" ? (
              <>
                New to HospiTime?{" "}
                <button
                  onClick={() => setActiveTab("register")}
                  className="font-semibold text-primary hover:underline underline-offset-2"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setActiveTab("login")}
                  className="font-semibold text-primary hover:underline underline-offset-2"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          {/* Mobile footer */}
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-400">© 2026 HospiTime · Secure healthcare visitor management</p>
          </div>
        </div>
      </div>
    </div>
  );
}
