import { useMemo, useState } from "react";
import { useCart } from "../../context/useCart.jsx";
import OrderItemsSection from "./components/OrderItemsSection.jsx";
import DeliverySection from "./components/DeliverySection.jsx";
import PaymentSection from "./components/PaymentSection.jsx";
import ReviewSection from "./components/ReviewSection.jsx";
import OrderSummary from "./components/OrderSummary.jsx";
import { usePpanel } from "../../context/PpanelProvider.jsx";
import { useNavigate } from "react-router-dom";

const steps = [
  { id: 1, label: "Order items" },
  { id: 2, label: "Delivery address" },
  { id: 3, label: "Payment" },
  { id: 4, label: "Review & confirmation" },
];

const shippingThreshold = 200;
const taxRate = 0.02;

export default function Checkout() {
  const { items = [], totals = { subtotal: 0 } } = useCart();
  const { user } = usePpanel();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [verifyPrompt, setVerifyPrompt] = useState(false);

  const delivery = totals.subtotal > shippingThreshold ? 0 : 15;
  const tax = useMemo(() => totals.subtotal * taxRate, [totals.subtotal]);

  const nextStep = () => {
    if (!user && currentStep >= 1) {
      setLoginPrompt(true);
      navigate("/login", { replace: false, state: { from: "/checkout" } });
      return;
    }
    if (user && !user.emailVerified && currentStep === 1) {
      setVerifyPrompt(true);
      navigate("/profile?tab=email");
      return;
    }
    setCurrentStep((s) => Math.min(4, s + 1));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  const needsVerification = user && !user.emailVerified;
  const nextLabel =
    currentStep === 4
      ? "Place order"
      : needsVerification && currentStep === 1
      ? "Verify email to continue"
      : `Next: ${steps[currentStep]?.label}`;
  const nextDisabled = !items.length || (needsVerification && currentStep === 1);

  return (
    <div className="w-full mx-auto px-4 lg:px-20 py-10 bg-[#f8fafc] space-y-6">
      {loginPrompt && !user && (
        <div className="w-full bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl">
          Please log in to complete delivery, payment, and review steps.
        </div>
      )}
      {verifyPrompt && user && !user.emailVerified && (
        <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          Please verify your email to continue checkout.
        </div>
      )}
      <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
          {steps.map((step, idx) => {
            const active = step.id === currentStep;
            return (
              <div key={step.id} className="flex items-center gap-3">
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    active
                      ? "bg-primary text-white border-primary"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  {step.id}
                </span>
                <span className={`${active ? "text-slate-900" : ""}`}>{step.label}</span>
                {idx < steps.length - 1 && <span className="text-slate-300">—</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          {currentStep === 1 && <OrderItemsSection onContinueShopping={() => {}} />}
          {currentStep === 2 && <DeliverySection />}
          {currentStep === 3 && <PaymentSection />}
          {currentStep === 4 && <ReviewSection />}
        </div>

        <OrderSummary
          items={items}
          totals={totals}
          delivery={delivery}
          tax={tax}
          onNext={nextStep}
          nextLabel={nextLabel}
        />
      </div>

      <div className="flex items-center justify-between pt-6">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 h-12 rounded-full border border-slate-200 text-slate-500 font-semibold bg-white hover:border-primary hover:text-primary transition shadow-sm disabled:opacity-50"
        >
          Previous step
        </button>
        <button
          onClick={nextStep}
          disabled={nextDisabled}
          className="px-6 h-12 rounded-full bg-primary text-white font-semibold text-base shadow-lg shadow-primary/20 hover:bg-primary-hover transition disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
