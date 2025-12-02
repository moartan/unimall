import { useState } from "react";

export default function EmailVerificationSection({ user, api, setUser }) {
  const [verifyMsg, setVerifyMsg] = useState({ success: "", error: "" });
  const [changeMsg, setChangeMsg] = useState({ success: "", error: "" });
  const [newEmail, setNewEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [changing, setChanging] = useState(false);
  const [token, setToken] = useState("");
  const [tokenMsg, setTokenMsg] = useState({ success: "", error: "" });

  const sendVerification = async () => {
    setSending(true);
    setVerifyMsg({ success: "", error: "" });
    try {
      await api.post("/auth/customer/email/verify");
      setVerifyMsg({ success: "Verification email sent.", error: "" });
    } catch (err) {
      setVerifyMsg({
        success: "",
        error: err?.response?.data?.message || "Failed to send verification email.",
      });
    } finally {
      setSending(false);
    }
  };

  const confirmToken = async () => {
    if (!token) {
      setTokenMsg({ success: "", error: "Enter the token from your email." });
      return;
    }
    setTokenMsg({ success: "", error: "" });
    try {
      await api.post("/auth/customer/email/confirm", { token });
      const profile = await api.get("/customer/profile");
      setUser(profile.data?.user || user);
      setTokenMsg({ success: "Email verified.", error: "" });
    } catch (err) {
      setTokenMsg({
        success: "",
        error: err?.response?.data?.message || "Failed to verify email.",
      });
    }
  };

  const sendChangeEmail = async () => {
    if (!newEmail) {
      setChangeMsg({ success: "", error: "Enter a new email." });
      return;
    }
    setChanging(true);
    setChangeMsg({ success: "", error: "" });
    try {
      await api.post("/auth/customer/email/change", { newEmail });
      setChangeMsg({
        success: "We sent a confirmation link to the new email. Please check your inbox.",
        error: "",
      });
    } catch (err) {
      setChangeMsg({
        success: "",
        error: err?.response?.data?.message || "Failed to send change email link.",
      });
    } finally {
      setChanging(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-7 space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Email & Verification</h2>

      <div className="space-y-2">
        <p className="text-sm text-slate-600">
          Current email: <span className="font-semibold text-slate-900">{user?.email}</span>
        </p>
        <p className="text-sm text-slate-600">
          Status:{" "}
          <span
            className={`font-semibold ${
              user?.emailVerified ? "text-green-600" : "text-amber-600"
            }`}
          >
            {user?.emailVerified ? "Verified" : "Not verified"}
          </span>
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-slate-600">Send a new verification email if you haven’t verified yet.</p>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={sendVerification}
            disabled={sending}
            className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send verification email"}
          </button>
          {verifyMsg.success && <span className="text-sm text-green-600 font-semibold">{verifyMsg.success}</span>}
          {verifyMsg.error && !verifyMsg.success && (
            <span className="text-sm text-red-600 font-semibold">{verifyMsg.error}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste verification token"
            className="w-full md:w-64 rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={confirmToken}
            className="px-4 py-2 rounded-xl border border-primary text-primary font-semibold hover:bg-primary hover:text-white"
          >
            Verify token
          </button>
        </div>
        {tokenMsg.success && <span className="text-sm text-green-600 font-semibold">{tokenMsg.success}</span>}
        {tokenMsg.error && !tokenMsg.success && (
          <span className="text-sm text-red-600 font-semibold">{tokenMsg.error}</span>
        )}
      </div>

      <div className="space-y-3 border-t border-slate-100 pt-4">
        <p className="text-sm text-slate-600">Want to use a new email? We’ll send a confirmation link.</p>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="New email address"
            className="w-full md:w-72 rounded-xl border border-slate-200 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={sendChangeEmail}
            disabled={changing}
            className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover disabled:opacity-60"
          >
            {changing ? "Sending..." : "Send change link"}
          </button>
        </div>
        {changeMsg.success && <span className="text-sm text-green-600 font-semibold">{changeMsg.success}</span>}
        {changeMsg.error && !changeMsg.success && (
          <span className="text-sm text-red-600 font-semibold">{changeMsg.error}</span>
        )}
      </div>
    </section>
  );
}
