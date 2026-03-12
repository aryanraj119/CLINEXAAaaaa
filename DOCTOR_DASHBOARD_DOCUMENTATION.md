# Doctor Dashboard - Patient Queue Management System

## System Overview

The Doctor Dashboard is a comprehensive hospital appointment management system that enables doctors to efficiently manage their patient queue, track consultation progress, and maintain optimal clinic workflow. The system provides real-time queue management with automatic wait time calculations and status tracking.

---

## Architecture & Components

### 1. **PatientQueueManager Component** (`src/components/PatientQueueManager.tsx`)

The core component responsible for managing the patient queue with the following features:

#### Key Features:
- **Real-time Queue Display**: Shows all scheduled patients for the day with their queue position
- **Automatic Wait Time Calculation**: Calculates estimated waiting time based on consultation duration
- **Status Management**: Tracks patient status (waiting, in_consultation, completed)
- **Current Consultation Highlight**: Prominently displays the patient currently being consulted
- **Queue Statistics**: Shows waiting patients, completed consultations, and total queue count

#### Component Props:
```typescript
interface PatientQueueManagerProps {
  doctorId: string;              // Doctor's unique identifier
  appointmentDate: string;       // Date for which to display queue (YYYY-MM-DD)
  onQueueUpdate?: () => void;    // Callback when queue is updated
}
```

---

## System Workflow

### 1. **Queue Initialization**

```
Doctor Login
    ↓
Load Doctor Dashboard
    ↓
Fetch Today's Appointments
    ↓
Build Patient Queue
    ↓
Calculate Wait Times
    ↓
Display Queue Manager
```

### 2. **Patient Consultation Flow**

```
Patient Arrives (Status: waiting)
    ↓
Doctor Clicks "Start Consultation"
    ↓
Status Changes to "in_consultation"
    ↓
Patient Highlighted in Current Consultation Card
    ↓
Doctor Performs Consultation
    ↓
Doctor Clicks "Mark as Completed"
    ↓
Status Changes to "completed"
    ↓
Database Updated with Timestamps
    ↓
Queue Recalculated
    ↓
Next Patient Becomes Current
    ↓
Wait Times Updated for Remaining Patients
```

### 3. **Queue Position Management**

When a patient is marked as completed:

1. **Remove from Active Queue**: Patient is moved to completed section
2. **Recalculate Positions**: Remaining patients' queue positions are recalculated
3. **Update Wait Times**: Estimated wait times for remaining patients are updated
4. **Notify Next Patient**: The next patient in queue becomes the current consultation

---

## Database Interaction

### Appointment Table Schema

```typescript
interface Appointment {
  id: string;                          // Unique appointment ID
  doctor_id: string;                   // Doctor's ID
  patient_id: string;                  // Patient's ID
  appointment_date: string;            // Date (YYYY-MM-DD)
  appointment_time: string;            // Time (HH:MM)
  status: "pending" | "confirmed" | "in_consultation" | "completed" | "cancelled";
  consultation_duration: number;       // Duration in minutes (default: 15)
  consultation_start_time?: string;    // ISO timestamp when consultation started
  consultation_end_time?: string;      // ISO timestamp when consultation ended
  completed_at?: string;               // ISO timestamp when marked complete
  notes?: string;                      // Patient notes
  payment_amount: number;              // Consultation fee
  payment_method: string;              // Payment method used
}
```

### Database Operations

#### 1. **Fetch Queue**
```typescript
// Get all confirmed appointments for today
const appointments = runQuery("appointments").filter((apt: any) => 
  apt.doctor_id === doctorId && 
  apt.appointment_date === appointmentDate &&
  (apt.status === "confirmed" || apt.status === "in_consultation" || apt.status === "completed")
);
```

#### 2. **Start Consultation**
```typescript
updateRecord("appointments", appointmentId, {
  status: "in_consultation",
  consultation_start_time: new Date().toISOString()
});
```

#### 3. **Complete Consultation**
```typescript
updateRecord("appointments", appointmentId, {
  status: "completed",
  consultation_end_time: new Date().toISOString(),
  completed_at: new Date().toISOString()
});
```

#### 4. **Skip Patient**
```typescript
updateRecord("appointments", appointmentId, {
  status: "cancelled",
  cancellation_reason: "Skipped by doctor"
});
```

---

## Wait Time Calculation Algorithm

### Algorithm Logic

```typescript
let cumulativeWaitTime = 0;

appointments.forEach((apt, index) => {
  const queuedPatient: QueuedPatient = {
    queue_position: index + 1,
    estimated_wait_time: cumulativeWaitTime,
    consultation_duration: apt.consultation_duration || 15
  };

  // Add current patient's consultation duration to cumulative time
  if (status !== "completed") {
    cumulativeWaitTime += queuedPatient.consultation_duration;
  }
});
```

### Example Calculation

```
Patient 1: Appointment Time 10:00 AM
  - Queue Position: 1
  - Estimated Wait Time: 0 minutes
  - Consultation Duration: 15 minutes

Patient 2: Appointment Time 10:15 AM
  - Queue Position: 2
  - Estimated Wait Time: 15 minutes (Patient 1's duration)
  - Consultation Duration: 20 minutes

Patient 3: Appointment Time 10:35 AM
  - Queue Position: 3
  - Estimated Wait Time: 35 minutes (15 + 20)
  - Consultation Duration: 15 minutes

Patient 4: Appointment Time 10:50 AM
  - Queue Position: 4
  - Estimated Wait Time: 50 minutes (15 + 20 + 15)
  - Consultation Duration: 15 minutes
```

---

## Key Features & Benefits

### 1. **Real-Time Queue Management**
- **Automatic Updates**: Queue refreshes every 30 seconds
- **Live Status**: Patients see their position and estimated wait time
- **Instant Feedback**: Doctors get immediate confirmation of status changes

### 2. **Efficient Consultation Process**
- **Clear Current Patient**: Highlighted current consultation card
- **Quick Actions**: One-click buttons to start/complete consultations
- **Reduced Confusion**: Clear queue position numbering

### 3. **Wait Time Optimization**
- **Accurate Predictions**: Based on actual consultation durations
- **Patient Satisfaction**: Patients know their wait time
- **Resource Planning**: Doctors can manage time effectively

### 4. **Data Integrity**
- **Timestamp Tracking**: Records when consultations start and end
- **Audit Trail**: Complete history of consultation status changes
- **Error Prevention**: Confirmation dialogs for critical actions

### 5. **User Experience**
- **Visual Indicators**: Color-coded status badges
- **Queue Statistics**: Overview of waiting, completed, and total patients
- **Responsive Design**: Works on desktop and mobile devices

---

## UI Components & Layout

### 1. **Current Consultation Card**
```
┌─────────────────────────────────────────────────────┐
│ Currently Consulting                                │
│ Patient in consultation room                        │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Patient Name: John Doe                          │ │
│ │ Appointment Time: 10:00 AM                      │ │
│ │ Contact: +1-555-0123                            │ │
│ │ Notes: Follow-up for hypertension               │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ [Start Consultation] [Mark Complete] [Skip Patient]│
└─────────────────────────────────────────────────────┘
```

### 2. **Queue Statistics**
```
┌──────────────┬──────────────┬──────────────┐
│ Waiting: 5   │ Completed: 8 │ Total: 13    │
└──────────────┴──────────────┴──────────────┘
```

### 3. **Patient Queue List**
```
┌─────────────────────────────────────────────────────┐
│ 1 │ John Doe          │ 10:00 AM │ Wait: 0 min    │
│   │ Status: Waiting   │          │ [Start]        │
├─────────────────────────────────────────────────────┤
│ 2 │ Jane Smith        │ 10:15 AM │ Wait: 15 min   │
│   │ Status: Waiting   │          │ [Start]        │
├─────────────────────────────────────────────────────┤
│ 3 │ Bob Johnson       │ 10:35 AM │ Wait: 35 min   │
│   │ Status: Waiting   │          │ [Start]        │
└─────────────────────────────────────────────────────┘
```

---

## Integration with DoctorDashboard

The PatientQueueManager is integrated into the main DoctorDashboard with a dedicated "Patient Queue" tab:

```typescript
<Tabs defaultValue="queue" className="w-full">
  <TabsList className="grid w-full grid-cols-4 max-w-2xl">
    <TabsTrigger value="queue">Patient Queue</TabsTrigger>
    <TabsTrigger value="pending">Pending</TabsTrigger>
    <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
    <TabsTrigger value="completed">Completed</TabsTrigger>
  </TabsList>

  <TabsContent value="queue" className="mt-6">
    <PatientQueueManager 
      doctorId={doctorInfo.id}
      appointmentDate={new Date().toISOString().split('T')[0]}
      onQueueUpdate={() => fetchAppointments(doctorInfo.id)}
    />
  </TabsContent>
</Tabs>
```

---

## Error Handling & Validation

### Error Scenarios

1. **Failed to Load Queue**
   - Toast notification: "Failed to load patient queue"
   - Fallback: Display empty queue

2. **Failed to Start Consultation**
   - Toast notification: "Failed to start consultation"
   - Rollback: Queue remains unchanged

3. **Failed to Complete Consultation**
   - Toast notification: "Failed to complete consultation"
   - Rollback: Patient status remains unchanged

### Validation Checks

- Doctor authentication required
- Appointment date validation
- Patient status validation before state changes
- Confirmation dialogs for critical actions

---

## Performance Optimization

### 1. **Auto-Refresh Strategy**
- Queue refreshes every 30 seconds
- Prevents excessive database queries
- Balances real-time updates with performance

### 2. **Data Caching**
- Profiles and users cached in memory
- Reduces repeated database lookups
- Improves response time

### 3. **Efficient Sorting**
- Appointments sorted by time on fetch
- Queue positions calculated once
- Minimal re-renders

---

## Future Enhancements

1. **SMS/Email Notifications**: Notify patients of their queue position
2. **Consultation Notes**: Add detailed notes during consultation
3. **Analytics Dashboard**: Track consultation duration trends
4. **Multi-Doctor Support**: Manage queues across multiple doctors
5. **Patient Feedback**: Collect satisfaction ratings post-consultation
6. **Appointment Rescheduling**: Allow patients to reschedule from queue
7. **Emergency Priority**: Fast-track emergency patients
8. **Video Consultation**: Support for telemedicine appointments

---

## Testing Scenarios

### Scenario 1: Normal Consultation Flow
1. Doctor logs in
2. Views patient queue for today
3. Clicks "Start Consultation" for first patient
4. Patient status changes to "in_consultation"
5. Doctor completes consultation
6. Clicks "Mark as Completed"
7. Patient moves to completed section
8. Next patient becomes current
9. Wait times recalculated

### Scenario 2: Skip Patient
1. Doctor starts consultation with patient
2. Decides to skip patient
3. Clicks "Skip Patient"
4. Patient status changes to "cancelled"
5. Next patient becomes current

### Scenario 3: Multiple Patients
1. Queue shows 5 patients
2. Patient 1: Wait time 0 min
3. Patient 2: Wait time 15 min
4. Patient 3: Wait time 35 min
5. Patient 4: Wait time 50 min
6. Patient 5: Wait time 65 min
7. After Patient 1 completes, all wait times decrease

---

## Conclusion

The Doctor Dashboard Patient Queue Management System provides a robust, efficient solution for managing hospital appointments. By automating queue management, calculating accurate wait times, and providing real-time updates, the system significantly improves the consultation process, enhances patient satisfaction, and optimizes doctor productivity.

The modular design allows for easy integration with existing systems and provides a foundation for future enhancements in healthcare appointment management.
