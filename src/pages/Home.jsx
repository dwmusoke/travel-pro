
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, BarChart, FileText, Settings, Shield, Users } from "lucide-react";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-800 to-amber-900 dark:from-amber-400 dark:to-amber-500 backdrop-blur-sm border border-amber-700/30 dark:border-amber-400/30 shadow-md">
      <Plane className="w-4 h-4 text-white" />
    </div>
    <span className="font-bold text-xl text-amber-900 dark:text-amber-100">TravelPro</span>
  </div>
);

export default function Home() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                const user = await User.me();
                // User is logged in, determine where to send them
                if (user.agency_id) {
                    // User has an agency, go to dashboard
                    window.location.href = createPageUrl("Dashboard");
                } else if (user.app_role === 'super_admin' || user.email === 'dwmusoke@gmail.com') {
                    // Super admin with no agency goes to super admin page
                    window.location.href = createPageUrl("SuperAdmin");
                } else {
                    // User is logged in but has no agency, go to setup
                    window.location.href = createPageUrl("GetStarted");
                }
            } catch (error) {
                // User is not logged in, they can stay on this page.
                setLoading(false);
            }
        };
        checkUserStatus();
    }, []);

    const handleLogin = async () => {
        try {
            // After login, they'll be redirected here, and the useEffect will route them.
            await User.loginWithRedirect(window.location.href);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };
    
    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 dark:border-amber-400"></div>
            </div>
        );
    }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 text-amber-900 dark:text-amber-100">
      <header className="p-4 border-b border-amber-700/20 dark:border-amber-400/20">
        <div className="container mx-auto flex justify-between items-center">
          <Logo />
          <Button 
            onClick={handleLogin}
            variant="outline"
            className="bg-amber-800/20 dark:bg-amber-400/20 backdrop-blur-sm text-amber-800 dark:text-amber-200 border-amber-700/30 dark:border-amber-400/30 hover:bg-amber-800/30 dark:hover:bg-amber-400/30 rounded-xl"
          >
            Sign In
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-900 to-amber-700 dark:from-amber-400 dark:to-amber-200">
              The All-In-One Back Office for Travel Agencies
            </h1>
            <p className="text-lg md:text-xl text-amber-800/80 dark:text-amber-200/80 mb-10">
              Streamline your operations, from GDS ticket processing and invoicing to financial management and client relations. TravelPro handles the complexity, so you can focus on creating amazing travel experiences.
            </p>
            <div className="mt-10">
              <Button
                onClick={handleLogin}
                className="bg-amber-800/20 dark:bg-amber-400/20 backdrop-blur-sm text-amber-800 dark:text-amber-200 border border-amber-700/30 dark:border-amber-400/30 hover:bg-amber-800/30 dark:hover:bg-amber-400/30 rounded-xl px-8 py-6 text-lg font-semibold"
              >
                Get Started for Free
              </Button>
              <div className="mt-4">
                <Link to="/TestMode">
                  <Button
                    variant="outline"
                    className="border-amber-700/30 dark:border-amber-400/30 text-amber-800 dark:text-amber-200 hover:bg-amber-800/10 dark:hover:bg-amber-400/10 rounded-xl px-6 py-3"
                  >
                    🧪 Test Mode (No Login Required)
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Plane, title: "Automated GDS Processing", desc: "Sync ticket files automatically from Amadeus, Sabre, and Galileo." },
              { icon: FileText, title: "Effortless Invoicing", desc: "Generate and send professional invoices in just a few clicks." },
              { icon: BarChart, title: "Financial Management", desc: "Track revenue, manage expenses, and reconcile BSP reports." },
              { icon: Users, title: "Integrated Client CRM", desc: "Maintain detailed client profiles and manage communications seamlessly." }
            ].map(feature => (
              <Card key={feature.title} className="bg-amber-800/10 dark:bg-amber-400/10 backdrop-blur-md border-amber-700/20 dark:border-amber-400/20 rounded-xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-amber-800/20 dark:bg-amber-400/20 mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-amber-800 dark:text-amber-300" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-amber-800/70 dark:text-amber-200/70">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

       <footer className="p-4 mt-16 border-t border-amber-700/20 dark:border-amber-400/20">
        <div className="container mx-auto text-center text-sm text-amber-800/70 dark:text-amber-200/70">
          © {new Date().getFullYear()} TravelPro. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
