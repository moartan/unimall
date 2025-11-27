const mockSessions = {
  devices: [
    { name: 'MacBook Pro · Toronto', status: 'Active', ip: '192.168.0.12' },
    { name: 'iPhone 14 · Toronto', status: 'Active', ip: '192.168.0.14' },
    { name: 'iPad · Toronto', status: 'Signed out', ip: '192.168.0.21' },
  ],
  api: [
    { name: 'Orders API', endpoint: 'https://api.unimall.com/orders', status: 'Online' },
    { name: 'Reports API', endpoint: 'https://api.unimall.com/reports', status: 'Online' },
  ],
};

export default function Sessions() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-ink dark:text-text-light">Sessions & Devices</h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-[#eef2f7] bg-opacity-60 p-5 border border-border/60 space-y-3">
          <h3 className="text-lg font-semibold text-ink dark:text-text-light">Devices</h3>
          <div className="space-y-2 text-sm text-ink dark:text-text-light">
            {mockSessions.devices.map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-dark-card"
              >
                <div>
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-xs text-muted dark:text-text-light/70">IP: {d.ip}</p>
                </div>
                <span className="text-xs font-semibold text-primary">{d.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-[#eef2f7] bg-opacity-60 p-5 border border-border/60 space-y-3">
          <h3 className="text-lg font-semibold text-ink dark:text-text-light">API Access</h3>
          <div className="space-y-2 text-sm text-ink dark:text-text-light">
            {mockSessions.api.map((a) => (
              <div
                key={a.name}
                className="rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-dark-card"
              >
                <p className="font-semibold">{a.name}</p>
                <p className="text-xs text-muted dark:text-text-light/70">{a.endpoint}</p>
                <p className="text-xs font-semibold text-primary">{a.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
