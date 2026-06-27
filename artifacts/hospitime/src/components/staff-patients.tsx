import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import {
  Plus, ChevronRight, Loader2, Pill, FlaskConical, ClipboardList,
  MessageSquare, Send, Pencil, Trash2, AlertTriangle, Heart,
  Activity, TrendingUp, CheckCircle2, Users, HeartPulse,
  UserPlus, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  createdBy: string;
  updatedAt: string;
}
interface Medication {
  id: number;
  patientId: number;
  drugName: string;
  purpose: string;
  dose: string | null;
  frequency: string | null;
  startedDate: string | null;
  active: boolean;
  addedBy: string;
}
interface ClinicalUpdate {
  id: number;
  patientId: number;
  updateType: string;
  title: string;
  content: string;
  updatedBy: string;
  createdAt: string;
}
interface TestResult {
  id: number;
  patientId: number;
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

const COND_CFG: Record<PatientCondition, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  critical:   { label: "Critical",   color: "text-red-700",     bg: "bg-red-50 border-red-200",       icon: <AlertTriangle className="w-4 h-4 text-red-600" /> },
  serious:    { label: "Serious",    color: "text-orange-700",  bg: "bg-orange-50 border-orange-200",  icon: <Heart className="w-4 h-4 text-orange-500" /> },
  stable:     { label: "Stable",     color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",      icon: <Activity className="w-4 h-4 text-blue-500" /> },
  improving:  { label: "Improving",  color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200",icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> },
  discharged: { label: "Discharged", color: "text-slate-700",   bg: "bg-slate-50 border-slate-200",    icon: <CheckCircle2 className="w-4 h-4 text-slate-500" /> },
};

const RESULT_CFG: Record<ResultStatus, { label: string; color: string }> = {
  normal:    { label: "Normal",     color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  borderline:{ label: "Borderline", color: "bg-amber-50 text-amber-700 border-amber-200" },
  elevated:  { label: "Elevated",   color: "bg-orange-50 text-orange-700 border-orange-200" },
  low:       { label: "Low",        color: "bg-blue-50 text-blue-700 border-blue-200" },
  pending:   { label: "Pending",    color: "bg-slate-50 text-slate-600 border-slate-200" },
};

const WARDS = ["ICU Ward A", "ICU Ward B", "ICU Ward C", "HDU"];
const UPDATE_TYPES = ["condition", "procedure", "test", "general", "discharge"];

function daysInICU(admissionDate: string): number {
  return differenceInDays(new Date(), new Date(admissionDate));
}

interface FamilyMember { id: number; name: string; email: string; }
interface VitalsData {
  heartRate: number | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  oxygenSaturation: number | null;
  temperature: string | null;
  respiratoryRate: number | null;
  recordedAt: string;
  recordedBy: string;
}

export function StaffPatients({ staffName }: { staffName: string }) {
  const { toast } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [detail, setDetail] = useState<{ medications: Medication[]; updates: ClinicalUpdate[]; testResults: TestResult[] } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Family members
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);

  // Vitals
  const [vitals, setVitals] = useState<VitalsData | null>(null);
  const [addVitalsOpen, setAddVitalsOpen] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({ heartRate: "", systolicBp: "", diastolicBp: "", oxygenSaturation: "", temperature: "", respiratoryRate: "" });

  // Dialog states
  const [registerOpen, setRegisterOpen] = useState(false);
  const [addMedOpen, setAddMedOpen] = useState(false);
  const [addUpdateOpen, setAddUpdateOpen] = useState(false);
  const [addTestOpen, setAddTestOpen] = useState(false);
  const [editCondOpen, setEditCondOpen] = useState(false);

  // Form state
  const [regForm, setRegForm] = useState({ name: "", ward: "", dateOfBirth: "", admissionDate: new Date().toISOString().slice(0, 10), condition: "stable" as PatientCondition, conditionNotes: "", careTeam: "" });
  const [medForm, setMedForm] = useState({ drugName: "", purpose: "", dose: "", frequency: "", startedDate: "" });
  const [updateForm, setUpdateForm] = useState({ updateType: "general", title: "", content: "" });
  const [testForm, setTestForm] = useState({ testName: "", resultSummary: "", resultStatus: "pending" as ResultStatus, testedAt: new Date().toISOString().slice(0, 10) });
  const [condForm, setCondForm] = useState({ condition: "stable" as PatientCondition, conditionNotes: "", careTeam: "" });
  const [submitting, setSubmitting] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [showInactiveMeds, setShowInactiveMeds] = useState(false);

  const fetchPatients = async () => {
    setPatientsLoading(true);
    try {
      const res = await fetch("/api/patients", { credentials: "include" });
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Failed to load patients", variant: "destructive" });
    } finally {
      setPatientsLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const selectPatient = async (p: Patient) => {
    setSelected(p);
    setDetail(null);
    setMessages([]);
    setFamilyMembers([]);
    setVitals(null);
    setDetailLoading(true);
    try {
      const [detailRes, msgRes, familyRes, vitalsRes] = await Promise.all([
        fetch(`/api/patients/${p.id}`, { credentials: "include" }).catch(() => null),
        fetch(`/api/messages?patientName=${encodeURIComponent(p.name)}&ward=${encodeURIComponent(p.ward)}`, { credentials: "include" }).catch(() => null),
        fetch(`/api/patients/${p.id}/family`, { credentials: "include" }).catch(() => null),
        fetch(`/api/patients/${p.id}/vitals`, { credentials: "include" }).catch(() => null),
      ]);
      if (detailRes?.ok) {
        const d = await detailRes.json();
        setDetail({ medications: d.medications ?? [], updates: d.updates ?? [], testResults: d.testResults ?? [] });
      } else {
        setDetail({ medications: [], updates: [], testResults: [] });
      }
      if (msgRes?.ok) {
        const m = await msgRes.json();
        setMessages(Array.isArray(m) ? m.reverse() : []);
      }
      if (familyRes?.ok) {
        const f = await familyRes.json();
        setFamilyMembers(Array.isArray(f) ? f : []);
      }
      if (vitalsRes?.ok) {
        const v = await vitalsRes.json();
        setVitals(v ?? null);
      }
    } catch {
      toast({ title: "Failed to load patient details", variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleLinkFamily = async () => {
    if (!selected || !linkEmail.trim()) return;
    setLinkLoading(true);
    try {
      const res = await fetch(`/api/patients/${selected.id}/link-family`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: linkEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setFamilyMembers(prev => [...prev, { id: data.userId, name: data.userName, email: data.userEmail }]);
      setLinkEmail("");
      toast({ title: `${data.userName} linked to ${selected.name}` });
    } catch (e: any) {
      toast({ title: e.message || "Failed to link account", variant: "destructive" });
    } finally {
      setLinkLoading(false);
    }
  };

  const handleUnlinkFamily = async (userId: number, userName: string) => {
    if (!selected) return;
    try {
      await fetch(`/api/patients/${selected.id}/link-family/${userId}`, { method: "DELETE", credentials: "include" });
      setFamilyMembers(prev => prev.filter(m => m.id !== userId));
      toast({ title: `${userName} unlinked` });
    } catch {
      toast({ title: "Failed to unlink", variant: "destructive" });
    }
  };

  const handleAddVitals = async () => {
    if (!selected) return;
    setSubmitting(true);
    const toInt = (v: string) => v.trim() ? parseInt(v, 10) : null;
    const toFloat = (v: string) => v.trim() ? parseFloat(v) : null;
    try {
      const res = await fetch(`/api/patients/${selected.id}/vitals`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heartRate: toInt(vitalsForm.heartRate),
          systolicBp: toInt(vitalsForm.systolicBp),
          diastolicBp: toInt(vitalsForm.diastolicBp),
          oxygenSaturation: toInt(vitalsForm.oxygenSaturation),
          temperature: toFloat(vitalsForm.temperature),
          respiratoryRate: toInt(vitalsForm.respiratoryRate),
        }),
      });
      if (!res.ok) throw new Error();
      const v = await res.json();
      setVitals(v);
      toast({ title: "Vitals recorded" });
      setAddVitalsOpen(false);
      setVitalsForm({ heartRate: "", systolicBp: "", diastolicBp: "", oxygenSaturation: "", temperature: "", respiratoryRate: "" });
    } catch {
      toast({ title: "Failed to record vitals", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!regForm.name.trim() || !regForm.ward.trim() || !regForm.admissionDate) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regForm.name.trim(),
          ward: regForm.ward.trim(),
          admissionDate: regForm.admissionDate,
          dateOfBirth: regForm.dateOfBirth || null,
          condition: regForm.condition,
          conditionNotes: regForm.conditionNotes.trim() || null,
          careTeam: regForm.careTeam.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Patient registered" });
      setRegisterOpen(false);
      setRegForm({ name: "", ward: "", dateOfBirth: "", admissionDate: new Date().toISOString().slice(0, 10), condition: "stable", conditionNotes: "", careTeam: "" });
      fetchPatients();
    } catch {
      toast({ title: "Failed to register patient", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMed = async () => {
    if (!selected || !medForm.drugName.trim() || !medForm.purpose.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/patients/${selected.id}/medications`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drugName: medForm.drugName.trim(),
          purpose: medForm.purpose.trim(),
          dose: medForm.dose.trim() || null,
          frequency: medForm.frequency.trim() || null,
          startedDate: medForm.startedDate || null,
        }),
      });
      if (!res.ok) throw new Error();
      const med = await res.json();
      setDetail(prev => prev ? { ...prev, medications: [med, ...prev.medications] } : prev);
      toast({ title: "Medication added" });
      setAddMedOpen(false);
      setMedForm({ drugName: "", purpose: "", dose: "", frequency: "", startedDate: "" });
    } catch {
      toast({ title: "Failed to add medication", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMed = async (medId: number) => {
    if (!selected) return;
    try {
      await fetch(`/api/patients/${selected.id}/medications/${medId}`, { method: "DELETE", credentials: "include" });
      setDetail(prev => prev ? { ...prev, medications: prev.medications.filter(m => m.id !== medId) } : prev);
      toast({ title: "Medication removed" });
    } catch {
      toast({ title: "Failed to remove medication", variant: "destructive" });
    }
  };

  const handleAddUpdate = async () => {
    if (!selected || !updateForm.title.trim() || !updateForm.content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/patients/${selected.id}/updates`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateType: updateForm.updateType, title: updateForm.title.trim(), content: updateForm.content.trim() }),
      });
      if (!res.ok) throw new Error();
      const update = await res.json();
      setDetail(prev => prev ? { ...prev, updates: [update, ...prev.updates] } : prev);
      toast({ title: "Update posted" });
      setAddUpdateOpen(false);
      setUpdateForm({ updateType: "general", title: "", content: "" });
    } catch {
      toast({ title: "Failed to post update", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTest = async () => {
    if (!selected || !testForm.testName.trim() || !testForm.resultSummary.trim() || !testForm.testedAt) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/patients/${selected.id}/test-results`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testName: testForm.testName.trim(), resultSummary: testForm.resultSummary.trim(), resultStatus: testForm.resultStatus, testedAt: testForm.testedAt }),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setDetail(prev => prev ? { ...prev, testResults: [result, ...prev.testResults] } : prev);
      toast({ title: "Test result added" });
      setAddTestOpen(false);
      setTestForm({ testName: "", resultSummary: "", resultStatus: "pending", testedAt: new Date().toISOString().slice(0, 10) });
    } catch {
      toast({ title: "Failed to add test result", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCondition = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/patients/${selected.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condition: condForm.condition, conditionNotes: condForm.conditionNotes.trim() || null, careTeam: condForm.careTeam.trim() || null }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setSelected(updated);
      setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
      toast({ title: "Patient condition updated" });
      setEditCondOpen(false);
    } catch {
      toast({ title: "Failed to update condition", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const sendMessage = async () => {
    if (!selected || !newMessage.trim()) return;
    setSendingMsg(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientName: selected.name, ward: selected.ward, content: newMessage.trim() }),
      });
      if (!res.ok) throw new Error();
      const msg = await res.json();
      setMessages(prev => [...prev, msg]);
      setNewMessage("");
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setSendingMsg(false);
    }
  };

  if (selected) {
    const cond = COND_CFG[selected.condition];
    return (
      <div className="space-y-5">
        <button onClick={() => setSelected(null)} className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1">
          ← Back to patients
        </button>

        {/* Patient header */}
        <div className={`rounded-xl border p-5 ${cond.bg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className={`text-2xl font-bold ${cond.color}`}>{selected.name}</h2>
                <span className="text-xs font-semibold bg-white/70 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                  Day {daysInICU(selected.admissionDate) + 1} in ICU
                </span>
              </div>
              <p className="text-slate-600 text-sm mt-0.5">
                {selected.ward} · Admitted {format(new Date(selected.admissionDate), "d MMM yyyy")}
              </p>
              {selected.careTeam && (
                <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {selected.careTeam}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <div className={`flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg border self-start ${cond.bg} ${cond.color}`}>
                {cond.icon} {cond.label}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="self-start border-slate-300 text-slate-700 hover:bg-white"
                onClick={() => {
                  setCondForm({ condition: selected.condition, conditionNotes: selected.conditionNotes ?? "", careTeam: selected.careTeam ?? "" });
                  setEditCondOpen(true);
                }}
              >
                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                Update Condition
              </Button>
            </div>
          </div>
          {selected.conditionNotes && (
            <p className="mt-3 text-sm text-slate-700 bg-white/60 rounded-lg p-3 border border-white/80">
              {selected.conditionNotes}
            </p>
          )}
        </div>

        {detailLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="updates" className="space-y-4">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="updates">
                <ClipboardList className="w-4 h-4 mr-1.5" />
                Updates <span className="ml-1.5 text-xs bg-slate-200 text-slate-600 rounded-full px-1.5">{detail?.updates.length ?? 0}</span>
              </TabsTrigger>
              <TabsTrigger value="medications">
                <Pill className="w-4 h-4 mr-1.5" />
                Medications <span className="ml-1.5 text-xs bg-slate-200 text-slate-600 rounded-full px-1.5">{detail?.medications.filter(m => m.active).length ?? 0}</span>
              </TabsTrigger>
              <TabsTrigger value="tests">
                <FlaskConical className="w-4 h-4 mr-1.5" />
                Tests <span className="ml-1.5 text-xs bg-slate-200 text-slate-600 rounded-full px-1.5">{detail?.testResults.length ?? 0}</span>
              </TabsTrigger>
              <TabsTrigger value="vitals">
                <HeartPulse className="w-4 h-4 mr-1.5" />
                Vitals
              </TabsTrigger>
              <TabsTrigger value="messages">
                <MessageSquare className="w-4 h-4 mr-1.5" />
                Messages <span className="ml-1.5 text-xs bg-slate-200 text-slate-600 rounded-full px-1.5">{messages.length}</span>
              </TabsTrigger>
              <TabsTrigger value="family">
                <UserPlus className="w-4 h-4 mr-1.5" />
                Family Access <span className="ml-1.5 text-xs bg-slate-200 text-slate-600 rounded-full px-1.5">{familyMembers.length}</span>
              </TabsTrigger>
            </TabsList>

            {/* UPDATES */}
            <TabsContent value="updates" className="space-y-3">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setAddUpdateOpen(true)}>
                  <Plus className="w-4 h-4 mr-1.5" /> Post Update
                </Button>
              </div>
              {(detail?.updates.length ?? 0) === 0 ? (
                <EmptyState icon={<ClipboardList />} text="No updates yet." />
              ) : detail!.updates.map(u => (
                <Card key={u.id} className="border-slate-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        u.updateType === "condition" ? "bg-blue-100 text-blue-700" :
                        u.updateType === "procedure" ? "bg-violet-100 text-violet-700" :
                        u.updateType === "test" ? "bg-amber-100 text-amber-700" :
                        u.updateType === "discharge" ? "bg-emerald-100 text-emerald-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>{u.updateType}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900">{u.title}</h4>
                    <p className="text-slate-600 text-sm mt-1 leading-relaxed">{u.content}</p>
                    <p className="text-xs text-slate-400 mt-2">Posted by {u.updatedBy} · {format(new Date(u.createdAt), "d MMM yyyy, HH:mm")}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* MEDICATIONS */}
            <TabsContent value="medications" className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowInactiveMeds(v => !v)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors"
                >
                  {showInactiveMeds ? "Hide discontinued" : `Show discontinued (${detail?.medications.filter(m => !m.active).length ?? 0})`}
                </button>
                <Button size="sm" onClick={() => setAddMedOpen(true)}>
                  <Plus className="w-4 h-4 mr-1.5" /> Add Medication
                </Button>
              </div>
              {(detail?.medications.filter(m => m.active).length ?? 0) === 0 ? (
                <EmptyState icon={<Pill />} text="No active medications recorded." />
              ) : detail!.medications.filter(m => showInactiveMeds ? true : m.active).map(med => (
                <Card key={med.id} className="border-slate-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Pill className={`w-4 h-4 ${med.active ? "text-primary" : "text-slate-400"}`} />
                          <h4 className={`font-semibold ${med.active ? "text-slate-900" : "text-slate-400 line-through"}`}>{med.drugName}</h4>
                          {med.dose && <span className="text-xs text-slate-500">{med.dose}</span>}
                          {med.frequency && <span className="text-xs text-slate-400">· {med.frequency}</span>}
                          {!med.active && <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">Discontinued</span>}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{med.purpose}</p>
                        {med.startedDate && <p className="text-xs text-slate-400 mt-1">Started {format(new Date(med.startedDate), "d MMM yyyy")}</p>}
                        <p className="text-xs text-slate-400 mt-0.5">Added by {med.addedBy}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteMed(med.id)}
                        className="shrink-0 text-slate-400 hover:text-rose-600 transition-colors p-1 rounded"
                        title="Remove medication"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* TEST RESULTS */}
            <TabsContent value="tests" className="space-y-3">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setAddTestOpen(true)}>
                  <Plus className="w-4 h-4 mr-1.5" /> Add Result
                </Button>
              </div>
              {(detail?.testResults.length ?? 0) === 0 ? (
                <EmptyState icon={<FlaskConical />} text="No test results recorded." />
              ) : detail!.testResults.map(r => {
                const cfg = RESULT_CFG[r.resultStatus];
                return (
                  <Card key={r.id} className="border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">{r.testName}</h4>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{r.resultSummary}</p>
                      <p className="text-xs text-slate-400 mt-2">Tested {format(new Date(r.testedAt), "d MMM yyyy")} · Added by {r.addedBy}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/* MESSAGES */}
            <TabsContent value="messages">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    Family messages — {selected.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Messages between family and ward staff for this patient.</p>
                </div>
                <div className="p-4 space-y-3 min-h-[200px] max-h-[400px] overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">No messages yet.</div>
                  ) : messages.map(m => {
                    const isStaff = m.senderRole === "staff";
                    return (
                      <div key={m.id} className={`flex ${isStaff ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          isStaff ? "bg-primary text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm"
                        }`}>
                          {!isStaff && (
                            <p className="text-xs font-semibold text-slate-600 mb-1">{m.senderName} · Family</p>
                          )}
                          <p className="text-sm leading-relaxed">{m.content}</p>
                          <p className={`text-xs mt-1 ${isStaff ? "text-white/60" : "text-slate-400"}`}>
                            {!isStaff ? "" : `${m.senderName} · `}{format(new Date(m.createdAt), "d MMM, HH:mm")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-slate-200 flex gap-2">
                  <Textarea
                    placeholder="Reply to family..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    className="resize-none h-10 min-h-[40px] text-sm py-2"
                    rows={1}
                  />
                  <Button size="sm" onClick={sendMessage} disabled={!newMessage.trim() || sendingMsg} className="shrink-0">
                    {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* VITALS */}
            <TabsContent value="vitals" className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setAddVitalsOpen(true)}>
                  <HeartPulse className="w-4 h-4 mr-1.5" /> Record Vitals
                </Button>
              </div>
              {!vitals ? (
                <EmptyState icon={<HeartPulse />} text="No vitals recorded yet." />
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {vitals.heartRate !== null && <VitalCard label="Heart Rate" value={`${vitals.heartRate}`} unit="bpm" />}
                    {(vitals.systolicBp !== null && vitals.diastolicBp !== null) && <VitalCard label="Blood Pressure" value={`${vitals.systolicBp}/${vitals.diastolicBp}`} unit="mmHg" />}
                    {vitals.oxygenSaturation !== null && <VitalCard label="O₂ Saturation" value={`${vitals.oxygenSaturation}`} unit="%" />}
                    {vitals.temperature !== null && <VitalCard label="Temperature" value={`${parseFloat(vitals.temperature).toFixed(1)}`} unit="°C" />}
                    {vitals.respiratoryRate !== null && <VitalCard label="Resp. Rate" value={`${vitals.respiratoryRate}`} unit="br/min" />}
                  </div>
                  <p className="text-xs text-slate-400">
                    Recorded {format(new Date(vitals.recordedAt), "d MMM yyyy 'at' HH:mm")} by {vitals.recordedBy}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* FAMILY ACCESS */}
            <TabsContent value="family" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
                Link a visitor's account by email so they can access this patient's records on the Patient Portal.
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Family member's account email"
                  value={linkEmail}
                  onChange={e => setLinkEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleLinkFamily(); }}
                  className="flex-1"
                />
                <Button onClick={handleLinkFamily} disabled={!linkEmail.trim() || linkLoading} className="shrink-0">
                  {linkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 mr-1.5" />}
                  Link
                </Button>
              </div>
              {familyMembers.length === 0 ? (
                <EmptyState icon={<Users />} text="No family members linked yet." />
              ) : (
                <div className="space-y-2">
                  {familyMembers.map(m => (
                    <div key={m.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.email}</p>
                      </div>
                      <button
                        onClick={() => handleUnlinkFamily(m.id, m.name)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded"
                        title="Remove access"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Add Vitals Dialog */}
        <Dialog open={addVitalsOpen} onOpenChange={setAddVitalsOpen}>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader><DialogTitle>Record Vitals</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="space-y-1.5">
                <Label>Heart Rate (bpm)</Label>
                <Input placeholder="e.g. 72" value={vitalsForm.heartRate} onChange={e => setVitalsForm(f => ({ ...f, heartRate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>O₂ Saturation (%)</Label>
                <Input placeholder="e.g. 98" value={vitalsForm.oxygenSaturation} onChange={e => setVitalsForm(f => ({ ...f, oxygenSaturation: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Systolic BP (mmHg)</Label>
                <Input placeholder="e.g. 120" value={vitalsForm.systolicBp} onChange={e => setVitalsForm(f => ({ ...f, systolicBp: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Diastolic BP (mmHg)</Label>
                <Input placeholder="e.g. 80" value={vitalsForm.diastolicBp} onChange={e => setVitalsForm(f => ({ ...f, diastolicBp: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Temperature (°C)</Label>
                <Input placeholder="e.g. 37.1" value={vitalsForm.temperature} onChange={e => setVitalsForm(f => ({ ...f, temperature: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Resp. Rate (br/min)</Label>
                <Input placeholder="e.g. 16" value={vitalsForm.respiratoryRate} onChange={e => setVitalsForm(f => ({ ...f, respiratoryRate: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddVitalsOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleAddVitals} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Vitals
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Condition Dialog */}
        <Dialog open={editCondOpen} onOpenChange={setEditCondOpen}>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle>Update Patient Condition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Condition</Label>
                <Select value={condForm.condition} onValueChange={v => setCondForm(f => ({ ...f, condition: v as PatientCondition }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(COND_CFG) as PatientCondition[]).map(c => (
                      <SelectItem key={c} value={c}>{COND_CFG[c].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Condition Notes (for family)</Label>
                <Textarea
                  placeholder="Brief description visible to family on the patient portal..."
                  value={condForm.conditionNotes}
                  onChange={e => setCondForm(f => ({ ...f, conditionNotes: e.target.value }))}
                  className="resize-none h-24 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Care Team</Label>
                <Input
                  placeholder="e.g. Dr. Patel, Nurse Martinez"
                  value={condForm.careTeam}
                  onChange={e => setCondForm(f => ({ ...f, careTeam: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditCondOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleUpdateCondition} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Medication Dialog */}
        <Dialog open={addMedOpen} onOpenChange={setAddMedOpen}>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader><DialogTitle>Add Medication</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label>Drug Name *</Label>
                <Input placeholder="e.g. Metoprolol" value={medForm.drugName} onChange={e => setMedForm(f => ({ ...f, drugName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Purpose (shown to family) *</Label>
                <Textarea placeholder="e.g. Helps control the heart rate and reduce the workload on the heart." value={medForm.purpose} onChange={e => setMedForm(f => ({ ...f, purpose: e.target.value }))} className="resize-none h-20 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Dose</Label>
                  <Input placeholder="e.g. 50mg" value={medForm.dose} onChange={e => setMedForm(f => ({ ...f, dose: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Frequency</Label>
                  <Input placeholder="e.g. Twice daily" value={medForm.frequency} onChange={e => setMedForm(f => ({ ...f, frequency: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Started Date</Label>
                <Input type="date" value={medForm.startedDate} onChange={e => setMedForm(f => ({ ...f, startedDate: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddMedOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleAddMed} disabled={submitting || !medForm.drugName.trim() || !medForm.purpose.trim()}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add Medication
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Clinical Update Dialog */}
        <Dialog open={addUpdateOpen} onOpenChange={setAddUpdateOpen}>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader><DialogTitle>Post Clinical Update</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label>Update Type</Label>
                <Select value={updateForm.updateType} onValueChange={v => setUpdateForm(f => ({ ...f, updateType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UPDATE_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Title *</Label>
                <Input placeholder="e.g. Post-surgery recovery progressing well" value={updateForm.title} onChange={e => setUpdateForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Details (family-friendly language) *</Label>
                <Textarea placeholder="Describe the update in plain language..." value={updateForm.content} onChange={e => setUpdateForm(f => ({ ...f, content: e.target.value }))} className="resize-none h-28 text-sm" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddUpdateOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleAddUpdate} disabled={submitting || !updateForm.title.trim() || !updateForm.content.trim()}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Post Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Test Result Dialog */}
        <Dialog open={addTestOpen} onOpenChange={setAddTestOpen}>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader><DialogTitle>Add Test Result</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label>Test Name *</Label>
                <Input placeholder="e.g. Full Blood Count" value={testForm.testName} onChange={e => setTestForm(f => ({ ...f, testName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Result Summary (plain language) *</Label>
                <Textarea placeholder="e.g. Red blood cell count is within normal range. No signs of anaemia." value={testForm.resultSummary} onChange={e => setTestForm(f => ({ ...f, resultSummary: e.target.value }))} className="resize-none h-20 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={testForm.resultStatus} onValueChange={v => setTestForm(f => ({ ...f, resultStatus: v as ResultStatus }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(RESULT_CFG) as ResultStatus[]).map(s => (
                        <SelectItem key={s} value={s}>{RESULT_CFG[s].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Test Date *</Label>
                  <Input type="date" value={testForm.testedAt} onChange={e => setTestForm(f => ({ ...f, testedAt: e.target.value }))} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddTestOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleAddTest} disabled={submitting || !testForm.testName.trim() || !testForm.resultSummary.trim() || !testForm.testedAt}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add Result
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const filteredPatients = patients.filter(p =>
    !patientSearch.trim() ||
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.ward.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.condition.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Patient Records</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage patient information visible to families.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search patients…"
              value={patientSearch}
              onChange={e => setPatientSearch(e.target.value)}
              className="pl-8 pr-3 h-9 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-44"
            />
            <Activity className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <Button onClick={() => setRegisterOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Register Patient
          </Button>
        </div>
      </div>

      {patientsLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 w-36 bg-slate-200 rounded" />
                <div className="h-4 w-48 bg-slate-100 rounded" />
              </div>
              <div className="h-7 w-20 bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No patients registered</p>
          <p className="text-slate-400 text-sm mt-1">Click "Register Patient" to add the first record.</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500 text-sm">No patients match "{patientSearch}"</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredPatients.map(p => {
            const cfg = COND_CFG[p.condition];
            return (
              <button
                key={p.id}
                onClick={() => selectPatient(p)}
                className="text-left bg-white border border-slate-200 rounded-xl p-5 hover:border-primary hover:shadow-sm transition-all group flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg group-hover:text-primary transition-colors">{p.name}</h3>
                  <p className="text-slate-500 text-sm mt-0.5">
                    {p.ward} · Day {daysInICU(p.admissionDate) + 1} (admitted {format(new Date(p.admissionDate), "d MMM yyyy")})
                  </p>
                  {p.careTeam && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Users className="w-3 h-3" />{p.careTeam}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Register Patient Dialog */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Register New Patient</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Full Name *</Label>
                <Input placeholder="Patient's full name" value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Ward *</Label>
                <Select value={regForm.ward} onValueChange={v => setRegForm(f => ({ ...f, ward: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select ward…" /></SelectTrigger>
                  <SelectContent>
                    {WARDS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Condition</Label>
                <Select value={regForm.condition} onValueChange={v => setRegForm(f => ({ ...f, condition: v as PatientCondition }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(COND_CFG) as PatientCondition[]).map(c => (
                      <SelectItem key={c} value={c}>{COND_CFG[c].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Admission Date *</Label>
                <Input type="date" value={regForm.admissionDate} onChange={e => setRegForm(f => ({ ...f, admissionDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Date of Birth</Label>
                <Input type="date" value={regForm.dateOfBirth} onChange={e => setRegForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Care Team</Label>
                <Input placeholder="e.g. Dr. Patel, Nurse Martinez" value={regForm.careTeam} onChange={e => setRegForm(f => ({ ...f, careTeam: e.target.value }))} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Condition Notes (shown to family)</Label>
                <Textarea placeholder="Brief description of the patient's current condition in plain language..." value={regForm.conditionNotes} onChange={e => setRegForm(f => ({ ...f, conditionNotes: e.target.value }))} className="resize-none h-20 text-sm" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleRegister} disabled={submitting || !regForm.name.trim() || !regForm.ward || !regForm.admissionDate}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Register Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

type VStatus = "normal" | "warning" | "critical";
function getVStatus(label: string, value: string): VStatus {
  const n = parseFloat(value);
  if (isNaN(n)) return "normal";
  if (label === "Heart Rate") {
    if (n < 40 || n > 130) return "critical";
    if (n < 60 || n > 100) return "warning";
  } else if (label === "Blood Pressure") {
    if (n > 180 || n < 70) return "critical";
    if (n > 140 || n < 90) return "warning";
  } else if (label === "O₂ Saturation") {
    if (n < 90) return "critical";
    if (n < 95) return "warning";
  } else if (label === "Temperature") {
    if (n > 39.5 || n < 35) return "critical";
    if (n > 37.5 || n < 36.1) return "warning";
  } else if (label === "Resp. Rate") {
    if (n > 30 || n < 8) return "critical";
    if (n > 20 || n < 12) return "warning";
  }
  return "normal";
}

function VitalCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  const status = getVStatus(label, value.split("/")[0]);
  const border = status === "critical" ? "border-red-200 bg-red-50" : status === "warning" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white";
  const valColor = status === "critical" ? "text-red-700" : status === "warning" ? "text-amber-700" : "text-slate-900";
  const dot = status === "critical" ? "bg-red-500" : status === "warning" ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className={`border rounded-xl p-4 ${border}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
      <span className={`text-2xl font-bold tabular-nums ${valColor}`}>{value}</span>
      <span className="text-sm text-slate-400 ml-1">{unit}</span>
    </div>
  );
}
