import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { baseClient } from "../../../shared/api/client";

export default function ConfirmEmailChange() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState({ loading: true, message: "", error: "" });

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus({ loading: false, message: "", error: "Missing token." });
      return;
    }
    const confirm = async () => {
      try {
        await baseClient.post("/auth/customer/email/confirm-change", { token });
        setStatus({
          loading: false,
          message: "Email updated. Please verify the new address from your inbox.",
          error: "",
        });
      } catch (err) {
        setStatus({
          loading: false,
          message: "",
          error: err?.response?.data?.message || "Failed to confirm email change.",
        });
      }
    };
    confirm();
  }, [params]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-md w-full text-center space-y-3">
        <h1 className="text-xl font-semibold text-slate-900">Confirm Email Change</h1>
        {status.loading && <p className="text-sm text-slate-600">Updating your email...</p>}
        {!status.loading && status.message && (
          <p className="text-sm text-green-600 font-semibold">{status.message}</p>
        )}
        {!status.loading && status.error && (
          <p className="text-sm text-red-600 font-semibold">{status.error}</p>
        )}
      </div>
    </div>
  );
}
