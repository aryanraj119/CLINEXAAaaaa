import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { localDb } from "@/integrations/local-db";
import { Search, Calendar, Shield, Clock, Star, MapPin } from "lucide-react";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Logo } from "@/components/Logo";

interface Specialization {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface LabTest {
  id: string;
  name: string;
  prep: string;
  price: number;
  lab_name: string;
  turnaround: string;
  summary: string;
}

const Index = () => {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    localDb.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = localDb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchSpecializations();
    fetchLabHighlights();

    return () => subscription.unsubscribe();
  }, []);

  const fetchSpecializations = async () => {
    const result = await localDb
      .from("specializations")
      .select("*")
      .order("name", { ascending: true });
    
    if (result.data) setSpecializations(result.data as Specialization[]);
  };

  const fetchLabHighlights = async () => {
    const result = await localDb
      .from("lab_tests")
      .select("*")
      .order("name", { ascending: true })
      .limit(3);

    if (result.data) setLabTests(result.data as LabTest[]);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/health-chat">Health Chat</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/blood-bank">Blood Bank</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/lab-tests">Lab Tests</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/admin/db">Admin</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/doctor-auth">Doctor Login</Link>
            </Button>
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/appointments">My Appointments</Link>
                </Button>
                <Button onClick={() => localDb.auth.signOut()}>Sign Out</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <HeroCarousel />
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "👨‍⚕️", label: "Expert Doctors", value: "500+" },
              { icon: "⭐", label: "Avg Rating", value: "4.8/5" },
              { icon: "📅", label: "Appointments", value: "50k+" },
              { icon: "🏥", label: "Specializations", value: "20+" },
            ].map((stat, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-all duration-300 text-center">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Popular Specializations</h2>
            <p className="text-xl text-muted-foreground">
              Browse doctors by medical specialty
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specializations.map((spec) => (
              <Link key={spec.id} to={`/doctors?specialization=${spec.id}`}>
                <Card className="p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary">
                  <div className="text-5xl mb-3">{spec.icon}</div>
                  <h3 className="font-semibold text-foreground">{spec.name}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose Clinexa?</h2>
            <p className="text-xl text-muted-foreground">
              Healthcare booking made simple and convenient
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="w-12 h-12 text-primary" />,
                title: "Easy Search",
                description: "Find the right doctor by specialty, location, or ratings in seconds",
              },
              {
                icon: <Calendar className="w-12 h-12 text-secondary" />,
                title: "Real-time Availability",
                description: "View doctor schedules and book available time slots instantly",
              },
              {
                icon: <Shield className="w-12 h-12 text-success" />,
                title: "Secure & Private",
                description: "Your health data is encrypted and protected with industry-leading security",
              },
              {
                icon: <Clock className="w-12 h-12 text-primary" />,
                title: "Quick Booking",
                description: "Book appointments in under 60 seconds with our streamlined process",
              },
              {
                icon: <Star className="w-12 h-12 text-secondary" />,
                title: "Verified Reviews",
                description: "Read genuine patient reviews to make informed decisions",
              },
              {
                icon: <MapPin className="w-12 h-12 text-success" />,
                title: "Location-based",
                description: "Find doctors near you with integrated maps and directions",
              },
            ].map((feature, i) => (
              <Card key={i} className="p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Lab Tests Highlight */}
      <section className="py-20 px-4 bg-background/80">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
              Diagnostics
            </p>
            <h2 className="text-4xl font-bold text-foreground">
              Trusted Lab Testing, Fast Results
            </h2>
            <p className="text-xl text-muted-foreground">
              Book across a curated network of partner labs that deliver quick
              prep guidance, same-day pickups, and digitized results through
              Clinexa.
            </p>
            <Button variant="secondary" asChild className="text-lg px-8">
              <Link to="/lab-tests">Explore Lab Tests</Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {labTests.length > 0
              ? labTests.map((test) => (
                  <Card
                    key={test.id}
                    className="border border-border p-6 shadow-lg transition hover:border-primary/50"
                  >
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{test.lab_name}</span>
                  <span>{test.turnaround}</span>
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-foreground">
                  {test.name}
                </h3>
                <p className="text-xs uppercase tracking-[0.2em] text-primary">
                  {test.category}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {test.summary}
                </p>
                    <div className="mt-4 flex items-baseline justify-between text-xl font-bold text-foreground">
                      <span>${test.price}</span>
                      <span className="text-xs uppercase text-muted-foreground">
                        {test.location}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Prep: {test.prep}
                    </p>
                  </Card>
                ))
              : Array.from({ length: 3 }).map((_, idx) => (
                  <Card key={idx} className="border border-dashed border-border/50 p-6">
                    <div className="h-6 w-40 animate-pulse rounded bg-muted/70" />
                    <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted/70" />
                    <div className="mt-4 h-3 w-16 animate-pulse rounded bg-muted/70" />
                    <div className="mt-3 h-3 w-20 animate-pulse rounded bg-muted/70" />
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-12 text-center bg-gradient-to-br from-primary to-secondary text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of patients who trust Clinexa for their healthcare needs
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link to="/doctors">Find a Doctor Now</Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 Clinexa. Your trusted healthcare booking platform.</p>
        </div>
      </footer>

      {/* Floating AI Chat Button */}
      <Link to="/health-chat" className="hc-float-btn" title="AI Health Chat">
        🩺
        <span className="hc-float-btn-tooltip">Ask AI MedBot</span>
      </Link>
    </div>
  );
};

export default Index;
