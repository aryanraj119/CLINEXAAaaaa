const DB_STORAGE_KEY = 'clinexa_db';

const SCHEMA = {
  users: [] as any[],
  profiles: [] as any[],
  doctors: [] as any[],
  specializations: [] as any[],
  doctor_availability: [] as any[],
  appointments: [] as any[],
  reviews: [] as any[],
  blood_banks: [] as any[],
  blood_inventory: [] as any[],
  donor_profiles: [] as any[],
  emergency_blood_requests: [] as any[],
  blood_notifications: [] as any[],
  donation_requests: [] as any[],
  lab_tests: [] as any[],
  user_roles: [] as any[]
};

const SEED_DATA: typeof SCHEMA = {
  specializations: [
    { id: 'spec-1', name: 'Ophthalmology', icon: '👁️', description: 'Eye care and vision specialists', created_at: new Date().toISOString() },
    { id: 'spec-2', name: 'ENT', icon: '👂', description: 'Ear, Nose, and Throat specialists', created_at: new Date().toISOString() },
    { id: 'spec-3', name: 'Pediatrics', icon: '👶', description: 'Child healthcare specialists', created_at: new Date().toISOString() },
    { id: 'spec-4', name: 'Cardiology', icon: '❤️', description: 'Heart and cardiovascular specialists', created_at: new Date().toISOString() },
    { id: 'spec-5', name: 'Dermatology', icon: '💆‍♂️', description: 'Skin care specialists', created_at: new Date().toISOString() },
    { id: 'spec-6', name: 'General Medicine', icon: '🩺', description: 'General health and wellness', created_at: new Date().toISOString() }
  ],
  doctors: [
    { id: 'doc-1', name: 'Dr. Sarah Johnson', specialization_id: 'spec-1', image_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', rating: 4.8, reviews_count: 127, consultation_fee: 500, experience_years: 12, qualification: 'MBBS, MD (Ophthalmology)', about: 'Specialized in cataract surgery and laser eye treatments', address: '123 Medical Plaza, Suite 200', city: 'New York', latitude: 40.7128, longitude: -74.0060, verified: true, created_at: new Date().toISOString() },
    { id: 'doc-2', name: 'Dr. Michael Chen', specialization_id: 'spec-2', image_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', rating: 4.9, reviews_count: 203, consultation_fee: 600, experience_years: 15, qualification: 'MBBS, MS (ENT)', about: 'Expert in sinus surgery and hearing disorders', address: '456 Healthcare Center', city: 'New York', latitude: 40.7580, longitude: -73.9855, verified: true, created_at: new Date().toISOString() },
    { id: 'doc-3', name: 'Dr. Emily Rodriguez', specialization_id: 'spec-3', image_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400', rating: 5.0, reviews_count: 156, consultation_fee: 450, experience_years: 10, qualification: 'MBBS, MD (Pediatrics)', about: 'Passionate about child health and development', address: '789 Kids Health Clinic', city: 'New York', latitude: 40.7489, longitude: -73.9680, verified: true, created_at: new Date().toISOString() },
    { id: 'doc-4', name: 'Dr. James Wilson', specialization_id: 'spec-4', image_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400', rating: 4.7, reviews_count: 189, consultation_fee: 700, experience_years: 18, qualification: 'MBBS, DM (Cardiology)', about: 'Specializes in preventive cardiology and heart disease management', address: '321 Heart Care Institute', city: 'New York', latitude: 40.7614, longitude: -73.9776, verified: true, created_at: new Date().toISOString() },
    { id: 'doc-5', name: 'Dr. Priya Patel', specialization_id: 'spec-5', image_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400', rating: 4.9, reviews_count: 142, consultation_fee: 550, experience_years: 8, qualification: 'MBBS, MD (Dermatology)', about: 'Expert in cosmetic and medical dermatology', address: '555 Skin Care Center', city: 'New York', latitude: 40.7282, longitude: -73.9942, verified: true, created_at: new Date().toISOString() }
  ],
  doctor_availability: [
    { id: 'avail-1', doctor_id: 'doc-1', day_of_week: 1, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-2', doctor_id: 'doc-1', day_of_week: 2, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-3', doctor_id: 'doc-1', day_of_week: 3, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-4', doctor_id: 'doc-1', day_of_week: 4, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-5', doctor_id: 'doc-1', day_of_week: 5, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-6', doctor_id: 'doc-2', day_of_week: 1, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-7', doctor_id: 'doc-2', day_of_week: 2, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-8', doctor_id: 'doc-2', day_of_week: 3, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-9', doctor_id: 'doc-2', day_of_week: 4, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-10', doctor_id: 'doc-2', day_of_week: 5, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-11', doctor_id: 'doc-3', day_of_week: 1, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-12', doctor_id: 'doc-3', day_of_week: 2, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-13', doctor_id: 'doc-3', day_of_week: 3, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-14', doctor_id: 'doc-3', day_of_week: 4, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-15', doctor_id: 'doc-3', day_of_week: 5, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-16', doctor_id: 'doc-4', day_of_week: 1, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-17', doctor_id: 'doc-4', day_of_week: 2, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-18', doctor_id: 'doc-4', day_of_week: 3, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-19', doctor_id: 'doc-4', day_of_week: 4, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-20', doctor_id: 'doc-4', day_of_week: 5, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-21', doctor_id: 'doc-5', day_of_week: 1, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-22', doctor_id: 'doc-5', day_of_week: 2, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-23', doctor_id: 'doc-5', day_of_week: 3, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-24', doctor_id: 'doc-5', day_of_week: 4, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() },
    { id: 'avail-25', doctor_id: 'doc-5', day_of_week: 5, start_time: '09:00', end_time: '17:00', is_available: 1, created_at: new Date().toISOString() }
  ],
  blood_banks: [
    { id: 'bb-1', name: 'Red Cross Blood Bank', address: '100 Health Ave', city: 'New York', phone: '+1-555-0101', email: 'info@redcross.org', operating_hours: '24/7', latitude: 40.7580, longitude: -73.9855, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'bb-2', name: 'City Hospital Blood Center', address: '200 Medical Plaza', city: 'New York', phone: '+1-555-0102', email: 'blood@cityhospital.org', operating_hours: '8AM - 8PM', latitude: 40.7489, longitude: -73.9680, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'bb-3', name: 'Lifeline Blood Services', address: '300 Emergency Blvd', city: 'New York', phone: '+1-555-0103', email: 'donate@lifeline.org', operating_hours: '24/7', latitude: 40.7614, longitude: -73.9776, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  blood_inventory: [
    { id: 'bi-1', blood_bank_id: 'bb-1', blood_type: 'A+', units_available: 15, last_updated: new Date().toISOString() },
    { id: 'bi-2', blood_bank_id: 'bb-1', blood_type: 'A-', units_available: 8, last_updated: new Date().toISOString() },
    { id: 'bi-3', blood_bank_id: 'bb-1', blood_type: 'B+', units_available: 12, last_updated: new Date().toISOString() },
    { id: 'bi-4', blood_bank_id: 'bb-1', blood_type: 'B-', units_available: 6, last_updated: new Date().toISOString() },
    { id: 'bi-5', blood_bank_id: 'bb-1', blood_type: 'AB+', units_available: 10, last_updated: new Date().toISOString() },
    { id: 'bi-6', blood_bank_id: 'bb-1', blood_type: 'AB-', units_available: 5, last_updated: new Date().toISOString() },
    { id: 'bi-7', blood_bank_id: 'bb-1', blood_type: 'O+', units_available: 20, last_updated: new Date().toISOString() },
    { id: 'bi-8', blood_bank_id: 'bb-1', blood_type: 'O-', units_available: 8, last_updated: new Date().toISOString() },
    { id: 'bi-9', blood_bank_id: 'bb-2', blood_type: 'A+', units_available: 10, last_updated: new Date().toISOString() },
    { id: 'bi-10', blood_bank_id: 'bb-2', blood_type: 'A-', units_available: 5, last_updated: new Date().toISOString() },
    { id: 'bi-11', blood_bank_id: 'bb-2', blood_type: 'B+', units_available: 8, last_updated: new Date().toISOString() },
    { id: 'bi-12', blood_bank_id: 'bb-2', blood_type: 'B-', units_available: 4, last_updated: new Date().toISOString() },
    { id: 'bi-13', blood_bank_id: 'bb-2', blood_type: 'AB+', units_available: 6, last_updated: new Date().toISOString() },
    { id: 'bi-14', blood_bank_id: 'bb-2', blood_type: 'AB-', units_available: 3, last_updated: new Date().toISOString() },
    { id: 'bi-15', blood_bank_id: 'bb-2', blood_type: 'O+', units_available: 15, last_updated: new Date().toISOString() },
    { id: 'bi-16', blood_bank_id: 'bb-2', blood_type: 'O-', units_available: 6, last_updated: new Date().toISOString() },
    { id: 'bi-17', blood_bank_id: 'bb-3', blood_type: 'A+', units_available: 18, last_updated: new Date().toISOString() },
    { id: 'bi-18', blood_bank_id: 'bb-3', blood_type: 'A-', units_available: 10, last_updated: new Date().toISOString() },
    { id: 'bi-19', blood_bank_id: 'bb-3', blood_type: 'B+', units_available: 14, last_updated: new Date().toISOString() },
    { id: 'bi-20', blood_bank_id: 'bb-3', blood_type: 'B-', units_available: 7, last_updated: new Date().toISOString() },
    { id: 'bi-21', blood_bank_id: 'bb-3', blood_type: 'AB+', units_available: 12, last_updated: new Date().toISOString() },
    { id: 'bi-22', blood_bank_id: 'bb-3', blood_type: 'AB-', units_available: 6, last_updated: new Date().toISOString() },
    { id: 'bi-23', blood_bank_id: 'bb-3', blood_type: 'O+', units_available: 25, last_updated: new Date().toISOString() },
    { id: 'bi-24', blood_bank_id: 'bb-3', blood_type: 'O-', units_available: 10, last_updated: new Date().toISOString() }
  ],
  users: [
    { id: 'admin-1', email: 'admin@clinexa.com', password: '240be518fabd2724ddb6f0403f3d5dabb2a4e24560193dba9d17d1679b772473', full_name: 'Admin', is_admin: true, created_at: new Date().toISOString() },
    { id: 'doc-user-1', email: 'sarah.johnson@clinexa.com', password: 'f348d5628621f3d8f59c8cabda0f8eb0aa7e0514a90be7571020b1336f26c113', full_name: 'Dr. Sarah Johnson', is_doctor: true, created_at: new Date().toISOString() },
    { id: 'doc-user-2', email: 'michael.chen@clinexa.com', password: 'f348d5628621f3d8f59c8cabda0f8eb0aa7e0514a90be7571020b1336f26c113', full_name: 'Dr. Michael Chen', is_doctor: true, created_at: new Date().toISOString() },
    { id: 'doc-user-3', email: 'emily.rodriguez@clinexa.com', password: 'f348d5628621f3d8f59c8cabda0f8eb0aa7e0514a90be7571020b1336f26c113', full_name: 'Dr. Emily Rodriguez', is_doctor: true, created_at: new Date().toISOString() },
    { id: 'doc-user-4', email: 'james.wilson@clinexa.com', password: 'f348d5628621f3d8f59c8cabda0f8eb0aa7e0514a90be7571020b1336f26c113', full_name: 'Dr. James Wilson', is_doctor: true, created_at: new Date().toISOString() },
    { id: 'doc-user-5', email: 'priya.patel@clinexa.com', password: 'f348d5628621f3d8f59c8cabda0f8eb0aa7e0514a90be7571020b1336f26c113', full_name: 'Dr. Priya Patel', is_doctor: true, created_at: new Date().toISOString() }
  ],
  profiles: [
    { id: 'doc-user-1', full_name: 'Dr. Sarah Johnson', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'doc-user-2', full_name: 'Dr. Michael Chen', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'doc-user-3', full_name: 'Dr. Emily Rodriguez', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'doc-user-4', full_name: 'Dr. James Wilson', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'doc-user-5', full_name: 'Dr. Priya Patel', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  appointments: [],
  reviews: [],
  donor_profiles: [],
  emergency_blood_requests: [],
  blood_notifications: [],
  donation_requests: [],
  lab_tests: [
    {
      id: "lab-1",
      name: "Comprehensive Blood Panel",
      price: 120,
      prep: "Fast for 10 hours, stay hydrated.",
      turnaround: "Same day",
      lab_name: "Clinexa Diagnostics",
      location: "New York, NY",
      summary: "Covers CBC, kidney and liver function, vitamin D, and cholesterol.",
      category: "Blood Test",
      created_at: new Date().toISOString()
    },
    {
      id: "lab-2",
      name: "Advanced Cardiac Check",
      price: 190,
      prep: "Avoid caffeine for 12 hours.",
      turnaround: "24 hours",
      lab_name: "Metro Health Labs",
      location: "Brooklyn, NY",
      summary: "Includes a lipid panel, hs-CRP, NT-proBNP, and echo referral.",
      category: "Cardiac Panel",
      created_at: new Date().toISOString()
    },
    {
      id: "lab-3",
      name: "Women's Health Panel",
      price: 155,
      prep: "Light breakfast okay, skip supplements.",
      turnaround: "Next day",
      lab_name: "Harbor Women's Lab",
      location: "Queens, NY",
      summary: "Hormonal panel, iron studies, thyroid function, and osteoporosis markers.",
      category: "Women's Health",
      created_at: new Date().toISOString()
    },
    {
      id: "lab-4",
      name: "Diabetes Risk Panel",
      price: 135,
      prep: "Fast for 8 hours, bring glucose log.",
      turnaround: "Same day",
      lab_name: "Clinexa Diagnostics",
      location: "Manhattan, NY",
      summary: "A1c, fasting glucose, insulin resistance markers, and dietitian follow-up plan.",
      category: "Endocrine/Diabetes",
      created_at: new Date().toISOString()
    },
    {
      id: "lab-5",
      name: "Liver & Kidney Wellness Screen",
      price: 145,
      prep: "Avoid alcohol and medications (if safe) for 48 hours.",
      turnaround: "24 hours",
      lab_name: "Harbor Women's Lab",
      location: "Queens, NY",
      summary: "CMP plus GGT, albumin, and urinary microalbumin to monitor detox and filtration.",
      category: "Pathology",
      created_at: new Date().toISOString()
    },
    {
      id: "lab-6",
      name: "Executive Travel Health Check",
      price: 210,
      prep: "Up-to-date vaccines, fast optional.",
      turnaround: "48 hours",
      lab_name: "Metro Health Labs",
      location: "Brooklyn, NY",
      summary: "Includes CRP, hepatitis screen, malaria quick test, and travel risk recommendations.",
      category: "Travel Health",
      created_at: new Date().toISOString()
    },
    {
      id: "lab-7",
      name: "Immunity Booster Panel",
      price: 165,
      prep: "No special prep; stay hydrated.",
      turnaround: "Next day",
      lab_name: "Clinexa Diagnostics",
      location: "New York, NY",
      summary: "Vitamin D, zinc, ferritin, CBC, and inflammation markers for immune resilience.",
      category: "Wellness & Immunity",
      created_at: new Date().toISOString()
    }
  ],
  user_roles: [
    { id: 'role-doc-1', user_id: 'doc-user-1', role: 'doctor', doctor_id: 'doc-1', created_at: new Date().toISOString() },
    { id: 'role-doc-2', user_id: 'doc-user-2', role: 'doctor', doctor_id: 'doc-2', created_at: new Date().toISOString() },
    { id: 'role-doc-3', user_id: 'doc-user-3', role: 'doctor', doctor_id: 'doc-3', created_at: new Date().toISOString() },
    { id: 'role-doc-4', user_id: 'doc-user-4', role: 'doctor', doctor_id: 'doc-4', created_at: new Date().toISOString() },
    { id: 'role-doc-5', user_id: 'doc-user-5', role: 'doctor', doctor_id: 'doc-5', created_at: new Date().toISOString() }
  ]
};

let db: typeof SCHEMA = { ...SCHEMA };

function saveToStorage() {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

function loadFromStorage(): typeof SCHEMA | null {
  try {
    const saved = localStorage.getItem(DB_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
  }
  return null;
}

function generateId(): string {
  return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function initDatabase(): typeof SCHEMA {
  const savedData = loadFromStorage();
  
  if (savedData) {
    db = savedData;
    ensureAdminUser();
    ensureDoctorUsers();
  } else {
    db = JSON.parse(JSON.stringify(SEED_DATA));
    saveToStorage();
  }

  console.log('Database initialized with', Object.keys(db).reduce((acc, key) => acc + db[key as keyof typeof db].length, 0), 'records');
  return db;
}

function ensureAdminUser() {
  const users = db.users as any[];
  const adminExists = users.some((u: any) => u.is_admin === true);
  
  if (!adminExists) {
    const adminUser = { 
      id: 'admin-1', 
      email: 'admin@clinexa.com', 
      password: '240be518fabd2724ddb6f0403f3d5dabb2a4e24560193dba9d17d1679b772473', 
      full_name: 'Admin', 
      is_admin: true, 
      created_at: new Date().toISOString() 
    };
    db.users.push(adminUser);
    saveToStorage();
    console.log('Admin user added');
  }
}

const SEED_DOCTOR_ACCOUNTS = [
  { userId: 'doc-user-1', email: 'sarah.johnson@clinexa.com', fullName: 'Dr. Sarah Johnson', doctorId: 'doc-1', roleId: 'role-doc-1' },
  { userId: 'doc-user-2', email: 'michael.chen@clinexa.com', fullName: 'Dr. Michael Chen', doctorId: 'doc-2', roleId: 'role-doc-2' },
  { userId: 'doc-user-3', email: 'emily.rodriguez@clinexa.com', fullName: 'Dr. Emily Rodriguez', doctorId: 'doc-3', roleId: 'role-doc-3' },
  { userId: 'doc-user-4', email: 'james.wilson@clinexa.com', fullName: 'Dr. James Wilson', doctorId: 'doc-4', roleId: 'role-doc-4' },
  { userId: 'doc-user-5', email: 'priya.patel@clinexa.com', fullName: 'Dr. Priya Patel', doctorId: 'doc-5', roleId: 'role-doc-5' },
];

function ensureDoctorUsers() {
  let changed = false;
  for (const doc of SEED_DOCTOR_ACCOUNTS) {
    const userIndex = (db.users as any[]).findIndex((u: any) => u.id === doc.userId);
    if (userIndex === -1) {
      db.users.push({
        id: doc.userId,
        email: doc.email,
        password: 'f348d5628621f3d8f59c8cabda0f8eb0aa7e0514a90be7571020b1336f26c113',
        full_name: doc.fullName,
        is_doctor: true,
        created_at: new Date().toISOString(),
      });
      changed = true;
    } else {
      // Update password if it's the old hash or plain text
      const currentUser = db.users[userIndex];
      if (currentUser.password !== 'f348d5628621f3d8f59c8cabda0f8eb0aa7e0514a90be7571020b1336f26c113') {
        currentUser.password = 'f348d5628621f3d8f59c8cabda0f8eb0aa7e0514a90be7571020b1336f26c113';
        changed = true;
      }
    }

    const profileExists = (db.profiles as any[]).some((p: any) => p.id === doc.userId);
    if (!profileExists) {
      db.profiles.push({
        id: doc.userId,
        full_name: doc.fullName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      changed = true;
    }

    const roleExists = (db.user_roles as any[]).some(
      (r: any) => r.user_id === doc.userId && r.role === 'doctor'
    );
    if (!roleExists) {
      db.user_roles.push({
        id: doc.roleId,
        user_id: doc.userId,
        role: 'doctor',
        doctor_id: doc.doctorId,
        created_at: new Date().toISOString(),
      });
      changed = true;
    }
  }
  if (changed) {
    saveToStorage();
    console.log('Doctor user accounts ensured');
  }
}

export function getDatabase(): typeof SCHEMA {
  return db;
}

export function runQuery(tableName: string): any[] {
  return db[tableName as keyof typeof db] || [];
}

export function insertRecord(tableName: string, record: any): string {
  const id = generateId();
  const newRecord = { id, ...record };
  db[tableName as keyof typeof db].push(newRecord);
  saveToStorage();
  return id;
}

export function updateRecord(tableName: string, id: string, updates: any): void {
  const table = db[tableName as keyof typeof db];
  const index = table.findIndex((r: any) => r.id === id);
  if (index !== -1) {
    table[index] = { ...table[index], ...updates };
    saveToStorage();
  }
}

export function deleteRecord(tableName: string, id: string): void {
  const table = db[tableName as keyof typeof db];
  const index = table.findIndex((r: any) => r.id === id);
  if (index !== -1) {
    table.splice(index, 1);
    saveToStorage();
  }
}

export { generateId };
