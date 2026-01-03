import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePpanel } from "../../context/PpanelProvider";
import Overview from "./Overview";
import EditProfile from "./EditProfile";
import AvatarSection from "./ProfileImageSection";
import SecuritySection from "./SecuritySection";
import EmailVerificationSection from "./EmailVerificationSection";
import ProfileShell from "./ProfileShell";
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
    <ProfileShell
      user={user}
      displayName={displayName}
      activeKey={activeTab}
      onSelectTab={(tabKey) => {
        setActiveTab(tabKey);
        setSearchParams({ tab: tabKey });
      }}
      logout={logout}
    >
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

      {activeTab === "email" && <EmailVerificationSection user={user} api={api} setUser={setUser} />}

    </ProfileShell>
  );
}
