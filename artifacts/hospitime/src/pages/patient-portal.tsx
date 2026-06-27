import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import {
  Pill, FlaskConical, ClipboardList, MessageSquare, Send,
  ChevronDown, ChevronUp, Activity, Heart, AlertTriangle,
  TrendingUp, CheckCircle2, Clock, Users, Loader2,
  HeartPulse, Thermometer, Wind, Gauge, RefreshCw, Lock, BarChart3,
  ScanLine, FileImage, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

type PatientCondition = "critical" | "serious" | "stable" | "improving" | "discharged";
type ResultStatus = "normal" | "borderline" | "elevated" | "low" | "pending";

interface Patient {
  id: number;
  name: string;
  ward: string;
  dateOfBirth: string | null;
  admissionDate: string;
  condition: PatientCondition;
  conditionNotes: string | null;
  careTeam: string | null;
  updatedAt: string;
}

interface Medication {
  id: number;
  drugName: string;
  purpose: string;
  dose: string | null;
  frequency: string | null;
  startedDate: string | null;
  active: boolean;
}

interface ClinicalUpdate {
  id: number;
  updateType: string;
  title: string;
  content: string;
  updatedBy: string;
  createdAt: string;
}

interface TestResult {
  id: number;
  testName: string;
  resultSummary: string;
  resultStatus: ResultStatus;
  testedAt: string;
  addedBy: string;
}

interface Message {
  id: number;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

interface Vitals {
  heartRate: number | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  oxygenSaturation: number | null;
  temperature: string | null;
  respiratoryRate: number | null;
  recordedAt: string;
  recordedBy: string;
}

const CONDITION_CONFIG: Record<PatientCondition, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  critical:   { label: "Critical",   color: "text-red-700",    bg: "bg-red-50 border-red-200",        icon: <AlertTriangle className="w-5 h-5 text-red-600" /> },
  serious:    { label: "Serious",    color: "text-orange-700", bg: "bg-orange-50 border-orange-200",   icon: <Heart className="w-5 h-5 text-orange-500" /> },
  stable:     { label: "Stable",     color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",       icon: <Activity className="w-5 h-5 text-blue-500" /> },
  improving:  { label: "Improving",  color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200", icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
  discharged: { label: "Discharged", color: "text-slate-700",  bg: "bg-slate-50 border-slate-200",     icon: <CheckCircle2 className="w-5 h-5 text-slate-500" /> },
};

const RESULT_CONFIG: Record<ResultStatus, { label: string; color: string; dot: string }> = {
  normal:    { label: "Normal",     color: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  borderline:{ label: "Borderline", color: "text-amber-700 bg-amber-50 border-amber-200",       dot: "bg-amber-400" },
  elevated:  { label: "Elevated",   color: "text-orange-700 bg-orange-50 border-orange-200",    dot: "bg-orange-500" },
  low:       { label: "Low",        color: "text-blue-700 bg-blue-50 border-blue-200",          dot: "bg-blue-400" },
  pending:   { label: "Pending",    color: "text-slate-600 bg-slate-50 border-slate-200",       dot: "bg-slate-400" },
};

export default function PatientPortal() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (!user) { setLocation("/"); return; }
      if (user.role === "visitor") { setLocation("/visitor-dashboard"); return; }
    }
  }, [user, authLoading, setLocation]);

  if (authLoading || !user || user.role === "visitor") return null;
  return <PatientPortalContent user={user} />;
}

function PatientPortalContent({ user }: { user: { name: string; email: string; role: string } }) {
  const { toast } = useToast();
  const [linkedPatient, setLinkedPatient] = useState<Patient | null | "loading">("loading");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [updates, setUpdates] = useState<ClinicalUpdate[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<Vitals[]>([]);
  const [vitalsLoading, setVitalsLoading] = useState(false);
  const [vitalsSpinning, setVitalsSpinning] = useState(false);
  const [vitalsLastRefresh, setVitalsLastRefresh] = useState<Date | null>(null);
  const [vitalsView, setVitalsView] = useState<"current" | "history">("current");
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<"updates" | "medications" | "tests" | "vitals" | "messages" | "imaging">("updates");
  const [expandedMeds, setExpandedMeds] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load the patient linked to this account
  useEffect(() => {
    fetch("/api/patients", { credentials: "include" })
      .then(r => r.json())
      .then(async (patients: Patient[]) => {
        if (!patients || patients.length === 0) {
          setLinkedPatient(null);
          return;
        }
        const patient = patients[0];
        setLinkedPatient(patient);
        setLoading(true);
        try {
          const [portalRes, msgRes] = await Promise.all([
            fetch(`/api/patients/${patient.id}`, { credentials: "include" }),
            fetch(`/api/messages?patientName=${encodeURIComponent(patient.name)}&ward=${encodeURIComponent(patient.ward)}`, { credentials: "include" }),
          ]);
          const portal = await portalRes.json();
          const msgs = await msgRes.json();
          setMedications(portal.medications ?? []);
          setUpdates(portal.updates ?? []);
          setTestResults(portal.testResults ?? []);
          setMessages(Array.isArray(msgs) ? msgs.reverse() : []);
        } catch {
          toast({ title: "Failed to load patient data", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      })
      .catch(() => setLinkedPatient(null));
  }, []);

  const fetchVitals = async (patientId: number) => {
    setVitalsLoading(true);
    try {
      const [latestRes, histRes] = await Promise.all([
        fetch(`/api/patients/${patientId}/vitals`, { credentials: "include" }),
        fetch(`/api/patients/${patientId}/vitals/history`, { credentials: "include" }),
      ]);
      if (latestRes.ok) setVitals(await latestRes.json());
      if (histRes.ok) setVitalsHistory(await histRes.json());
      setVitalsLastRefresh(new Date());
    } catch {
      // silent
    } finally {
      setVitalsLoading(false);
    }
  };

  // Auto-refresh vitals every 30s when on vitals tab
  useEffect(() => {
    if (activeTab !== "vitals" || !linkedPatient || linkedPatient === "loading") return;
    fetchVitals(linkedPatient.id);
    const interval = setInterval(() => fetchVitals(linkedPatient.id), 30000);
    return () => clearInterval(interval);
  }, [activeTab, linkedPatient]);

  // When messages tab is active: mark staff messages as read and poll for new messages
  useEffect(() => {
    if (activeTab !== "messages" || !linkedPatient || linkedPatient === "loading") return;

    const patient = linkedPatient;

    // Mark staff messages as read (clears family unread badge)
    fetch("/api/messages/mark-staff-read", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientName: patient.name, ward: patient.ward }),
    }).catch(() => {});

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `/api/messages?patientName=${encodeURIComponent(patient.name)}&ward=${encodeURIComponent(patient.ward)}`,
          { credentials: "include" }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setMessages(data.reverse());
      } catch {}
    };

    // Scroll to newest message when tab opens
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 150);

    const interval = setInterval(async () => {
      await fetchMessages();
      // Scroll to bottom after refresh too
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }, 30_000);
    return () => clearInterval(interval);
  }, [activeTab, linkedPatient]);

  const sendMessage = async () => {
    if (!linkedPatient || linkedPatient === "loading" || !newMessage.trim()) return;
    setSendingMessage(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: linkedPatient.name,
          ward: linkedPatient.ward,
          content: newMessage.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      const msg = await res.json();
      setMessages(prev => [...prev, msg]);
      setNewMessage("");
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setSendingMessage(false);
    }
  };

  if (linkedPatient === "loading") {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </LayoutWrapper>
    );
  }

  if (!linkedPatient) {
    return (
      <LayoutWrapper>
        <div className="max-w-md mx-auto mt-20 text-center space-y-4">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-slate-200">
            <Lock className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">No patient linked to your account</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            To access patient records, please contact the ward staff and ask them to link your account to your loved one's patient profile.
          </p>
          <p className="text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            Share this email with ward staff: <strong className="text-slate-600">{user.email}</strong>
          </p>
        </div>
      </LayoutWrapper>
    );
  }

  const cond = CONDITION_CONFIG[linkedPatient.condition];

  const tabs = [
    { key: "updates"     as const, label: "Updates",     icon: <ClipboardList className="w-4 h-4" />, count: updates.length },
    { key: "medications" as const, label: "Medications", icon: <Pill className="w-4 h-4" />,          count: medications.filter(m => m.active).length },
    { key: "tests"       as const, label: "Test Results",icon: <FlaskConical className="w-4 h-4" />,  count: testResults.length },
    { key: "imaging"     as const, label: "Imaging",     icon: <ScanLine className="w-4 h-4" />,      count: null },
    { key: "vitals"      as const, label: "Vitals",      icon: <HeartPulse className="w-4 h-4" />,    count: null },
    { key: "messages"    as const, label: "Messages",    icon: <MessageSquare className="w-4 h-4" />, count: messages.length },
  ];

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Patient Portal</h1>
          <p className="text-slate-500 mt-1">Real-time information about your loved one's care.</p>
        </div>

        {/* Patient header */}
        <div className={`rounded-xl border p-5 ${cond.bg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className={`text-2xl font-bold ${cond.color}`}>{linkedPatient.name}</h2>
                <span className="text-xs font-semibold bg-white/70 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                  Day {differenceInDays(new Date(), new Date(linkedPatient.admissionDate)) + 1} in ICU
                </span>
              </div>
              <p className="text-slate-600 text-sm mt-0.5">
                {linkedPatient.ward} · Admitted {format(new Date(linkedPatient.admissionDate), "d MMM yyyy")}
              </p>
              {linkedPatient.careTeam && (
                <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Care team: {linkedPatient.careTeam}
                </p>
              )}
            </div>
            <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border self-start sm:self-auto ${cond.bg} ${cond.color}`}>
              {cond.icon}
              Condition: {cond.label}
            </div>
          </div>
          {linkedPatient.conditionNotes && (
            <p className="mt-3 text-sm text-slate-700 bg-white/60 rounded-lg p-3 border border-white/80">
              {linkedPatient.conditionNotes}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-2">
            Last updated {format(new Date(linkedPatient.updatedAt), "d MMM yyyy 'at' HH:mm")}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-w-0 ${
                activeTab === tab.key
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${activeTab === tab.key ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-600"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* UPDATES TAB */}
            {activeTab === "updates" && (
              <div className="space-y-3">
                {updates.length === 0 ? (
                  <EmptyState icon={<ClipboardList />} text="No updates posted yet." />
                ) : updates.map(u => (
                  <Card key={u.id} className="border-slate-200 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                          u.updateType === "condition" ? "bg-blue-100 text-blue-700" :
                          u.updateType === "procedure" ? "bg-violet-100 text-violet-700" :
                          u.updateType === "test" ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>{u.updateType}</span>
                      </div>
                      <h4 className="font-semibold text-slate-900">{u.title}</h4>
                      <p className="text-slate-600 text-sm mt-1 leading-relaxed">{u.content}</p>
                      <p className="text-xs text-slate-400 mt-3">
                        Posted by {u.updatedBy} · {format(new Date(u.createdAt), "d MMM yyyy, HH:mm")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* MEDICATIONS TAB */}
            {activeTab === "medications" && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  <strong className="text-amber-800">For information only.</strong> Always speak to the ward nurse or doctor for medical advice.
                </p>
                {medications.filter(m => m.active).length === 0 ? (
                  <EmptyState icon={<Pill />} text="No current medications recorded." />
                ) : medications.filter(m => m.active).map(med => {
                  const expanded = expandedMeds.has(med.id);
                  return (
                    <Card key={med.id} className="border-slate-200 shadow-sm overflow-hidden">
                      <button
                        className="w-full text-left p-5"
                        onClick={() => setExpandedMeds(prev => {
                          const next = new Set(prev);
                          expanded ? next.delete(med.id) : next.add(med.id);
                          return next;
                        })}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <Pill className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900">{med.drugName}</h4>
                              {med.dose && med.frequency && (
                                <p className="text-xs text-slate-500 mt-0.5">{med.dose} · {med.frequency}</p>
                              )}
                            </div>
                          </div>
                          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>
                      {expanded && (
                        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                          <p className="text-sm text-slate-700 leading-relaxed">{med.purpose}</p>
                          {med.startedDate && (
                            <p className="text-xs text-slate-400 mt-3">Started: {format(new Date(med.startedDate), "d MMM yyyy")}</p>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {/* TEST RESULTS TAB */}
            {activeTab === "tests" && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  Results are summarised in plain language. Speak to the care team for full clinical details.
                </p>
                {testResults.length === 0 ? (
                  <EmptyState icon={<FlaskConical />} text="No test results recorded yet." />
                ) : testResults.map(r => {
                  const cfg = RESULT_CONFIG[r.resultStatus];
                  return (
                    <Card key={r.id} className="border-slate-200 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-slate-900">{r.testName}</h4>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1`} />
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{r.resultSummary}</p>
                        <p className="text-xs text-slate-400 mt-3">
                          Tested: {format(new Date(r.testedAt), "d MMM yyyy")} · Added by {r.addedBy}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* VITALS TAB */}
            {activeTab === "vitals" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setVitalsView("current")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${vitalsView === "current" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      <HeartPulse className="w-3.5 h-3.5 inline mr-1" />
                      Current
                    </button>
                    <button
                      onClick={() => setVitalsView("history")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${vitalsView === "history" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      <BarChart3 className="w-3.5 h-3.5 inline mr-1" />
                      Trends
                    </button>
                  </div>
                  <button
                    onClick={async () => {
                      if (vitalsSpinning) return;
                      setVitalsSpinning(true);
                      const [,] = await Promise.all([
                        fetchVitals(linkedPatient.id),
                        new Promise(r => setTimeout(r, 700)),
                      ]);
                      setVitalsSpinning(false);
                    }}
                    disabled={vitalsSpinning}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 transition-transform ${vitalsSpinning ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                </div>

                {!vitals ? (
                  <EmptyState icon={<HeartPulse />} text="No vitals recorded yet. Check back soon." />
                ) : vitalsView === "current" ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <VitalCard
                        icon={<HeartPulse className="w-5 h-5 text-rose-500" />}
                        label="Heart Rate"
                        value={vitals.heartRate !== null ? `${vitals.heartRate}` : null}
                        unit="bpm"
                        normal="60–100"
                        status={vitals.heartRate !== null ? getHrStatus(vitals.heartRate) : "none"}
                      />
                      <VitalCard
                        icon={<Gauge className="w-5 h-5 text-violet-500" />}
                        label="Blood Pressure"
                        value={vitals.systolicBp !== null && vitals.diastolicBp !== null ? `${vitals.systolicBp}/${vitals.diastolicBp}` : null}
                        unit="mmHg"
                        normal="<120/80"
                        status={vitals.systolicBp !== null ? getBpStatus(vitals.systolicBp) : "none"}
                      />
                      <VitalCard
                        icon={<Activity className="w-5 h-5 text-blue-500" />}
                        label="Oxygen Sat."
                        value={vitals.oxygenSaturation !== null ? `${vitals.oxygenSaturation}` : null}
                        unit="%"
                        normal="95–100"
                        status={vitals.oxygenSaturation !== null ? getO2Status(vitals.oxygenSaturation) : "none"}
                      />
                      <VitalCard
                        icon={<Thermometer className="w-5 h-5 text-amber-500" />}
                        label="Temperature"
                        value={vitals.temperature !== null ? `${parseFloat(vitals.temperature).toFixed(1)}` : null}
                        unit="°C"
                        normal="36.1–37.2"
                        status={vitals.temperature !== null ? getTempStatus(parseFloat(vitals.temperature)) : "none"}
                      />
                      <VitalCard
                        icon={<Wind className="w-5 h-5 text-teal-500" />}
                        label="Resp. Rate"
                        value={vitals.respiratoryRate !== null ? `${vitals.respiratoryRate}` : null}
                        unit="br/min"
                        normal="12–20"
                        status={vitals.respiratoryRate !== null ? getRrStatus(vitals.respiratoryRate) : "none"}
                      />
                    </div>
                    <p className="text-xs text-slate-400 text-right flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      Recorded {format(new Date(vitals.recordedAt), "d MMM yyyy 'at' HH:mm")} by {vitals.recordedBy}
                    </p>
                    <p className="text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                      These readings are for family awareness only. Contact the ward nurse directly for any concerns.
                    </p>
                  </>
                ) : (
                  /* HISTORY / TRENDS VIEW */
                  <VitalsHistoryChart history={vitalsHistory} />
                )}

                {vitalsLastRefresh && (
                  <p className="text-xs text-slate-400 text-center">
                    Last checked: {format(vitalsLastRefresh, "HH:mm:ss")}
                  </p>
                )}
              </div>
            )}

            {/* IMAGING TAB */}
            {activeTab === "imaging" && linkedPatient && (
              <ImagingTab patient={linkedPatient} />
            )}

            {/* MESSAGES TAB */}
            {activeTab === "messages" && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      Messages with the care team
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Questions and updates between family and ward staff.</p>
                  </div>

                  <div className="p-4 space-y-3 min-h-[200px] max-h-[400px] overflow-y-auto">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm">No messages yet. Send a message to the care team below.</div>
                    ) : messages.map(m => {
                      const isMe = m.senderRole === user.role && m.senderName === user.name;
                      const isStaff = m.senderRole === "staff";
                      return (
                        <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                            isMe ? "bg-primary text-white rounded-br-sm" :
                            isStaff ? "bg-emerald-50 border border-emerald-200 text-slate-800 rounded-bl-sm" :
                            "bg-slate-100 text-slate-800 rounded-bl-sm"
                          }`}>
                            {!isMe && (
                              <p className={`text-xs font-semibold mb-1 ${isStaff ? "text-emerald-700" : "text-slate-600"}`}>
                                {m.senderName} {isStaff ? "· Ward Staff" : "· Family"}
                              </p>
                            )}
                            <p className="text-sm leading-relaxed">{m.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? "text-white/60" : "text-slate-400"}`}>
                              {format(new Date(m.createdAt), "d MMM, HH:mm")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 border-t border-slate-200 flex gap-2">
                    <Textarea
                      placeholder="Type a message to the care team..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      className="resize-none h-10 min-h-[40px] text-sm py-2"
                      rows={1}
                    />
                    <Button
                      size="sm"
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="shrink-0"
                    >
                      {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </LayoutWrapper>
  );
}

type VitalStatus = "normal" | "warning" | "critical" | "none";

function VitalCard({ icon, label, value, unit, normal, status }: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  unit: string;
  normal: string;
  status: VitalStatus;
}) {
  const colors: Record<VitalStatus, string> = {
    normal:   "border-emerald-200 bg-emerald-50",
    warning:  "border-amber-200 bg-amber-50",
    critical: "border-red-200 bg-red-50",
    none:     "border-slate-200 bg-white",
  };
  const valueColors: Record<VitalStatus, string> = {
    normal:   "text-emerald-700",
    warning:  "text-amber-700",
    critical: "text-red-700",
    none:     "text-slate-400",
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[status]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      {value !== null ? (
        <div>
          <span className={`text-2xl font-bold tabular-nums ${valueColors[status]}`}>{value}</span>
          <span className="text-sm text-slate-400 ml-1">{unit}</span>
        </div>
      ) : (
        <span className="text-sm text-slate-400">—</span>
      )}
      <p className="text-xs text-slate-400 mt-1">Normal: {normal}</p>
    </div>
  );
}

function getHrStatus(hr: number): VitalStatus {
  if (hr < 40 || hr > 130) return "critical";
  if (hr < 60 || hr > 100) return "warning";
  return "normal";
}
function getBpStatus(systolic: number): VitalStatus {
  if (systolic > 180 || systolic < 70) return "critical";
  if (systolic > 140 || systolic < 90) return "warning";
  return "normal";
}
function getO2Status(o2: number): VitalStatus {
  if (o2 < 90) return "critical";
  if (o2 < 95) return "warning";
  return "normal";
}
function getTempStatus(temp: number): VitalStatus {
  if (temp > 39.5 || temp < 35) return "critical";
  if (temp > 37.5 || temp < 36.1) return "warning";
  return "normal";
}
function getRrStatus(rr: number): VitalStatus {
  if (rr > 30 || rr < 8) return "critical";
  if (rr > 20 || rr < 12) return "warning";
  return "normal";
}

function VitalsHistoryChart({ history }: { history: Vitals[] }) {
  const [selected, setSelected] = useState<"hr" | "bp" | "o2" | "temp" | "rr">("hr");

  if (history.length < 2) {
    return (
      <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
        <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-500 text-sm">Not enough readings to show trends yet.</p>
        <p className="text-slate-400 text-xs mt-1">Check back after more vitals have been recorded.</p>
      </div>
    );
  }

  const chartData = history.map(v => ({
    time: format(new Date(v.recordedAt), "d MMM HH:mm"),
    hr: v.heartRate,
    systolic: v.systolicBp,
    diastolic: v.diastolicBp,
    o2: v.oxygenSaturation,
    temp: v.temperature !== null ? parseFloat(v.temperature) : null,
    rr: v.respiratoryRate,
  }));

  const TABS = [
    { key: "hr" as const,   label: "Heart Rate",   color: "#f43f5e", unit: "bpm",    lines: [{ key: "hr",       name: "HR",         color: "#f43f5e" }] },
    { key: "bp" as const,   label: "Blood Press.", color: "#8b5cf6", unit: "mmHg",   lines: [{ key: "systolic", name: "Systolic",   color: "#8b5cf6" }, { key: "diastolic", name: "Diastolic", color: "#a78bfa" }] },
    { key: "o2" as const,   label: "O₂ Sat",       color: "#3b82f6", unit: "%",      lines: [{ key: "o2",       name: "SpO₂",       color: "#3b82f6" }] },
    { key: "temp" as const, label: "Temp",          color: "#f59e0b", unit: "°C",     lines: [{ key: "temp",     name: "Temp",       color: "#f59e0b" }] },
    { key: "rr" as const,   label: "Resp. Rate",   color: "#14b8a6", unit: "br/min", lines: [{ key: "rr",       name: "RR",         color: "#14b8a6" }] },
  ];

  const current = TABS.find(t => t.key === selected)!;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex gap-0.5 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setSelected(t.key)}
            className={`flex-1 text-xs font-medium px-2 py-1.5 rounded-md whitespace-nowrap transition-all ${selected === t.key ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        <p className="text-xs text-slate-500 mb-3">
          {current.label} over the last {history.length} readings ({current.unit})
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              labelStyle={{ color: "#475569", fontWeight: 600 }}
            />
            {current.lines.length > 1 && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />}
            {current.lines.map(l => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                stroke={l.color}
                strokeWidth={2}
                dot={{ r: 3, fill: l.color }}
                activeDot={{ r: 5 }}
                name={l.name}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
      <div className="text-slate-300 flex justify-center mb-3">{icon}</div>
      <p className="text-slate-500 text-sm">{text}</p>
    </div>
  );
}

interface ImagingResult {
  id: number;
  type: "CT" | "X-Ray" | "MRI" | "Ultrasound";
  title: string;
  bodyPart: string;
  date: string;
  reportedBy: string;
  technicalFindings: string;
  plainEnglish: string;
  status: "normal" | "attention" | "critical";
}

function getImagingForPatient(patient: Patient): ImagingResult[] {
  const ward = patient.ward;
  const condition = patient.condition;

  const baseDate = patient.admissionDate.slice(0, 10);

  if (ward === "ICU Ward A" || ward === "ICU Ward B") {
    return [
      {
        id: 1,
        type: "CT",
        title: "CT Chest with Contrast",
        bodyPart: "Chest",
        date: baseDate,
        reportedBy: "Dr. Alison Webb (Radiology)",
        technicalFindings: condition === "critical" || condition === "serious"
          ? "Bilateral lower lobe consolidation consistent with pneumonia. Small pleural effusions noted bilaterally. No pneumothorax."
          : "Clear lung fields bilaterally. No consolidation, effusion or pneumothorax identified. Heart size normal.",
        plainEnglish: condition === "critical" || condition === "serious"
          ? "The scan shows infection in both lower parts of the lungs (pneumonia) with a small amount of fluid around each lung. This is consistent with your loved one's current symptoms and is being treated with antibiotics. The care team is monitoring this closely."
          : "The chest scan looks largely clear — there are no serious concerns with the lungs or surrounding areas. This is a reassuring finding.",
        status: condition === "critical" ? "critical" : condition === "serious" ? "attention" : "normal",
      },
      {
        id: 2,
        type: "X-Ray",
        title: "Chest X-Ray (AP)",
        bodyPart: "Chest",
        date: new Date(new Date(baseDate).getTime() + 2 * 86400000).toISOString().slice(0, 10),
        reportedBy: "Dr. Marcus Reid (Radiology)",
        technicalFindings: "AP chest radiograph. ETT tube positioned 4 cm above carina. NG tube tip in stomach. Cardiac silhouette normal size. No significant change from prior CT.",
        plainEnglish: "This is a routine bedside X-ray taken to check the breathing tube and feeding tube are in the correct positions — they are. The chest looks similar to the earlier scan with no new concerns.",
        status: "normal",
      },
      {
        id: 3,
        type: "Ultrasound",
        title: "Cardiac Echocardiogram",
        bodyPart: "Heart",
        date: new Date(new Date(baseDate).getTime() + 4 * 86400000).toISOString().slice(0, 10),
        reportedBy: "Dr. Sophie Lawson (Cardiology)",
        technicalFindings: condition === "critical"
          ? "Moderate global left ventricular systolic dysfunction. EF estimated 35–40%. Mild mitral regurgitation. No pericardial effusion."
          : "Normal LV size and systolic function. EF estimated 55–60%. No significant valvular abnormality. No pericardial effusion.",
        plainEnglish: condition === "critical"
          ? "The heart scan shows that the heart's pumping function is somewhat reduced — it's working, but not as efficiently as normal. The heart team is aware and medication has been prescribed to help support the heart. The care team will repeat this scan to check for any change."
          : "The heart scan shows the heart is pumping well at a normal efficiency (around 55–60%). There are no structural concerns with the heart valves or surrounding tissue — this is a good result.",
        status: condition === "critical" ? "attention" : "normal",
      },
    ];
  }

  if (ward === "ICU Ward C") {
    return [
      {
        id: 1,
        type: "CT",
        title: "CT Head (Non-contrast)",
        bodyPart: "Brain",
        date: baseDate,
        reportedBy: "Dr. Alison Webb (Radiology)",
        technicalFindings: condition === "critical"
          ? "Hyperdense area in right basal ganglia consistent with haemorrhagic stroke. Midline shift of approximately 4 mm to the left. No herniation."
          : "No acute intracranial abnormality. No haemorrhage, infarction, or mass effect identified. Ventricles are normal in size.",
        plainEnglish: condition === "critical"
          ? "The head scan shows a bleed inside the brain (a haemorrhagic stroke) which is causing a small amount of swelling and shifting of the brain's midline. The neurosurgery team has reviewed this and the care team is managing the swelling with medication and close monitoring."
          : "The brain scan is reassuring — there is no bleeding, stroke, or signs of pressure inside the head. This is a good result and shows no new acute problems.",
        status: condition === "critical" ? "critical" : "normal",
      },
      {
        id: 2,
        type: "X-Ray",
        title: "Chest X-Ray (PA)",
        bodyPart: "Chest",
        date: new Date(new Date(baseDate).getTime() + 1 * 86400000).toISOString().slice(0, 10),
        reportedBy: "Dr. Marcus Reid (Radiology)",
        technicalFindings: "PA chest radiograph. Central venous catheter tip in SVC. Lungs clear. No pneumothorax or pleural effusion. Cardiac silhouette within normal limits.",
        plainEnglish: "This routine chest X-ray confirms the central line (a tube placed to give medications) is in the right position. The lungs are clear and there are no new concerns.",
        status: "normal",
      },
      {
        id: 3,
        type: "MRI",
        title: "MRI Brain with Diffusion",
        bodyPart: "Brain",
        date: new Date(new Date(baseDate).getTime() + 3 * 86400000).toISOString().slice(0, 10),
        reportedBy: "Dr. Priya Nair (Neuroradiology)",
        technicalFindings: condition === "critical"
          ? "DWI sequences confirm acute ischaemic infarct in right MCA territory. FLAIR hyperintensity. No haemorrhagic transformation. Area approximately 3.2 × 2.8 cm."
          : "No restricted diffusion. No evidence of acute infarct. White matter changes mild for age. Posterior fossa unremarkable.",
        plainEnglish: condition === "critical"
          ? "The MRI gives us a clearer picture of the brain. It confirms a stroke affecting a region of the right side of the brain responsible for movement and sensation on the left side. The stroke team is guiding the care plan. Rehabilitation will be discussed once the patient is more stable."
          : "The MRI shows no signs of a stroke or recent brain injury. The small white matter changes seen are common for the patient's age and not a concern. This is a reassuring scan.",
        status: condition === "critical" ? "critical" : "normal",
      },
    ];
  }

  // HDU
  return [
    {
      id: 1,
      type: "X-Ray",
      title: "Chest X-Ray (PA)",
      bodyPart: "Chest",
      date: baseDate,
      reportedBy: "Dr. Marcus Reid (Radiology)",
      technicalFindings: "PA chest radiograph. Mild cardiomegaly. Bilateral lower zone hazy opacification suggesting pulmonary oedema. No pneumothorax.",
      plainEnglish: "The X-ray shows the heart is slightly enlarged and there is some fluid build-up around the lungs — this is a sign that the heart was under strain. Medication (diuretics) has been given to reduce this fluid, and we expect the follow-up X-ray to show improvement.",
      status: "attention",
    },
    {
      id: 2,
      type: "Ultrasound",
      title: "Abdominal Ultrasound",
      bodyPart: "Abdomen",
      date: new Date(new Date(baseDate).getTime() + 2 * 86400000).toISOString().slice(0, 10),
      reportedBy: "Dr. Sophie Lawson (Radiology)",
      technicalFindings: "Liver normal size and echotexture. No gallstones. Common bile duct not dilated. Kidneys normal size bilaterally. No free fluid. Spleen unremarkable.",
      plainEnglish: "The abdominal ultrasound looked at the main organs in the belly — liver, kidneys, gallbladder, and spleen. Everything appears to be within normal range with no signs of blockage, stones, or fluid build-up. This is a reassuring result.",
      status: "normal",
    },
    {
      id: 3,
      type: "CT",
      title: "CT Coronary Angiogram",
      bodyPart: "Heart & Coronary Arteries",
      date: new Date(new Date(baseDate).getTime() + 1 * 86400000).toISOString().slice(0, 10),
      reportedBy: "Dr. Alison Webb (Cardiology)",
      technicalFindings: "Significant stenosis (>70%) in proximal LAD. Moderate stenosis in RCA. LCX unremarkable. No evidence of acute dissection. Calcified plaques noted.",
      plainEnglish: "The CT scan of the heart's blood vessels shows a significant narrowing in one of the main arteries supplying blood to the heart (the LAD). This is what caused the heart attack. The cardiology team has reviewed this and is planning the next steps, which may include a stent procedure to open the blocked artery.",
      status: "attention",
    },
  ];
}

const IMAGING_TYPE_COLORS: Record<string, string> = {
  CT: "bg-blue-100 text-blue-700 border-blue-200",
  "X-Ray": "bg-slate-100 text-slate-700 border-slate-200",
  MRI: "bg-violet-100 text-violet-700 border-violet-200",
  Ultrasound: "bg-teal-100 text-teal-700 border-teal-200",
};

const IMAGING_STATUS_CONFIG = {
  normal:    { label: "Normal", color: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  attention: { label: "Review needed", color: "text-amber-700 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  critical:  { label: "Significant finding", color: "text-red-700 bg-red-50 border-red-200", dot: "bg-red-500" },
};

function ImagingTab({ patient }: { patient: Patient }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const results = getImagingForPatient(patient);

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-500 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <span>
          Imaging results are shown in plain language to help families understand. For clinical detail or concerns, please speak directly with the care team.
        </span>
      </div>

      {results.map(r => {
        const isOpen = expanded === r.id;
        const statusCfg = IMAGING_STATUS_CONFIG[r.status];
        const typeCfg = IMAGING_TYPE_COLORS[r.type] ?? "bg-slate-100 text-slate-700 border-slate-200";
        return (
          <div key={r.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <button
              className="w-full text-left p-5"
              onClick={() => setExpanded(isOpen ? null : r.id)}
            >
              <div className="flex items-start gap-4">
                {/* Scan placeholder thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-950 opacity-80" />
                  {r.type === "CT" && <ScanLine className="w-7 h-7 text-cyan-400 relative z-10" />}
                  {r.type === "X-Ray" && <FileImage className="w-7 h-7 text-slate-300 relative z-10" />}
                  {r.type === "MRI" && <Activity className="w-7 h-7 text-violet-400 relative z-10" />}
                  {r.type === "Ultrasound" && <Heart className="w-7 h-7 text-teal-400 relative z-10" />}
                  <span className="absolute bottom-1 right-1 text-[8px] font-bold text-white/50 uppercase">{r.type}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${typeCfg}`}>{r.type}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusCfg.dot} mr-1`} />
                      {statusCfg.label}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 leading-snug">{r.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{r.bodyPart} · {format(new Date(r.date), "d MMM yyyy")} · {r.reportedBy}</p>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />}
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-4">
                {/* Plain-English explanation (primary) */}
                <div className="bg-primary/5 border border-primary/15 rounded-lg p-4">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> What this means for your loved one
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">{r.plainEnglish}</p>
                </div>

                {/* Technical findings (collapsed/secondary) */}
                <details className="group">
                  <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 list-none flex items-center gap-1 select-none">
                    <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                    View technical report
                  </summary>
                  <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-600 leading-relaxed font-mono">{r.technicalFindings}</p>
                  </div>
                </details>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
