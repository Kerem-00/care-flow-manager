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
import { Activity, Clock, ShieldCheck, HeartPulse, UserCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(["visitor", "staff"]),
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

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

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

  const selectedRole = useWatch({ control: registerForm.control, name: "role" });

  useEffect(() => {
    if (user && !isLoading) {
      setLocation(user.role === "staff" ? "/staff-dashboard" : "/visitor-dashboard");
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
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      },
      onError: (error) => {
        toast({ 
          title: "Sign in failed", 
          description: getErrorMessage(error),
          variant: "destructive" 
        });
      }
    });
  };

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate({ data: values }, {
      onSuccess: (response) => {
        toast({ title: "Account created", description: response.message });
        queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      },
      onError: (error) => {
        toast({ 
          title: "Registration failed", 
          description: getErrorMessage(error),
          variant: "destructive" 
        });
      }
    });
  };

  if (isLoading || user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Activity className="w-8 h-8 text-primary animate-pulse" />
    </div>;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50">
      {/* Brand Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-primary relative overflow-hidden text-white p-12 lg:p-24">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-primary/90 mix-blend-multiply z-10" />
          <img
            src="/auth-bg.png"
            alt="Hospital waiting area"
            className="w-full h-full object-cover opacity-60 grayscale"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
        
        <div className="relative z-20">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <span className="font-bold text-3xl tracking-tight">HospiTime</span>
          </div>
          
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Structured ICU visiting for every family.
          </h1>
          <p className="text-xl text-primary-foreground/80 leading-relaxed max-w-lg">
            Critical care communication doesn't have to be chaotic. We provide a calm, fair, and evidence-based way to schedule visits, reducing stress for families and administrative burden for clinical staff.
          </p>
        </div>

        <div className="relative z-20 space-y-8 mt-12">
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 text-accent shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg">Predictable Scheduling</h3>
              <p className="text-primary-foreground/70 text-sm mt-1">Book 30, 60, or 90 minute slots with immediate status updates.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-accent shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg">Staff Controlled</h3>
              <p className="text-primary-foreground/70 text-sm mt-1">Ward managers review and approve requests based on clinical capacity.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <HeartPulse className="w-6 h-6 text-accent shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg">Empathetic Design</h3>
              <p className="text-primary-foreground/70 text-sm mt-1">Built by people who understand the reality of intensive care waiting rooms.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16 relative bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex flex-col items-center gap-1 mb-10 text-center">
            <div className="bg-primary/10 p-3 rounded-xl text-primary mb-2">
              <Activity className="w-7 h-7" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900">HospiTime</span>
            <span className="text-sm text-slate-500">ICU Visitor Coordination</span>
          </div>

          <div className="hidden lg:block mb-8">
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
              <TabsTrigger value="login" className="text-sm font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-login">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="text-sm font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === "login" ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === "login" ? 10 : -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "login" ? (
                  <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
                    <CardHeader className="space-y-1 pb-5 pt-6 px-6 lg:hidden">
                      <CardTitle className="text-xl font-bold tracking-tight">Welcome back</CardTitle>
                      <CardDescription className="text-slate-500">
                        Sign in to manage your visits and requests.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <Input 
                            id="login-email" 
                            type="email" 
                            placeholder="name@example.com" 
                            {...loginForm.register("email")}
                            data-testid="input-login-email"
                          />
                          {loginForm.formState.errors.email && (
                            <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password">Password</Label>
                          <Input 
                            id="login-password" 
                            type="password" 
                            {...loginForm.register("password")}
                            data-testid="input-login-password"
                          />
                          {loginForm.formState.errors.password && (
                            <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                          )}
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full mt-6" 
                          disabled={loginMutation.isPending}
                          data-testid="button-login-submit"
                        >
                          {loginMutation.isPending ? "Signing in..." : "Sign in"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl">
                    <CardHeader className="space-y-1 pb-5 pt-6 px-6 lg:hidden">
                      <CardTitle className="text-xl font-bold tracking-tight">Create an account</CardTitle>
                      <CardDescription className="text-slate-500">
                        Join HospiTime to schedule structured visits.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <div className="space-y-3 mb-6">
                          <Label>I am a...</Label>
                          <RadioGroup 
                            value={selectedRole}
                            onValueChange={(v) => registerForm.setValue("role", v as "visitor" | "staff")}
                            className="grid grid-cols-2 gap-4"
                            data-testid="radio-role"
                          >
                            <div>
                              <RadioGroupItem value="visitor" id="role-visitor" className="peer sr-only" />
                              <Label
                                htmlFor="role-visitor"
                                className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 bg-transparent p-4 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                              >
                                <UserCircle className="mb-2 h-6 w-6 text-slate-600" />
                                Family / Visitor
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem value="staff" id="role-staff" className="peer sr-only" />
                              <Label
                                htmlFor="role-staff"
                                className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 bg-transparent p-4 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                              >
                                <ShieldCheck className="mb-2 h-6 w-6 text-slate-600" />
                                Hospital Staff
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-name">Full Name</Label>
                          <Input 
                            id="register-name" 
                            {...registerForm.register("name")}
                            data-testid="input-register-name"
                          />
                          {registerForm.formState.errors.name && (
                            <p className="text-sm text-destructive">{registerForm.formState.errors.name.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-email">Email</Label>
                          <Input 
                            id="register-email" 
                            type="email" 
                            placeholder="name@example.com" 
                            {...registerForm.register("email")}
                            data-testid="input-register-email"
                          />
                          {registerForm.formState.errors.email && (
                            <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-password">Password</Label>
                          <Input 
                            id="register-password" 
                            type="password" 
                            {...registerForm.register("password")}
                            data-testid="input-register-password"
                          />
                          {registerForm.formState.errors.password && (
                            <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                          )}
                        </div>

                        <AnimatePresence>
                          {selectedRole === "staff" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, marginTop: 0 }}
                              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              className="space-y-2 overflow-hidden"
                            >
                              <Label htmlFor="register-staffcode">Staff Authorization Code</Label>
                              <Input 
                                id="register-staffcode" 
                                type="password" 
                                {...registerForm.register("staffCode")}
                                data-testid="input-register-staffcode"
                              />
                              {registerForm.formState.errors.staffCode && (
                                <p className="text-sm text-destructive">{registerForm.formState.errors.staffCode.message}</p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <Button 
                          type="submit" 
                          className="w-full mt-6" 
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
          
          <p className="mt-5 text-center text-sm text-slate-500">
            {activeTab === "login" ? (
              <>New to HospiTime?{" "}
                <button onClick={() => setActiveTab("register")} className="font-semibold text-primary hover:underline">
                  Create an account
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => setActiveTab("login")} className="font-semibold text-primary hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>

          <div className="mt-8 text-center space-y-1 border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">University of Hertfordshire · Computer Science</p>
            <p className="text-sm text-slate-500 font-medium">HospiTime — ICU Visitor Coordination System</p>
            <p className="text-xs text-slate-400">Dissertation Project · Sedat Kucuk · 23002046</p>
          </div>
        </div>
      </div>
    </div>
  );
}
