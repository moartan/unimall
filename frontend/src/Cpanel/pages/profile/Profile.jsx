import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Overview from './Overview.jsx';
import EditProfile from './EditProfile.jsx';
import ProfileImage from './ProfileImage.jsx';
import Security from './Security.jsx';
import Sessions from './Sessions.jsx';
import EmailVerification from './EmailVerification.jsx';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'edit', label: 'Edit Profile' },
  { key: 'image', label: 'Profile Image' },
  { key: 'security', label: 'Security' },
  { key: 'email', label: 'Email & Verification' },
  { key: 'sms', label: 'SMS & 2FA' },
  { key: 'sessions', label: 'Sessions' },
];

export default function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'overview';
  }, [location.search]);

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    const params = new URLSearchParams(location.search);
    params.set('tab', key);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  return (
    <div className="p-2 md:p-2 lg:p-4">
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-ink dark:text-text-light">Profile Management</h1>
          </div>
          <Link to="/cpanel/dashboard" className="text-primary font-semibold text-sm md:text-base hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="mt-4 border-t border-border" />

        <div className="mt-4 overflow-x-auto">
          <div className="flex min-w-max gap-6 text-sm font-semibold text-muted dark:text-text-light/80">
            {tabs.map((tab) => {
              const active = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`relative pb-3 transition-colors ${
                    active ? 'text-primary' : 'hover:text-primary'
                  }`}
                >
                  <div>{tab.label}</div>
                  {active ? (
                    <span className="absolute -bottom-[2px] left-0 h-[3px] w-full rounded-full bg-primary" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <Content activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}

function Content({ activeTab }) {
  switch (activeTab) {
    case 'overview':
      return <Overview />;
    case 'edit':
      return <EditProfile />;
    case 'image':
      return <ProfileImage />;
    case 'security':
      return <Security />;
    case 'email':
      return <EmailVerification />;
    case 'sms':
      return <Placeholder title="SMS & 2FA" />;
    case 'sessions':
      return <Sessions />;
    default:
      return null;
  }
}

function Placeholder({ title }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-ink dark:text-text-light">{title}</h2>
      <p className="mt-2 text-sm text-muted dark:text-text-light/80">
        Content for {title} will appear here.
      </p>
    </div>
  );
}
