import { useState } from "react";

interface Props {
  totalPrice: number;
  travelerCount: number;
}

export default function PricePanel({ totalPrice, travelerCount }: Props) {
  const [applied, setApplied] = useState(true);
  const discount = Math.round(totalPrice * 0.02);
  const original = totalPrice + discount;
  const [toast, setToast] = useState<string | null>(null);

  function handleProceed() {
    setToast("This is a demo — no real payment is processed. In production this would hand off to checkout.");
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <div className="rounded-2xl border border-ink-900/5 bg-white p-4 shadow-sm">
      <p className="text-xs text-ink-500 line-through">₹{original.toLocaleString("en-IN")}</p>
      <p className="text-xs font-semibold text-brand-600">2% OFF</p>
      <p className="mt-0.5 text-2xl font-extrabold text-ink-900">
        ₹{totalPrice.toLocaleString("en-IN")}
        <span className="text-sm font-medium text-ink-500"> /adult</span>
      </p>
      <p className="text-xs text-ink-500">Excluding applicable taxes · {travelerCount} travelers</p>
      <button
        onClick={handleProceed}
        className="mt-3 w-full rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-accent-600"
      >
        PROCEED TO PAYMENT
      </button>
      {toast && <p className="mt-2 text-xs text-ink-500">{toast}</p>}

      <div className="mt-4 border-t border-ink-900/5 pt-3">
        <p className="text-xs font-bold text-ink-900">Coupons & Offers</p>
        <div className="mt-2 flex items-center justify-between rounded-lg border border-dashed border-accent-400 bg-accent-50 px-3 py-2">
          <div>
            <p className="text-xs font-bold text-accent-700">SUNDAYSAVER</p>
            <p className="text-[11px] text-ink-500">Special discount applied</p>
          </div>
          {applied ? (
            <button onClick={() => setApplied(false)} className="text-xs font-semibold text-brand-600">
              Remove
            </button>
          ) : (
            <button onClick={() => setApplied(true)} className="text-xs font-semibold text-accent-600">
              Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
