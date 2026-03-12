import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { localDb } from "@/integrations/local-db";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  Star,
  AlertCircle,
  RefreshCw,
  Stethoscope,
  Award,
  MapPin,
  Bell,
  CheckCircle,
  LogOut,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import PatientQueueManager from "@/components/PatientQueueManager";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    checkDoctorAccess();
  }, []);

  useEffect(() => {
    if (!doctorInfo) return;
    const interval = setInterval(() => {
      fetchAppointments(doctorInfo.id);
      setLastRefresh(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, [doctorInfo]);

  const checkDoctorAccess = async () => {
    const {
      data: { session },
    } = await localDb.auth.getSession();

    if (!session) {
      navigate("/doctor-auth");
      return;
    }

    setUser(session.user);

    const rolesResult = await localDb
      .from("user_roles")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("role", "doctor")
      .single();

    const roleData: any = rolesResult.data;

    if (!roleData || !roleData.doctor_id) {
      toast({
        title: "Access Denied",
        description: "You don't have doctor permissions",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    const specResult = await localDb.from("specializations").select("*");
    const specMap = new Map(
      (specResult.data || []).map((s: any) => [s.id, s])
    );

    const { data: doctorData } = await localDb
      .from("doctors")
      .select("*")
      .eq("id", roleData.doctor_id)
      .single();

    if (doctorData && typeof doctorData === "object") {
      const doctorWithSpec = {
        ...doctorData,
        specialization: specMap.get((doctorData as any).specialization_id),
      };
      setDoctorInfo(doctorWithSpec);
      fetchAppointments(roleData.doctor_id);
    }
  };

  const fetchAppointments = useCallback(async (doctorId: string) => {
    const profilesResult = await localDb.from("profiles").select("*");
    const profileMap = new Map(
      (profilesResult.data || []).map((p: any) => [p.id, p])
    );

    const { data } = await localDb
      .from("appointments")
      .select("*")
      .eq("doctor_id", doctorId)
      .order("appointment_date", { ascending: true });

    if (data) {
      const appointmentsWithProfiles = data.map((apt: any) => ({
        ...apt,
        profiles: profileMap.get(apt.patient_id),
      }));
      setAppointments(appointmentsWithProfiles);
    }
    setLoading(false);
  }, []);

  const updateAppointmentStatus = async (
    id: string,
    status: "pending" | "confirmed" | "completed" | "cancelled"
  ) => {
    const { error } = await localDb
      .from("appointments")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Appointment ${status}`,
      });
      if (doctorInfo) fetchAppointments(doctorInfo.id);
    }
  };

  const handleSignOut = async () => {
    await localDb.auth.signOut();
    navigate("/doctor-auth");
  };

  const handleRefresh = () => {
    if (doctorInfo) {
      fetchAppointments(doctorInfo.id);
      setLastRefresh(new Date());
      toast({ title: "Refreshed", description: "Appointments updated" });
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter(
    (a) => a.appointment_date === today
  );
  const allPending = appointments.filter((a) => a.status === "pending");
  const allConfirmed = appointments.filter((a) => a.status === "confirmed");
  const allCompleted = appointments.filter((a) => a.status === "completed");
  const todayPending = todayAppointments.filter((a) => a.status === "pending");
  const todayConfirmed = todayAppointments.filter(
    (a) => a.status === "confirmed"
  );
  const todayCompleted = todayAppointments.filter(
    (a) => a.status === "completed"
  );

  const isRecentAppointment = (apt: any) => {
    if (!apt.created_at) return false;
    const created = new Date(apt.created_at);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return created > hourAgo;
  };

  const newAppointmentsCount = allPending.filter(isRecentAppointment).length;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      in_consultation: "bg-purple-100 text-purple-800",
    };
    return (
      <Badge className={styles[status] || "bg-gray-100 text-gray-800"}>
        {status.replace("_", " ").charAt(0).toUpperCase() +
          status.replace("_", " ").slice(1)}
      </Badge>
    );
  };

  if (loading || !doctorInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="inline-block size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const renderAppointmentCard = (apt: any) => {
    const isNew = isRecentAppointment(apt);
    return (
      <Card key={apt.id} className={`p-6 ${isNew ? "border-l-4 border-l-primary" : ""}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-lg">
                {apt.profiles?.full_name || "Patient"}
              </h3>
              {getStatusBadge(apt.status)}
              {isNew && (
                <Badge className="bg-primary/10 text-primary text-xs">
                  <Bell className="size-3 mr-1" />
                  New
                </Badge>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" />
                {apt.appointment_date}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4" />
                {apt.appointment_time}
              </div>
              {apt.payment_amount && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="size-4" />
                  <span className="tabular-nums">${apt.payment_amount}</span>
                  {apt.payment_method && (
                    <span className="text-xs">({apt.payment_method})</span>
                  )}
                </div>
              )}
              {apt.created_at && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="size-4" />
                  Booked {formatDistanceToNow(new Date(apt.created_at), { addSuffix: true })}
                </div>
              )}
            </div>
            {apt.notes && (
              <p className="mt-3 text-sm text-muted-foreground">
                <strong>Notes:</strong> {apt.notes}
              </p>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            {apt.status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={() => updateAppointmentStatus(apt.id, "confirmed")}
                >
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => updateAppointmentStatus(apt.id, "cancelled")}
                >
                  Cancel
                </Button>
              </>
            )}
            {apt.status === "confirmed" && (
              <Button
                size="sm"
                onClick={() => updateAppointmentStatus(apt.id, "completed")}
              >
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderEmptyState = (message: string) => (
    <Card className="p-12 text-center">
      <Calendar className="size-12 mx-auto mb-4 text-muted-foreground/40" />
      <p className="text-muted-foreground text-pretty">{message}</p>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="size-4 mr-2" />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/lab-tests">
                <Stethoscope className="size-4 mr-2" />
                Lab Tests
              </Link>
            </Button>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Updated {formatDistanceToNow(lastRefresh, { addSuffix: true })}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="size-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Doctor Profile Welcome Section */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {doctorInfo.image_url ? (
              <img
                src={doctorInfo.image_url}
                alt={doctorInfo.name}
                className="size-20 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Stethoscope className="size-10 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-balance">{doctorInfo.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
                {doctorInfo.specialization && (
                  <span className="flex items-center gap-1">
                    <span className="text-lg">{doctorInfo.specialization.icon}</span>
                    {doctorInfo.specialization.name}
                  </span>
                )}
                {doctorInfo.qualification && (
                  <span className="flex items-center gap-1">
                    <Award className="size-4" />
                    {doctorInfo.qualification}
                  </span>
                )}
                {doctorInfo.experience_years && (
                  <span className="flex items-center gap-1">
                    <Clock className="size-4" />
                    {doctorInfo.experience_years} years exp.
                  </span>
                )}
                {doctorInfo.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" />
                    {doctorInfo.city}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
              {newAppointmentsCount > 0 && (
                <Badge className="mt-2 bg-primary text-primary-foreground">
                  <Bell className="size-3 mr-1" />
                  {newAppointmentsCount} new appointment{newAppointmentsCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="size-8 text-primary shrink-0" />
              <div>
                <p className="text-2xl font-bold tabular-nums">{todayAppointments.length}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-8 text-yellow-500 shrink-0" />
              <div>
                <p className="text-2xl font-bold tabular-nums">{allPending.length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="size-8 text-green-500 shrink-0" />
              <div>
                <p className="text-2xl font-bold tabular-nums">{allConfirmed.length}</p>
                <p className="text-xs text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <User className="size-8 text-blue-500 shrink-0" />
              <div>
                <p className="text-2xl font-bold tabular-nums">{allCompleted.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Star className="size-8 text-yellow-500 shrink-0" />
              <div>
                <p className="text-2xl font-bold tabular-nums">{doctorInfo.rating ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="size-8 text-green-600 shrink-0" />
              <div>
                <p className="text-2xl font-bold tabular-nums">
                  ${appointments.reduce((sum, a) => sum + (a.status !== "cancelled" ? (a.payment_amount || 0) : 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Appointment Tabs */}
        <Tabs defaultValue="queue" className="w-full">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="queue">Patient Queue</TabsTrigger>
            <TabsTrigger value="today">
              Today
              {todayAppointments.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs tabular-nums">
                  {todayAppointments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              {allPending.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs tabular-nums">
                  {allPending.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed
              {allConfirmed.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs tabular-nums">
                  {allConfirmed.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="mt-6">
            <PatientQueueManager
              doctorId={doctorInfo.id}
              appointmentDate={today}
              onQueueUpdate={() => fetchAppointments(doctorInfo.id)}
            />
          </TabsContent>

          <TabsContent value="today" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-balance">
                  Today's Appointments — {format(new Date(), "MMMM d, yyyy")}
                </h3>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span className="tabular-nums">{todayPending.length} pending</span>
                  <span>·</span>
                  <span className="tabular-nums">{todayConfirmed.length} confirmed</span>
                  <span>·</span>
                  <span className="tabular-nums">{todayCompleted.length} done</span>
                </div>
              </div>
              {todayAppointments.length === 0
                ? renderEmptyState("No appointments scheduled for today")
                : todayAppointments
                    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                    .map(renderAppointmentCard)}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <div className="space-y-4">
              {allPending.length === 0
                ? renderEmptyState("No pending appointments")
                : allPending.map(renderAppointmentCard)}
            </div>
          </TabsContent>

          <TabsContent value="confirmed" className="mt-6">
            <div className="space-y-4">
              {allConfirmed.length === 0
                ? renderEmptyState("No confirmed appointments")
                : allConfirmed.map(renderAppointmentCard)}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="space-y-4">
              {allCompleted.length === 0
                ? renderEmptyState("No completed appointments yet")
                : allCompleted.map(renderAppointmentCard)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;