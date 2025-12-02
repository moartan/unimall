import { useRef } from "react";

export default function AvatarSection({
  user,
  displayName,
  avatarPreview,
  onFileChange,
  onRemove,
  onSubmit,
  avatarFile,
  loading,
  msg,
}) {
  const fileRef = useRef(null);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-7 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Profile Image</h2>
        {msg.success && <span className="text-sm text-green-600 font-semibold">{msg.success}</span>}
        {msg.error && !msg.success && <span className="text-sm text-red-600 font-semibold">{msg.error}</span>}
      </div>

      <p className="text-sm text-slate-600">
        Upload a new profile image. PNG or JPG up to 5MB. Your image will appear in your account and across
        the dashboard.
      </p>

      <form className="flex flex-col md:flex-row items-center gap-4" onSubmit={onSubmit}>
        <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
          ) : user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-500 font-semibold">
              {(displayName || "U").slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 md:flex-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            className="hidden"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover"
            >
              Choose File
            </button>
            <button
              type="button"
              onClick={() => {
                if (fileRef.current) fileRef.current.value = "";
                onRemove();
              }}
              className="px-5 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Remove
            </button>
            <button
              type="submit"
              disabled={!avatarFile || loading}
              className="px-5 py-2 rounded-xl bg-primary/80 text-white font-semibold hover:bg-primary disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <p className="text-xs text-slate-500">PNG or JPG up to 5MB.</p>
        </div>
      </form>
    </section>
  );
}
