export default function TabsBar({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto bg-[#f5f8fb] px-2 py-2 w-full">
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`whitespace-nowrap px-3 pb-2 pt-1 transition text-sm font-semibold border-b-2 ${
              isActive
                ? 'text-primary border-primary'
                : 'text-text-secondary border-transparent hover:text-text-primary hover:border-primary/40'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
