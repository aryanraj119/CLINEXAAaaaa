import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { localDb } from "@/integrations/local-db";

const TABLES = [
  "users",
  "profiles",
  "doctors",
  "specializations",
  "appointments",
  "reviews",
  "lab_appointments",
  "blood_banks",
  "blood_inventory",
  "donor_profiles",
  "emergency_blood_requests",
  "donation_requests",
  "user_roles"
];

export default function DatabaseViewer() {
  const [selectedTable, setSelectedTable] = useState("users");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    const admin = localDb.adminAuth.getAdminUser();
    if (admin) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [selectedTable, isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setError("");

    const result = await localDb.adminAuth.login(email, password);
    
    if (result.success) {
      setIsLoggedIn(true);
    } else {
      setError(result.error || "Invalid credentials");
    }
    setLoggingIn(false);
  };

  const handleLogout = async () => {
    await localDb.adminAuth.logout();
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
  };

  const fetchData = () => {
    setLoading(true);
    try {
      const results = localDb.from(selectedTable).select();
      (results as any).then((res: { data: any[] }) => {
        setData(res.data || []);
        setLoading(false);
      });
    } catch (e) {
      console.error(e);
      setData([]);
      setLoading(false);
    }
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.removeItem("clinexa_db");
      window.location.reload();
    }
  };

  const handleVerifyDoctor = (doctorId: string) => {
    localDb.from("doctors").update({ verified: true, rejected: false }).eq("id", doctorId);
    fetchData();
  };

  const handleRejectDoctor = (doctorId: string) => {
    if (confirm("Are you sure you want to reject this doctor?")) {
      localDb.from("doctors").update({ verified: false, rejected: true }).eq("id", doctorId);
      fetchData();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <Logo showText={false} />
            </div>
            <h1 className="text-3xl font-bold mb-2">Admin Login</h1>
            <p className="text-muted-foreground">
              Enter your admin credentials
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@clinexa.com"
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
            <Button type="submit" className="w-full" disabled={loggingIn}>
              {loggingIn ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button variant="ghost" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>

        </Card>
      </div>
    );
  }

  const renderDoctorsTable = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="capitalize">doctors</span>
          <Badge variant="secondary">{data.length} records</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Actions</th>
                  {Object.keys(data[0] || {}).filter(k => k !== 'id').map(key => (
                    <th key={key} className="text-left p-2 font-medium capitalize">
                      {key.replace('_', ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="flex gap-2">
                        {!row.verified && !row.rejected && (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleVerifyDoctor(row.id)}
                            >
                              Verify
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleRejectDoctor(row.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {row.verified && (
                          <Badge variant="default" className="bg-green-500">Verified</Badge>
                        )}
                        {row.rejected && (
                          <Badge variant="destructive">Rejected</Badge>
                        )}
                      </div>
                    </td>
                    {Object.entries(row).filter(([k]) => k !== 'id').map(([key, value], j) => (
                      <td key={j} className="p-2 max-w-xs truncate">
                        {typeof value === 'object' 
                          ? JSON.stringify(value) 
                          : String(value ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderDefaultTable = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="capitalize">{selectedTable}</span>
          <Badge variant="secondary">{data.length} records</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {Object.keys(data[0] || {}).map(key => (
                    <th key={key} className="text-left p-2 font-medium">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-muted/50">
                    {Object.values(row).map((value: any, j) => (
                      <td key={j} className="p-2 max-w-xs truncate">
                        {typeof value === 'object' 
                          ? JSON.stringify(value) 
                          : String(value ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/">← Back to Home</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">View and manage registered users and data</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData}>Refresh</Button>
            <Button variant="destructive" onClick={handleClearData}>Clear All Data</Button>
          </div>
        </div>

        <Tabs value={selectedTable} onValueChange={setSelectedTable}>
          <TabsList className="flex flex-wrap h-auto">
            {TABLES.map(table => (
              <TabsTrigger key={table} value={table} className="capitalize">
                {table}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABLES.map(table => (
            <TabsContent key={table} value={table}>
              {table === 'doctors' ? renderDoctorsTable() : renderDefaultTable()}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}