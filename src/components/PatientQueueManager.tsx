import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Clock, CheckCircle, AlertCircle, User, Phone, FileText } from "lucide-react";
import { localDb, runQuery, updateRecord } from "@/integrations/local-db";
import { useToast } from "@/hooks/use-toast";

interface QueuedPatient {
  id: string;
  appointment_id: string;
  patient_id: string;
  patient_name: string;
  appointment_time: string;
  appointment_date: string;
  queue_position: number;
  status: "waiting" | "in_consultation" | "completed";
  estimated_wait_time: number;
  consultation_duration: number;
  notes?: string;
  phone?: string;
  email?: string;
}

interface PatientQueueManagerProps {
  doctorId: string;
  appointmentDate: string;
  onQueueUpdate?: () => void;
}

const PatientQueueManager = ({
  doctorId,
  appointmentDate,
  onQueueUpdate
}: PatientQueueManagerProps) => {
  const { toast } = useToast();
  const [queue, setQueue] = useState<QueuedPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentConsultation, setCurrentConsultation] = useState<QueuedPatient | null>(null);

  useEffect(() => {
    fetchQueue();
    // Refresh queue every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [doctorId, appointmentDate]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      // Get all confirmed appointments for today
      const appointments = runQuery("appointments").filter((apt: any) => 
        apt.doctor_id === doctorId && 
        apt.appointment_date === appointmentDate &&
        (apt.status === "confirmed" || apt.status === "in_consultation" || apt.status === "completed")
      );

      // Get profiles for patient details
      const profiles = runQuery("profiles");
      const profileMap = new Map(profiles.map((p: any) => [p.id, p]));

      // Get users for contact info
      const users = runQuery("users");
      const userMap = new Map(users.map((u: any) => [u.id, u]));

      // Build queue with calculated wait times
      const queuedPatients: QueuedPatient[] = [];
      let cumulativeWaitTime = 0;

      appointments
        .sort((a: any, b: any) => {
          const timeA = a.appointment_time.split(":").reduce((h: number, m: number) => h * 60 + m, 0);
          const timeB = b.appointment_time.split(":").reduce((h: number, m: number) => h * 60 + m, 0);
          return timeA - timeB;
        })
        .forEach((apt: any, index: number) => {
          const profile = profileMap.get(apt.patient_id);
          const user = userMap.get(apt.patient_id);
          
          let status: "waiting" | "in_consultation" | "completed" = "waiting";
          if (apt.status === "in_consultation") status = "in_consultation";
          if (apt.status === "completed") status = "completed";

          const queuedPatient: QueuedPatient = {
            id: apt.id,
            appointment_id: apt.id,
            patient_id: apt.patient_id,
            patient_name: profile?.full_name || "Unknown Patient",
            appointment_time: apt.appointment_time,
            appointment_date: apt.appointment_date,
            queue_position: index + 1,
            status,
            estimated_wait_time: status === "completed" ? 0 : cumulativeWaitTime,
            consultation_duration: apt.consultation_duration || 15, // Default 15 minutes
            notes: apt.notes,
            phone: user?.phone,
            email: user?.email
          };

          queuedPatients.push(queuedPatient);

          // Add consultation duration to cumulative wait time for next patient
          if (status !== "completed") {
            cumulativeWaitTime += queuedPatient.consultation_duration;
          }
        });

      setQueue(queuedPatients);

      // Set current consultation (first in_consultation or first waiting)
      const inConsultation = queuedPatients.find(p => p.status === "in_consultation");
      const nextWaiting = queuedPatients.find(p => p.status === "waiting");
      setCurrentConsultation(inConsultation || nextWaiting || null);
    } catch (error) {
      console.error("Error fetching queue:", error);
      toast({
        title: "Error",
        description: "Failed to load patient queue",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const startConsultation = async (patient: QueuedPatient) => {
    try {
      // Update appointment status to in_consultation
      updateRecord("appointments", patient.appointment_id, {
        status: "in_consultation",
        consultation_start_time: new Date().toISOString()
      });

      setCurrentConsultation(patient);
      toast({
        title: "Consultation Started",
        description: `Started consultation with ${patient.patient_name}`
      });

      fetchQueue();
      onQueueUpdate?.();
    } catch (error) {
      console.error("Error starting consultation:", error);
      toast({
        title: "Error",
        description: "Failed to start consultation",
        variant: "destructive"
      });
    }
  };

  const completeConsultation = async (patient: QueuedPatient) => {
    try {
      const consultationEndTime = new Date().toISOString();
      
      // Update appointment status to completed
      updateRecord("appointments", patient.appointment_id, {
        status: "completed",
        consultation_end_time: consultationEndTime,
        completed_at: consultationEndTime
      });

      toast({
        title: "Consultation Completed",
        description: `Completed consultation with ${patient.patient_name}`,
      });

      // Refresh queue to recalculate wait times
      fetchQueue();
      onQueueUpdate?.();
    } catch (error) {
      console.error("Error completing consultation:", error);
      toast({
        title: "Error",
        description: "Failed to complete consultation",
        variant: "destructive"
      });
    }
  };

  const skipPatient = async (patient: QueuedPatient) => {
    try {
      // Update appointment status to cancelled
      updateRecord("appointments", patient.appointment_id, {
        status: "cancelled",
        cancellation_reason: "Skipped by doctor"
      });

      toast({
        title: "Patient Skipped",
        description: `${patient.patient_name} has been skipped`,
      });

      fetchQueue();
      onQueueUpdate?.();
    } catch (error) {
      console.error("Error skipping patient:", error);
      toast({
        title: "Error",
        description: "Failed to skip patient",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_consultation":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_consultation":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "waiting":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const waitingPatients = queue.filter(p => p.status === "waiting");
  const completedPatients = queue.filter(p => p.status === "completed");

  return (
    <div className="space-y-6">
      {/* Current Consultation Card */}
      {currentConsultation && (
        <Card className="p-6 border-2 border-blue-500 bg-blue-50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-blue-900">Currently Consulting</h3>
              <p className="text-sm text-blue-700">Patient in consultation room</p>
            </div>
            <Badge className={`${getStatusColor(currentConsultation.status)}`}>
              <span className="flex items-center gap-1">
                {getStatusIcon(currentConsultation.status)}
                {currentConsultation.status.replace("_", " ").toUpperCase()}
              </span>
            </Badge>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Patient Name</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {currentConsultation.patient_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Appointment Time</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {currentConsultation.appointment_time}
                </p>
              </div>
              {currentConsultation.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {currentConsultation.phone}
                  </p>
                </div>
              )}
              {currentConsultation.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {currentConsultation.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {currentConsultation.status === "waiting" && (
              <Button 
                onClick={() => startConsultation(currentConsultation)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Start Consultation
              </Button>
            )}
            {currentConsultation.status === "in_consultation" && (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      Mark as Completed
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Complete Consultation</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to mark {currentConsultation.patient_name}'s consultation as completed? This will update the queue and notify the next patient.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => completeConsultation(currentConsultation)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Complete
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
                <Button 
                  variant="outline"
                  onClick={() => skipPatient(currentConsultation)}
                >
                  Skip Patient
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Queue Statistics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Waiting Patients</p>
          <p className="text-3xl font-bold">{waitingPatients.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Completed Today</p>
          <p className="text-3xl font-bold">{completedPatients.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Queue</p>
          <p className="text-3xl font-bold">{queue.length}</p>
        </Card>
      </div>

      {/* Patient Queue List */}
      <div>
        <h3 className="text-lg font-bold mb-4">Patient Queue</h3>
        {queue.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No patients scheduled for today</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {queue.map((patient) => (
              <Card 
                key={patient.id} 
                className={`p-4 transition-all ${
                  patient.status === "completed" ? "opacity-60" : ""
                } ${
                  patient.status === "in_consultation" ? "border-2 border-blue-500" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Queue Position */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-bold">
                      {patient.queue_position}
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{patient.patient_name}</p>
                        <Badge className={getStatusColor(patient.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(patient.status)}
                            {patient.status.replace("_", " ")}
                          </span>
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {patient.appointment_time}
                        </span>
                        {patient.status !== "completed" && (
                          <span className="flex items-center gap-1">
                            ⏱️ Wait: {patient.estimated_wait_time} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {patient.status === "waiting" && (
                      <Button 
                        size="sm"
                        onClick={() => startConsultation(patient)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Start
                      </Button>
                    )}
                    {patient.status === "in_consultation" && (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Complete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Complete Consultation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Mark {patient.patient_name}'s consultation as completed?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex gap-3">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => completeConsultation(patient)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Complete
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => skipPatient(patient)}
                        >
                          Skip
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Completed Patients Summary */}
      {completedPatients.length > 0 && (
        <Card className="p-4 bg-green-50">
          <h4 className="font-semibold text-green-900 mb-2">Completed Consultations</h4>
          <div className="space-y-1">
            {completedPatients.map((patient) => (
              <p key={patient.id} className="text-sm text-green-800">
                ✓ {patient.patient_name}
              </p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PatientQueueManager;
