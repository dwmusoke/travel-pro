
import React, { useState, useEffect } from "react";
import { User, Agency } from "@/api/entities";
import { createFlutterwavePaymentLink } from "@/api/functions";
import { createPaypalPaymentLink } from "@/api/functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, DollarSign, Users, CreditCard, ArrowRight, Loader2 } from "lucide-react";

const plans = [
    {
        name: 'Basic',
        price: '$49',
        priceSuffix: '/mo',
        description: 'For small agencies getting started.',
        features: ['GDS Upload & Parsing', 'Basic Invoicing', 'Ticket Tracker', '2 Users'],
        mostPopular: false,
    },
    {
        name: 'Pro',
        price: '$99',
        priceSuffix: '/mo',
        description: 'For growing agencies needing more power.',
        features: ['Everything in Basic', 'Advanced Reporting', 'Client CRM', 'Tax Compliance', '10 Users'],
        mostPopular: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        priceSuffix: '',
        description: 'For large agencies with custom needs.',
        features: ['Everything in Pro', 'Visual Workflow Builder', 'Unlimited Users', 'Priority Support', 'API Access'],
        mostPopular: false,
    }
];

export default function Billing() {
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState({ plan: null, gateway: null }); // Track plan and gateway

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await User.me();
        if (user.agency_id) {
          const agencyData = await Agency.get(user.agency_id);
          setAgency(agencyData);
        }
      } catch (error) {
        console.error("Error loading billing data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleUpgrade = async (planName, gateway) => {
    if (upgrading.plan) return; // Prevent multiple clicks
    setUpgrading({ plan: planName, gateway: gateway });
    try {
      let paymentFunction;
      if (gateway === 'flutterwave') {
        paymentFunction = createFlutterwavePaymentLink;
      } else if (gateway === 'paypal') {
        paymentFunction = createPaypalPaymentLink;
      } else {
        throw new Error("Invalid payment gateway");
      }

      const { data } = await paymentFunction({ plan: planName });
      if (data.link) {
        window.location.href = data.link; // Redirect to payment page
      } else {
        alert("Could not create payment link. Please try again.");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert(error.response?.data?.error || "An unexpected error occurred. Please ensure your payment gateway keys are correctly configured in settings.");
    } finally {
      setUpgrading({ plan: null, gateway: null });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-800" />
      </div>
    );
  }

  const currentPlan = agency?.subscription_plan || 'basic';
  const userCount = agency?.user_count || 1; // You'd fetch this from users list
  const ticketsProcessed = agency?.tickets_processed_mtd || 1234; // Example data

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 25%, #e8d5b7 50%, #dfc49a 75%, #d4b382 100%)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-900 mb-3">Billing & Subscription</h1>
          <p className="text-lg text-amber-800/80">Manage your plan, view usage, and access invoices.</p>
        </div>

        {/* Current Plan Summary */}
        <Card className="mb-12 bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex justify-between items-center text-amber-900">
              <span>Your Current Plan</span>
              <Badge className="bg-amber-800/20 text-amber-900 border border-amber-700/30 text-sm capitalize">{currentPlan}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-amber-100/30 rounded-lg">
              <p className="text-sm text-amber-700/80">Next Billing Date</p>
              <p className="text-xl font-semibold text-amber-900">Not set</p>
            </div>
            <div className="p-4 bg-amber-100/30 rounded-lg">
              <p className="text-sm text-amber-700/80">Users</p>
              <p className="text-xl font-semibold text-amber-900">{userCount} / 2</p>
            </div>
            <div className="p-4 bg-amber-100/30 rounded-lg">
              <p className="text-sm text-amber-700/80">Tickets Processed (MTD)</p>
              <p className="text-xl font-semibold text-amber-900">{ticketsProcessed}</p>
            </div>
          </CardContent>
        </Card>

        {/* Choose Your Plan */}
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-amber-900 mb-3">Choose Your Plan</h2>
            <p className="text-amber-800/80">Select the plan that best fits your agency's needs.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`bg-amber-50/50 backdrop-blur-md rounded-xl shadow-xl flex flex-col ${
                plan.mostPopular ? 'border-2 border-amber-600' : 'border border-amber-200/50'
              }`}
            >
              <CardHeader className="text-center">
                {plan.mostPopular && <Badge className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-amber-700 text-white border-amber-600">Most Popular</Badge>}
                <CardTitle className="text-2xl font-bold text-amber-900">{plan.name}</CardTitle>
                <p className="text-amber-700/80">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-amber-900">{plan.price}</span>
                  {plan.priceSuffix && <span className="text-amber-700/80">{plan.priceSuffix}</span>}
                </div>
                <ul className="space-y-3 mb-8 text-amber-800 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto space-y-2">
                    {plan.name.toLowerCase() === currentPlan ? (
                        <Button disabled className="w-full bg-amber-200/80 text-amber-800 rounded-lg">Current Plan</Button>
                    ) : (
                        plan.name === 'Enterprise' ? (
                            <Button className="w-full bg-amber-800 text-white hover:bg-amber-900 rounded-lg">Contact Sales</Button>
                        ) : (
                            <>
                                <Button 
                                  onClick={() => handleUpgrade(plan.name, 'flutterwave')} 
                                  disabled={!!upgrading.plan}
                                  className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                                >
                                    {upgrading.plan === plan.name && upgrading.gateway === 'flutterwave' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    {upgrading.plan === plan.name && upgrading.gateway === 'flutterwave' ? 'Redirecting...' : 'Pay with Flutterwave'}
                                </Button>
                                <Button 
                                  onClick={() => handleUpgrade(plan.name, 'paypal')} 
                                  disabled={!!upgrading.plan}
                                  className="w-full bg-sky-700 text-white hover:bg-sky-800 rounded-lg"
                                >
                                    {upgrading.plan === plan.name && upgrading.gateway === 'paypal' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    {upgrading.plan === plan.name && upgrading.gateway === 'paypal' ? 'Redirecting...' : 'Pay with PayPal'}
                                </Button>
                            </>
                        )
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
