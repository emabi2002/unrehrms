"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // For demo purposes, allow any login
    // In production, this would use Supabase auth
    if (email && password) {
      toast.success("Login successful!");
      router.push("/dashboard");
    } else {
      toast.error("Please enter email and password");
    }

    setLoading(false);
  };

  const handleDemoLogin = () => {
    setEmail("demo@unre.ac.pg");
    setPassword("demo123");
    toast.info("Demo credentials loaded. Click Login to continue.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img
            src="/images/unre-logo.svg"
            alt="UNRE Logo"
            className="h-16 w-16 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">UNRE</h1>
            <p className="text-sm text-slate-600">GE Request System</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-slate-900 mb-6">
          Login to Your Account
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@unre.ac.pg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-slate-600">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-unre-green-600 hover:text-blue-700">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-unre-green-600 to-unre-green-700 hover:from-unre-green-700 hover:to-unre-green-800"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleDemoLogin}
          >
            Use Demo Credentials
          </Button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-600">
          <p>
            Need help?{" "}
            <Link href="/support" className="text-unre-green-600 hover:text-blue-700">
              Contact IT Support
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
