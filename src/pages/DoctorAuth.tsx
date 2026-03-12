import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { localDb, runQuery, insertRecord, generateId, hashPassword } from "@/integrations/local-db";

const SPECIALIZATIONS = [
  { id: "spec-1", name: "Ophthalmology" },
  { id: "spec-2", name: "ENT" },
  { id: "spec-3", name: "Pediatrics" },
  { id: "spec-4", name: "Cardiology" },
  { id: "spec-5", name: "Dermatology" },
  { id: "spec-6", name: "General Medicine" },
];

const DoctorAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [fee, setFee] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const hashedPassword = await hashPassword(password);
    const users = runQuery("users").filter((u: any) => 
      u.email.toLowerCase().trim() === email.toLowerCase().trim() && 
      u.password === hashedPassword && 
      u.is_doctor
    );
    const roles = runQuery("user_roles").filter((r: any) => r.role === "doctor" && users.some((u: any) => u.id === r.user_id));

    if (roles.length > 0) {
      const doctorId = roles[0].doctor_id;
      const doctors = runQuery("doctors").filter((d: any) => d.id === doctorId);
      
      if (doctors.length > 0) {
        const doctor = doctors[0];
        if (doctor.rejected) {
          setError("Your account has been rejected. Please contact support.");
        } else if (!doctor.verified) {
          setError("Your account is pending verification. Please wait for admin approval.");
        } else {
          await localDb.auth.signInWithPassword({ email, password });
          navigate("/doctor-dashboard");
        }
      } else {
        setError("Doctor profile not found");
      }
    } else {
      setError("No doctor account found with this email");
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name || !email || !password || !specialization || !qualification || !experience || !fee) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const existing = runQuery("users").filter((u: any) => u.email === email);
    if (existing.length > 0) {
      setError("Email already registered");
      setLoading(false);
      return;
    }

    const userId = generateId();
    const doctorId = generateId();

    const hashedPassword = await hashPassword(password);

    insertRecord("users", { 
      id: userId, 
      email, 
      password: hashedPassword, 
      full_name: name, 
      is_doctor: true,
      created_at: new Date().toISOString() 
    });

    insertRecord("doctors", {
      id: doctorId,
      name,
      specialization_id: specialization,
      qualification,
      experience_years: parseInt(experience),
      consultation_fee: parseInt(fee),
      rating: 5.0,
      reviews_count: 0,
      city: "New York",
      verified: false,
      rejected: false,
      created_at: new Date().toISOString()
    });

    insertRecord("user_roles", {
      user_id: userId,
      role: "doctor",
      doctor_id: doctorId,
      created_at: new Date().toISOString()
    });

    alert("Registration submitted! Your account is pending approval by admin. You will be notified once verified.");
    // Navigate to home after successful registration
    setTimeout(() => navigate("/"), 1500);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <Logo showText={false} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Doctor Portal</h1>
          <p className="text-muted-foreground">
            Register or login as a doctor
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <div className="mb-4 p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-1">Demo Credentials:</p>
              <p className="text-muted-foreground">Email: <code className="text-foreground">sarah.johnson@clinexa.com</code></p>
              <p className="text-muted-foreground">Password: <code className="text-foreground">doctor123</code></p>
            </div>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Dr. John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="doctor@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <select
                  id="specialization"
                  className="w-full p-2 border rounded-md bg-background"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  required
                >
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map((spec) => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  type="text"
                  placeholder="MBBS, MD"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="5"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee">Consultation Fee ($)</Label>
                  <Input
                    id="fee"
                    type="number"
                    placeholder="500"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Register as Doctor"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <Button variant="ghost" asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DoctorAuth;
