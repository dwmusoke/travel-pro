

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Agency } from "@/api/entities";
import { DEV_MODE } from "@/api/base44Client";
import {
  LayoutDashboard,
  FileText,
  Ticket,
  Users,
  TrendingUp,
  Settings,
  Menu,
  X,
  Plane,
  CreditCard,
  Workflow,
  LogOut,
  Target,
  GitCompare,
  Receipt,
  UserCog,
  Clock,
  Building,
  Mail,
  BarChart,
  Shield,
  Database,
  Globe,
  Sun,
  Moon,
  Package // Import Package icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DevModeIndicator } from "@/components/ui/dev-mode-indicator";

// Regular agency navigation items
const allNavigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard, moduleId: "dashboard" },
  { title: "Sales Pipeline", url: createPageUrl("Sales"), icon: Target, moduleId: "sales_pipeline" },
  { title: "Travel Services", url: createPageUrl("Services"), icon: Package, moduleId: "travel_services" },
  { title: "GDS Management", url: createPageUrl("GDSManagement"), icon: Plane, moduleId: "gds_management" },
  { title: "Email Processor", url: createPageUrl("EmailProcessor"), icon: Mail, moduleId: "gds_management" },
  { title: "BSP Reconciliation", url: createPageUrl("BSPReconciliation"), icon: GitCompare, moduleId: "bsp_reconciliation" },
  { title: "Invoicing", url: createPageUrl("Invoicing"), icon: FileText, moduleId: "invoicing" },
  { title: "Financial Management", url: createPageUrl("FinancialManagement"), icon: Receipt, moduleId: "financial_management" },
  { title: "Reports & Analytics", url: createPageUrl("Reports"), icon: BarChart, moduleId: "financial_management" },
  { title: "Service Rules", url: createPageUrl("ServiceRules"), icon: Settings, moduleId: "financial_management" },
  { title: "Ticket Tracker", url: createPageUrl("TicketTracker"), icon: Ticket, moduleId: "ticket_tracker" },
  { title: "Client CRM", url: createPageUrl("ClientCRM"), icon: Users, moduleId: "client_crm" },
  { title: "Workflows", url: createPageUrl("Workflows"), icon: Workflow, moduleId: "workflows" },
  { title: "Billing", url: createPageUrl("Billing"), icon: CreditCard, moduleId: "billing" },
];

const adminNavigationItems = [
  { title: "Agency Settings", url: createPageUrl("AgencySettings"), icon: Building, moduleId: "agency_settings" },
  { title: "User Management", url: createPageUrl("AgencyUserManagement"), icon: UserCog, moduleId: "user_management" },
];

// Super Admin specific navigation items
const superAdminNavigationItems = [
  { title: "Super Admin Dashboard", url: createPageUrl("SuperAdmin"), icon: Shield },
  { title: "Platform Settings", url: createPageUrl("PlatformSettings"), icon: Settings },
  { title: "Agency Management", url: createPageUrl("AgencyManagement"), icon: Building },
  { title: "System Analytics", url: createPageUrl("SystemAnalytics"), icon: BarChart },
  { title: "User Management", url: createPageUrl("UserManagement"), icon: Users },
  { title: "System Logs", url: createPageUrl("SystemLogs"), icon: Database },
];

const ProtectedLayout = ({ children, currentPageName }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAgencyActive, setIsAgencyActive] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigationItems, setNavigationItems] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('travelpro-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('travelpro-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('travelpro-theme', 'light');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🚀 Layout: DEV_MODE is:', DEV_MODE);
        console.log('🚀 Layout: Loading user data...');
        
        const userData = await User.me();
        console.log('🚀 Layout: User data loaded:', userData);
        setUser(userData);

        // CRITICAL FIX: Check for Super Admin role FIRST.
        // A Super Admin's access should not depend on agency status.
        const isSuperAdmin = userData.app_role === 'super_admin' || userData.email === 'dwmusoke@gmail.com';
        
        if (isSuperAdmin) {
          // Super Admin gets their own navigation and is always considered "active".
          setNavigationItems(superAdminNavigationItems);
          setIsAgencyActive(true);
          setLoading(false); // Super admin view is ready to be rendered.
          return; // IMPORTANT: Stop execution here for super admins.
        }

        // --- Logic for non-super admin users ---

        // If user is not a super admin and has no agency, they must be redirected.
        if (!userData.agency_id) {
            console.warn("User is not a super admin and has no agency. Redirecting to GetStarted.");
            // Only redirect if we're not already on GetStarted to prevent loops
            if (location.pathname !== '/GetStarted' && location.pathname !== '/getstarted') {
                window.location.href = createPageUrl("GetStarted");
                return; // Stop further execution.
            }
        }

        // User has an agency, so load its data.
        let agencyData = null;
        try {
          agencyData = await Agency.get(userData.agency_id);
          setAgency(agencyData);
          
          if (!agencyData) {
            console.error("Agency not found for user. Logging out for safety.");
            await User.logout();
            window.location.href = createPageUrl("Home");
            return;
          }

          // Check if agency is active and approved.
          if (agencyData.is_active && agencyData.subscription_status !== 'pending_approval') {
            setIsAgencyActive(true);
          }
        } catch (agencyError) {
          console.error("Error loading agency data for user:", agencyError);
          // Fallback: log out user to prevent being stuck in a broken state.
          await User.logout();
          window.location.href = createPageUrl("Home");
          return;
        }

        // Set navigation based on agency's enabled modules and user's role.
        const enabledModules = agencyData?.settings?.modules || {};
        const baseNav = allNavigationItems.filter(item => !item.moduleId || enabledModules[item.moduleId] !== false);
        const adminNav = adminNavigationItems.filter(item => !item.moduleId || enabledModules[item.moduleId] !== false);

        let finalNav = [...baseNav];
        if(userData.app_role === 'agency_admin') {
          finalNav = [...finalNav, ...adminNav];
        }
        setNavigationItems(finalNav);

      } catch (error) {
        // This catch block handles the case where User.me() fails (user not logged in).
        // In production mode, let Base44 handle authentication instead of redirecting
        console.log("User not authenticated:", error);
        // Don't redirect here - let the UI handle it gracefully
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await User.logout();
      window.location.href = createPageUrl("Home");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800 dark:border-amber-400"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-amber-800/20 dark:bg-amber-400/20 backdrop-blur-sm border border-amber-700/30 dark:border-amber-400/30">
            <Plane className="w-8 h-8 text-amber-800 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-4">Access Required</h2>
          <p className="text-amber-800/80 dark:text-amber-200/80 mb-6">Please sign in to continue to your travel agency dashboard.</p>
          <Link to={createPageUrl("Home")}>
            <Button className="bg-amber-800/20 dark:bg-amber-400/20 backdrop-blur-sm text-amber-800 dark:text-amber-200 border border-amber-700/30 dark:border-amber-400/30 hover:bg-amber-800/30 dark:hover:bg-amber-400/30 rounded-xl">
              Go to Home Page
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if user is super admin to avoid showing pending approval screen
  const isSuperAdmin = user.app_role === 'super_admin' || user.email === 'dwmusoke@gmail.com';

  if (!isAgencyActive && user && agency && !isSuperAdmin) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
            <div className="text-center bg-amber-800/10 dark:bg-amber-400/10 backdrop-blur-md p-10 rounded-xl border border-amber-700/20 dark:border-amber-400/20 max-w-lg shadow-xl">
                <div className="w-16 h-16 bg-yellow-600/20 dark:bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur-sm border border-yellow-600/30 dark:border-yellow-400/30">
                    <Clock className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-amber-900 dark:text-amber-100">Account Pending Approval</h2>
                <p className="text-amber-800/80 dark:text-amber-200/80 mb-6">
                    Thank you for signing up! Your agency, <span className="font-bold text-amber-900 dark:text-amber-100">{agency?.name || 'your agency'}</span>, is currently under review.
                    You will receive an email notification once your account has been approved by our team.
                </p>
                <p className="text-sm text-amber-700/60 dark:text-amber-300/60 mb-8">
                    If you have any questions, please contact support.
                </p>
                <Button onClick={handleLogout} className="bg-amber-800/20 dark:bg-amber-400/20 backdrop-blur-sm text-amber-800 dark:text-amber-200 border border-amber-700/30 dark:border-amber-400/30 hover:bg-amber-800/30 dark:hover:bg-amber-400/30 rounded-xl">
                    Sign Out
                </Button>
            </div>
        </div>
    );
  }

  const SidebarContent = ({ onItemClick }) => (
    <div className="flex flex-col h-full bg-gradient-to-b from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <style jsx>{`
        .nav-item-active {
          background: rgba(139, 69, 19, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(139, 69, 19, 0.2);
          border-radius: 12px;
        }
        .dark .nav-item-active {
          background: rgba(217, 119, 6, 0.15);
          border: 1px solid rgba(217, 119, 6, 0.2);
        }
        .nav-item-hover:hover {
          background: rgba(139, 69, 19, 0.08);
          backdrop-filter: blur(10px);
          border-radius: 12px;
        }
        .dark .nav-item-hover:hover {
          background: rgba(217, 119, 6, 0.08);
        }
      `}</style>

      {/* Header */}
      <div className="p-6 border-b border-amber-700/20 dark:border-amber-400/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-800/20 dark:bg-amber-400/20 backdrop-blur-sm border border-amber-700/20 dark:border-amber-400/20 shadow-lg">
            {isSuperAdmin ? <Shield className="w-6 h-6 text-amber-800 dark:text-amber-400" /> : <Plane className="w-6 h-6 text-amber-800 dark:text-amber-400" />}
          </div>
          <div>
            <h1 className="text-lg font-bold text-amber-900 dark:text-amber-100">
              {isSuperAdmin ? 'Platform Admin' : 'TravelPro'}
            </h1>
            <p className="text-xs text-amber-700/70 dark:text-amber-300/70">
              {isSuperAdmin ? 'System Management' : 'Back Office Platform'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.url || currentPageName === item.title.replace(/\s/g, '');
            return (
              <Link
                key={item.title}
                to={item.url}
                onClick={onItemClick}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'nav-item-active text-amber-900 dark:text-amber-100'
                    : 'text-amber-800/80 dark:text-amber-200/80 nav-item-hover'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Theme Toggle & User Profile */}
      <div className="p-4 border-t border-amber-700/20 dark:border-amber-400/20">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-amber-800 dark:text-amber-200 hover:bg-amber-800/10 dark:hover:bg-amber-400/10 rounded-xl"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
        
        <div className="flex items-center gap-3 p-2 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-sm bg-amber-800/20 dark:bg-amber-400/20 backdrop-blur-sm text-amber-900 dark:text-amber-100 border border-amber-700/30 dark:border-amber-400/30">
              {(user?.full_name || '').split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-amber-900 dark:text-amber-100">
              {user?.full_name || 'User'}
            </p>
            <p className="text-xs truncate text-amber-700/70 dark:text-amber-300/70">
              {isSuperAdmin ? 'Super Administrator' : user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-amber-800/80 dark:text-amber-200/80 hover:bg-amber-800/10 dark:hover:bg-amber-400/10 hover:text-amber-900 dark:hover:text-amber-100 rounded-xl"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      <DevModeIndicator />
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 shadow-xl">
        <SidebarContent onItemClick={() => {}} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-gradient-to-b from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
          <SidebarContent onItemClick={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-amber-800/10 dark:bg-amber-400/10 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-amber-700/20 dark:border-amber-400/20 shadow-sm">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-amber-800 dark:text-amber-200">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm border border-amber-700/20 dark:border-amber-400/20 shadow-md bg-gradient-to-br from-amber-800 to-amber-900 dark:from-amber-400 dark:to-amber-500">
              {isSuperAdmin ? <Shield className="w-4 h-4 text-white" /> : <Plane className="w-4 h-4 text-white" />}
            </div>
            <span className="font-bold text-amber-900 dark:text-amber-100">
              {isSuperAdmin ? 'Platform Admin' : 'TravelPro'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-amber-800 dark:text-amber-200"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>

        {/* Page Content */}
        <main className="flex-1 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function Layout({ children, currentPageName }) {
  // CRITICAL FIX: Make Home and TestMode pages completely public - no authentication checks
  if (currentPageName === 'Home' || currentPageName === 'TestMode') {
    return <>{children}</>;
  }

  // All other pages get the protected layout
  return <ProtectedLayout currentPageName={currentPageName}>{children}</ProtectedLayout>;
}

