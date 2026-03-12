# Doctor Dashboard - System Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DOCTOR DASHBOARD SYSTEM                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION LAYER                               │
├─────────────────────────────────────────────────────────────────────────────���┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      DoctorDashboard.tsx                            │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │ Navigation Bar (Doctor Name, Sign Out)                      │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │  ┌───────────────────────────────────────���──────────────────────┐  │   │
│  │  │ Statistics Cards (Total, Pending, Rating, Completed)        │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │ Tabs: Queue | Pending | Confirmed | Completed              │  │   │
│  │  │                                                              │  │   │
│  │  │ ┌────────────────────────────────────────────────────────┐  │  │   │
│  │  │ │ PatientQueueManager Component                          │  │  │   │
│  │  │ │                                                        │  │  │   │
│  │  │ │ ┌──────────────────────────────────────────────────┐  │  │  │   │
│  │  │ │ │ Current Consultation Card                        │  │  │  │   │
│  │  │ │ │ - Patient Name                                   │  │  │  │   │
│  │  │ │ │ - Appointment Time                               │  │  │  │   │
│  │  │ │ │ - Contact Info                                   │  │  │  │   │
│  │  │ │ │ - Status Badge                                   │  │  │  │   │
│  │  │ │ │ - Action Buttons                                 │  │  │  │   │
│  │  │ │ └──────────────────────────────────────────────────┘  │  │  │   │
│  │  │ │                                                        │  │  │   │
│  │  │ │ ┌──────────────────────────────────────────────────┐  │  │  │   ��
│  │  │ │ │ Queue Statistics                                 │  │  │  │   │
│  │  │ │ │ - Waiting Patients                               │  │  │  │   │
│  │  │ │ │ - Completed Today                                │  │  │  │   │
│  │  │ │ │ - Total Queue                                    │  │  │  │   │
│  │  │ │ └──────────────────────────────────────────────────┘  │  │  │   │
│  │  │ │                                                        │  │  │   │
│  │  │ │ ┌──────────────────────────────────────────────────┐  │  │  │   │
│  │  │ │ │ Patient Queue List                               │  │  │  │   │
│  │  │ │ │ ┌────────────────────────────────────────────┐   │  │  │  │   │
│  │  │ │ │ │ Position | Name | Time | Wait | Actions   │   │  │  │  │   │
│  │  │ │ │ ├───────────────────────────────���────────────┤   │  │  │  │   │
│  │  │ │ │ │ 1       | John | 10:00| 0 min | [Start]   │   │  │  │  │   │
│  │  │ │ │ │ 2       | Jane | 10:15| 15min | [Start]   │   │  │  │  │   │
│  │  │ │ │ │ 3       | Bob  | 10:35| 35min | [Start]   │   │  │  │  │   │
│  │  │ │ │ └────────────────────────────────────────────┘   │  │  │  │   │
│  │  │ │ └──────────────────────────────────────────────────┘  │  │  │   │
│  │  │ └────────────────────────────────────────────────────────┘  │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────────────���┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                            BUSINESS LOGIC LAYER                             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    PatientQueueManager Logic                        │   │
│  │                                                                     ���   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │ fetchQueue()                                                 │  │   │
│  │  │ - Query appointments for doctor & date                       │  │   │
│  │  │ - Sort by appointment time                                   │  │   │
│  │  │ - Calculate queue positions                                  │  │   │
│  │  │ - Calculate wait times                                       │  │   │
│  │  │ - Merge with patient profiles                                │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │ startConsultation(patient)                                   │  │   │
│  │  │ - Update appointment status to "in_consultation"             │  │   │
│  │  │ - Record consultation_start_time                             │  │   │
│  │  │ - Set as current consultation                                │  │   │
│  │  │ - Trigger queue refresh                                      │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │ completeConsultation(patient)                                │  │   │
│  │  │ - Update appointment status to "completed"                   │  │   │
│  │  │ - Record consultation_end_time                               │  │   │
│  │  │ - Record completed_at timestamp                              │  │   │
│  │  │ - Recalculate queue positions                                │  │   │
│  │  │ - Recalculate wait times                                     │  │   │
│  │  │ - Move to next patient                                       │  │   │
│  │  │ - Trigger queue refresh                                      │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │ skipPatient(patient)                                         │  │   │
│  │  │ - Update appointment status to "cancelled"                   │  │   │
│  │  │ - Record cancellation_reason                                 │  │   │
│  │  │ - Recalculate queue                                          │  │   │
│  │  │ - Trigger queue refresh                                      │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  │  ┌───────────────────────��──────────────────────────────────────┐  │   │
│  │  │ calculateWaitTimes()                                         │  │   │
│  │  │ - Iterate through sorted appointments                        │  │   │
│  │  │ - Accumulate consultation durations                          │  │   │
│  │  │ - Assign estimated_wait_time to each patient                 │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────���────────────────────────────────────────────────────────────────────┐
│                            DATA ACCESS LAYER                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Local Database (localDb)                       │   │
│  │                                                                     │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │ runQuery(table)                                              │  │   │
│  │  │ - Fetch all records from table                               │  │   │
│  │  │ - Apply filters                                              │  │   │
│  │  │ - Return filtered results                                    │  │   │
│  │  └───────────��──────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │ updateRecord(table, id, data)                                │  │   │
│  │  │ - Find record by ID                                          │  │   │
│  │  │ - Merge with new data                                        │  │   │
│  │  │ - Save to localStorage                                       │  │   │
│  │  │ - Return updated record                                      │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                            STORAGE LAYER                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Browser LocalStorage                           │   │
│  │                                                                     │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │ clinexa_db (JSON)                                            │  │   │
│  │  │ {                                                            │  │   │
│  │  │   "appointments": [                                          │  │   │
│  │  │     {                                                        │  │   │
│  │  │       "id": "apt-123",                                       │  │   │
│  │  │       "doctor_id": "doc-1",                                  │  │   │
│  │  │       "patient_id": "pat-1",                                 │  │   │
│  │  │       "appointment_date": "2024-01-15",                      │  │   │
│  │  │       "appointment_time": "10:00",                           │  │   │
│  │  │       "status": "in_consultation",                           │  │   │
│  │  │       "consultation_duration": 15,                           │  │   │
│  │  ���       "consultation_start_time": "2024-01-15T10:00:00Z",     │  │   │
│  │  │       "consultation_end_time": null,                         │  │   │
│  │  │       "completed_at": null                                   │  │   │
│  │  │     }                                                        │  │   │
│  │  │   ],                                                         │  │   │
│  │  │   "profiles": [...],                                         │  │   │
│  │  │   "users": [...]                                             │  │   │
│  │  │ }                                                            │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### 1. Queue Initialization Flow

```
┌─────────────────────┐
│  Doctor Dashboard   │
│  Component Mounts   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ PatientQueueManager useEffect()      │
│ - doctorId: "doc-1"                 │
│ - appointmentDate: "2024-01-15"     │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ fetchQueue()                        │
│ - Query appointments table          │
│ - Filter by doctor_id & date        │
│ - Filter by status (confirmed, etc) │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ runQuery("appointments")            │
│ Returns: [apt1, apt2, apt3, ...]    │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Sort by appointment_time            │
│ [10:00, 10:15, 10:35, ...]          │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Calculate Queue Positions           │
│ Position 1, 2, 3, ...               │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Calculate Wait Times                │
│ 0 min, 15 min, 35 min, ...          │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Merge with Profiles                 │
│ Add patient names & contact info    │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ setQueue(queuedPatients)            │
│ Update component state              │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Render Queue UI                     │
│ Display all patients with positions │
└─────��───────────────────────────────┘
```

### 2. Start Consultation Flow

```
┌──────────────────────────────┐
│ Doctor Clicks "Start"        │
│ for Patient #1               │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ startConsultation(patient)               │
│ - patient.id = "apt-123"                 │
│ - patient.patient_name = "John Doe"      │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ updateRecord("appointments", id, {       │
│   status: "in_consultation",             │
│   consultation_start_time: ISO_TIME      │
│ })                                       │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ localStorage.setItem("clinexa_db", ...)  │
│ Persist changes                          │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ setCurrentConsultation(patient)          │
│ Update component state                   │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ toast("Consultation Started")            │
│ Show success notification                │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ fetchQueue()                             │
│ Refresh queue data                       │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Render Updated UI                        │
│ - Patient highlighted in current card    │
│ - Status badge shows "in_consultation"   │
│ - Buttons change to "Complete" & "Skip"  │
└──────────────────────────────────────────┘
```

### 3. Complete Consultation Flow

```
┌──────────────────────────────┐
│ Doctor Clicks "Complete"     │
│ for Current Patient          │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Confirmation Dialog                      │
│ "Mark consultation as completed?"        │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Doctor Confirms                          │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ completeConsultation(patient)            │
│ - patient.id = "apt-123"                 │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ updateRecord("appointments", id, {       │
│   status: "completed",                   │
│   consultation_end_time: ISO_TIME,       │
│   completed_at: ISO_TIME                 │
│ })                                       │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ localStorage.setItem("clinexa_db", ...)  │
│ Persist changes                          │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ toast("Consultation Completed")          │
│ Show success notification                │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ fetchQueue()                             │
│ Refresh queue data                       │
└──────────┬───────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────��────┐
│ Recalculate Queue:                       │
│ - Remove completed patient               │
│ - Recalculate positions (1, 2, 3, ...)   │
│ - Recalculate wait times                 │
│ - Set next patient as current            │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ Render Updated UI:                       │
│ - Completed patient in summary section   │
│ - Next patient highlighted as current    │
│ - All wait times updated                 │
│ - Queue positions recalculated           │
└──────────────────────────────────────────┘
```

### 4. Wait Time Recalculation Flow

```
Before Completion:
┌─────────────────────────────────────────┐
│ Patient 1: Wait 0 min  (in_consultation)│
│ Patient 2: Wait 15 min (waiting)        │
│ Patient 3: Wait 35 min (waiting)        │
│ Patient 4: Wait 50 min (waiting)        │
└─────────────────────────────────────────┘

After Patient 1 Completes:
┌─────────────────────────────────────────┐
│ Patient 1: COMPLETED (removed)          │
│ Patient 2: Wait 0 min  (in_consultation)│
│ Patient 3: Wait 20 min (waiting)        │
│ Patient 4: Wait 35 min (waiting)        │
└─────────────────────────────────────────┘

Calculation:
- Patient 2 becomes current (wait = 0)
- Patient 3 wait = Patient 2 duration (20 min)
- Patient 4 wait = Patient 2 duration + Patient 3 duration (20 + 15 = 35 min)
```

---

## State Management

### Component State

```typescript
// PatientQueueManager State
const [queue, setQueue] = useState<QueuedPatient[]>([]);
// - Holds all patients in queue
// - Updated on fetchQueue()
// - Sorted by appointment time

const [loading, setLoading] = useState(true);
// - True while fetching data
// - False when data loaded
// - Used to show loading spinner

const [currentConsultation, setCurrentConsultation] = useState<QueuedPatient | null>(null);
// - Holds patient currently being consulted
// - Updated when status changes to "in_consultation"
// - Highlighted in UI
```

### State Transitions

```
Initial State:
queue = []
loading = true
currentConsultation = null

After fetchQueue():
queue = [patient1, patient2, patient3, ...]
loading = false
currentConsultation = patient1 (first waiting or in_consultation)

After startConsultation():
queue = [patient1 (in_consultation), patient2, patient3, ...]
currentConsultation = patient1
patient1.status = "in_consultation"

After completeConsultation():
queue = [patient2 (in_consultation), patient3, patient4, ...]
currentConsultation = patient2
patient1.status = "completed"
All wait times recalculated
```

---

## Database Schema

### Appointments Table

```typescript
{
  id: string;                          // Primary key
  doctor_id: string;                   // Foreign key to doctors
  patient_id: string;                  // Foreign key to users/profiles
  appointment_date: string;            // YYYY-MM-DD
  appointment_time: string;            // HH:MM
  status: string;                      // pending | confirmed | in_consultation | completed | cancelled
  consultation_duration: number;       // Minutes (default: 15)
  consultation_start_time?: string;    // ISO 8601 timestamp
  consultation_end_time?: string;      // ISO 8601 timestamp
  completed_at?: string;               // ISO 8601 timestamp
  notes?: string;                      // Patient notes
  payment_amount: number;              // Consultation fee
  payment_method: string;              // Payment method
  created_at: string;                  // ISO 8601 timestamp
  updated_at?: string;                 // ISO 8601 timestamp
}
```

### Profiles Table

```typescript
{
  id: string;                          // Primary key (user_id)
  full_name: string;                   // Patient name
  phone?: string;                      // Contact number
  email?: string;                      // Email address
  created_at: string;                  // ISO 8601 timestamp
  updated_at?: string;                 // ISO 8601 timestamp
}
```

---

## Performance Considerations

### Time Complexity

- **fetchQueue()**: O(n log n) - due to sorting
- **calculateWaitTimes()**: O(n) - single pass through appointments
- **startConsultation()**: O(1) - single record update
- **completeConsultation()**: O(n) - recalculates all wait times

### Space Complexity

- **queue array**: O(n) - stores all patients for the day
- **profileMap**: O(m) - stores all profiles
- **userMap**: O(m) - stores all users

### Optimization Strategies

1. **Auto-refresh interval**: 30 seconds (balance between real-time and performance)
2. **Caching**: Profiles and users cached in memory during component lifecycle
3. **Lazy loading**: Only fetch data for current date
4. **Efficient sorting**: Sort once on fetch, not on every render

---

## Error Handling Strategy

```
Try-Catch Blocks:
├── fetchQueue()
│   └── Catch: Show toast "Failed to load patient queue"
├── startConsultation()
│   └── Catch: Show toast "Failed to start consultation"
├── completeConsultation()
│   └── Catch: Show toast "Failed to complete consultation"
└── skipPatient()
    └── Catch: Show toast "Failed to skip patient"

Validation:
├── Doctor authentication check
├── Appointment date validation
├── Patient status validation
└── Confirmation dialogs for critical actions
```

---

## Integration Points

### With DoctorDashboard

```typescript
<PatientQueueManager 
  doctorId={doctorInfo.id}
  appointmentDate={new Date().toISOString().split('T')[0]}
  onQueueUpdate={() => fetchAppointments(doctorInfo.id)}
/>
```

### With Local Database

```typescript
// Read operations
runQuery("appointments")
runQuery("profiles")
runQuery("users")

// Write operations
updateRecord("appointments", appointmentId, updates)
```

### With UI Components

```typescript
// From @/components/ui
Button
Card
Badge
AlertDialog
Tabs
```

---

## Conclusion

The Doctor Dashboard system provides a comprehensive, efficient solution for managing patient queues in a hospital setting. The architecture is modular, scalable, and designed for optimal performance while maintaining data integrity and user experience.
