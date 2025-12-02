import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Home, UserCircle2, KeyRound, LogOut, MapPin, ChevronDown } from "lucide-react";
import { usePpanel } from "../../context/PpanelProvider";
import Overview from "./Overview";
import EditProfile from "./EditProfile";
import AvatarSection from "./ProfileImageSection";
import SecuritySection from "./SecuritySection";
import AddressesSection from "./AddressesSection";
import EmailVerificationSection from "./EmailVerificationSection";
import SmsTwoFASection from "./SmsTwoFASection";
// Sessions removed per request

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, api, setUser, loading, logout } = usePpanel();
  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    phone: "",
    gender: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ error: "", success: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarMsg, setAvatarMsg] = useState({ error: "", success: "" });
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [navOpen, setNavOpen] = useState(true);

  const displayName = useMemo(() => user?.name || user?.fullName || user?.email || "", [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        country: user.country || "",
        phone: user.phone || "",
        gender: user.gender || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const handle = () => {
      const isMobile = window.innerWidth < 1024;
      setNavOpen(!isMobile);
    };
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.put("/customer/profile", {
        name: form.name,
        country: form.country,
        phone: form.phone,
        gender: form.gender,
      });
      if (data?.user) {
        setUser(data.user);
      }
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) {
      setPwdMsg({ success: "", error: "New passwords do not match." });
      return;
    }
    setPwdSaving(true);
    setPwdMsg({ error: "", success: "" });
    try {
      await api.put("/customer/profile/password", {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdMsg({ success: "Password updated successfully.", error: "" });
      setPwdForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setPwdMsg({
        error: err?.response?.data?.message || "Failed to update password.",
        success: "",
      });
    } finally {
      setPwdSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    e.preventDefault();
    if (!avatarFile) return;
    setAvatarLoading(true);
    setAvatarMsg({ error: "", success: "" });
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const { data } = await api.put("/customer/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data?.user) setUser(data.user);
      setAvatarMsg({ success: "Avatar updated.", error: "" });
      setAvatarFile(null);
      setAvatarPreview("");
    } catch (err) {
      setAvatarMsg({ error: err?.response?.data?.message || "Upload failed.", success: "" });
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto py-10 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside className="bg-white rounded-3xl shadow-md border border-slate-100 p-6 flex flex-col items-stretch gap-5">
          <button
            className="lg:hidden flex items-center justify-between w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold"
            onClick={() => setNavOpen((v) => !v)}
          >
            <span className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                {(displayName || "U").slice(0, 2).toUpperCase()}
              </span>
              Profile
            </span>
            <ChevronDown
              size={18}
              className={`transition ${navOpen ? "rotate-180" : ""}`}
            />
          </button>

          {navOpen && (
            <>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
                  {(displayName || "U")
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{displayName}</p>
                  <p className="text-sm text-slate-600">{user?.email}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { key: "overview", label: "Overview", icon: <Home size={18} /> },
                  { key: "details", label: "Edit Profile", icon: <UserCircle2 size={18} /> },
                  { key: "avatar", label: "Profile Image", icon: <UserCircle2 size={18} /> },
                  { key: "security", label: "Security", icon: <KeyRound size={18} /> },
                  { key: "addresses", label: "Addresses", icon: <MapPin size={18} /> },
                  { key: "email", label: "Email & Verification", icon: <UserCircle2 size={18} /> },
                  { key: "sms", label: "SMS & 2FA", icon: <KeyRound size={18} /> },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setSearchParams({ tab: tab.key });
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition border flex items-center gap-3 ${
                      activeTab === tab.key
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-primary/60"
                    }`}
                  >
                    <span className="shrink-0">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={logout}
                className="w-full text-left px-4 py-3 rounded-xl font-semibold transition border flex items-center gap-3 bg-slate-50 text-slate-700 border-slate-200 hover:border-red-400 hover:text-red-600"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          )}
        </aside>

        <div className="space-y-5">
          {activeTab === "overview" && <Overview user={user} displayName={displayName} />}

          {activeTab === "details" && (
            <EditProfile
              form={form}
              onChange={handleChange}
              onReset={() => {
                if (user) {
                  setForm({
                    name: user.name || "",
                    email: user.email || "",
                    country: user.country || "",
                    phone: user.phone || "",
                    gender: user.gender || "",
                  });
                }
                setError("");
                setSuccess("");
              }}
              onSubmit={handleSave}
              saving={saving}
              success={success}
              error={error}
            />
          )}

          {activeTab === "avatar" && (
            <AvatarSection
              user={user}
              displayName={displayName}
              avatarPreview={avatarPreview}
              onFileChange={(file) => {
                setAvatarFile(file || null);
                setAvatarPreview(file ? URL.createObjectURL(file) : "");
                setAvatarMsg({ error: "", success: "" });
              }}
              onRemove={() => {
                setAvatarFile(null);
                setAvatarPreview("");
                setAvatarMsg({ error: "", success: "" });
              }}
              onSubmit={handleAvatarUpload}
              avatarFile={avatarFile}
              loading={avatarLoading}
              msg={avatarMsg}
            />
          )}

          {activeTab === "security" && (
            <SecuritySection
              pwdForm={pwdForm}
              onChange={setPwdForm}
              onSubmit={handlePasswordChange}
              saving={pwdSaving}
              msg={pwdMsg}
            />
          )}

          {activeTab === "addresses" && <AddressesSection />}

          {activeTab === "email" && (
            <EmailVerificationSection user={user} api={api} setUser={setUser} />
          )}

          {activeTab === "sms" && <SmsTwoFASection />}
        </div>
      </div>
    </div>
  );
}
