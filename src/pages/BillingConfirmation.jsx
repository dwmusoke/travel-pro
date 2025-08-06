import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Loader2, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { verifyFlutterwavePayment } from "@/api/functions";
import { verifyPaypalPayment } from "@/api/functions"; // Import new function

export default function BillingConfirmation() {
  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'failed'
  const [details, setDetails] = useState(null);
  const [error, setError] = useState("");
  const location = useLocation();

  useEffect(() => {
    const verifyPayment = async () => {
      // Ensure user is logged in before proceeding
      try {
        await User.me();
      } catch (e) {
        setStatus("failed");
        setError("You must be logged in to confirm a payment.");
        return;
      }
      
      const params = new URLSearchParams(location.search);
      const flutterwaveStatus = params.get("status");
      const flutterwaveTxRef = params.get("tx_ref");
      const flutterwaveTransactionId = params.get("transaction_id");

      const paypalToken = params.get("token");
      const paypalPayerId = params.get("PayerID");

      if (flutterwaveStatus && flutterwaveTransactionId) {
        // --- Handle Flutterwave Verification ---
        if (flutterwaveStatus === "successful") {
          try {
            const { data } = await verifyFlutterwavePayment({ transaction_id: flutterwaveTransactionId });
            if (data.verification === 'success') {
              setStatus("success");
              setDetails(data);
            } else {
              setStatus("failed");
              setError(data.message || "Flutterwave payment verification failed.");
            }
          } catch (err) {
            setStatus("failed");
            setError(err.response?.data?.error || "An error occurred during Flutterwave verification.");
          }
        } else {
          setStatus("failed");
          setError("Flutterwave payment was not successful or was cancelled.");
        }
      } else if (paypalToken && paypalPayerId) {
        // --- Handle PayPal Verification ---
        try {
            const { data } = await verifyPaypalPayment({ orderID: paypalToken });
             if (data.verification === 'success') {
              setStatus("success");
              setDetails(data);
            } else {
              setStatus("failed");
              setError(data.message || "PayPal payment verification failed.");
            }
        } catch (err) {
             setStatus("failed");
             setError(err.response?.data?.error || "An error occurred during PayPal verification.");
        }
      } else {
        setStatus("failed");
        setError("Invalid payment confirmation URL. No payment parameters found.");
      }
    };

    verifyPayment();
  }, [location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f7f3e9 0%, #f0e6d2 100%)' }}>
      <Card className="max-w-md w-full bg-amber-50/50 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-xl">
        <CardHeader className="text-center">
          {status === 'verifying' && <Loader2 className="w-12 h-12 mx-auto animate-spin text-amber-800" />}
          {status === 'success' && <CheckCircle className="w-12 h-12 mx-auto text-green-600" />}
          {status === 'failed' && <AlertTriangle className="w-12 h-12 mx-auto text-red-600" />}
          <CardTitle className="text-2xl font-bold text-amber-900 mt-4">
            {status === 'verifying' && "Verifying Your Payment..."}
            {status === 'success' && "Payment Successful!"}
            {status === 'failed' && "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'verifying' && <p className="text-amber-800/80">Please wait while we confirm your transaction. Do not close this page.</p>}
          
          {status === 'success' && details && (
            <div className="space-y-4">
              <p className="text-lg text-amber-800/80">
                Your subscription to the <span className="font-bold text-amber-900">{details.plan}</span> plan is now active!
              </p>
              <div className="p-4 bg-amber-100/40 rounded-lg text-left text-amber-900">
                <p><strong>Amount Paid:</strong> {details.amount} {details.currency}</p>
                <p><strong>New Plan:</strong> {details.plan}</p>
              </div>
              <Link to={createPageUrl("Dashboard")}>
                <Button className="w-full bg-amber-800 text-white hover:bg-amber-900 rounded-lg">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
          
          {status === 'failed' && (
            <div className="space-y-4">
              <p className="text-red-700 bg-red-100/50 p-3 rounded-lg">{error || "An unknown error occurred."}</p>
              <Link to={createPageUrl("Billing")}>
                <Button variant="outline" className="w-full bg-amber-100/50 text-amber-900 border-amber-300/50 hover:bg-amber-100/70 rounded-lg">
                  Return to Billing Page
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}