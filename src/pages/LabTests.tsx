import { useEffect, useMemo, useState } from "react";
import { BookHomeVisitModal } from "@/components/BookHomeVisitModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { localDb } from "@/integrations/local-db";

interface LabTest {
  id: string;
  name: string;
  price: number;
  prep: string;
  turnaround: string;
  lab_name: string;
  location: string;
  summary: string;
  category: string;
}

const LabTests = () => {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchLabTests = async () => {
      const result = await localDb
        .from("lab_tests")
        .select("*")
        .order("name", { ascending: true })
        .limit(6);

      if (result.data) setLabTests(result.data as LabTest[]);
    };

    fetchLabTests();
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(labTests.map((test) => test.category || "Other")));
    return ["All", ...cats];
  }, [labTests]);

  const displayedTests =
    selectedCategory === "All"
      ? labTests
      : labTests.filter((test) => test.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background py-14">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
            Diagnostics
          </p>
          <h1 className="mt-2 text-4xl font-bold text-foreground">
            Lab Tests & Preventive Screenings
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose from curated diagnostic packages backed by trusted partner labs.
            Book same-day pickups, view prep instructions, and access test reports
            inside the Clinexa dashboard.
          </p>
          <BookHomeVisitModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
          <Button
            size="lg"
            variant="secondary"
            className="mt-6 text-lg px-8"
            onClick={() => setIsModalOpen(true)}
          >
            Book a Home Visit
          </Button>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === selectedCategory ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="uppercase tracking-wide"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedTests.map((test) => (
            <Card
              key={test.id}
              className="border-2 border-transparent p-6 shadow-xl transition hover:border-primary/70"
            >
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{test.lab_name}</span>
                <span>{test.turnaround}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-foreground">
                {test.name}
              </h2>
              <p className="mt-1 text-xs uppercase tracking-[0.1em] text-primary">
                {test.category}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{test.summary}</p>
              <div className="mt-4 flex items-baseline justify-between text-xl font-semibold text-foreground">
                <span>${test.price}</span>
                <span className="text-xs uppercase text-muted-foreground">
                  {test.location}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Prep: {test.prep}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabTests;