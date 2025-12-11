"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Building2,
  FileText,
  CheckCircle,
  DollarSign,
  CreditCard,
  TrendingUp,
  Users,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  Home,
  Upload,
  BarChart3,
  Activity,
  Shield,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "GE Requests", href: "/dashboard/requests", icon: FileText },
  { name: "My Approvals", href: "/dashboard/approvals", icon: CheckCircle, badge: 5 },
  { name: "Annual Activity Plans", href: "/dashboard/aap", icon: Calendar },
  { name: "Budget Overview", href: "/dashboard/budget", icon: DollarSign },
  { name: "Budget Allocation", href: "/dashboard/budget/allocation", icon: TrendingUp },
  { name: "Commitments", href: "/dashboard/commitments", icon: TrendingUp },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "M&E Planning", href: "/dashboard/me-planning", icon: Activity },
  { name: "Internal Audit", href: "/dashboard/audit", icon: Shield },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "PGAS Sync", href: "/dashboard/pgas", icon: Upload },
  { name: "Cost Centres", href: "/dashboard/cost-centres", icon: Building2 },
  { name: "User Management", href: "/dashboard/users", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r border-slate-200 bg-white overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 py-5 border-b">
            <div className="flex items-center gap-3">
              <img
                src="/images/unre-logo.svg"
                alt="UNRE Logo"
                className="h-10 w-10 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-slate-900">UNRE</h1>
                <p className="text-xs text-slate-600">GE System</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                      isActive
                        ? "bg-unre-green-50 text-unre-green-700"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? "text-unre-green-700" : "text-slate-400 group-hover:text-slate-500"
                      }`}
                    />
                    {item.name}
                    {item.badge && (
                      <Badge className="ml-auto bg-red-500">{item.badge}</Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 p-4 border-t">
            <Link href="/login">
              <Button variant="ghost" className="w-full justify-start text-slate-700">
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-slate-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
            <div className="flex items-center justify-between flex-shrink-0 px-4 py-5 border-b">
              <div className="flex items-center gap-3">
                <img
                  src="/images/unre-logo.svg"
                  alt="UNRE Logo"
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <h1 className="text-lg font-bold text-slate-900">UNRE</h1>
                  <p className="text-xs text-slate-600">GE System</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)}>
                    <div
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                        isActive
                          ? "bg-unre-green-50 text-unre-green-700"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 ${
                          isActive ? "text-unre-green-700" : "text-slate-400 group-hover:text-slate-500"
                        }`}
                      />
                      {item.name}
                      {item.badge && (
                        <Badge className="ml-auto bg-red-500">{item.badge}</Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <header className="flex-shrink-0 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
                </h2>
                <p className="text-sm text-slate-600">Welcome back, Emmanuel Saliki</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
              </Button>
              <Avatar>
                <AvatarFallback className="bg-gradient-to-br from-unre-green-600 to-unre-green-800 text-white">
                  ES
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
