import { useEffect, useState } from 'react';
import { useCpanel } from '../../context/CpanelProvider';

export default function ProfileImage() {
  const { user, api, setUser } = useCpanel();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  useEffect(() => {
    if (user?.avatar) {
      setPreview(user.avatar);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus({ loading: true, error: '', success: '' });
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await api.put('/employee/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data?.user) {
        setUser(data.user);
        setPreview(data.user.avatar || preview);
      }
      setStatus({ loading: false, error: '', success: 'Profile image updated.' });
      setFile(null);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to upload image.';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  const handleRemoveSelection = () => {
    setFile(null);
    if (user?.avatar) {
      setPreview(user.avatar);
    } else {
      setPreview(null);
    }
    setStatus({ loading: false, error: '', success: '' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ink dark:text-text-light">Profile Image</h2>

      <div className="rounded-xl bg-[#eef2f7] bg-opacity-60 p-5 border border-border/60 flex flex-col md:flex-row gap-6">
        <div className="flex flex-1 flex-col items-center gap-3">
          <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-[#b8e2e8] text-primary text-3xl font-bold">
            {preview ? (
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              (user?.name ||
                user?.email ||
                'NA')
                .toString()
                .split(' ')
                .map((n) => n[0])
                .join('')
            )}
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-ink dark:text-text-light">{user?.name || '—'}</p>
            <p className="text-sm text-muted dark:text-text-light/80">{user?.email || '—'}</p>
            <span className="mt-1 inline-flex rounded-full bg-[#b8e2e8] px-3 py-1 text-xs font-semibold text-ink dark:text-text-light">
              {user?.employeeRole ? user.employeeRole.toUpperCase() : user?.role || '—'}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="rounded-lg border border-dashed border-border bg-white p-4 dark:bg-dark-card">
            <p className="text-sm font-semibold text-ink dark:text-text-light">Upload a new profile image</p>
            <p className="text-xs text-muted dark:text-text-light/70">
              PNG or JPG up to 5MB. Your image will appear in your account and across the dashboard.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-accent transition hover:bg-primary-hover">
                Choose File
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
              <button
                type="button"
                onClick={handleRemoveSelection}
                className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary"
                disabled={!file && !preview}
              >
                Remove
              </button>
              <button
                type="button"
                disabled={!file || status.loading}
                onClick={handleUpload}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-accent transition hover:bg-primary-hover disabled:opacity-70"
              >
                {status.loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>

          {status.error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{status.error}</div>
          ) : null}
          {status.success ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{status.success}</div>
          ) : null}

          <div className="rounded-lg border border-border bg-white p-4 text-sm text-muted dark:border-slate-700 dark:bg-dark-card dark:text-text-light/80">
            <p className="font-semibold text-ink dark:text-text-light">Tips</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Use a clear, centered photo for best results.</li>
              <li>Square images work best (1:1 aspect ratio).</li>
              <li>Max file size 5MB.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
